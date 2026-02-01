import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props {
  content: string
}

export default function BlogPostContent({ content }: Props) {
  return (
    <article className="prose prose-lg prose-slate max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children, ...props }) => {
            const id = String(children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
            return (
              <h2 {...props} id={id} className="scroll-mt-24">
                {children}
              </h2>
            )
          },
          h3: ({ children, ...props }) => {
            const id = String(children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
            return (
              <h3 {...props} id={id} className="scroll-mt-24">
                {children}
              </h3>
            )
          },
          img: ({ src, alt }) => (
            <figure className="my-8">
              <img
                src={src}
                alt={alt}
                className="rounded-xl shadow-lg w-full"
              />
              {alt && (
                <figcaption className="text-center text-sm text-gray-500 mt-2">
                  {alt}
                </figcaption>
              )}
            </figure>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary-500 pl-4 italic bg-primary-50 py-2 rounded-r">
              {children}
            </blockquote>
          ),
          code: ({ children, className }) => {
            const isInline = !className
            if (isInline) {
              return (
                <code className="bg-gray-100 text-primary-600 px-1.5 py-0.5 rounded text-sm">
                  {children}
                </code>
              )
            }
            return (
              <code className={className}>
                {children}
              </code>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  )
}
