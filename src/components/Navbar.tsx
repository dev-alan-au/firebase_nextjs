import Link from "next/link";
import { useContext } from "react";
import { UserContext } from "@/lib/context";
import { signOut } from '@/lib/firebase';

export default function Navbar() {
  const { user, username } = useContext(UserContext);

  return (
    <nav className="navbar">
      <ul>
        <li>
          <Link href={`/`}>
            <button className="btn-logo">
              FEED
            </button>
          </Link>
        </li>
        {
          username && (
            <>
              <li className="push-left">
                <Link href="/admin">
                  <button>
                    Write Post
                  </button>
                </Link>
              </li>
              <li>
                <Link href={`/${username}`}>
                  <button>
                    {user?.photoURL ? <img src={user.photoURL} /> : 'Profile'}
                  </button>
                </Link>
              </li>
              <li>
                <button onClick={signOut}>
                  Log Out
                </button>
              </li>
            </>
          )
        }
        {
          !username && (
            <>
              <li>
                <Link href="/enter">
                  <button className="btn-blue">Log In</button>
                </Link>
              </li>
            </>
          )
        }
      </ul>
    </nav>
  )
}