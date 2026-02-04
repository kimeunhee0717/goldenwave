import { useEffect, useState } from 'react'

interface Heading {
  id: string
  text: string
  level: number
}

interface Props {
  content: string
}

export default function TableOfContents({ content }: Props) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    // 마크다운에서 헤딩 추출
    const regex = /^(#{2,3})\s+(.+)$/gm
    const matches: Heading[] = []
    let match

    while ((match = regex.exec(content)) !== null) {
      const level = match[1].length
      const text = match[2]
      const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
      matches.push({ id, text, level })
    }

    setHeadings(matches)
  }, [content])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-20% 0% -35% 0%' }
    )

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offsetTop = element.offsetTop - 100
      window.scrollTo({ top: offsetTop, behavior: 'smooth' })
    }
  }

  return (
    <nav>
      <h3 className="font-bold text-espresso-800 mb-4 flex items-center gap-2">
        <span className="w-1 h-4 bg-gradient-to-b from-cocoa-500 to-sand-400 rounded-full"></span>
        목차
      </h3>
      <ul className="space-y-2">
        {headings.map((heading) => (
          <li key={heading.id}>
            <button
              onClick={() => scrollToHeading(heading.id)}
              className={`
                block text-sm text-left w-full transition-all duration-200 rounded-lg px-3 py-2
                ${heading.level === 3 ? 'pl-6' : ''}
                ${activeId === heading.id
                  ? 'text-cocoa-600 font-medium bg-golden-100 border-l-2 border-cocoa-500'
                  : 'text-espresso-600 hover:text-cocoa-600 hover:bg-golden-50'
                }
              `}
            >
              {heading.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
