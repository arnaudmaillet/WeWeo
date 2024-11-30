import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { Keyboard } from "react-native";


const KeyboardContext = createContext({});

export interface KeyboardContextProps {
    keyboardProps: any;
    isKeyboardVisible: boolean;
    keyboardPropsOnClick: boolean;
    setKeyboardPropsOnClick: (value: boolean) => void;
}

export const KeyboardProvider = ({ children }: PropsWithChildren<{}>) => {
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const [keyboardPropsOnClick, setKeyboardPropsOnClick] = useState<boolean>(false);
    const [keyboardProps, setKeyboardProps] = useState({});

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setKeyboardVisible(true); // Le clavier est visible
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardVisible(false); // Le clavier est caché
            }
        );

        // Nettoyage des écouteurs lors du démontage
        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, [])

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            (e) => {
                setKeyboardProps(e);
            }
        );

        // Nettoyage des écouteurs lors du démontage
        return () => {
            keyboardDidShowListener.remove();
        };
    }, [keyboardPropsOnClick])


    return (
        <KeyboardContext.Provider value={{ keyboardProps, isKeyboardVisible, keyboardPropsOnClick, setKeyboardPropsOnClick }}>
            {children}
        </KeyboardContext.Provider>
    )
}

export const useKeyboard = () => {
    const context = useContext(KeyboardContext) as KeyboardContextProps;
    if (!context) {
        throw new Error('useKeyboard must be used within a KeyboardProvider');
    }
    return context;
}