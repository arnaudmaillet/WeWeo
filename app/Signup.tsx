import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Keyboard, Modal, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '~/contexts/AuthProvider';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import localesData from '~/data/locales.json';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';

interface LocaleProps {
    label: string;
    value: string;
    flag: string;
}

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [confirmationCode, setConfirmationCode] = useState(Array(6).fill('')); // Code de confirmation stocké comme un tableau de 6 valeurs

    const [username, setUsername] = useState('');
    const [birthdate, setBirthdate] = useState('');
    const [locale, setLocale] = useState<LocaleProps | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showLocalePicker, setShowLocalePicker] = useState(false);

    const [step, setStep] = useState(1); // Étape 1, 2 ou 3

    const router = useRouter();
    const { isLoading, signUp } = useAuth();

    const dotScale = useSharedValue(1); // Valeur partagée pour l'animation de l'échelle
    const inputsRefs = Array(6).fill(null).map(() => useRef<TextInput>(null)); // Références pour les inputs

    useEffect(() => {
        // Charger le premier locale par défaut
        if (localesData.data.length > 0) {
            setLocale(localesData.data[0]);
        }
    }, []);

    const handleNextStep = () => {
        if (!email || !password || !confirmPassword) {
            alert("Please fill out all fields.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        // Passer à l'étape suivante
        setStep(2);
    };

    const handleSignup = () => {
        if (!username || !birthdate || !locale) {
            alert("Please fill out all fields.");
            return;
        }

        // Appel à la fonction signUp ici
        signUp(email, password, username, birthdate, locale.value)
            .then(() => {
                // Passer à l'étape 3 uniquement si signUp réussit
                // setStep(3);
            })
            .catch(error => {
                alert(error.message); // Afficher l'erreur si signUp échoue
            });

        Keyboard.dismiss();
    };

    const handleConfirmSignUp = () => {
        const code = confirmationCode.join(''); // Concaténer les 6 inputs pour obtenir le code complet
        //confirmSignUp(code)
    };

    const onChangeDate = (_: any, selectedDate?: Date | undefined) => {
        const currentDate = selectedDate || new Date();
        setShowDatePicker(false);
        const formattedDate = currentDate.toISOString().split('T')[0];
        setBirthdate(formattedDate);
    };

    const handleInputChange = (value: string, index: number) => {
        const updatedCode = [...confirmationCode];
        updatedCode[index] = value;
        setConfirmationCode(updatedCode);

        // Déplacer le curseur vers l'input suivant
        if (value && index < 5) {
            inputsRefs[index + 1].current?.focus();
        }
    };

    const handleBackspace = (value: string, index: number) => {
        // Si on appuie sur 'Backspace' et que l'input est vide, revenir à l'input précédent
        if (!value && index > 0) {
            inputsRefs[index - 1].current?.focus();
        }
    };

    const handleDotPress = (stepNumber: number) => {
        // Ne permettre la navigation que vers des étapes précédentes
        if (stepNumber <= step) {
            setStep(stepNumber);
            // Animation lors du changement de dot
            dotScale.value = withTiming(1.2, { duration: 300 }, () => {
                dotScale.value = withTiming(1, { duration: 300 });
            });
        }
    };

    const dotAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: dotScale.value }],
        };
    });

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                <View style={styles.formContainer}>
                    {step === 1 ? (
                        // Step 1 : Email et mot de passe
                        <>
                            <Text style={styles.title}>创建账户 - Step 1</Text>

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

                            <TouchableOpacity onPress={handleNextStep} style={styles.signupButton}>
                                <Text style={styles.signupButtonText}>Next</Text>
                            </TouchableOpacity>
                        </>
                    ) : step === 2 ? (
                        // Step 2 : Username, birthdate et locale
                        <>
                            <Text style={styles.title}>创建账户 - Step 2</Text>

                            <TextInput
                                style={styles.input}
                                placeholder="Username"
                                placeholderTextColor="#aaa"
                                onChangeText={setUsername}
                                value={username}
                            />

                            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                                <View style={styles.datePickerInput}>
                                    <Text style={birthdate ? styles.datePickerText : { color: '#aaa' }}>
                                        {birthdate ? birthdate : "Birthdate"}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            {showDatePicker && (
                                <DateTimePicker
                                    value={new Date()}
                                    mode="date"
                                    display="default"
                                    onChange={onChangeDate}
                                />
                            )}

                            <TouchableOpacity onPress={() => setShowLocalePicker(true)}>
                                <View style={styles.input}>
                                    <Text style={styles.localeText}>
                                        {locale ? `${locale.flag} ${locale.label}` : "Select Locale"}
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            <Modal
                                visible={showLocalePicker}
                                transparent={true}
                                animationType="fade"
                            >
                                <TouchableOpacity
                                    style={styles.modalContainer}
                                    activeOpacity={1}
                                    onPressOut={() => setShowLocalePicker(false)}
                                >
                                    <TouchableOpacity activeOpacity={1} style={styles.pickerModal}>
                                        <Picker
                                            selectedValue={locale?.value}
                                            onValueChange={(itemValue) => {
                                                const selectedLocale = localesData.data.find(locale => locale.value === itemValue);
                                                setLocale(selectedLocale || null);
                                                setShowLocalePicker(false);
                                            }}
                                        >
                                            {localesData.data.map((item) => (
                                                <Picker.Item key={item.value} label={`${item.flag} ${item.label}`} value={item.value} />
                                            ))}
                                        </Picker>
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            </Modal>

                            <TouchableOpacity onPress={handleSignup} style={styles.signupButton}>
                                <Text style={styles.signupButtonText}>注册</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        // Step 3 : Confirmation de l'inscription avec 6 inputs pour le code de confirmation
                        <>
                            <Text style={styles.title}>Confirmation</Text>
                            <Text style={styles.instructions}>Un code de confirmation a été envoyé à votre email. Veuillez entrer le code ci-dessous pour finaliser l'inscription.</Text>

                            <View style={styles.codeInputContainer}>
                                {confirmationCode.map((digit, index) => (
                                    <TextInput
                                        key={index}
                                        ref={inputsRefs[index]} // Attacher la référence
                                        style={styles.codeInput}
                                        keyboardType="number-pad"
                                        maxLength={1}
                                        value={digit}
                                        onChangeText={(value) => handleInputChange(value, index)}
                                        onKeyPress={({ nativeEvent }) => {
                                            if (nativeEvent.key === 'Backspace') {
                                                handleBackspace(digit, index);
                                            }
                                        }}
                                    />
                                ))}
                            </View>

                            {
                                isLoading ? (
                                    <View style={styles.signupButton}>
                                        <ActivityIndicator size="small" color="#fff" />
                                    </View>
                                ) : (
                                    <TouchableOpacity onPress={handleConfirmSignUp} style={styles.signupButton}>
                                        <Text style={styles.signupButtonText}>Confirmer</Text>
                                    </TouchableOpacity>
                                )
                            }
                        </>
                    )}

                    {/* Slide Indicator */}
                    <View style={styles.slideIndicatorContainer}>
                        <TouchableOpacity onPress={() => handleDotPress(1)}>
                            <Animated.View style={[styles.dot, step === 1 && styles.activeDot, dotAnimatedStyle]} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDotPress(2)}>
                            <Animated.View style={[styles.dot, step === 2 && styles.activeDot, dotAnimatedStyle]} />
                        </TouchableOpacity>
                        <TouchableOpacity disabled={step < 3}>
                            <Animated.View style={[styles.dot, step === 3 && styles.activeDot, dotAnimatedStyle]} />
                        </TouchableOpacity>
                    </View>

                    {/* Bouton pour aller à l'écran de connexion */}
                    <TouchableOpacity onPress={() => router.push('/Login')} style={styles.loginButton}>
                        <Text style={styles.loginButtonText}>已经有账号？登录</Text>
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
    instructions: {
        fontSize: 16,
        marginBottom: 10,
        textAlign: 'center',
        color: '#333',
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        justifyContent: 'center',
        paddingHorizontal: 10,
        marginVertical: 10,
    },
    localeText: {
        fontSize: 16,
        color: '#333',
    },
    datePickerInput: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        justifyContent: 'center',
        paddingHorizontal: 10,
        marginVertical: 10,
    },
    datePickerText: {
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
    loginButton: {
        marginTop: 30,
        alignItems: 'center',
    },
    loginButtonText: {
        color: '#0088cc',
        fontSize: 14,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    pickerModal: {
        backgroundColor: '#fff',
        borderRadius: 20,
        width: '80%',
    },
    codeInputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 20,
        width: '80%',
        alignSelf: 'center',
    },
    codeInput: {
        width: 40,
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        textAlign: 'center',
        fontSize: 20,
    },
    slideIndicatorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 30,
    },
    dot: {
        height: 10,
        width: 10,
        backgroundColor: '#ccc',
        borderRadius: 5,
        marginHorizontal: 5,
    },
    activeDot: {
        backgroundColor: '#0088cc',
    },
});

export default Signup;
