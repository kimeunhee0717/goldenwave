import { Share2, Twitter, Facebook, Linkedin, Link as LinkIcon } from 'lucide-react'
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
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
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
    <div className="bg-gray-50 rounded-xl p-6 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <Share2 size={18} className="text-gray-600" />
        <h3 className="font-bold text-gray-900">공유하기</h3>
      </div>
      <div className="flex gap-2">
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            title={link.name}
          >
            <link.icon size={20} className="text-gray-600" />
          </a>
        ))}
        <button
          onClick={copyLink}
          className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow relative"
          title="링크 복사"
        >
          <LinkIcon size={20} className="text-gray-600" />
          {copied && (
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              복사됨!
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
