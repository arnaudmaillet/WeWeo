import { collection, getDocs, query, where } from "firebase/firestore";
import { IMarker } from "~/contexts/markers/types";
import { firestore } from "~/firebase";
import { ICoordinates } from "~/types/MapInterfaces";

const fetchPosts = async (): Promise<IMarker[]> => {
    const postsCollection = collection(firestore, "markers");
    const publicPostsQuery = query(postsCollection, where("policy.isPrivate", "==", false));

    const [userPostsSnapshot, publicPostsSnapshot] = await Promise.all([
        getDocs(postsCollection),
        getDocs(publicPostsQuery),
    ]);

    const allPosts = new Map<string, IMarker>();

    userPostsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const coordinates = data.coordinates;
        allPosts.set(doc.id, {
            ...data,
            markerId: doc.id,
            isLoading: false,
            connections: null,
            coordinates: {
                lat: coordinates.latitude,
                long: coordinates.longitude,
            } as ICoordinates,
        } as IMarker);
    });

    publicPostsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const coordinates = data.coordinates;
        allPosts.set(doc.id, {
            ...data,
            markerId: doc.id,
            subscribedUserIds: data.subscribedUserIds,
            isLoading: false,
            connections: null,
            coordinates: {
                lat: coordinates.latitude,
                long: coordinates.longitude,
            } as ICoordinates,
        } as IMarker);
    });

    return Array.from(allPosts.values());
    // return [Array.from(allPosts.values())[0]] as IMarker[];
};

export { fetchPosts }