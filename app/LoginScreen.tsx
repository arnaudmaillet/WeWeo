import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, ScrollView, Platform, ActivityIndicator, Keyboard } from 'react-native';
import Animated, { BounceIn, SlideInDown, SlideInRight } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useKeyboard } from '~/providers/KeyboardProvider';
import { useAuth } from '~/providers/AuthProvider';

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [input, setInput] = useState('');
    const [isEmailOk, setIsEmailOk] = useState(false);

    const router = useRouter();
    const { keyboardPropsOnClick, setKeyboardPropsOnClick } = useKeyboard();
    const { isLoading, signIn } = useAuth();

    const handleLogin = async () => {
        if (isEmailOk) {
            setPassword(input); // Mettez à jour l'état du password
            setIsEmailOk(false);
            console.log('try to login with email:', email, 'and password:', input); // Utilisez 'input' ici directement
            const isLogged = await signIn(email, input);
            if (isLogged) {
                setEmail('');
                setPassword('');
                setInput('');
                setKeyboardPropsOnClick(!keyboardPropsOnClick);
                //setUser(email);
                router.push('/MainScreen');
            }
        } else {
            setEmail(input);
            setInput('');
            setIsEmailOk(true);
        }
    };

    const handleSignup = () => {
        Keyboard.dismiss();
        router.push('/SignupScreen');
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
            >
                <Animated.View style={styles.circle} entering={BounceIn.springify().stiffness(150).damping(100)}>
                    <Text style={styles.circleText}>Wewe</Text>
                    <Text style={styles.circleTextChinese}>微位</Text>
                </Animated.View>
                <Animated.View style={styles.inputContainer} entering={SlideInDown.springify().stiffness(150).damping(100)}>
                    <TextInput
                        style={styles.input}
                        placeholder={isEmailOk ? 'Password' : 'Email'}
                        placeholderTextColor="#aaa"
                        onChangeText={setInput}
                        keyboardType={isEmailOk ? 'visible-password' : 'email-address'}
                        autoCapitalize="none"
                        value={input}
                        secureTextEntry={isEmailOk}
                    />
                    <TouchableOpacity onPress={handleLogin} disabled={input === ''}>
                        <Animated.View entering={SlideInRight.springify().stiffness(150).damping(100)} style={styles.buttonContainer}>
                            {isLoading ? (
                                <ActivityIndicator size="small" color="#0088cc" />  // Affiche le loader
                            ) : (
                                // Affichage des boutons selon l'état d'email ou mot de passe
                                isEmailOk ? (
                                    <Text style={[styles.connectButton, { color: input === '' ? '#aaa' : '#0088cc' }]}>登录</Text> // "Connect"
                                ) : (
                                    <Text style={[styles.validateButton, { color: input === '' ? '#aaa' : '#0088cc' }]}>验证</Text> // "Validate"
                                )
                            )}
                        </Animated.View>
                    </TouchableOpacity>
                </Animated.View>

                {/* Nouveau bouton pour créer un compte */}
                <TouchableOpacity onPress={handleSignup}>
                    <Text style={styles.signupText}>创建账户</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 50,
    },
    circle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#0088cc',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 80,
    },
    circleText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    circleTextChinese: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    input: {
        flex: 1,
        height: 50,
        paddingHorizontal: 10,
        fontSize: 16,
        color: '#333',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 20,
        overflow: 'hidden',
    },
    inputPassword: {
        flex: 1,
        height: 50,
        paddingHorizontal: 10,
        fontSize: 16,
        color: '#333',
    },
    buttonContainer: {
        padding: 10,
        marginRight: 10,
        width: 60,
        alignItems: 'center',
    },
    validateButton: {
        color: '#0088cc',
        fontSize: 18,
        fontWeight: '600',
    },
    connectButton: {
        color: '#0088cc',
        fontSize: 18,
        fontWeight: '600',
    },
    signupText: {
        color: '#0088cc',
        fontSize: 16,
        fontWeight: '600',
        marginVertical: 35,
    },
});

export default LoginScreen;
