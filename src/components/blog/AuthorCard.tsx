import { Author } from '@/types/blog'
import { Linkedin, Twitter, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  author: Author
  className?: string
}

export default function AuthorCard({ author, className }: Props) {
  return (
    <div className={cn('bg-gradient-to-br from-golden-100 to-oatmeal-200/50 rounded-2xl p-8 border border-sand-200 shadow-sm', className)}>
      <div className="flex items-start gap-5">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sand-300 to-cocoa-300 overflow-hidden flex-shrink-0 shadow-lg ring-2 ring-white">
          <img
            src={author.image}
            alt={author.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wide text-cocoa-500 font-medium mb-1">Written by</p>
          <h3 className="font-bold text-xl text-espresso-800">{author.name}</h3>
          <p className="text-sm text-cocoa-500 mb-3">{author.role}</p>
          {author.bio && (
            <p className="text-sm text-espresso-600 mb-4 leading-relaxed">{author.bio}</p>
          )}
          {author.social && (
            <div className="flex gap-2">
              {author.social.linkedin && (
                <a
                  href={author.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-cocoa-500 hover:text-cocoa-700 hover:bg-white/50 rounded-lg transition-all"
                >
                  <Linkedin size={18} />
                </a>
              )}
              {author.social.twitter && (
                <a
                  href={author.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-cocoa-500 hover:text-cocoa-700 hover:bg-white/50 rounded-lg transition-all"
                >
                  <Twitter size={18} />
                </a>
              )}
              {author.social.email && (
                <a
                  href={`mailto:${author.social.email}`}
                  className="p-2 text-cocoa-500 hover:text-cocoa-700 hover:bg-white/50 rounded-lg transition-all"
                >
                  <Mail size={18} />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
