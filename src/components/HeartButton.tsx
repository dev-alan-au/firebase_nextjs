import {
  increment,
  DocumentReference,
  DocumentData,
  collection,
  doc,
  writeBatch,
} from 'firebase/firestore';
import { fireStore, auth } from '@/lib/firebase';
import { useDocument } from 'react-firebase-hooks/firestore';

export default function HeartButton({
  postRef,
}: {
  postRef: DocumentReference<DocumentData>;
}) {
  const heartRef = doc(collection(postRef, 'hearts'), auth.currentUser!.uid);
  const [heartDoc] = useDocument(heartRef);

  const addHeart = async () => {
    const userId = auth.currentUser!.uid;
    const batch = writeBatch(fireStore);
    batch.update(postRef, { heartCount: increment(1) });
    batch.set(heartRef, { userId });

    await batch.commit();
  };

  const removeHeart = async () => {
    const batch = writeBatch(fireStore);
    batch.update(postRef, { heartCount: increment(-1) });
    batch.delete(heartRef);

    await batch.commit();
  };

  return heartDoc?.exists() ? (
    <button onClick={removeHeart}>💔 Unheart</button>
  ) : (
    <button onClick={addHeart}>💗 Heart</button>
  );
}
