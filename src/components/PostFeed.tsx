import Link from 'next/link';

export default function PostFeed({ posts, admin }: { posts: any[], admin: boolean }) {
  if (!posts?.length) return null;
  return (
    <>
      {posts.map((post, index) => <PostItem post={post} key={index} admin={admin} />)}
    </>
  )
}

function PostItem({ post, admin }: { post: any, admin: any }) {
  const wordCount = post?.content.trim().split(/\s+/g).length;
  const minutesToRead = (wordCount / 100 + 1).toFixed(0);

  return (
    <div className="card">
      <Link href={`/${post.username}`}>
        <strong>By @{post.username}</strong>
      </Link>

      <h2>
        <Link href={`/${post.username}/${post.slug}`}>
          {post.title}
        </Link>
      </h2>

      <footer>
        <span>
          {wordCount} words. {minutesToRead} min read
        </span>
        <span className="push-left">💗 {post.heartCount || 0} Hearts</span>
      </footer>

      {/* If admin view, show extra controls for user */}
      {admin && (
        <>
          <h3>
            <Link href={`/admin/${post.slug}`}>
              <button className="btn-blue">Edit</button>
            </Link>
          </h3>

          {post.published ? <p className="text-success">Live</p> : <p className="text-danger">Unpublished</p>}
        </>
      )}
    </div>
  )
}