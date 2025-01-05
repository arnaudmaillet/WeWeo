import { auth, firestore } from '~/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { IUser } from '~/types/userTypes';

interface UserWithToken {
    user: IUser;
    token: string;
}

/**
 * Authentifie un utilisateur via Firebase et récupère les données utilisateur depuis Firestore.
 * @param email Email de l'utilisateur
 * @param password Mot de passe de l'utilisateur
 * @returns Objet contenant l'utilisateur et le token
 * @throws Erreur si l'utilisateur ou ses données ne sont pas trouvées
 */

const signInUser = async (email: string, password: string): Promise<UserWithToken> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid));
    if (!userDoc.exists()) {
        throw new Error('User document not found');
    }

    const userData = userDoc.data() as IUser;
    const token = await firebaseUser.getIdToken();

    return {
        user: { ...userData, userId: firebaseUser.uid },
        token,
    };
};

export { signInUser, UserWithToken }