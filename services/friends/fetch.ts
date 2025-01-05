import { collection, getDoc, getDocs, DocumentReference, doc, DocumentData } from "firebase/firestore";
import { IMarker } from "~/contexts/markers/types";
import { firestore } from "~/firebase";
import { ICoordinates } from "~/types/MapInterfaces";
import { IFriend } from "~/types/userTypes";

const fetch = async (userId?: string): Promise<IFriend[] | undefined> => {
    if (!userId) throw new Error('User ID is required');

    // Accéder à la sous-collection 'friends'
    const friendsCollectionRef = collection(firestore, "users", userId, "friends");
    const friendsSnapshot = await getDocs(friendsCollectionRef);

    if (friendsSnapshot.empty) {
        throw new Error('No friends found for this user');
    }

    const markerRefs: DocumentReference[] = [];

    // Récupérer les données des amis
    const friends = await Promise.all(
        friendsSnapshot.docs.map(async (friendDoc) => {
            const friendData = friendDoc.data();
            const userRef = friendData.userRef as DocumentReference;

            if (!userRef) {
                console.warn(`Friend document ${friendDoc.id} does not contain a valid userRef`);
                return null;
            }

            // Récupérer les données de l'utilisateur référencé
            const userSnapshot = await getDoc(userRef);
            if (!userSnapshot.exists()) {
                return null;
            }

            const friend = userSnapshot.data() as IFriend;
            return { ...friend, userId: userRef.id, ownerOf: [] as IMarker[] };
        })
    );

    const validFriends = friends.filter((friend) => friend !== null) as IFriend[];

    const friendsWithMarkers = await Promise.all(
        validFriends.map(async (friend) => {
    
            const ownerOfCollection = collection(firestore, "users", friend.userId, "ownerOf");
            const ownerOfSnapshot = await getDocs(ownerOfCollection);
    
            if (!ownerOfSnapshot.empty) {
                for (const ownerDoc of ownerOfSnapshot.docs) {
                    const ownerData = ownerDoc.data();
                    if (ownerData.markerRef instanceof DocumentReference) {
                        markerRefs.push(ownerData.markerRef);
                    }
                }
            }
            return { ...friend, ownerOf: [] as IMarker[] };
        })
    );
    
    // Charger toutes les références markerRef en parallèle
    const markerRefDocs = await Promise.all(markerRefs.map((ref) => getDoc(ref)));
    const markerRefData = markerRefDocs
        .filter((doc) => doc.exists())
        .map((doc) => ({
            id: doc.id,
            ...(doc.data()),
        } as DocumentData));
    
    // Associer les données des marqueurs référencés aux amis
    friendsWithMarkers.forEach((friend) => {
        friend.ownerOf = friend.ownerOf || []; // Initialiser ownerOf si nécessaire
    
        const markersForFriend = markerRefData.filter((marker) => marker.creatorId === friend.userId);

        markersForFriend.forEach((marker) => {
            const coordinates = marker.coordinates;
            const newMarker = {
                ...marker,
                markerId: marker.id,
                isLoading: false,
                connections: null,
                coordinates: {
                    lat: coordinates.latitude,
                    long: coordinates.longitude,
                } as ICoordinates,
            } as IMarker;

            friend.ownerOf.push(newMarker);
        });
    });

    return friendsWithMarkers;
};

export { fetch as fetchFriends };
