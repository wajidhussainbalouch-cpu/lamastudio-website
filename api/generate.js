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

  // 2. Fallback cascade model order in case of high traffic
  const modelsToTry = [
    'gemini-3.7-flash',
    'gemini-3.6-flash',
    'gemini-2.5-flash'
  ];

  let lastError = '';

  // 3. Try each model sequentially if high demand errors occur
  for (const modelName of modelsToTry) {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      const data = await response.json();

      // Return successful text response
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return res.status(200).json({ text: data.candidates[0].content.parts[0].text });
      }

      // Handle server busy / high-demand overload errors gracefully
      if (data.error) {
        lastError = data.error.message || 'Model overloaded';
        console.warn(`Model [${modelName}] busy: ${lastError}. Switching to fallback...`);
        await new Promise(resolve => setTimeout(resolve, 400)); // Short 400ms pause
        continue;
      }
    } catch (err) {
      lastError = err.message || 'Network connectivity error';
      console.error(`Network error on model [${modelName}]:`, err);
    }
  }

  // 4. Return an error message if all backup models are simultaneously overloaded
  return res.status(503).json({ 
    error: `All AI servers are currently experiencing high traffic (${lastError}). Please try again in a moment.` 
  });
}
