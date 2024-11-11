import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { IUser } from '~/types/UserInterfaces';
import { router } from 'expo-router';

import { CognitoUserAttribute, CognitoUser, AuthenticationDetails, CognitoUserPool } from 'amazon-cognito-identity-js';
import { jwtDecode } from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';
import awsConfig from '~/config/awsConfig';

const userPool = new CognitoUserPool({
    UserPoolId: awsConfig.cognito.userPoolId,
    ClientId: awsConfig.cognito.clientId,
});

interface AuthContextProps {
    user: IUser | null;
    isLoading: boolean;
    signUp: (email: string, password: string, username: string, birthdate: string, locale: string) => Promise<boolean>;
    confirmSignUp: (code: string) => Promise<boolean>;
    signIn: (email: string, password: string) => Promise<boolean>;
    signOut: () => Promise<void>;
}

export const getToken = async () => {
    try {
        return await AsyncStorage.getItem('@user_token');
    } catch (e) {
        console.error('Failed to retrieve token:', e);
        return null;
    }
};

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<IUser | null>(null)
    const [userTmp, setUserTmp] = useState<IUser | null>(null)
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadUser();
    }, []);

    const createAttribute = (Name: string, Value: string): CognitoUserAttribute => {
        return new CognitoUserAttribute({ Name, Value });
    }

    const storeUser = async (token: string) => {
        try {
            await AsyncStorage.setItem('@user_token', token);
        } catch (e) {
            console.error('Failed to save the user token.', e);
        }
    };


    const loadUser = async () => {
        try {
            const token = await AsyncStorage.getItem('@user_token');
            if (token) {
                const userInfo = jwtDecode<{
                    sub: string;
                    email: string;
                    preferred_username: string;
                    birthdate: string;
                    locale: string;
                }>(token);

                setUser({
                    userId: userInfo.sub || '',
                    username: userInfo.preferred_username,
                    email: userInfo.email,
                    birthdate: userInfo.birthdate,
                    locale: userInfo.locale,
                    following: [],
                });
            } else {
                router.push('/LoginScreen');
            }
        } catch (e) {
            console.error('Failed to load the user token.', e);
        }
    };

    const signIn = async (email: string, password: string): Promise<boolean> => {
        setIsLoading(true);
        const authenticationDetails = new AuthenticationDetails({
            Username: email,
            Password: password,
        });
        const userData = {
            Username: email,
            Pool: userPool,
        };
        const cognitoUser = new CognitoUser(userData);

        return new Promise<boolean>((resolve) => {
            cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: (result) => {
                    const idToken = result.getIdToken().getJwtToken();
                    if (!idToken) {
                        console.error('No token found in the result:', result);
                        setIsLoading(false);
                        resolve(false);
                        return;
                    }
                    const userInfo = jwtDecode<{
                        sub: string;
                        email: string;
                        preferred_username: string;
                        birthdate: string;
                        locale: string;
                    }>(idToken);
                    setUser({
                        userId: userInfo.sub || '',
                        username: userInfo.preferred_username,
                        email: userInfo.email,
                        birthdate: userInfo.birthdate,
                        locale: userInfo.locale,
                        following: [],
                    });

                    // Sauvegarder le jeton dans AsyncStorage
                    storeUser(idToken)
                    setIsLoading(false);
                    resolve(true);
                },
                onFailure: (err) => {
                    console.error('Error signing in:', err.message || JSON.stringify(err));
                    setIsLoading(false);
                    resolve(false);
                },
            });
        });
    };

    const signOut = async () => {
        setIsLoading(true);

        // Effacer les données utilisateur et le jeton
        try {
            await AsyncStorage.removeItem('@user_token');
        } catch (e) {
            console.error('Failed to remove the user token.', e);
        }

        setUser(null);
        router.push('/LoginScreen');
        setIsLoading(false);
    };

    const signUp = async (email: string, password: string, username: string, birthdate: string, locale: string): Promise<boolean> => {
        setIsLoading(true);

        const attributeList = [
            createAttribute('email', email),
            createAttribute('preferred_username', username),
            createAttribute('birthdate', birthdate),
            createAttribute('locale', locale),
            createAttribute('updated_at', Math.floor(Date.now() / 1000).toString())
        ];

        const signUpResult = await new Promise<boolean>((resolve) => {
            userPool.signUp(email, password, attributeList, [], (err, result) => {
                if (err) {
                    console.log(err);
                    setIsLoading(false);
                    resolve(false);
                } else if (result) {
                    console.log(result);
                    setUserTmp({
                        userId: result?.userSub,
                        username: username,
                        email: email,
                        following: [],
                        locale: "",
                        birthdate: "",
                    });
                    setIsLoading(false);
                    resolve(true);
                }
            });
        });

        return signUpResult;
    }

    const confirmSignUp = async (code: string): Promise<boolean> => {
        setIsLoading(true);

        const confirmSignUpResult = await new Promise<boolean>((resolve) => {
            const cognitoUser = new CognitoUser({
                Username: userTmp?.userId || '',
                Pool: userPool
            });

            cognitoUser.confirmRegistration(code, true, (err, result) => {
                if (err) {
                    resolve(false);
                    console.log(err);
                    alert("Invalid confirmation code.");
                } else {
                    resolve(true);
                    console.log(result);
                    router.push('/LoginScreen');
                }
            })
        });
        setIsLoading(false);

        return confirmSignUpResult;
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, signUp, confirmSignUp, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextProps => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};