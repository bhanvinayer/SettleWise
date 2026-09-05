import type { VercelRequest, VercelResponse } from '@vercel/node';
import { propagateAttributes, startActiveObservation } from '@langfuse/tracing';
import { flushLangfuse } from '../src/server/langfuse.js';

const getEnv = (...names: string[]) => names.map(name => process.env[name]).find(Boolean);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const apiKey = getEnv('GROQ_API_KEY', 'groq_api_key');
  if (!apiKey) return res.status(200).json({ provider: 'deterministic-only', available: false });

  const { exceptionCase, deterministicPolicy } = req.body || {};
  const prompt = [
    'You are the SettleWise LLM Policy Reviewer inside a finance-control LangGraph.',
    'Review evidence, hypotheses, money trail, and deterministic policy output.',
    'You may veto auto-resolution when evidence is ambiguous, but you must never approve a case that deterministic policy rejected.',
    'Return JSON only: {"approved": boolean, "decision": "AUTO_RESOLVE"|"HUMAN_REVIEW"|"BLOCK"|"RECOVERY_CASE", "risk": "LOW"|"MEDIUM"|"HIGH", "reason": string, "checks": string[]}.',
    `Exception: ${JSON.stringify(exceptionCase)}`,
    `Deterministic policy: ${JSON.stringify(deterministicPolicy)}`,
  ].join('\n');

  try {
    const review = await propagateAttributes({ tags: ['settlewise', 'groq', 'policy-review'], version: 'track04-v1' }, async () => startActiveObservation('settlewise-groq-policy-review', async root => {
      const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
      root.update({
        input: { caseId: exceptionCase?.id, category: exceptionCase?.category, deterministicPolicy },
        metadata: { source: 'groq', model, feature: 'langgraph-policy-review' },
      });
      const generation = root.startObservation(
        'groq-policy-generation',
        { model, input: [{ role: 'user', content: prompt }] },
        { asType: 'generation' },
      );

      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model,
            temperature: 0,
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: 'You are a conservative financial policy reviewer. Do not invent evidence.' },
              { role: 'user', content: prompt },
            ],
          }),
        });
        const rawBody = await response.text();
        if (!response.ok) throw new Error('Groq policy review unavailable');
        const payload = JSON.parse(rawBody);
        const content = payload?.choices?.[0]?.message?.content;
        if (typeof content !== 'string' || !content.trim()) throw new Error('Empty Groq policy review');
        const normalized = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
        const start = normalized.indexOf('{');
        const end = normalized.lastIndexOf('}');
        const parsedReview = JSON.parse(normalized.slice(start, end + 1));
        generation.update({ output: parsedReview, usageDetails: payload.usage ? { input: payload.usage.prompt_tokens, output: payload.usage.completion_tokens, total: payload.usage.total_tokens } : undefined });
        generation.end();
        root.update({ output: { decision: parsedReview.decision, approved: parsedReview.approved } });
        return parsedReview;
      } catch (error) {
        generation.update({ output: { error: error instanceof Error ? error.message : 'Groq review failed' } });
        generation.end();
        throw error;
      }
    }));
    await flushLangfuse();
    return res.status(200).json({ provider: 'groq', available: true, review });
  } catch {
    await flushLangfuse().catch(() => undefined);
    return res.status(200).json({ provider: 'deterministic-only', available: false, warning: 'Groq policy review failed safely' });
  }
}
