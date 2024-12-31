import { collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { firestore } from "~/firebase";

const create = async (postId: string, userId?: string): Promise<void> => {
    if (!userId) {
        throw new Error("User not logged in, unable to add to history.");
    }

    const userHistoryCollection = collection(firestore, "users", userId, "history");
    const markerRef = doc(firestore, "markers", postId);
    const historyDocRef = doc(userHistoryCollection, postId);
    const historyDocSnapshot = await getDoc(historyDocRef);

    if (historyDocSnapshot.exists()) {
        await updateDoc(historyDocRef, { viewedAt: new Date() });
    } else {
        await setDoc(historyDocRef, { markerRef, viewedAt: new Date() });
    }
};

export { create as createHistory }