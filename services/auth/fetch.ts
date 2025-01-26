import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '~/firebase';
import { IUser } from '~/types/userTypes';

const fetch = async (): Promise<IUser | null> => {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const userRef = doc(firestore, 'users', firebaseUser.uid);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        resolve(userSnap.data() as IUser);
                    } else {
                        console.error(`User document not found for ID: ${firebaseUser.uid}`);
                        resolve(null);
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    reject(error);
                }
            } else {
                resolve(null);
            }
        });
    });
};

export { fetch as fetchUser };