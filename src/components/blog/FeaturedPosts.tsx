import { BlogPost } from '@/types/blog'
import BlogCard from './BlogCard'

interface Props {
  posts: BlogPost[]
}

export default function FeaturedPosts({ posts }: Props) {
  if (posts.length === 0) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.slice(0, 3).map((post, index) => (
        <div 
          key={post.id} 
          className={`${index === 0 ? 'md:col-span-2 lg:col-span-1' : ''}`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <BlogCard post={post} featured={index === 0} />
        </div>
      ))}
    </div>
  )
}
