import { Author } from '@/types/blog'
import { Linkedin, Twitter, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  author: Author
  className?: string
}

export default function AuthorCard({ author, className }: Props) {
  return (
    <div className={cn('bg-gray-50 rounded-xl p-6', className)}>
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
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
          <h3 className="font-bold text-gray-900">{author.name}</h3>
          <p className="text-sm text-gray-500 mb-2">{author.role}</p>
          {author.bio && (
            <p className="text-sm text-gray-600 mb-3">{author.bio}</p>
          )}
          {author.social && (
            <div className="flex gap-2">
              {author.social.linkedin && (
                <a
                  href={author.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-gray-500 hover:text-primary-600 transition-colors"
                >
                  <Linkedin size={18} />
                </a>
              )}
              {author.social.twitter && (
                <a
                  href={author.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-gray-500 hover:text-primary-600 transition-colors"
                >
                  <Twitter size={18} />
                </a>
              )}
              {author.social.email && (
                <a
                  href={`mailto:${author.social.email}`}
                  className="p-1.5 text-gray-500 hover:text-primary-600 transition-colors"
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
