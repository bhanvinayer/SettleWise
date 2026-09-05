import type { VercelRequest, VercelResponse } from '@vercel/node';
import { propagateAttributes, startActiveObservation } from '@langfuse/tracing';
import { flushLangfuse } from '../src/server/langfuse.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
  const secretKey = process.env.LANGFUSE_SECRET_KEY;
  if (!publicKey || !secretKey) return res.status(503).json({ error: 'Langfuse credentials are not configured' });

  const { traceId, name, input, output, metadata } = req.body || {};
  if (!traceId || !name) return res.status(400).json({ error: 'traceId and name are required' });

  try {
    await propagateAttributes({ tags: ['settlewise', 'finance-controller', 'langgraph'], version: 'track04-v1' }, async () => {
      await startActiveObservation(name, async root => {
        root.update({
          input,
          metadata: { ...metadata, traceId, source: 'settlewise-dashboard', environment: process.env.APP_ENV || 'production' },
        });

        const graphObservation = root.startObservation(
          'langgraph-execution',
          { input: { traceId, graphId: metadata?.graphId, nodeCount: metadata?.nodes } },
          { asType: 'agent' },
        );
        graphObservation.update({ output });
        graphObservation.end();
        root.update({ output });
      });
    });

    await flushLangfuse();
    return res.status(200).json({ traced: true, traceId, provider: 'langfuse-sdk' });
  } catch (error) {
    return res.status(502).json({ error: error instanceof Error ? error.message : 'Langfuse SDK trace failed' });
  }
}
