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
        const keyboardWillShowListener = Keyboard.addListener(
            'keyboardWillShow',
            () => {
                setKeyboardVisible(true); // Le clavier est visible
            }
        );
        const keyboardWillHideListener = Keyboard.addListener(
            'keyboardWillHide',
            () => {
                setKeyboardVisible(false); // Le clavier est caché
            }
        );

        // Nettoyage des écouteurs lors du démontage
        return () => {
            keyboardWillHideListener.remove();
            keyboardWillShowListener.remove();
        };
    }, [])

    useEffect(() => {
        const keyboardWillShowListener = Keyboard.addListener(
            'keyboardWillShow',
            (e) => {
                setKeyboardProps(e);
            }
        );

        // Nettoyage des écouteurs lors du démontage
        return () => {
            keyboardWillShowListener.remove();
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