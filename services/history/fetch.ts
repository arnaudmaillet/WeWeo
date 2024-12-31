import { collection, DocumentData, getDoc, getDocs } from "firebase/firestore";
import { IMarkerHistory } from "~/contexts/markers/types";
import { firestore } from "~/firebase";

const fetch = async (userId?: string): Promise<IMarkerHistory[] | null> => {
    if(!userId) return null
    const userHistoryCollection = collection(firestore, "users", userId, "history");
  
    const querySnapshot = await getDocs(userHistoryCollection);
    const markerPromises = querySnapshot.docs.map(async (doc) => {
      const markerRef = doc.data().markerRef;
      const markerSnapshot = await getDoc(markerRef);
  
      if (markerSnapshot.exists()) {
        const markerData = markerSnapshot.data() as DocumentData;
        return {
          ...markerData,
          markerId: markerSnapshot.id,
          viewedAt: doc.data().viewedAt.toDate(),
        };
      }
      return null;
    });
  
    const historyWithNulls = await Promise.all(markerPromises);
    return historyWithNulls.filter((item): item is IMarkerHistory => item !== null);
};

export { fetch as fetchHistory }