import type { VercelRequest, VercelResponse } from '@vercel/node';

const getEnv = (...names: string[]) => names.map(name => process.env[name]).find(Boolean);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const publicKey = getEnv('LANGFUSE_PUBLIC_KEY');
  const secretKey = getEnv('LANGFUSE_SECRET_KEY');
  const baseUrl = getEnv('LANGFUSE_BASE_URL') || 'https://cloud.langfuse.com';
  if (!publicKey || !secretKey) return res.status(503).json({ error: 'Langfuse credentials are not configured' });

  const { traceId, name, input, output, metadata } = req.body || {};
  if (!traceId || !name) return res.status(400).json({ error: 'traceId and name are required' });

  const event = {
    id: traceId,
    type: 'trace-create',
    timestamp: new Date().toISOString(),
    body: {
      id: traceId,
      name,
      input,
      output,
      metadata: { ...metadata, source: 'settlewise-dashboard' },
    },
  };

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/public/ingestion`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${publicKey}:${secretKey}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ batch: [event] }),
    });
    if (!response.ok) return res.status(response.status).json({ error: 'Langfuse ingestion failed' });
    return res.status(200).json({ traced: true, traceId });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Trace failed' });
  }
}
