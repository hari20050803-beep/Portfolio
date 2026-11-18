import { StrictMode } from 'react';
import { prerenderToNodeStream } from 'react-dom/static';
import { App } from './App';

/** Renders the whole page to HTML at build time. Used by scripts/prerender.mjs. */
export async function render(): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <StrictMode>
      <App />
    </StrictMode>,
    // By default React moves large sections into a hidden block that a script
    // reveals. This keeps them as plain HTML, readable with no JavaScript at all.
    { progressiveChunkSize: Number.MAX_SAFE_INTEGER },
  );

  const chunks: Buffer[] = [];
  for await (const chunk of prelude) {
    chunks.push(Buffer.from(chunk as Uint8Array));
  }
  return Buffer.concat(chunks).toString('utf8');
}
