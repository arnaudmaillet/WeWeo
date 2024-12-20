import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, firestore } from '~/firebase';
import { doc, setDoc, getDoc, collection, getDocs, DocumentData } from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, updateProfile } from "firebase/auth";
import { IMarker } from './markers/types';
import { useUser } from './user/Context';
import { IFriend, IUser } from './user/types';
import { ICoordinates } from '~/types/MapInterfaces';

interface AuthContextProps {
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
    const { set: setUser, logout: logoutUser } = useUser()
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setIsLoading(true);
                const token = await firebaseUser.getIdToken();
                storeUser(firebaseUser.email || '', token);

                console.log('User', firebaseUser.uid);

                // Récupérer les informations utilisateur depuis Firestore
                const userDoc = await getDoc(doc(firestore, "users", firebaseUser.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();

                    // Récupérer les amis depuis la collection "friends"
                    const friendsCollection = collection(firestore, "users", firebaseUser.uid, "friends");
                    const friendsSnapshot = await getDocs(friendsCollection);

                    const friends: IFriend[] = [];
                    if (!friendsSnapshot.empty) {
                        for (const friendDoc of friendsSnapshot.docs) {
                            const friendData = friendDoc.data();
                            const userRef = friendData.userRef;

                            // Récupérer les données utilisateur depuis la référence
                            const userSnapshot = await getDoc(userRef);
                            if (userSnapshot.exists()) {
                                const userDetails = userSnapshot.data() as DocumentData;
                                friends.push({
                                    userId: userRef.id,
                                    email: userDetails.email,
                                    username: userDetails.username,
                                    birthdate: userDetails.birthdate,
                                    locale: userDetails.locale,
                                    addedAt: friendData.addedAt,
                                    friends: [],
                                    subscribedTo: userDetails.subscribedTo,
                                    ownerOf: []
                                } as IFriend);
                            }
                        }
                    }

                    // Récupérer les markers possédés depuis la collection "ownerOf"
                    const ownerOfCollection = collection(firestore, "users", firebaseUser.uid, "ownerOf");
                    const ownerOfSnapshot = await getDocs(ownerOfCollection);

                    const ownerOf: IMarker[] = [];
                    if (!ownerOfSnapshot.empty) {
                        for (const markerDoc of ownerOfSnapshot.docs) {
                            const markerData = markerDoc.data();

                            ownerOf.push({
                                markerId: markerDoc.id,
                                createdAt: markerData.createdAt,
                                creatorId: markerData.creatorId,
                                minZoom: markerData.minZoom,
                                subscribedUserIds: markerData.subscribedUserIds,
                                connections: markerData.connections || null,
                                views: markerData.views,
                                messages: markerData.messages,
                                isLoading: false, // Par défaut
                            } as IMarker);
                        }
                    }

                    // Récupérer les markers depuis la collection "subscribedTo"
                    const subscribedToCollection = collection(firestore, "users", firebaseUser.uid, "subscribedTo");
                    const subscribedToSnapshot = await getDocs(subscribedToCollection);

                    const subscribedTo: IMarker[] = [];
                    if (!subscribedToSnapshot.empty) {
                        for (const subscribedDoc of subscribedToSnapshot.docs) {
                            const subscribedData = subscribedDoc.data();
                            const markerRef = subscribedData.markerRef;

                            // Récupérer les données marker depuis la référence
                            const markerSnapshot = await getDoc(markerRef);
                            if (markerSnapshot.exists()) {
                                const markerDetails = markerSnapshot.data() as DocumentData;
                                subscribedTo.push({
                                    markerId: markerRef.id,
                                    subscribedUserIds: markerDetails.subscribedUserIds,
                                    isLoading: false,
                                    connections: null,
                                    ...markerDetails,
                                    coordinates: {
                                        lat: markerDetails.coordinates.latitude,
                                        long: markerDetails.coordinates.longitude,
                                    } as ICoordinates,
                                } as IMarker)
                            }
                        }
                    }
                    // Mise à jour de l'état utilisateur
                    setUser({
                        userId: firebaseUser.uid,
                        email: userData.email,
                        username: userData.username,
                        birthdate: userData.birthdate,
                        locale: userData.locale,
                        friends: friends,
                        subscribedTo: subscribedTo,
                        ownerOf: ownerOf,
                        location: {
                            lat: fakeUserLocation.lat,
                            long: fakeUserLocation.long,
                            latDelta: fakeUserLocation.latDelta,
                            longDelta: fakeUserLocation.longDelta,
                        },
                    });
                    setIsLoading(false);
                } else {
                    console.error('User document not found in Firestore');
                    router.push('/Login');
                }
            } else {
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
            const userData: IUser = {
                userId: firebaseUser.uid,
                username,
                email,
                birthdate,
                locale,
                location: {
                    lat: fakeUserLocation.lat,
                    long: fakeUserLocation.long,
                    latDelta: fakeUserLocation.latDelta,
                    longDelta: fakeUserLocation.longDelta,
                },
                ownerOf: []
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

                // Récupérer les amis depuis la collection "friends"
                const friendsCollection = collection(firestore, "users", firebaseUser.uid, "friends");
                const friendsSnapshot = await getDocs(friendsCollection);

                const friends: IFriend[] = [];
                if (!friendsSnapshot.empty) {
                    for (const friendDoc of friendsSnapshot.docs) {
                        const friendData = friendDoc.data();
                        const userRef = friendData.userRef;

                        // Récupérer les données utilisateur depuis la référence
                        const userSnapshot = await getDoc(userRef);
                        if (userSnapshot.exists()) {
                            const userDetails = userSnapshot.data() as DocumentData;
                            friends.push({
                                userId: userRef.id,
                                email: userDetails.email,
                                username: userDetails.username,
                                birthdate: userDetails.birthdate,
                                locale: userDetails.locale,
                                addedAt: friendData.timestamp,
                                friends: [],
                                subscribedTo: userDetails.subscribedTo,
                                ownerOf: []
                            } as IFriend);
                        }
                    }
                }

                // Récupérer les markers possédés depuis la collection "ownerOf"
                const ownerOfCollection = collection(firestore, "users", firebaseUser.uid, "ownerOf");
                const ownerOfSnapshot = await getDocs(ownerOfCollection);

                const ownerOf: IMarker[] = [];
                if (!ownerOfSnapshot.empty) {
                    for (const markerDoc of ownerOfSnapshot.docs) {
                        const markerData = markerDoc.data();

                        ownerOf.push({
                            markerId: markerDoc.id,
                            createdAt: markerData.createdAt,
                            creatorId: markerData.creatorId,
                            minZoom: markerData.minZoom,
                            subscribedUserIds: markerData.subscribedUserIds,
                            connections: markerData.connections || null,
                            views: markerData.views,
                            messages: markerData.messages,
                            isLoading: false, // Par défaut
                        } as IMarker);
                    }
                }

                // Récupérer les markers depuis la collection "subscribedTo"
                const subscribedToCollection = collection(firestore, "users", firebaseUser.uid, "subscribedTo");
                const subscribedToSnapshot = await getDocs(subscribedToCollection);

                const subscribedTo: IMarker[] = [];
                if (!subscribedToSnapshot.empty) {
                    for (const subscribedDoc of subscribedToSnapshot.docs) {
                        const subscribedData = subscribedDoc.data();
                        const markerRef = subscribedData.markerRef;

                        // Récupérer les données marker depuis la référence
                        const markerSnapshot = await getDoc(markerRef);
                        if (markerSnapshot.exists()) {
                            const markerDetails = markerSnapshot.data() as DocumentData;
                            subscribedTo.push({
                                markerId: markerRef.id,
                                createdAt: markerDetails.createdAt,
                                creatorId: markerDetails.creatorId,
                                minZoom: markerDetails.minZoom,
                                subscribedUserIds: markerDetails.subscribedUserIds,
                                connections: markerDetails.connections || null,
                                views: markerDetails.views,
                                messages: markerDetails.messages,
                                isLoading: false, // Par défaut
                            } as IMarker);
                        }
                    }
                }

                // Mise à jour de l'état utilisateur
                setUser({
                    userId: firebaseUser.uid,
                    email: userData.email,
                    username: userData.username,
                    birthdate: userData.birthdate,
                    locale: userData.locale,
                    friends: friends,
                    subscribedTo: subscribedTo,
                    ownerOf: ownerOf,
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
            logoutUser()
            router.push('/Login');
        } catch (error) {
            console.error('Failed to sign out:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ isLoading, signUp, signIn, signOut }}>
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
