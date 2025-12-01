
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const webhookUrl = "https://rahul264.app.n8n.cloud/webhook-test/ea211a1a-1318-4ecf-af86-ce2d24dcb5ba";

  try {
    const body = await req.json();

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Webhook server error:", errorBody);
      return new NextResponse(errorBody, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Error in webhook proxy:', error);
    // Return a more detailed error message to the client
    return new NextResponse(
        JSON.stringify({
            error: "Failed to proxy request to webhook.",
            details: error.message || "An unknown error occurred."
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
