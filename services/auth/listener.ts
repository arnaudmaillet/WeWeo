import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '~/firebase';
import { IUser } from '~/types/userTypes';


/**
 * Écoute les changements d'état d'authentification Firebase et enrichit les données avec Firestore.
 * @param onAuthCallback Fonction appelée lors des changements d'état.
 * @returns Fonction pour se désabonner de l'écoute.
 */
const listener = (onAuthCallback: (user: IUser | null) => void) => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            try {
                const userRef = doc(collection(firestore, 'users'), firebaseUser.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const userData = userSnap.data() as IUser;

                    onAuthCallback({
                        ...userData,
                    });
                } else {
                    console.error(`User document not found for ID: ${firebaseUser.uid}`);
                    onAuthCallback(null);
                }
            } catch (error) {
                console.error('Error fetching user data from Firestore:', error);
                onAuthCallback(null);
            }
        } else {
            onAuthCallback(null);
        }
    });
};

export { listener as listeningOnAuthChanges };
