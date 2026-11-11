/* AskLama Gemini endpoint. Runs server-side on Vercel; never exposes GEMINI_API_KEY. */
const AI_MODELS = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-3.5-flash-lite'];

/* Public facts supplied by the site owner. Never infer a billing period or claim live status. */
const LAMA_SITE_FACTS = [
  'LAMA Studio: Software, Education and Innovation. Official website: https://www.lamastudio.pk/',
  'LAMA School Suite: School management software for private, government and preparatory schools; supports student and teacher administration, attendance, examination/results, syllabus planning and communications. The availability of individual features can vary during development.',
  'LAMA School Suite starting price: Rs. 1,500. This is a starting price only; billing period and school-specific plan terms must be confirmed with LAMA Studio.',
  'LAMA Studio WhatsApp contact for product information: 03437064536.',
  'LAMA School Suite site and registration: https://www.lamastudio.pk/lamastudio-school-suite/',
  'LAMA PPSC Preparation Academy: competitive examination preparation, job-specific syllabi and practice papers; https://www.lamastudio.pk/education-academy/',
  'LAMA Kids Learning: child-focused learning activities. LAMA IQ Test: separate IQ and practice-question app.',
  'LamaSky: weather application. LAMA VPN Pro: separate VPN app. Do not confuse these products.',
  'The School Suite has school, teacher, and student/parent logins. A School ID identifies the school; users must still sign in with their authorized credentials.',
  'Do not request or display private school records, passwords, student details or billing history.'
].join('\n');

function getSiteAnswer(prompt) {
  const q = String(prompt || '').toLocaleLowerCase('en').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
  if (!q) return null;
  const has = expression => expression.test(q);
  const school = has(/\b(school|schools|erp|management software|school suite|school suit|اسکول|سکول|مدرسہ)\b/u);
  const price = has(/\b(price|cost|fees?|charges?|rates?|subscription|pricing|buy|purchase|قیمت|فیس|ریٹ|کتنے|پیسا|روپے|روپیہ)\b/u);
  if (school && price) return 'LAMA School Suite starts from Rs. 1,500. This is a starting price, not a confirmed monthly fee. For current plans, a demo, and school-specific pricing, WhatsApp 03437064536 or visit https://www.lamastudio.pk/lamastudio-school-suite/';
  if (school && has(/\b(what is|about|features?|modules?|benefits?|manage|attendance|results?|exams?|how does|سہولیات|خصوصیات|کیا ہے|کیا کرتا)\b/u))
    return 'LAMA School Suite is LAMA Studio’s school management platform, designed for student and teacher records, attendance, examinations and results, syllabus planning, fees and school communications. Some functions may be in testing. Explore the platform or request a demonstration at https://www.lamastudio.pk/lamastudio-school-suite/; WhatsApp 03437064536.';
  if (school && has(/\b(login|log in|sign in|access|school id|teacher|student|parent|لاگ ان|آئی ڈی)\b/u))
    return 'Open the LAMA School Suite page at https://www.lamastudio.pk/lamastudio-school-suite/ and choose your school, teacher or student/parent portal. Use your own School ID and authorized account credentials. School IDs can be copied from the school board. Ask your school administrator for account access—never share your password in chat.';
  if (has(/\b(whatsapp|contact|support|phone|telephone|helpline|number|رابطہ|واٹس ایپ|فون نمبر)\b/u))
    return 'You can contact LAMA Studio about software, registration or demonstrations on WhatsApp: 03437064536. Official website: https://www.lamastudio.pk/';
  if (has(/\b(ppsc|headmaster|headmistress|competitive exam|preparation academy|پنجاب پبلک سروس)\b/u))
    return 'LAMA PPSC Preparation Academy provides job-specific competitive-test preparation, syllabi and practice questions. Visit https://www.lamastudio.pk/education-academy/ for the available categories and sample materials.';
  if (has(/\b(lamasky|lama sky|weather app|موسم)\b/u))
    return 'LamaSky is the LAMA Studio weather app. It is separate from LAMA VPN Pro. Explore LAMA Studio’s apps at https://www.lamastudio.pk/#apps.';
  if (has(/\b(vpn|lama vpn)\b/u))
    return 'LAMA VPN Pro is a separate VPN-related application, not the weather app LamaSky. Visit https://www.lamastudio.pk/#apps for the LAMA Studio app catalog.';
  if (has(/\b(iq test|lama iq|kids learning|children learning|بچوں کی تعلیم)\b/u))
    return 'LAMA IQ Test focuses on IQ/practice questions, while LAMA Kids Learning focuses on children’s learning activities. These are separate projects. Browse them at https://www.lamastudio.pk/#apps.';
  if (has(/\b(what is lama studio|about lama studio|who are you|what is this website|what can this site do|لاما اسٹوڈیو)\b/u))
    return 'LAMA Studio is an independent software and education studio developing tools for schools, learners and everyday digital tasks. The website is https://www.lamastudio.pk/. You can browse projects, developer tools, school software and the education academy.';
  return null;
}

function getPageContext(raw) {
  const path = typeof raw === 'string' && raw.startsWith('/') ? raw.slice(0,100) : '/';
  if (path.startsWith('/lamastudio-school-suite/')) return 'Visitor is viewing a LAMA School Suite page.';
  if (path.startsWith('/education-academy/')) return 'Visitor is viewing LAMA PPSC Preparation Academy.';
  if (path.startsWith('/categories/')) return 'Visitor is exploring LAMA Studio tools: '+path;
  if (path.startsWith('/apps/')) return 'Visitor is viewing a LAMA Studio app: '+path;
  if (path.startsWith('/blogs/')) return 'Visitor is reading a LAMA Studio article: '+path;
  return 'Visitor is on the LAMA Studio website.';
}

const SYSTEM_GUIDE = [
  'You are AskLama, the public-facing virtual guide for LAMA Studio (lamastudio.pk).',
  'Answer helpfully in the language of the visitor. Be friendly, concise and accurate.',
  'LAMA Studio develops education and software projects, including LAMA School Suite.',
  'Do not claim you accessed private school data, payment records, accounts or live app status.',
  'When information about a LAMA product is unavailable, explain the uncertainty.',
  'Do not request passwords, student records, financial information or secret API keys.',
  'Use these verified public facts as grounding. Never make up prices, billing periods or release promises:',
  LAMA_SITE_FACTS
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

  const directAnswer = getSiteAnswer(prompt);
  if (directAnswer) return res.status(200).json({text:directAnswer,source:'site-guide'});

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('AskLama: GEMINI_API_KEY is not configured');
    return res.status(503).json({error:'AskLama is temporarily unavailable. Please try again later.'});
  }

  const contents = buildContents(prompt, body.history);
  contents[contents.length - 1].parts[0].text = getPageContext(body.pagePath)+'\nVisitor question: '+prompt;
  let retryableFailure = false;

  for (let i=0; i<AI_MODELS.length; i++) {
    const model = AI_MODELS[i];
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), i === 0 ? 9000 : i === 1 ? 7000 : 5000);
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
      ? 'The AI service is temporarily unavailable. Ask me about LAMA Studio, School Suite pricing, app features, registration or contact information, or try your broader question later.'
      : 'The AI service is unavailable. You can still ask about LAMA Studio products.'
  });
}

// Expose pure helpers for unit tests only; no credentials.
export const __askLamaHelpers = {parseRequest, buildContents, extractText, getSiteAnswer, getPageContext};
