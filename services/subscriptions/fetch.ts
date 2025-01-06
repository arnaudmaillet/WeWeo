import { collection, DocumentData, getDoc, getDocs } from "firebase/firestore";
import { IPostSubscription } from "~/contexts/markers/types";
import { firestore } from "~/firebase";
import { ICoordinates } from "~/types/MapInterfaces";

const fetch = async (userId?: string): Promise<IPostSubscription[] | null> => {
    if(!userId) throw new Error('User ID is required');
    const subscriptionCollection = collection(firestore, "users", userId, "subscribedTo");
  
    const querySnapshot = await getDocs(subscriptionCollection);
    const promise = querySnapshot.docs.map(async (doc) => {
      const ref = doc.data().markerRef;
      const snapshot = await getDoc(ref);
  
      if (snapshot.exists()) {
        const data = snapshot.data() as DocumentData;
        const coordinates = data.coordinates;
        return {
            ...data,
            markerId: snapshot.id,
            subscribedAt: doc.data().subscribedAt.toDate(),
            coordinates: {
                lat: coordinates.latitude,
                long: coordinates.longitude,
            } as ICoordinates,
        } as IPostSubscription;
      }
      return null;
    });
  
    const posts = await Promise.all(promise);
    return posts.filter((item): item is IPostSubscription => item !== null);
};

export { fetch as fetchSubscriptions }