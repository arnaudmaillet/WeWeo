import { collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { firestore } from "~/firebase";

const create = async (postId: string, userId?: string): Promise<void> => {
    if (!userId) {
        throw new Error("User missing, unable to add to history.");
    }

    const historyCollection = collection(firestore, "users", userId, "history");
    const ref = doc(firestore, "markers", postId);
    const docRef = doc(historyCollection, postId);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
        await updateDoc(docRef, { viewedAt: new Date() });
    } else {
        await setDoc(docRef, { ref, viewedAt: new Date() });
    }
};

export { create as createHistory }