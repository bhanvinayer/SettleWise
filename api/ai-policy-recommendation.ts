import type { VercelRequest, VercelResponse } from '@vercel/node';

const getEnv = (...names: string[]) => names.map(name => process.env[name]).find(Boolean);

function parseRecommendation(content: unknown) {
  if (typeof content !== 'string' || !content.trim()) throw new Error('Groq returned an empty recommendation');
  const normalized = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  const start = normalized.indexOf('{');
  const end = normalized.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('Groq returned malformed recommendation JSON');
  return JSON.parse(normalized.slice(start, end + 1));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = getEnv('GROQ_API_KEY', 'groq_api_key');
  if (!apiKey) return res.status(503).json({ error: 'Groq API key is not configured' });

  const { guardrails, metrics } = req.body || {};
  const prompt = [
    'You are a cautious finance controller reviewing SettleWise policy guardrails.',
    'Recommend only measurable policy changes. Never recommend auto-resolution when false-positive risk increases.',
    `Current guardrails: ${JSON.stringify(guardrails)}`,
    `Latest replay metrics: ${JSON.stringify(metrics)}`,
    'Return strict JSON with keys: summary, recommendedChanges (array of {field, value, reason}), riskLevel, reasoning.',
  ].join('\n');

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
        temperature: 0.1,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'You provide conservative, auditable financial policy recommendations.' },
          { role: 'user', content: prompt },
        ],
      }),
    });
    const rawBody = await response.text();
    let payload: { error?: { message?: string }; choices?: { message?: { content?: string } }[] } = {};
    try {
      payload = rawBody.trim() ? JSON.parse(rawBody) : {};
    } catch {
      return res.status(502).json({ error: 'Groq returned an invalid response' });
    }
    if (!response.ok) return res.status(response.status).json({ error: payload.error?.message || 'Groq request failed' });
    const content = payload?.choices?.[0]?.message?.content;
    return res.status(200).json({ provider: 'groq', recommendation: parseRecommendation(content) });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Recommendation failed' });
  }
}
