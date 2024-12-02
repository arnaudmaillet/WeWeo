import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { ICurrentUser, IUser } from '~/types/UserInterfaces';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, firestore } from '~/firebase';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, updateProfile } from "firebase/auth";

interface AuthContextProps {
    user: ICurrentUser | null;
    isLoading: boolean;
    signUp: (email: string, password: string, username: string, birthdate: string, locale: string) => Promise<boolean>;
    signIn: (email: string, password: string) => Promise<boolean>;
    signOut: () => Promise<void>;
}

export const fakeUserLocation = {
    lat: 37.7749,
    long: -122.4194,
    latDelta: 0.0922,
    longDelta: 0.0421,
}


const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<ICurrentUser | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const token = await firebaseUser.getIdToken();
                storeUser(firebaseUser.email || '', token);

                console.log('User', firebaseUser.uid);

                // Récupérer les informations utilisateur depuis Firestore
                const userDoc = await getDoc(doc(firestore, "users", firebaseUser.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();

                    // Récupérer les amis par leurs IDs
                    const friendsIds = userData.friends || [];
                    let friends: IUser[] = [];
                    if (friendsIds.length > 0) {
                        const friendsDocs = await Promise.all(
                            friendsIds.map((id: string) => getDoc(doc(firestore, "users", id)))
                        );
                        friends = friendsDocs
                            .filter((doc) => doc.exists())
                            .map((doc) => doc.data() as IUser);
                    }


                    // Mise à jour de l'état utilisateur
                    setUser({
                        userId: firebaseUser.uid,
                        email: userData.email,
                        username: userData.username,
                        birthdate: userData.birthdate,
                        locale: userData.locale,
                        friends: friends,
                        subscribedTo: userData.subscribedTo,
                        location: {
                            lat: fakeUserLocation.lat,
                            long: fakeUserLocation.long,
                            latDelta: fakeUserLocation.latDelta,
                            longDelta: fakeUserLocation.longDelta,
                        },
                    });
                } else {
                    console.error('User document not found in Firestore');
                    router.push('/Login');
                }
            } else {
                setUser(null);
                router.push('/Login');
            }
        });

        return () => unsubscribe();
    }, []);


    const storeUser = async (email: string, token: string) => {
        try {
            await AsyncStorage.setItem('@user_email', email);
            await AsyncStorage.setItem('@user_token', token);
        } catch (e) {
            console.error('Failed to save the user token.', e);
        }
    };

    const signUp = async (email: string, password: string, username: string, birthdate: string, locale: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;
            const userData: ICurrentUser = {
                userId: firebaseUser.uid,
                username,
                email,
                birthdate,
                locale,
                friends: [],
                subscribedTo: [],
                location: {
                    lat: fakeUserLocation.lat,
                    long: fakeUserLocation.long,
                    latDelta: fakeUserLocation.latDelta,
                    longDelta: fakeUserLocation.longDelta,
                }
            };

            await updateProfile(firebaseUser, {
                displayName: username,
            });

            await setDoc(doc(firestore, "users", firebaseUser.uid), userData);
            await storeUser(email, await firebaseUser.getIdToken());

            setUser(userData);
            setIsLoading(false);

            return true;
        } catch (error) {
            console.error('Error signing up:', error);
            setIsLoading(false);
            return false;
        }
    };

    const signIn = async (email: string, password: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;
            const userDoc = await getDoc(doc(firestore, "users", firebaseUser.uid));

            if (userDoc.exists()) {
                const userData = userDoc.data();

                // Récupérer les amis par leurs IDs
                const friendsIds = userData.friends || [];
                let friends: IUser[] = [];
                if (friendsIds.length > 0) {
                    const friendsDocs = await Promise.all(
                        friendsIds.map((id: string) => getDoc(doc(firestore, "users", id)))
                    );
                    friends = friendsDocs
                        .filter((doc) => doc.exists())
                        .map((doc) => doc.data() as IUser);
                }

                // Mise à jour de l'état utilisateur
                setUser({
                    userId: firebaseUser.uid,
                    email: userData.email,
                    username: userData.username,
                    birthdate: userData.birthdate,
                    locale: userData.locale,
                    friends: friends,
                    subscribedTo: userData.subscribedTo,
                    location: {
                        lat: fakeUserLocation.lat,
                        long: fakeUserLocation.long,
                        latDelta: fakeUserLocation.latDelta,
                        longDelta: fakeUserLocation.longDelta,
                    },
                });

                console.log('User signed in:', userData);
            } else {
                console.error('User document not found in Firestore');
            }

            await storeUser(email, await firebaseUser.getIdToken());
            setIsLoading(false);
            return true;
        } catch (error) {
            console.error('Error signing in:', error);
            setIsLoading(false);
            return false;
        }
    };


    const signOut = async () => {
        setIsLoading(true);
        try {
            await firebaseSignOut(auth);
            await AsyncStorage.removeItem('@user_token');
            setUser(null);
            router.push('/Login');
        } catch (error) {
            console.error('Failed to sign out:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, signUp, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextProps => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
