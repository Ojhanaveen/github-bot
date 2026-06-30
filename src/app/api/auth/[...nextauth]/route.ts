import NextAuth, { NextAuthOptions } from "next-auth"
import GithubProvider from "next-auth/providers/github"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async session({ session, user, token }) {
      if (session.user) {
        // Handle both database (user) and jwt (token) strategies
        session.user.id = user?.id || token?.sub as string;
      }
      return session;
    }
  },
  session: {
    strategy: "database", // Force database strategy since we use Prisma
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
