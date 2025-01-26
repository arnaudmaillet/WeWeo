import { addDoc, collection, GeoPoint } from "firebase/firestore";
import { firestore } from "~/firebase";

type Payload = {
    coordinates: { lat: number; long: number };
    [key: string]: any;
}

const create = async (payload: Payload, userId?: string): Promise<void> => {

    const { coordinates, ...rest } = payload;

    if (!userId) {
        throw new Error("User missing, unable to add a post.");
    }

    await addDoc(collection(firestore, "markers"), {
        coordinates: new GeoPoint(coordinates.lat, coordinates.long),
        ...rest,
        minZoom: 15,
        subscribedUserIds: [userId],
        connectedUserIds: [],
        senderId: userId,
        createdAt: new Date().getTime(),
        messages: [],
    });
};

export { create as createPost, Payload as PostPayload }