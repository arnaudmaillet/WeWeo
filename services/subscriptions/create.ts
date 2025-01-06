import { doc, updateDoc, arrayUnion, collection, setDoc } from "firebase/firestore";
import { firestore } from "~/firebase";

export const create = async (postId: string, userId?: string) => {

    if(!userId) throw new Error(`User missing, postId: ${postId}.`);
    
    const ref = doc(firestore, "markers", postId);
    const subscriptionCollection = collection(firestore, "users", userId, "subscribedTo");

    await updateDoc(ref, {
        subscribedUserIds: arrayUnion(userId),
    });

    const docRef = doc(subscriptionCollection, postId);
    await setDoc(docRef, {
        ref,
        subscribedAt: new Date(),
    });
};

export { create as createSubscription }