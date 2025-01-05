import { signOut as firebaseSignOut } from "firebase/auth"
import { auth } from "~/firebase"

const signOutUser = async() => await firebaseSignOut(auth)

export { signOutUser }

