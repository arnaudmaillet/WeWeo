import { collection, DocumentData, getDoc, getDocs } from "firebase/firestore";
import { IMarkerHistory } from "~/contexts/markers/types";
import { firestore } from "~/firebase";
import { ICoordinates } from "~/types/MapInterfaces";

const fetch = async (userId?: string): Promise<IMarkerHistory[] | null> => {
    if(!userId) throw new Error('User ID is required');
    const userHistoryCollection = collection(firestore, "users", userId, "history");
  
    const querySnapshot = await getDocs(userHistoryCollection);
    const markerPromises = querySnapshot.docs.map(async (doc) => {
      const markerRef = doc.data().markerRef;
      const markerSnapshot = await getDoc(markerRef);
  
      if (markerSnapshot.exists()) {
        const markerData = markerSnapshot.data() as DocumentData;
        const coordinates = markerData.coordinates;
        return {
          ...markerData,
          markerId: markerSnapshot.id,
          viewedAt: doc.data().viewedAt.toDate(),
          coordinates: {
            lat: coordinates.latitude,
            long: coordinates.longitude,
        } as ICoordinates,
        } as IMarkerHistory;
      }
      return null;
    });
  
    const historyWithNulls = await Promise.all(markerPromises);
    return historyWithNulls.filter((item): item is IMarkerHistory => item !== null);
};

export { fetch as fetchHistory }