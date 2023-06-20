import { GetServerSidePropsContext, GetStaticPropsResult } from 'next';
import UserProfile from '@/components/UserProfile';
import PostFeed from '@/components/PostFeed';
import { getUserWithUsername, getUserPosts } from '@/lib/firebase';
import Metatags from '@/components/MetaTags';

interface PageProps {
  user: any;
  posts: any[];
  admin: boolean;
}

export default function UserPage({ user, posts, admin }: PageProps) {
  return (
    <>
      <Metatags />
      <UserProfile user={user} />
      <PostFeed posts={posts} admin={admin} />
    </>
  );
}

export async function getServerSideProps({
  query,
}: GetServerSidePropsContext): Promise<
  GetStaticPropsResult<Omit<PageProps, 'admin'>>
> {
  const { username } = query;
  const userDoc = await getUserWithUsername(username as string);

  let user = null;
  let posts: any[] = [];

  if (userDoc) {
    user = userDoc.data();
    posts = await getUserPosts(userDoc);
  } else {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      user,
      posts,
    },
  };
}
