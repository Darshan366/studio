
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 1. Extract the user's prompt from the incoming request.
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
    }

    // 2. Get the webhook URL from server-side environment variables.
    const webhookUrl = process.env.N8N_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error("N8N_WEBHOOK_URL is not set in the environment variables.");
      return NextResponse.json({ error: 'AI service is not configured.' }, { status: 500 });
    }

    // 3. Securely call the n8n webhook from the server.
    const webhookResponse = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: prompt }), // n8n expects the prompt in a 'text' field
    });

    if (!webhookResponse.ok) {
        const errorText = await webhookResponse.text();
        console.error("Webhook server error:", errorText);
        return NextResponse.json({ error: `The webhook server responded with status ${webhookResponse.status}.` }, { status: 502 });
    }
    
    // 4. Parse the response and extract the "GYM" value.
    const data = await webhookResponse.json();
    const reply = data?.GYM;

    if (!reply) {
        console.error("Webhook response did not contain a 'GYM' field. Response:", data);
        return NextResponse.json({ error: "The response from the webhook was not in the expected format." }, { status: 500 });
    }

    // 5. Send the extracted value back to the client.
    return NextResponse.json({ reply });

  } catch (err: any) {
    console.error("Error in /api/ai-suggestions:", err);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
