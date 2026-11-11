/* AskLama Gemini endpoint. Runs server-side on Vercel; never exposes GEMINI_API_KEY. */
const AI_MODELS = ['gemini-3.8-flash', 'gemini-3.5-flash-lite', 'gemini-3.7-flash'];
const SYSTEM_GUIDE = [
  'You are AskLama, the public-facing virtual guide for LAMA Studio (lamastudio.pk).',
  'Answer helpfully in the language of the visitor. Be friendly, concise and accurate.',
  'LAMA Studio develops education and software projects, including LAMA School Suite.',
  'Do not claim you accessed private school data, payment records, accounts or live app status.',
  'When information about a LAMA product is unavailable, explain the uncertainty.',
  'Do not request passwords, student records, financial information or secret API keys.'
].join(' ');

function parseRequest(body) {
  if (typeof body === 'string') {
    try { return JSON.parse(body); } catch (_) { return {}; }
  }
  return body && typeof body === 'object' ? body : {};
}

function buildContents(prompt, inputHistory) {
  const history = Array.isArray(inputHistory) ? inputHistory.slice(-6) : [];
  const contents = history
    .filter(item => item && (item.role === 'user' || item.role === 'model' || item.role === 'assistant')
      && typeof item.text === 'string' && item.text.trim())
    .map(item => ({
      role: item.role === 'user' ? 'user' : 'model',
      parts: [{text: item.text.slice(0, 1400).trim()}]
    }));
  contents.push({role: 'user', parts: [{text: prompt}]});
  return contents;
}

function extractText(payload) {
  return (payload?.candidates?.[0]?.content?.parts || [])
    .map(part => typeof part.text === 'string' ? part.text : '')
    .join('\n').trim();
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({error:'Only POST messages are supported.'});
  }
  const body = parseRequest(req.body);
  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
  if (!prompt || prompt.length > 1200) {
    return res.status(400).json({error:'Please enter a question of up to 1,200 characters.'});
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('AskLama: GEMINI_API_KEY is not configured');
    return res.status(503).json({error:'AskLama is temporarily unavailable. Please try again later.'});
  }

  const contents = buildContents(prompt, body.history);
  let retryableFailure = false;

  for (let i=0; i<AI_MODELS.length; i++) {
    const model = AI_MODELS[i];
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), i === 0 ? 14000 : i === 1 ? 9000 : 6000);
    try {
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent',
        {
          method: 'POST',
          headers: {
            'Content-Type':'application/json',
            'x-goog-api-key':apiKey
          },
          body: JSON.stringify({
            systemInstruction: {parts:[{text:SYSTEM_GUIDE}]},
            contents,
            generationConfig: {temperature:0.65, maxOutputTokens:800}
          }),
          signal: controller.signal
        }
      );
      let payload;
      try { payload = await response.json(); }
      catch (_) { payload = {}; }

      if (response.ok) {
        const text = extractText(payload);
        if (text) return res.status(200).json({text});
        if (payload?.promptFeedback?.blockReason) {
          return res.status(400).json({error:'This request could not be answered. Please ask a different question.'});
        }
        retryableFailure = true;
        console.warn('AskLama: empty response from model', model);
        continue;
      }

      console.warn('AskLama: model response status', model, response.status);
      if ([429, 500, 502, 503, 504, 404].includes(response.status)) {
        retryableFailure = true;
        continue;
      }
      if (response.status === 400) {
        // A model-specific unsupported parameter can be tried on a fallback.
        retryableFailure = true;
        continue;
      }
      // Invalid API credentials or disallowed access will not recover by
      // sending the same key to several models.
      return res.status(503).json({error:'AskLama is not available right now. Please try again later.'});
    } catch (error) {
      retryableFailure = true;
      console.warn('AskLama: AI request failed', model, error?.name || 'NetworkError');
    } finally {
      clearTimeout(timeout);
    }
  }
  return res.status(503).json({
    error: retryableFailure
      ? 'AskLama is busy or the connection timed out. Please try again shortly.'
      : 'AskLama is temporarily unavailable.'
  });
}

// Expose pure helpers for unit tests only; no credentials.
export const __askLamaHelpers = {parseRequest, buildContents, extractText};
