import { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import Link from 'next/link';
import toast from 'react-hot-toast';
import AuthCheck from '@/components/AuthCheck';
import {
  updateDoc,
  DocumentReference,
  DocumentData,
  serverTimestamp,
  doc,
} from 'firebase/firestore';
import { auth, fireStore } from '@/lib/firebase';
import styles from '@/styles/Admin.module.css';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import ImageUploader from '@/components/ImageUploader';

export default function AdminEditPostPage() {
  return (
    <AuthCheck>
      <PostManager />
    </AuthCheck>
  );
}

function PostManager() {
  const router = useRouter();
  const { slug } = router.query;
  const [preview, setPreview] = useState(false);

  const postRef = doc(
    fireStore,
    'users',
    auth.currentUser!.uid,
    'posts',
    slug as string
  );
  const [post] = useDocumentData(postRef);

  return (
    <main className={styles.container}>
      {post && postRef && (
        <>
          <section>
            <h1>{post.title}</h1>
            <p>ID: {post.slug}</p>
            <PostForm
              postRef={postRef}
              originalValues={post}
              preview={preview}
            />
          </section>

          <aside>
            <h3>Tools</h3>
            <button onClick={() => setPreview(!preview)}>
              {preview ? 'Edit' : 'Preview'}
            </button>
            <Link href={`/${post.username}/${post.slug}`}>
              <button className="btn-blue">Live view</button>
            </Link>
          </aside>
        </>
      )}
    </main>
  );
}

function PostForm({
  originalValues,
  postRef,
  preview,
}: {
  originalValues: DocumentData;
  postRef: DocumentReference<DocumentData>;
  preview: boolean;
}) {
  const { register, handleSubmit, reset, watch, formState } = useForm({
    defaultValues: {
      content: originalValues.content,
      published: originalValues.published,
    },
    mode: 'onChange',
  });

  const { errors, isDirty, isValid } = formState;

  const updatePost = async ({
    content,
    published,
  }: {
    content: string;
    published: boolean;
  }) => {
    await updateDoc(postRef, {
      content,
      published,
      updatedAt: serverTimestamp(),
    });

    reset({ content, published });

    toast.success('Post updated successfully!');
  };

  return (
    <form onSubmit={handleSubmit(updatePost)}>
      {preview && (
        <div className="card">
          <ReactMarkdown>{watch('content')}</ReactMarkdown>
        </div>
      )}
      <div className={preview ? styles.hidden : styles.controls}>
        <ImageUploader />
        <textarea
          {...register('content', {
            maxLength: {
              value: 100,
              message: 'Too many characters',
            },
            minLength: {
              value: 3,
              message: 'Not enough characters',
            },
            required: {
              value: true,
              message: 'Content is required',
            },
          })}
        ></textarea>

        {errors.content && (
          <p className="text-danger">{errors.content.message as string}</p>
        )}

        <fieldset>
          <input
            className={styles.checkbox}
            type="checkbox"
            {...register('published')}
          />
          <label>Published</label>
        </fieldset>

        <button
          type="submit"
          className="btn-green"
          disabled={!isDirty || !isValid}
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}
