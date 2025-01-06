import { addDoc, collection } from "firebase/firestore";
import { firestore } from "~/firebase";

const create = async (markerId: string, message: any) => {
    const messagesCollection = collection(firestore, `markers/${markerId}/messages`);
    await addDoc(messagesCollection, message);
};

export { create as createMessage }