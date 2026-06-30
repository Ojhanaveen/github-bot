import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;

function verifySignature(payload: string, signature: string | null) {
  if (!signature || !WEBHOOK_SECRET) return false;
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-hub-signature-256');
    const eventType = req.headers.get('x-github-event') || 'unknown';
    const deliveryId = req.headers.get('x-github-delivery');

    if (!deliveryId) {
      return NextResponse.json({ error: 'Missing delivery ID' }, { status: 400 });
    }

    if (!verifySignature(rawBody, signature)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // 1. Idempotency Check
    const existingEvent = await prisma.eventLog.findUnique({
      where: { deliveryId }
    });

    if (existingEvent) {
      console.log(`Event ${deliveryId} already processed. Skipping.`);
      return NextResponse.json({ message: 'Already processed' }, { status: 202 });
    }

    const payload = JSON.parse(rawBody);
    
    // Auto-register repositories from installation events
    if (eventType === 'installation' && payload.action === 'created') {
      const installationId = payload.installation?.id;
      const senderId = payload.sender?.login;
      
      // Find the user in our DB by GitHub username
      const account = await prisma.account.findFirst({
        where: { providerAccountId: String(payload.sender?.id) },
        include: { user: true }
      });

      if (account && payload.repositories) {
        for (const repo of payload.repositories) {
          await prisma.repository.upsert({
            where: { githubId: repo.id },
            update: { installationId },
            create: {
              githubId: repo.id,
              name: repo.name,
              fullName: repo.full_name,
              installationId,
              userId: account.user.id
            }
          });
        }
      }
    }

    // We can extract repository info if present
    const githubRepoId = payload.repository?.id;
    let repositoryId = null;

    if (githubRepoId) {
       const repo = await prisma.repository.findUnique({
          where: { githubId: githubRepoId }
       });
       if (repo) repositoryId = repo.id;
    }

    // 2. Save event reliably - handle race condition on duplicate deliveries
    let newEvent;
    try {
      newEvent = await prisma.eventLog.create({
        data: {
          deliveryId,
          eventType,
          payload,
          status: 'PENDING',
          repositoryId
        }
      });
    } catch (dbError: any) {
      // P2002 = unique constraint violation - means duplicate delivery, ignore it
      if (dbError?.code === 'P2002') {
        return NextResponse.json({ message: 'Already processing' }, { status: 202 });
      }
      throw dbError;
    }

    // 3. Trigger processing synchronously so Vercel doesn't kill the serverless function
    await processEventBackground(newEvent.id);

    return NextResponse.json({ message: 'Event received' }, { status: 202 });

  } catch (error) {
    console.error('Error handling webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function processEventBackground(eventId: string) {
    try {
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        await fetch(`${baseUrl}/api/process-event`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventId })
        });
    } catch(err) {
        console.error("Failed to trigger process-event API", err)
    }
}
