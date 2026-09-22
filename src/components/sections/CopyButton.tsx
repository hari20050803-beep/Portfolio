import { Check, Copy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '../../lib/cn'

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value)
    return true
  } catch {
    // Fallback for browsers without the async clipboard API.
    const area = document.createElement('textarea')
    area.value = value
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    area.remove()
    return ok
  }
}

export function CopyButton({ value, label, className }: { value: string; label: string; className?: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const id = window.setTimeout(() => setCopied(false), 2200)
    return () => window.clearTimeout(id)
  }, [copied])

  return (
    <button
      type="button"
      onClick={async () => setCopied(await copyText(value))}
      className={cn(
        'inline-flex h-9 shrink-0 items-center gap-2 rounded-full border border-white/12 px-3.5 text-xs text-fog-200 transition-colors duration-500 hover:border-white/30 hover:text-fog-50',
        className,
      )}
    >
      {copied ? <Check aria-hidden="true" className="size-3.5 text-accent" /> : <Copy aria-hidden="true" className="size-3.5" />}
      <span aria-live="polite">{copied ? 'Copied' : label}</span>
    </button>
  )
}
