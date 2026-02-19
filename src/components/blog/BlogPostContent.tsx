import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props {
  content: string
}

export default function BlogPostContent({ content }: Props) {
  return (
    <article className="prose prose-lg max-w-none
      prose-headings:text-espresso-800 prose-headings:font-bold
      prose-p:text-espresso-700 prose-p:leading-relaxed
      prose-strong:text-espresso-800 prose-strong:font-semibold
      prose-ul:text-espresso-700 prose-ol:text-espresso-700
      prose-li:marker:text-cocoa-500
    ">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children, ...props }) => {
            const id = String(children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
            return (
              <h2
                {...props}
                id={id}
                className="scroll-mt-24 text-2xl md:text-3xl font-bold text-espresso-800 mt-12 mb-6 pb-3 border-b-2 border-golden-100 flex items-center gap-3"
              >
                <span className="w-1 h-8 bg-gradient-to-b from-cocoa-500 to-sand-400 rounded-full"></span>
                {children}
              </h2>
            )
          },
          h3: ({ children, ...props }) => {
            const id = String(children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
            return (
              <h3
                {...props}
                id={id}
                className="scroll-mt-24 text-xl md:text-2xl font-semibold text-espresso-700 mt-10 mb-4"
              >
                {children}
              </h3>
            )
          },
          h4: ({ children, ...props }) => (
            <h4
              {...props}
              className="text-lg font-semibold text-cocoa-600 mt-8 mb-3"
            >
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-espresso-700 leading-[1.85] mb-6 text-[17px]">
              {children}
            </p>
          ),
          img: ({ src, alt }) => (
            <figure className="my-10">
              <div className="relative overflow-hidden rounded-2xl shadow-xl ring-1 ring-oatmeal-200">
                <img
                  src={src}
                  alt={alt}
                  className="w-full transition-transform duration-500 hover:scale-[1.02]"
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-2xl pointer-events-none"></div>
              </div>
              {alt && (
                <figcaption className="text-center text-sm text-cocoa-500 mt-4 italic">
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
              className="text-cocoa-500 hover:text-cocoa-600 underline decoration-sand-300 underline-offset-2 decoration-2 hover:decoration-cocoa-400 transition-all font-medium"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="relative my-8 pl-6 pr-6 py-5 bg-gradient-to-br from-golden-100/80 to-oatmeal-200/50 border-l-4 border-cocoa-500 rounded-r-2xl shadow-sm">
              <div className="absolute top-4 left-4 text-4xl text-cocoa-300 font-serif leading-none">"</div>
              <div className="relative text-espresso-700 italic pl-6">
                {children}
              </div>
            </blockquote>
          ),
          code: ({ children, className }) => {
            const isInline = !className
            if (isInline) {
              return (
                <code className="bg-golden-100 text-cocoa-600 px-2 py-1 rounded-md text-[0.9em] font-mono border border-oatmeal-200">
                  {children}
                </code>
              )
            }
            return (
              <code className={`${className} text-[0.9em]`}>
                {children}
              </code>
            )
          },
          pre: ({ children }) => (
            <div className="my-8 rounded-2xl overflow-hidden shadow-lg ring-1 ring-espresso-800/10">
              <div className="flex items-center gap-2 px-4 py-3 bg-espresso-900">
                <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
                <span className="ml-3 text-xs text-oatmeal-300 font-mono">code</span>
              </div>
              <pre className="!mt-0 !rounded-t-none bg-espresso-800 text-golden-100 p-5 overflow-x-auto text-sm leading-relaxed font-bold">
                {children}
              </pre>
            </div>
          ),
          table: ({ children }) => (
            <div className="my-10 overflow-hidden rounded-2xl shadow-lg ring-1 ring-oatmeal-200">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  {children}
                </table>
              </div>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gradient-to-r from-golden-100 to-oatmeal-200">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-6 py-4 font-bold text-sm uppercase tracking-wide text-espresso-800 border-b-2 border-cocoa-300">
              {children}
            </th>
          ),
          tbody: ({ children }) => (
            <tbody className="bg-white divide-y divide-oatmeal-200">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-golden-100/50 transition-colors">
              {children}
            </tr>
          ),
          td: ({ children }) => (
            <td className="px-6 py-4 text-espresso-700">
              {children}
            </td>
          ),
          ul: ({ children }) => (
            <ul className="my-4 space-y-1.5 pl-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-4 space-y-1.5 list-decimal list-inside pl-1">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="flex items-start gap-2 text-espresso-700 leading-relaxed">
              <span className="flex-shrink-0 w-1.5 h-1.5 mt-[0.6rem] rounded-full bg-gradient-to-br from-cocoa-500 to-sand-400"></span>
              <span className="flex-1">{children}</span>
            </li>
          ),
          hr: () => (
            <div className="my-12 flex items-center justify-center gap-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-oatmeal-300 to-transparent"></div>
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-cocoa-400"></div>
                <div className="w-2 h-2 rounded-full bg-sand-400"></div>
                <div className="w-2 h-2 rounded-full bg-golden-300"></div>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-oatmeal-300 to-transparent"></div>
            </div>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-espresso-800 bg-golden-100/60 px-1 rounded">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-cocoa-600">
              {children}
            </em>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  )
}
