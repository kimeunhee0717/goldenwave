interface SEOHeadProps {
  title: string
  description: string
  url?: string
  image?: string
  type?: 'website' | 'article'
  publishedAt?: string
  tags?: string[]
  noindex?: boolean
}

const SITE_NAME = '부자타임'
const BASE_URL = 'https://www.bujatime.com'
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`

export default function SEOHead({
  title,
  description,
  url,
  image,
  type = 'website',
  publishedAt,
  tags,
  noindex = false,
}: SEOHeadProps) {
  const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`
  const fullUrl = url ? `${BASE_URL}${url}` : BASE_URL
  const ogImage = image || DEFAULT_IMAGE
  const desc = description.length > 160 ? description.slice(0, 157) + '...' : description

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      {tags && tags.length > 0 && (
        <meta name="keywords" content={tags.join(', ')} />
      )}
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Canonical */}
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="ko_KR" />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Article specific */}
      {type === 'article' && publishedAt && (
        <meta property="article:published_time" content={publishedAt} />
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD */}
      {type === 'article' ? (
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: title,
            description: desc,
            image: ogImage,
            url: fullUrl,
            datePublished: publishedAt,
            publisher: {
              '@type': 'Organization',
              name: SITE_NAME,
              url: BASE_URL,
            },
          })}
        </script>
      ) : (
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: SITE_NAME,
            url: fullUrl,
            description: desc,
          })}
        </script>
      )}
    </>
  )
}
