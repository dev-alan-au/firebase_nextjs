import { auth, fireStore } from '@/lib/firebase';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, onSnapshot } from 'firebase/firestore';

export function useUserData() {
  const [user] = useAuthState(auth);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    let unsub;

    if (user) {
      const docRef = doc(fireStore, 'users', `${user.uid}`);
      unsub = onSnapshot(docRef, (entry) => {
        setUsername(entry.data()?.username);
      });
    } else {
      setUsername(null);
    }

    return unsub;
  }, [user]);

  return { user, username };
}