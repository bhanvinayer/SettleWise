import { NodeSDK } from '@opentelemetry/sdk-node';
import { LangfuseSpanProcessor } from '@langfuse/otel';

const processor = new LangfuseSpanProcessor({
  exportMode: 'immediate',
});

export const langfuseSdk = new NodeSDK({
  spanProcessors: [processor],
});

langfuseSdk.start();

export async function flushLangfuse(): Promise<void> {
  await processor.forceFlush();
}
