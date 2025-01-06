import { doc, updateDoc, arrayRemove, collection, deleteDoc } from "firebase/firestore";
import { firestore } from "~/firebase";

export const remove = async (postId: string, userId?: string) => {
    
    if(!userId) throw new Error(`User missing, postId: ${postId}.`);

    const ref = doc(firestore, "markers", postId);
    const subscriptionCollection = collection(firestore, "users", userId, "subscribedTo");

    await updateDoc(ref, {
        subscribedUserIds: arrayRemove(userId),
    });

    const docRef = doc(subscriptionCollection, postId);
    await deleteDoc(docRef);
};

export { remove as deleteSubscription }