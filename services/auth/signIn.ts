import { auth, firestore } from '~/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { IUser } from '~/types/userTypes';


/**
 * Authentifie un utilisateur via Firebase et récupère les données utilisateur depuis Firestore.
 * @param email Email de l'utilisateur
 * @param password Mot de passe de l'utilisateur
 * @returns Objet contenant l'utilisateur et le token
 * @throws Erreur si l'utilisateur ou ses données ne sont pas trouvées
 */

const signIn = async (email: string, password: string): Promise<IUser> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid));
    if (!userDoc.exists()) {
        throw new Error('User document not found');
    }

    const userData = userDoc.data() as IUser;

    return { ...userData, userId: firebaseUser.uid }
};

export { signIn as signInUser }