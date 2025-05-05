import React, { useState } from 'react';
    import {
        View,
        Text,
        TextInput,
        TouchableOpacity,
        StyleSheet,
        Alert,
        ScrollView,
    } from 'react-native';
    import { LinearGradient } from 'expo-linear-gradient';
    import { Lock, Eye, EyeOff, Key, ArrowRight } from 'lucide-react-native';
    import axios from 'axios';
    import { useNavigation, useRoute } from '@react-navigation/native';

    export default function ResetPassword() {
        const navigation = useNavigation();
        const route = useRoute();
        const { email } = route.params;

        const [resetCode, setResetCode] = useState('');
        const [newPassword, setNewPassword] = useState('');
        const [confirmPassword, setConfirmPassword] = useState('');
        const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
        const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

        const handleResetPassword = async () => {
            if (newPassword !== confirmPassword) {
                Alert.alert('Error', 'New password and confirm password do not match');
                return;
            }

            try {
                const response = await axios.post(
                    'http://172.20.10.5:8080/api/user/reset-password',
                    { resetCode, newPassword, confirmPassword }
                );

                if (response.status === 200) {
                    Alert.alert('Success', 'Password reset successfully', [
                        {
                            text: 'OK',
                            onPress: () => navigation.navigate('Login'),
                        },
                    ]);
                } else {
                    Alert.alert('Error', 'Failed to reset password');
                }
            } catch (error) {
                console.error(error);
                Alert.alert('Error', 'Failed to reset password');
            }
        };

        return (
            <ScrollView style={styles.container}>
                <LinearGradient
                    colors={['#0056b3', '#003366']}
                    style={styles.headerGradient}
                >
                    <Text style={styles.headerTitle}>Reset Password</Text>
                </LinearGradient>

                <View style={styles.contentContainer}>
                    <View style={styles.card}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Reset Code</Text>
                            <View style={styles.inputContainer}>
                                <Key size={24} color="#0056b3" style={styles.icon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter reset code"
                                    placeholderTextColor="#666"
                                    value={resetCode}
                                    onChangeText={setResetCode}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>New Password</Text>
                            <View style={styles.inputContainer}>
                                <Lock size={24} color="#0056b3" style={styles.icon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter new password"
                                    placeholderTextColor="#666"
                                    secureTextEntry={!isNewPasswordVisible}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                />
                                <TouchableOpacity
                                    onPress={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
                                    style={styles.eyeIcon}
                                >
                                    {isNewPasswordVisible ? (
                                        <EyeOff size={24} color="#666" />
                                    ) : (
                                        <Eye size={24} color="#666" />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Confirm Password</Text>
                            <View style={styles.inputContainer}>
                                <Lock size={24} color="#0056b3" style={styles.icon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirm new password"
                                    placeholderTextColor="#666"
                                    secureTextEntry={!isConfirmPasswordVisible}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                />
                                <TouchableOpacity
                                    onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                                    style={styles.eyeIcon}
                                >
                                    {isConfirmPasswordVisible ? (
                                        <EyeOff size={24} color="#666" />
                                    ) : (
                                        <Eye size={24} color="#666" />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
                            <View style={styles.buttonContent}>
                                <Text style={styles.buttonText}>Reset Password</Text>
                                <ArrowRight size={20} color="#fff" style={styles.buttonIcon} />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        );
    }

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#f5f5f5',
        },
        headerGradient: {
            padding: 20,
            paddingTop: 40,
            paddingBottom: 40,
        },
        headerTitle: {
            fontSize: 24,
            fontWeight: 'bold',
            color: '#fff',
            textAlign: 'center',
        },
        contentContainer: {
            padding: 20,
            marginTop: -30,
        },
        card: {
            backgroundColor: '#fff',
            borderRadius: 15,
            padding: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 5,
        },
        inputGroup: {
            marginBottom: 20,
        },
        label: {
            fontSize: 14,
            color: '#444',
            marginBottom: 8,
            fontWeight: '500',
        },
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#e1e1e1',
            borderRadius: 10,
            paddingHorizontal: 15,
            backgroundColor: '#fff',
        },
        icon: {
            marginRight: 12,
        },
        input: {
            flex: 1,
            height: 50,
            color: '#333',
            fontSize: 16,
        },
        eyeIcon: {
            padding: 8,
        },
        button: {
            height: 50,
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#0056b3',
            marginTop: 20,
        },
        buttonContent: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        buttonText: {
            color: '#fff',
            fontSize: 16,
            fontWeight: '600',
            marginRight: 8,
        },
        buttonIcon: {
            marginTop: 2,
        },
        cancelButton: {
            backgroundColor: '#e1e1e1',
        },
        cancelButtonText: {
            color: '#333',
            fontSize: 16,
            fontWeight: '600',
        },
    });