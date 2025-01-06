import { collection, DocumentData, getDoc, getDocs } from "firebase/firestore";
import { IMarkerHistory } from "~/contexts/markers/types";
import { firestore } from "~/firebase";
import { ICoordinates } from "~/types/MapInterfaces";

const fetch = async (userId?: string): Promise<IMarkerHistory[] | null> => {
    if(!userId) throw new Error('User ID is required');
    const historyCollection = collection(firestore, "users", userId, "history");
  
    const querySnapshot = await getDocs(historyCollection);
    const promise = querySnapshot.docs.map(async (doc) => {
      const ref = doc.data().markerRef;
      const snapshot = await getDoc(ref);
  
      if (snapshot.exists()) {
        const data = snapshot.data() as DocumentData;
        const coordinates = data.coordinates;
        return {
          ...data,
          markerId: snapshot.id,
          viewedAt: doc.data().viewedAt.toDate(),
          coordinates: {
            lat: coordinates.latitude,
            long: coordinates.longitude,
        } as ICoordinates,
        } as IMarkerHistory;
      }
      return null;
    });
  
    const posts = await Promise.all(promise);
    return posts.filter((item): item is IMarkerHistory => item !== null);
};

export { fetch as fetchHistory }