import { signInWithGoogle, signOut } from '@/lib/firebase';
import { useContext, useCallback, useEffect, useState } from 'react';
import { UserContext } from '@/lib/context';
import { fireStore } from '@/lib/firebase';
import { doc, getDoc, runTransaction } from 'firebase/firestore';
import debounce from 'lodash/debounce';

export default function EnterPage() {
  const { user, username } = useContext(UserContext);

  return (
    <>
      <h1>Sign Up</h1>
      <p>{JSON.stringify(user)}</p>
      {!user && <SignInButton />}
      {user && username && <SignOutButton />}
      {user && !username && <UsernameForm />}
    </>
  );
}

function SignInButton() {
  const signIn = async () => {
    try {
      await signInWithGoogle();
    } catch (ex) {
      console.log('Sign in failed.');
    }
  };

  return <button onClick={() => signIn()}>Sign in with Google</button>;
}

function SignOutButton() {
  return <button onClick={() => signOut()}>Sign out</button>;
}

function UsernameForm() {
  const [formValue, setFormValue] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(false);
  const [loading, setIsLoading] = useState<boolean>(false);
  const { user } = useContext(UserContext);

  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const val = ev.target.value.toLowerCase();
    const re = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/;
    setFormValue(val);

    if (val.length < 3) {
      setIsValid(false);
      setIsLoading(false);
    }
    if (re.test(val)) {
      setIsValid(false);
      setIsLoading(true);
    }
  };

  const onSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    const userRef = doc(fireStore, 'users', user.uid);
    const usernameRef = doc(fireStore, 'usernames', formValue);

    try {
      await runTransaction(fireStore, async (transaction) => {
        const fbUser = await transaction.get(userRef);
        if (!fbUser.exists()) {
          throw 'Document does not exist!';
        }

        transaction.update(userRef, { username: formValue });
        transaction.set(usernameRef, { uid: user.uid });
      });
      console.log('Transaction successfully committed!');
    } catch (e) {
      console.log('Transaction failed: ', e);
    }
  };

  const checkUsername = useCallback(
    debounce(async (username: string) => {
      if (username.length >= 3) {
        const docRef = doc(fireStore, 'usernames', username);
        const docSnap = await getDoc(docRef);
        console.log('Firestore `getDoc` ran.');
        setIsValid(!docSnap.exists());
        setIsLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    checkUsername(formValue);
  }, [formValue]);

  return (
    <form onSubmit={onSubmit}>
      <input
        name="username"
        type="text"
        placeholder="Username"
        onChange={onChange}
        value={formValue}
      />
      <UsernameMessage
        username={formValue}
        isValid={isValid}
        loading={loading}
      />
      <button type="submit" className="btn-green" disabled={!isValid}>
        Submit
      </button>

      <h3>Debug State</h3>
      <div>
        Username: {formValue}
        <br />
        Loading: {loading.toString()}
        <br />
        Username Valid: {isValid.toString()}
      </div>
    </form>
  );
}

function UsernameMessage({
  username,
  isValid,
  loading,
}: {
  username: string;
  isValid: boolean;
  loading: boolean;
}) {
  if (loading) {
    return <p>Checking...</p>;
  } else if (isValid) {
    return <p className="text-success">{username} is available!</p>;
  } else if (username && !isValid) {
    return <p className="text-danger">That username is taken!</p>;
  } else {
    return <p></p>;
  }
}
