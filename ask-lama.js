export default async function handler(req, res) {
  // 1. Verify the request method is POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Server API key not configured in environment variables.' });
  }

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt content is missing.' });
  }

  // 2. Active fallback model order using supported production models
  const modelsToTry = [
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite'
  ];

  let lastError = '';

  // System persona instructions to guide the AI's behavior across all languages
  const systemInstruction = {
    role: "user",
    parts: [{ text: "You are AskLama, the friendly, multilingual AI guide and mascot assistant for LamaStudio. You help users navigate apps like LamaVPN Pro and LamaSky, explain platform FAQs, and assist with school management features in any language they use (English, Urdu, Roman Urdu, Arabic, etc.). Keep answers helpful, concise, and polite." }]
  };

  const userMessage = {
    role: "user",
    parts: [{ text: prompt }]
  };

  // 3. Try each model sequentially
  for (const modelName of modelsToTry) {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contents: [systemInstruction, userMessage] 
        })
      });

      const data = await response.json();

      // Return successful text response
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return res.status(200).json({ text: data.candidates[0].content.parts[0].text });
      }

      // Handle server busy / overload errors gracefully
      if (data.error) {
        lastError = data.error.message || 'Model overloaded';
        console.warn(`Model [${modelName}] busy: ${lastError}. Switching to fallback...`);
        await new Promise(resolve => setTimeout(resolve, 400));
        continue;
      }
    } catch (err) {
      lastError = err.message || 'Network connectivity error';
      console.error(`Network error on model [${modelName}]:`, err);
    }
  }

  // 4. Return an error message if all models fail
  return res.status(503).json({ 
    error: `All AI servers are currently experiencing high traffic (${lastError}). Please try again in a moment.` 
  });
}
