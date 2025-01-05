import * as SecureStore from "expo-secure-store";
import { StorageKeys } from "~/constants/constants";

interface ISecureTokenStorage {
    key: StorageKeys;
    payload: string;
}

const useSecureStorage = () => {
    /**
     * Ajoute ou met à jour plusieurs valeurs dans SecureStore.
     * @param tokens Liste des paires { key, payload } à stocker.
     */
    const setTokens = async (...tokens: ISecureTokenStorage[]) => {
        try {
            for (const { key, payload } of tokens) {
                await SecureStore.setItemAsync(key, payload);
            }
        } catch (error) {
            console.error("Erreur lors de l'enregistrement des tokens :", error);
        }
    };

    /**
     * Supprime une ou plusieurs clés de SecureStore.
     * @param tokens Liste des clés à supprimer.
     */
    const removeTokens = async (...tokens: StorageKeys[]) => {
        try {
            for (const key of tokens) {
                await SecureStore.deleteItemAsync(key);
            }
        } catch (error) {
            console.error("Erreur lors de la suppression des tokens :", error);
        }
    };

    /**
     * Récupère une valeur depuis SecureStore.
     * @param key Clé à récupérer.
     * @returns La valeur stockée ou `null` si elle n'existe pas.
     */
    const getToken = async (key: StorageKeys): Promise<string | null> => {
        try {
            const value = await SecureStore.getItemAsync(key);
            if (value) {
                return value;
            } else {
                console.warn(`Token introuvable : ${key}`);
                return null;
            }
        } catch (error) {
            console.error("Erreur lors de la récupération du token :", error);
            return null;
        }
    };

    return { setTokens, removeTokens, getToken };
};

export { useSecureStorage };
