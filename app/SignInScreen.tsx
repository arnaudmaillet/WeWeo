import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import Animated, { BounceIn, SlideInDown, SlideInRight } from 'react-native-reanimated';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';

const SignInScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [input, setInput] = useState('');
    const [isEmailOk, setIsEmailOk] = useState(false);

    const router = useRouter();

    const handleLogin = () => {
        if (isEmailOk) {
            setPassword(input); // Mettez à jour l'état du password
            setIsEmailOk(false);
            console.log('try to login with email:', email, 'and password:', input); // Utilisez 'input' ici directement
            setEmail('');
            setPassword('');
            setInput('');
            //setUser(email);
            router.push('/MainScreen');
        } else {
            setEmail(input);
            setInput('');
            setIsEmailOk(true);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={-40}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
            >
                <Animated.View style={styles.circle} entering={BounceIn.springify().stiffness(150).damping(100)}>
                    <Text style={styles.circleText}>微位</Text>
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
                    />
                    <TouchableOpacity onPress={handleLogin} disabled={input === ''}>
                        <Animated.View entering={SlideInRight.springify().stiffness(150).damping(100)} style={styles.icon}>
                            <MaterialCommunityIcons name="login" size={30} color={input === '' ? '#aaa' : '#333'} />
                        </Animated.View>
                    </TouchableOpacity>
                </Animated.View>
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
        marginBottom: 40,
        overflow: 'hidden',
    },
    inputPassword: {
        flex: 1,
        height: 50,
        paddingHorizontal: 10,
        fontSize: 16,
        color: '#333',
    },
    icon: {
        padding: 10,
        marginRight: 10,
    },
});

export default SignInScreen;
