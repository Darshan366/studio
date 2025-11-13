const functions = require("firebase-functions");
const axios = require("axios");

// To set your API key, run the following command in your terminal:
// firebase functions:config:set ai.key="YOUR_GEMINI_API_KEY"

exports.exerciseAI = functions.https.onRequest(async (req, res) => {
  // Set CORS headers for preflight and actual requests
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    // End preflight request successfully
    res.status(204).send('');
    return;
  }
  
  try {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const apiKey = functions.config().ai.key;
    if (!apiKey) {
      console.error("Gemini API key not configured in Firebase Functions config.");
      return res.status(500).send("AI key not configured");
    }

    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).send("Prompt required");
    }

    const geminiResponse = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + apiKey,
      {
        contents: [{ parts: [{ text: prompt }]}]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const reply =
      geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn’t generate a response at this time.";

    res.status(200).send({ reply });

  } catch (err) {
    console.error("Error calling Gemini API:", err.response ? err.response.data : err.message);
    res.status(500).send("Internal Server Error");
  }
});
