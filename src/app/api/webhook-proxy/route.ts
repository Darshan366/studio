
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 1. Get the text from the incoming request from our frontend
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text payload is required' }, { status: 400 });
    }

    const webhookUrl = 'https://rahul264.app.n8n.cloud/webhook-test/ea211a1a-1318-4ecf-af86-ce2d24dcb5ba';

    // 2. Forward this payload to the external n8n webhook URL
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    // 3. Check if the webhook call was successful
    if (!webhookResponse.ok) {
      // If the webhook returns an error, forward that error to our frontend
      const errorBody = await webhookResponse.text();
      console.error('Webhook error:', errorBody);
      return NextResponse.json({ error: 'The webhook server returned an error.' }, { status: webhookResponse.status });
    }

    // 4. Send a success response back to our frontend
    return NextResponse.json({ message: 'Successfully forwarded to webhook' }, { status: 200 });

  } catch (error) {
    console.error('Error in webhook proxy:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
