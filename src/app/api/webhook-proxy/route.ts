
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const webhookUrl = "https://rahul264.app.n8n.cloud/webhook-test/ea211a1a-1318-4ecf-af86-ce2d24dcb5ba";

  try {
    const body = await req.json();

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // n8n webhooks might not require special headers, but some services do.
        // This is where you would add an API key if n8n required it.
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      // If the webhook server returns an error, forward it to the client.
      const errorBody = await response.text();
      console.error("Webhook server error:", errorBody);
      return new NextResponse(errorBody, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in webhook proxy:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
