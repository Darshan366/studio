
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
      // Return the actual error from the webhook server to the client
      return new NextResponse(errorBody || `Request failed with status ${response.status}`, { status: response.status });
    }

    // Handle potentially empty responses from the webhook
    const responseText = await response.text();
    if (!responseText) {
      // If the response is empty, return a success response with an empty body
      return NextResponse.json({});
    }

    // If the response has content, try to parse it as JSON
    const data = JSON.parse(responseText);
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
