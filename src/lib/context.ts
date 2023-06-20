import { createContext } from "react";

interface UserData {
  user: null | any,
  username: null | string,
}

export const UserContext = createContext<UserData>({ user: null, username: null });