import Link from "next/link";
import { useContext } from "react";
import { UserContext } from "@/lib/context";

export default function AuthCheck(props: any) {
  const { username } = useContext(UserContext);
  if(!username) {
    return ( props?.fallback || <Link href="/enter">You must be signed in</Link> )
  }

  return props?.children;
}