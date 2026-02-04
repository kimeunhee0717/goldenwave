import { Twitter, Facebook, Linkedin, Link as LinkIcon } from 'lucide-react'
import { useState } from 'react'

interface Props {
  title: string
  url?: string
}

export default function ShareButtons({ title, url }: Props) {
  const [copied, setCopied] = useState(false)
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')

  const shareLinks = [
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
      color: 'hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: 'hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      color: 'hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200',
    },
  ]

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="flex gap-2">
      {shareLinks.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`p-3 bg-golden-100/50 border border-oatmeal-200 rounded-xl text-cocoa-500 transition-all duration-200 ${link.color}`}
          title={link.name}
        >
          <link.icon size={18} />
        </a>
      ))}
      <button
        onClick={copyLink}
        className="p-3 bg-golden-100/50 border border-oatmeal-200 rounded-xl text-cocoa-500 hover:bg-cocoa-50 hover:text-cocoa-600 hover:border-cocoa-200 transition-all duration-200 relative"
        title="링크 복사"
      >
        <LinkIcon size={18} />
        {copied && (
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-espresso-800 text-golden-100 text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
            복사됨!
          </span>
        )}
      </button>
    </div>
  )
}
