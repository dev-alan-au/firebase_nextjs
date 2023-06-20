// Import the functions you need from the SDKs you need
import { getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signOut as _signOut,
  signInWithPopup,
} from 'firebase/auth';
import {
  collection,
  DocumentData,
  DocumentSnapshot,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  QueryDocumentSnapshot,
  where,
  Timestamp,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyD8BzsD7bFgJELiUAs-XMB_flu4kalLt2E',
  authDomain: 'next-firebase-e79d0.firebaseapp.com',
  projectId: 'next-firebase-e79d0',
  storageBucket: 'next-firebase-e79d0.appspot.com',
  messagingSenderId: '788789461592',
  appId: '1:788789461592:web:beec81d5d0dde53337002d',
};

// Initialize Firebase
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();
export const fireStore = getFirestore(app);
export const storage = getStorage(app);
export const signInWithGoogle = () => signInWithPopup(auth, googleAuthProvider);
export const signOut = () => _signOut(auth);

/**
 * Get a user document with the username
 * @param {string} username
 */
export async function getUserWithUsername(username: string) {
  const userRef = collection(fireStore, 'users');
  const userQuery = query(userRef, where('username', '==', username), limit(1));
  const userDocs = await getDocs(userQuery);
  return userDocs.docs[0];
}

/**
 *
 * @param {QueryDocumentSnapshot} user
 */
export async function getUserPosts(user: QueryDocumentSnapshot<DocumentData>) {
  const userRef = user.ref;
  const postsCollection = collection(userRef, 'posts');
  const postsQuery = query(
    postsCollection,
    where('published', '==', true),
    limit(5),
    orderBy('createdAt', 'desc')
  );
  return (await getDocs(postsQuery)).docs.map(postToJSON);
}

/**
 *
 * @param {DocumentSnapshot} doc
 */
export function postToJSON(doc: DocumentSnapshot) {
  const data = doc.data();
  return {
    ...data,
    createdAt: data?.createdAt.toMillis(),
    updatedAt: data?.updatedAt.toMillis(),
  };
}

export const fromMillis = Timestamp.fromMillis;
