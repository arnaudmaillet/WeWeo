// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from "~/config/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);

export const auth = initializeAuth(firebase, {
    persistence: getReactNativePersistence(AsyncStorage),
  });

export const firestore = getFirestore(firebase);
// const analytics = getAnalytics(app);

export default firebase;
