import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createSettleWiseAgentRecommendation } from '../src/engine/settleWiseAgent.js';
import { propagateAttributes, startActiveObservation } from '@langfuse/tracing';
import { flushLangfuse } from '../src/server/langfuse.js';

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
  const { guardrails, metrics } = req.body || {};
  const localRecommendation = createSettleWiseAgentRecommendation(guardrails, metrics);
  if (!apiKey) return res.status(200).json({ provider: 'settlewise-agent', recommendation: localRecommendation, aiProvider: 'deterministic-fallback' });
  const prompt = [
    'You are the SettleWise Finance Controller Agent reviewing policy guardrails.',
    'Recommend only measurable policy changes. Never recommend auto-resolution when false-positive risk increases.',
    `Current guardrails: ${JSON.stringify(guardrails)}`,
    `Latest replay metrics: ${JSON.stringify(metrics)}`,
    'Return strict JSON with keys: summary, recommendedChanges (array of {field, value, reason}), riskLevel, reasoning, checks.',
  ].join('\n');

  try {
    const recommendation = await propagateAttributes({ tags: ['settlewise', 'groq', 'policy-recommendation'], version: 'track04-v1' }, async () => startActiveObservation('settlewise-agent-policy-recommendation', async root => {
      const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
      root.update({ input: { guardrails, metrics }, metadata: { source: 'groq', model, feature: 'policy-recommendation' } });
      const generation = root.startObservation('groq-policy-recommendation-generation', { model, input: [{ role: 'user', content: prompt }] }, { asType: 'generation' });
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model,
            temperature: 0.1,
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: 'You provide conservative, auditable financial policy recommendations.' },
              { role: 'user', content: prompt },
            ],
          }),
        });
        const rawBody = await response.text();
        const payload = rawBody.trim() ? JSON.parse(rawBody) : {};
        if (!response.ok) throw new Error(payload.error?.message || 'Groq request failed');
        const parsedRecommendation = parseRecommendation(payload?.choices?.[0]?.message?.content);
        generation.update({ output: parsedRecommendation, usageDetails: payload.usage ? { input: payload.usage.prompt_tokens, output: payload.usage.completion_tokens, total: payload.usage.total_tokens } : undefined });
        generation.end();
        root.update({ output: { riskLevel: parsedRecommendation.riskLevel, changeCount: parsedRecommendation.recommendedChanges?.length || 0 } });
        return parsedRecommendation;
      } catch (error) {
        generation.update({ output: { error: error instanceof Error ? error.message : 'Groq recommendation failed' } });
        generation.end();
        throw error;
      }
    }));
    await flushLangfuse();
    return res.status(200).json({ provider: 'settlewise-agent', recommendation, aiProvider: 'groq' });
  } catch (error) {
    await flushLangfuse().catch(() => undefined);
    return res.status(200).json({
      provider: 'settlewise-agent',
      recommendation: localRecommendation,
      aiProvider: 'deterministic-fallback',
      warning: error instanceof Error ? error.message : 'Groq unavailable; deterministic agent used',
    });
  }
}
