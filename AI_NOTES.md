# AI Integration Notes

## Overview

This project uses the **Google Gemini API** (`gemini-2.5-flash` model) to provide AI-powered summarization of GitHub issues.

## How It Works

When a new GitHub issue is opened, the bot:
1. Receives the webhook event from GitHub
2. Extracts the issue title and body text
3. Sends a structured prompt to the Gemini API
4. Posts the AI-generated summary as a comment on the GitHub issue

## Model Used

- **Model**: `gemini-2.5-flash`
- **Library**: `@google/genai` (Google Gen AI SDK)
- **Why this model**: The `gemini-2.5-flash` model provides fast, high-quality text generation with a generous free tier quota. It is ideal for real-time summarization tasks where low latency is important.

## Prompt Design

The prompt is kept concise and task-focused:

```
Summarize the following GitHub issue in 2-3 concise sentences. 
Focus on the core problem or request.

Title: {issue_title}
Body: {issue_body}
```

**Design decisions:**
- **2-3 sentence limit**: Keeps summaries scannable and actionable in Slack notifications
- **"Focus on the core problem"**: Instructs the model to avoid restating the title verbatim
- **No few-shot examples**: The task is simple enough that zero-shot works well and reduces token cost

## Error Handling

The AI summarization is wrapped in a try/catch block. If the API call fails (e.g., rate limit, network error), the bot:
1. Logs the error to the console
2. Falls back to `"AI summarization failed due to an error."`
3. **Still posts the GitHub comment and Slack notification** — the core workflow is not blocked by AI failures

This ensures the bot remains reliable even when the AI service is temporarily unavailable.

## Configuration

The model can be overridden via the `GEMINI_MODEL_NAME` environment variable, making it easy to switch to other Gemini models (e.g., `gemini-2.0-flash`, `gemini-1.5-flash`) without code changes.

## Future Improvements

- **Configurable prompts per repository**: Allow users to define custom prompt templates per repo
- **PR summarization**: Summarize pull request diffs and changed files
- **Issue classification**: Use AI to automatically apply labels (bug, feature, question)
- **Sentiment analysis**: Detect frustration in issue descriptions and prioritize accordingly
- **Multi-language support**: Detect and respond in the same language as the issue
