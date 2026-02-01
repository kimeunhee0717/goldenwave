import { BlogPost } from '@/types/blog'
import BlogCard from './BlogCard'

interface Props {
  posts: BlogPost[]
}

export default function BlogList({ posts }: Props) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">포스트가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {posts.map((post, index) => (
        <BlogCard
          key={post.id}
          post={post}
          featured={index === 0}
        />
      ))}
    </div>
  )
}
