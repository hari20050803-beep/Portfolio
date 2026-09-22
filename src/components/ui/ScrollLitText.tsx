import { motion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { useMemo, useRef } from 'react'
import { cn } from '../../lib/cn'
import { useReducedMotion } from '../../lib/hooks'

type Part = { text: string; serif: boolean }

/** Splits text into words; `*like this*` marks editorial serif segments. */
function tokenize(text: string): Part[][] {
  const words: Part[][] = []
  let serif = false
  let word: Part[] = []
  let buffer = ''
  const flushPart = () => {
    if (buffer) word.push({ text: buffer, serif })
    buffer = ''
  }
  const flushWord = () => {
    flushPart()
    if (word.length) words.push(word)
    word = []
  }
  for (const char of text) {
    if (char === '*') {
      flushPart()
      serif = !serif
    } else if (char === ' ') {
      flushWord()
    } else {
      buffer += char
    }
  }
  flushWord()
  return words
}

const serifClass = 'font-serif italic font-normal tracking-[-0.01em] text-[1.08em]'

function Word({ parts, progress, range }: { parts: Part[]; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.14, 1])
  return (
    <motion.span style={{ opacity }}>
      {parts.map((part, index) => (
        <span key={index} className={part.serif ? serifClass : undefined}>
          {part.text}
        </span>
      ))}
    </motion.span>
  )
}

/** A statement whose words light up as it scrolls through the viewport. */
export function ScrollLitText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const reduced = useReducedMotion()
  const words = useMemo(() => tokenize(text), [text])
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.88', 'end 0.5'] })

  return (
    <p ref={ref} className={cn(className)}>
      {words.map((parts, index) => (
        <span key={index}>
          {reduced ? (
            parts.map((part, i) => (
              <span key={i} className={part.serif ? serifClass : undefined}>
                {part.text}
              </span>
            ))
          ) : (
            <Word parts={parts} progress={scrollYProgress} range={[index / words.length, (index + 1) / words.length]} />
          )}
          {index < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </p>
  )
}
