import React, { createContext, useState, useContext, ReactNode } from 'react';
import Users from '~/data/users.json';
import { IUser } from '~/types/UserInterfaces';
import { router } from 'expo-router';

import { CognitoUserAttribute, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import { userPool } from '~/config/CognitoConfig'
import { jwtDecode } from 'jwt-decode';

interface AuthContextProps {
    user: IUser | null;
    isLoading: boolean;
    signUp: (email: string, password: string, username: string, birthdate: string, locale: string) => Promise<boolean>;
    confirmSignUp: (code: string) => Promise<boolean>;
    signIn: (email: string, password: string) => Promise<boolean>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<IUser | null>(null)
    const [userTmp, setUserTmp] = useState<IUser | null>(null)
    const [isLoading, setIsLoading] = useState(false);

    const createAttribute = (Name: string, Value: string): CognitoUserAttribute => {
        return new CognitoUserAttribute({ Name, Value });
    }


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

        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: (result) => {
                console.log('Access token:', result.getAccessToken().getJwtToken());
                const idToken = result.getIdToken().getJwtToken();
                const userInfo = jwtDecode<{ sub: string; preferred_username: string, birthdate: string, locale: string }>(idToken);
                console.log('User info:', userInfo);
                setUser({
                    id: userInfo.sub || '',
                    username: userInfo.preferred_username,
                    birthdate: userInfo.birthdate,
                    locale: userInfo.locale,
                    following: [],
                });
            },
            onFailure: (err) => {
                console.error('Error signing in:', err.message || JSON.stringify(err));
            },
        });

        setIsLoading(false);
        return true;
    };

    const signOut = async () => {

        // Simuler un délai pour imiter une déconnexion API
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 250));
        router.push('/LoginScreen');
        setIsLoading(false);

        setUser(null);
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
                        id: result?.userSub,
                        username: username,
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
                Username: userTmp?.id || '',
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