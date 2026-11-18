import { useEffect, useState } from 'react';
import { Icon } from '../ui/Icon';

type CopyState = 'idle' | 'copied' | 'blocked';

/** Copies the email address, for visitors whose email app doesn't open from a link. */
export function CopyEmail({ email }: { email: string }) {
  const [state, setState] = useState<CopyState>('idle');
  // Copying needs JavaScript, so the button only appears once the page is running.
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  useEffect(() => {
    if (state !== 'copied') return;
    const timer = window.setTimeout(() => setState('idle'), 2500);
    return () => window.clearTimeout(timer);
  }, [state]);

  if (!ready) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setState('copied');
    } catch {
      setState('blocked');
    }
  };

  return (
    <>
      <button className="btn btn--ghost btn--small copy-email" type="button" onClick={copy}>
        <Icon name={state === 'copied' ? 'check' : 'copy'} />
        {state === 'copied' ? 'Email copied' : 'Copy email'}
      </button>
      <span className="sr-comma" role="status">
        {state === 'copied' ? 'Email address copied' : ''}
      </span>
      {state === 'blocked' ? (
        <span className="copy-email__hint">Your browser blocked copying. Select the address to copy it.</span>
      ) : null}
    </>
  );
}
