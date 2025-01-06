import { signOut as firebaseSignOut } from "firebase/auth"
import { auth } from "~/firebase"

const signOut = async() => await firebaseSignOut(auth)

export { signOut as signOutUser }

