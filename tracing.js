// tracing.js
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const enabled = process.env.ENABLE_NODE_TRACING === 'true';
const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

if (!enabled || !endpoint) {
  console.info('Node tracing disabled. Set ENABLE_NODE_TRACING=true and OTEL_EXPORTER_OTLP_ENDPOINT to enable.');
} else {
  const sdk = new NodeSDK({
    instrumentations: [getNodeAutoInstrumentations()],
    traceExporter: new (await import('@opentelemetry/exporter-trace-otlp-http')).OTLPTraceExporter({
      url: endpoint,
    }),
  });

  sdk
    .start()
    .then(() => {
      console.log('Tracing initialized.');
    })
    .catch((error) => {
      console.error('Error initializing tracing:', error);
    });
}

// To use tracing, import this file at the top of your main entry point (e.g., index.js or server.js)
