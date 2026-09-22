import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Link } from '../../lib/navigation'
import { Magnetic } from './Magnetic'
import { RollText, SwapArrow, type ArrowDirection } from './Motifs'

type Variant = 'primary' | 'secondary'

interface CommonProps {
  children: string
  variant?: Variant
  icon?: ArrowDirection | 'none'
  leading?: ReactNode
  magnetic?: boolean
  size?: 'md' | 'lg'
  className?: string
  'aria-label'?: string
}

type ButtonProps = CommonProps &
  (
    | { to: string; href?: never; type?: never; onClick?: never }
    | { href: string; to?: never; type?: never; onClick?: never; external?: boolean }
    | { type: 'submit' | 'button'; onClick?: () => void; to?: never; href?: never }
  )

const variants: Record<Variant, string> = {
  primary:
    'bg-fog-50 text-ink-950 hover:bg-white hover:shadow-[0_0_0_6px_rgb(255_255_255/0.06),0_20px_50px_-14px_rgb(155_179_214/0.55)]',
  secondary: 'border border-white/15 text-fog-100 hover:border-white/35 hover:bg-white/[0.04]',
}

const sizes = { md: 'h-12 px-6 text-[0.9375rem]', lg: 'h-14 px-7 text-base' }

export function Button(props: ButtonProps) {
  const { children, variant = 'primary', icon = 'up-right', leading, magnetic = false, size = 'md', className } = props
  const classes = cn(
    'group relative inline-flex items-center justify-center gap-3 rounded-full font-medium tracking-[-0.01em] whitespace-nowrap',
    'transition-[background-color,border-color,color,box-shadow] duration-500 ease-cinematic',
    variants[variant],
    sizes[size],
    className,
  )
  const content = (
    <>
      {leading}
      <RollText>{children}</RollText>
      {icon !== 'none' && <SwapArrow direction={icon} />}
    </>
  )

  let element: ReactNode
  if ('to' in props && props.to !== undefined) {
    element = (
      <Link to={props.to} className={classes} aria-label={props['aria-label']}>
        {content}
      </Link>
    )
  } else if ('href' in props && props.href !== undefined) {
    const external = 'external' in props && props.external
    element = (
      <a
        href={props.href}
        className={classes}
        aria-label={props['aria-label']}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {content}
      </a>
    )
  } else {
    element = (
      <button
        type={'type' in props ? props.type : 'button'}
        onClick={'onClick' in props ? props.onClick : undefined}
        className={classes}
        aria-label={props['aria-label']}
      >
        {content}
      </button>
    )
  }

  return magnetic ? <Magnetic>{element}</Magnetic> : element
}
