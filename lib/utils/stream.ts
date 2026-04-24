import type { GenerationEvent } from "@/types/generation";

export function encodeSSE(event: GenerationEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export function createSSEStream(): {
  readable: ReadableStream;
  send: (event: GenerationEvent) => void;
  close: () => void;
} {
  let controller: ReadableStreamDefaultController<Uint8Array>;
  const encoder = new TextEncoder();

  const readable = new ReadableStream<Uint8Array>({
    start(c) {
      controller = c;
    },
  });

  return {
    readable,
    send(event: GenerationEvent) {
      controller.enqueue(encoder.encode(encodeSSE(event)));
    },
    close() {
      controller.close();
    },
  };
}
