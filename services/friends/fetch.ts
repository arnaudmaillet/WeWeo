import { collection, getDoc, getDocs, DocumentReference } from "firebase/firestore";
import { IMarker } from "~/contexts/markers/types";
import { firestore } from "~/firebase";
import { ICoordinates } from "~/types/MapInterfaces";
import { IFriend, IUser } from "~/types/userTypes";

// const fetch = async (user?: IUser): Promise<IMarker[] | undefined> => {
//     if (!user || !user.friends) return;

//     const friendsWithMarkers = await Promise.all(user.friends.map(async friend => {
//         const friendData: IFriend = { ...friend, ownerOf: [] };

//         const ownerOfCollection = collection(firestore, "users", friend.userId, "ownerOf");
//         const ownerOfSnapshot = await getDocs(ownerOfCollection);

//         if (!ownerOfSnapshot.empty) {
//             for (const markerDoc of ownerOfSnapshot.docs) {
//                 const markerData = markerDoc.data();
//                 let markerDetails = markerData;

//                 if (markerData.markerRef) {
//                     const markerRefSnapshot = await getDoc(markerData.markerRef);
//                     if (markerRefSnapshot.exists()) {
//                         markerDetails = markerRefSnapshot.data() as DocumentData;
//                     } else {
//                         console.warn(`MarkerRef ${markerData.markerRef.id} does not exist.`);
//                         continue;
//                     }
//                 }

//                 friendData.ownerOf?.push({
//                     ...markerDetails,
//                     markerId: markerDoc.id,
//                     isLoading: false,
//                     connections: null,
//                     coordinates: {
//                         lat: markerDetails.coordinates.latitude,
//                         long: markerDetails.coordinates.longitude,
//                     } as ICoordinates,
//                 } as IMarker);
//             }
//         }
//         return friendData;
//     }));

//     const markers = friendsWithMarkers.flatMap((friend: IFriend) => friend.ownerOf);
//     return markers;
// };

interface IRawMarker extends Omit<IMarker, "coordinates"> {
    markerRef?: DocumentReference;
    coordinates: {
        latitude: number;
        longitude: number;
    };
}

interface IReferencedMarkerData {
    coordinates: {
        latitude: number;
        longitude: number;
    };
    [key: string]: any;
}

const fetch = async (user?: IUser): Promise<IMarker[] | undefined> => {
    if (!user || !user.friends) return;

    const markerRefs: DocumentReference[] = [];

    const friendsWithMarkers = await Promise.all(
        user.friends.map(async (friend) => {
            const friendData: IFriend = { ...friend, ownerOf: [] };

            const ownerOfCollection = collection(firestore, "users", friend.userId, "ownerOf");
            const ownerOfSnapshot = await getDocs(ownerOfCollection);

            if (!ownerOfSnapshot.empty) {
                for (const markerDoc of ownerOfSnapshot.docs) {
                    const markerData = markerDoc.data() as IRawMarker;

                    if (markerData.markerRef instanceof DocumentReference) {
                        markerRefs.push(markerData.markerRef);
                    } else {
                        if (
                            markerData.coordinates &&
                            typeof markerData.coordinates.latitude === "number" &&
                            typeof markerData.coordinates.longitude === "number"
                        ) {
                            friendData.ownerOf?.push({
                                ...markerData,
                                markerId: markerDoc.id,
                                isLoading: false,
                                connections: null,
                                coordinates: {
                                    lat: markerData.coordinates.latitude,
                                    long: markerData.coordinates.longitude,
                                } as ICoordinates,
                            } as IMarker);
                        } else {
                            console.warn(`Invalid coordinates for marker ${markerDoc.id}`);
                        }
                    }
                }
            }
            return friendData;
        })
    );

    // Charger toutes les références en parallèle
    const markerRefDocs = await Promise.all(markerRefs.map((ref) => getDoc(ref)));

    const markerRefData = markerRefDocs
        .filter((doc) => doc.exists())
        .map((doc) => ({
            id: doc.id,
            ...(doc.data() as IReferencedMarkerData),
        }));

    // Associer les données des références aux marqueurs
    friendsWithMarkers.forEach((friend) => {
        friend.ownerOf?.forEach((marker) => {
            const refData = markerRefData.find((ref) => ref.id === marker.markerId);
            if (refData && refData.coordinates) {
                Object.assign(marker, {
                    ...refData,
                    coordinates: {
                        lat: refData.coordinates.latitude,
                        long: refData.coordinates.longitude,
                    },
                });
            }
        });
    });

    return friendsWithMarkers.flatMap((friend) => friend.ownerOf);
};

export { fetch as fetchFriends };
