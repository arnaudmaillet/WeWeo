import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';

const SignupScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const router = useRouter();

    const handleSignup = () => {
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        console.log('Signup with email:', email, 'password:', password);
        // Ajoute ici la logique d'inscription, par exemple appeler un backend pour créer l'utilisateur
        Keyboard.dismiss();
        router.push('/LoginScreen'); // Redirige vers l'écran de login après l'inscription
    };


    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                <View style={styles.formContainer}>
                    <Text style={styles.title}>创建账户</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#aaa"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        onChangeText={setEmail}
                        value={email}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#aaa"
                        secureTextEntry
                        onChangeText={setPassword}
                        value={password}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Confirm Password"
                        placeholderTextColor="#aaa"
                        secureTextEntry
                        onChangeText={setConfirmPassword}
                        value={confirmPassword}
                    />

                    <TouchableOpacity onPress={handleSignup} style={styles.signupButton}>
                        <Text style={styles.signupButtonText}>注册</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.push('/LoginScreen')} style={styles.loginRedirect}>
                        <Text style={styles.loginRedirectText}>已经有账户？登录</Text>
                    </TouchableOpacity>
                </View>
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
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 50,
    },
    formContainer: {
        width: '100%',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginVertical: 10,
        fontSize: 16,
        color: '#333',
    },
    signupButton: {
        backgroundColor: '#0088cc',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
        width: 100,
        alignSelf: 'center',
    },
    signupButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    loginRedirect: {
        marginTop: 30,
        alignItems: 'center',
    },
    loginRedirectText: {
        color: '#0088cc',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default SignupScreen;
