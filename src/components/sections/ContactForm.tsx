import { useId, useRef, useState, type FormEvent } from 'react'
import { profile } from '../../data/profile'
import { cn } from '../../lib/cn'
import { Button } from '../ui/Button'
import { CopyButton } from './CopyButton'

type Values = { name: string; email: string; message: string }
type Errors = Partial<Record<keyof Values, string>>

const MAX_MESSAGE = 1500
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function validate(values: Values): Errors {
  const errors: Errors = {}
  if (!values.name.trim()) errors.name = 'Please enter your name.'
  if (!values.email.trim()) errors.email = 'Please enter your email address.'
  else if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = 'Please enter a valid email address.'
  if (!values.message.trim()) errors.message = 'Please write a short message.'
  return errors
}

function Field({
  id,
  label,
  error,
  multiline = false,
  className,
  ...inputProps
}: {
  id: string
  label: string
  error?: string
  multiline?: boolean
  className?: string
  name: keyof Values
  value: string
  onChange: (value: string) => void
  type?: string
  autoComplete?: string
  placeholder?: string
  maxLength?: number
  inputMode?: 'email' | 'text'
}) {
  const { onChange, ...rest } = inputProps
  const errorId = `${id}-error`
  const fieldClass = cn(
    'peer w-full border-0 border-b bg-transparent px-0 py-3 text-lg text-fog-50 placeholder:text-fog-600 focus:outline-none',
    'transition-colors duration-500',
    error ? 'border-[#e8a0a0]/70' : 'border-white/15 hover:border-white/30',
  )
  const shared = {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? errorId : undefined,
    required: true,
    ...rest,
  }
  return (
    <div className={cn('relative', className)}>
      <label htmlFor={id} className="eyebrow text-fog-400">
        {label}
      </label>
      <div className="relative mt-2">
        {multiline ? (
          <textarea
            {...shared}
            rows={5}
            onChange={(event) => onChange(event.target.value)}
            className={cn(fieldClass, 'resize-none leading-relaxed')}
          />
        ) : (
          <input {...shared} onChange={(event) => onChange(event.target.value)} className={fieldClass} />
        )}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 bg-accent transition-transform duration-700 ease-cinematic peer-focus:scale-x-100"
        />
      </div>
      {error && (
        <p id={errorId} className="mt-2 text-sm text-[#f0b0b0]">
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * There is no backend: submitting opens the visitor's email app with the
 * message pre-filled (mailto), which the form states clearly.
 */
export function ContactForm() {
  const id = useId()
  const formRef = useRef<HTMLFormElement>(null)
  const [values, setValues] = useState<Values>({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [opened, setOpened] = useState(false)

  const set = (key: keyof Values) => (value: string) => {
    setValues((current) => ({ ...current, [key]: value }))
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }))
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    const firstInvalid = (Object.keys(nextErrors) as (keyof Values)[])[0]
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus()
      return
    }
    const name = values.name.trim()
    const subject = `Portfolio enquiry from ${name}`
    const body = `${values.message.trim()}\n\n— ${name}\n${values.email.trim()}`
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setOpened(true)
  }

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={onSubmit}
      aria-describedby={`${id}-note`}
      className="glass relative overflow-hidden rounded-[1.25rem] p-6 sm:p-10"
    >
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      <div className="grid gap-8 sm:grid-cols-2">
        <Field
          id={`${id}-name`}
          name="name"
          label="Name"
          autoComplete="name"
          placeholder="Your name"
          value={values.name}
          onChange={set('name')}
          error={errors.name}
        />
        <Field
          id={`${id}-email`}
          name="email"
          type="email"
          inputMode="email"
          label="Email"
          autoComplete="email"
          placeholder="Your email address"
          value={values.email}
          onChange={set('email')}
          error={errors.email}
        />
      </div>
      <Field
        id={`${id}-message`}
        name="message"
        label="Message"
        multiline
        maxLength={MAX_MESSAGE}
        placeholder="Tell me about your idea, opportunity or project"
        className="mt-8"
        value={values.message}
        onChange={set('message')}
        error={errors.message}
      />

      <div className="mt-10 flex flex-col-reverse gap-6 sm:flex-row sm:items-center sm:justify-between">
        <p id={`${id}-note`} className="max-w-xs text-sm leading-relaxed text-fog-500">
          Sending opens your email app with this message ready to go. Nothing is stored on this site.
        </p>
        <Button type="submit" magnetic>
          Send Message
        </Button>
      </div>

      <div role="status" aria-live="polite">
        {opened && (
          <div className="mt-8 flex flex-col gap-3 border-t border-white/[0.08] pt-6 text-sm text-fog-300 sm:flex-row sm:items-center sm:justify-between">
            <p>Your email app should now be open with the message ready. If it didn&rsquo;t open, email me directly:</p>
            <CopyButton value={profile.email} label="Copy email" />
          </div>
        )}
      </div>
    </form>
  )
}
