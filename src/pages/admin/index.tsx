import AuthCheck from '@/components/AuthCheck';
import { auth, fireStore } from '@/lib/firebase';
import kebabCase from 'lodash/kebabCase';
import {
  collection,
  doc,
  query,
  orderBy,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import PostFeed from '@/components/PostFeed';
import { useRouter } from 'next/router';
import { useContext, useState } from 'react';
import { UserContext } from '@/lib/context';
import { toast } from 'react-hot-toast';

export default function AdminPage({}) {
  return (
    <main>
      <AuthCheck>
        <h1>Welcome</h1>
        <PostList />
        <CreateNewPost />
      </AuthCheck>
    </main>
  );
}

function PostList() {
  const postsRef = collection(
    fireStore,
    'users',
    auth.currentUser!.uid,
    'posts'
  );
  const postQuery = query(postsRef, orderBy('createdAt'));
  const [querySnapshot] = useCollection(postQuery);
  const posts = querySnapshot?.docs.map((doc) => doc.data());

  return (
    <>
      <h2>Manage your posts</h2>
      {posts && <PostFeed posts={posts} admin />}
    </>
  );
}

function CreateNewPost() {
  const router = useRouter();
  const { username } = useContext(UserContext);
  const [title, setTitle] = useState<string>('');
  const slug = encodeURI(kebabCase(title));
  const isValid = title.length > 3 && title.length < 100;
  const createPost = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const uid = auth.currentUser!.uid;
    const postRef = doc(fireStore, 'users', uid, 'posts', slug);
    const data = {
      title,
      slug,
      uid,
      username,
      published: false,
      content: '# hello world!',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      heartCount: 0,
    };

    await setDoc(postRef, data);
    toast.success('Post created!');
    router.push(`/admin/${slug}`);
  };

  return (
    <form onSubmit={createPost}>
      <input
        type="text"
        value={title}
        onChange={(ev) => setTitle(ev.target.value)}
        placeholder="Title"
      />
      <p>
        <strong>Slug:</strong> {slug}
      </p>
      <button type="submit" disabled={!isValid} className="btn-green">
        Add post
      </button>
    </form>
  );
}
