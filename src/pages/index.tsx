import Link from 'next/link';
import Loader from '@/components/Loader';
import toast from 'react-hot-toast';
import { GetServerSideProps } from 'next';
import { fireStore, fromMillis, postToJSON } from '@/lib/firebase';
import {
  collectionGroup,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from 'firebase/firestore';
import { useState } from 'react';
import PostFeed from '@/components/PostFeed';

const LIMIT = 1;

export default function Home({ posts: basePosts }: { posts: any[] }) {
  const [posts, setPosts] = useState(basePosts);
  const [loading, setLoading] = useState(false);
  const [postsEnd, setPostsEnd] = useState(false);

  const getMorePosts = async () => {
    setLoading(true);
    const lastPost = posts.at(-1);

    const cursor =
      typeof lastPost.createdAt === 'number'
        ? fromMillis(lastPost.createdAt)
        : lastPost.createdAt;
    const postsRef = collectionGroup(fireStore, 'posts');
    const postsQuery = query(
      postsRef,
      where('published', '==', true),
      orderBy('createdAt', 'desc'),
      limit(10),
      startAfter(cursor)
    );
    const newPosts = (await getDocs(postsQuery)).docs.map(postToJSON);
    setPosts((posts) => [...posts, ...newPosts]);
    setLoading(false);

    if (newPosts.length < LIMIT) {
      setPostsEnd(true);
    }
  };

  return (
    <>
      <Link
        prefetch={false}
        href={{
          pathname: '/[username]',
          query: { username: '' },
        }}
      >
        Profile
      </Link>
      <Loader show />
      <button onClick={() => toast.success('hello toast!')}>Toast Me</button>
      <PostFeed posts={posts} admin={false} />
      {!loading && !postsEnd && (
        <button onClick={getMorePosts}>Load more</button>
      )}
      <Loader show={loading} />
      {postsEnd && 'You have reached the end'};
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const postsRef = collectionGroup(fireStore, 'posts');
  const postsQuery = query(
    postsRef,
    where('published', '==', true),
    orderBy('createdAt', 'desc'),
    limit(LIMIT)
  );
  const returnedPosts = await getDocs(postsQuery);
  const posts = returnedPosts.docs.map(postToJSON);

  return {
    props: {
      posts,
    },
  };
};
