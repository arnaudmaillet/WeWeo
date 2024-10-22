import React, { createContext, useState, useContext, ReactNode } from 'react';
import Users from '../data/users.json';
import { UserProps } from '../types/UserInterfaces';
import { router } from 'expo-router';

interface AuthContextProps {
    user: UserProps | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserProps | null>(null)
    const [isLoading, setIsLoading] = useState(false);

    const login = async (email: string, password: string): Promise<boolean> => {

        // Simuler un délai pour imiter un appel à une API
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(false);

        setUser(Users.data[0]);
        return true;
    };

    const logout = async () => {

        // Simuler un délai pour imiter une déconnexion API
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 250));
        router.push('/LoginScreen');
        setIsLoading(false);

        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
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