import { collection, deleteDoc, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { firestore } from "~/firebase";

type UpdateLikeParams = {
    userId?: string;
    postId?: string;
    state: boolean;
};

const update = async ({ postId, state, userId }: UpdateLikeParams): Promise<void> => {
    if (!userId) {
        throw new Error("User is missing, unable to update likes.");
    }

    if (!postId) {
        throw new Error("postId is missing, unable to update likes.");
    }

    const postLikeCollection = collection(firestore, "markers", postId, "likes");
    const userLikeCollection = collection(firestore, "users", userId, "likes");

    const postLikeDocRef = doc(postLikeCollection, userId);
    const userLikeDocRef = doc(userLikeCollection, userId);

    const postLikeSnapshot = await getDoc(postLikeDocRef);

    if (state) {
        if (!postLikeSnapshot.exists()) {
            await setDoc(postLikeDocRef, { likedAt: serverTimestamp() });
            await setDoc(userLikeDocRef, { postLikeRef: postLikeDocRef });
        }
    } else {
        if (postLikeSnapshot.exists()) {
            await deleteDoc(postLikeDocRef);
            await deleteDoc(userLikeDocRef);
        }
    }
};

export { update as updateLike, UpdateLikeParams };
