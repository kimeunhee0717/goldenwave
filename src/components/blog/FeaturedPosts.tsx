import { BlogPost } from '@/types/blog'
import BlogCard from './BlogCard'

interface Props {
  posts: BlogPost[]
}

export default function FeaturedPosts({ posts }: Props) {
  if (posts.length === 0) return null

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">추천 포스트</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.slice(0, 3).map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  )
}
