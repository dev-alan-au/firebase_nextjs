import { GetStaticPaths, GetStaticProps } from 'next';
import { fireStore, getUserWithUsername, postToJSON } from '@/lib/firebase';
import {
  collection,
  doc,
  query,
  where,
  getDocs,
  limit,
  collectionGroup,
} from 'firebase/firestore';
import PostContent from '@/components/PostContent';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import AuthCheck from '@/components/AuthCheck';
import Link from 'next/link';
import HeartButton from '@/components/HeartButton';

export default function PostPage({ post, path }: { post: any; path: string }) {
  const postRef = doc(fireStore, path);
  const [realTimePost] = useDocumentData(postRef);
  const displayedPost = realTimePost || post;

  return (
    <main className="container">
      <section>
        <PostContent post={displayedPost} />
      </section>
      <aside className="card">
        <p>
          <strong>{displayedPost.heartCount || 0} 🤍</strong>
        </p>

        <AuthCheck
          fallback={
            <Link href="/enter">
              <button>💗 Sign Up</button>
            </Link>
          }
        >
          <HeartButton postRef={postRef} />
        </AuthCheck>
      </aside>
    </main>
  );
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { username, slug } = params!;
  const userDoc = await getUserWithUsername(username as string);

  let post: any | null = null;
  let path: any | null = null;

  if (userDoc) {
    const postsRef = collection(userDoc.ref, 'posts');
    const postQuery = query(postsRef, where('slug', '==', slug), limit(1));
    const postDoc = await getDocs(postQuery);
    post = postDoc.size == 1 ? postToJSON(postDoc.docs?.[0]) : null;
    path = postDoc.docs?.[0].ref.path;
  }

  return {
    props: {
      post,
      path,
    },
    revalidate: 5000,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const postsRef = collectionGroup(fireStore, 'posts');
  const posts = getDocs(postsRef);
  const paths = (await posts).docs.map((doc) => {
    const { username, slug } = doc.data();
    return {
      params: {
        username,
        slug,
      },
    };
  });

  return {
    paths,
    fallback: 'blocking',
  };
};
