import { collection, query, orderBy, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { IMessage } from '~/contexts/markers/types';
import { firestore } from '~/firebase';

export const subscription = (markerId: string, callback: (messages: IMessage[]) => void) => {
    const messagesCollection = collection(firestore, `markers/${markerId}/messages`);
    const q = query(messagesCollection, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
        const messages = await Promise.all(
            snapshot.docs.map(async (docRef) => {
                const messageData = docRef.data();
                const senderId = messageData.senderId;

                let userInfo = null;
                if (senderId) {
                    const userDoc = await getDoc(doc(firestore, 'users', senderId));
                    userInfo = userDoc.exists() ? userDoc.data() : null;
                }

                return {
                    messageId: docRef.id,
                    senderInfo: userInfo,
                    markerId,
                    senderId,
                    content: messageData.content,
                    type: messageData.type,
                    createdAt: messageData.createdAt,
                } as IMessage;
            })
        );
        callback(messages);
    });

    return unsubscribe;
};

export { subscription as messageSubscription }
