import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

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
                'http://172.20.10.2:8080/api/user/reset-password',
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

    const toggleNewPasswordVisibility = () => {
        setIsNewPasswordVisible(!isNewPasswordVisible);
    };

    const toggleConfirmPasswordVisibility = () => {
        setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Reset Password</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter reset code"
                placeholderTextColor="#888"
                value={resetCode}
                onChangeText={setResetCode}
            />
            <View style={styles.passwordContainer}>
                <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter new password"
                    placeholderTextColor="#888"
                    secureTextEntry={!isNewPasswordVisible}
                    value={newPassword}
                    onChangeText={setNewPassword}
                />
                <TouchableOpacity
                    onPress={toggleNewPasswordVisibility}
                    style={styles.eyeIcon}
                >
                    <Icon
                        name={isNewPasswordVisible ? 'eye-slash' : 'eye'}
                        size={20}
                        color="#888"
                    />
                </TouchableOpacity>
            </View>
            <View style={styles.passwordContainer}>
                <TextInput
                    style={styles.passwordInput}
                    placeholder="Confirm new password"
                    placeholderTextColor="#888"
                    secureTextEntry={!isConfirmPasswordVisible}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />
                <TouchableOpacity
                    onPress={toggleConfirmPasswordVisibility}
                    style={styles.eyeIcon}
                >
                    <Icon
                        name={isConfirmPasswordVisible ? 'eye-slash' : 'eye'}
                        size={20}
                        color="#888"
                    />
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
                <Text style={styles.buttonText}>Reset Password</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
    },
    input: {
        width: '80%',
        height: 50,
        borderColor: '#444',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 20,
        color: '#fff',
        backgroundColor: '#333',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '80%',
        borderColor: '#444',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 20,
        backgroundColor: '#333',
    },
    passwordInput: {
        flex: 1,
        height: 50,
        paddingHorizontal: 15,
        color: '#fff',
    },
    eyeIcon: {
        padding: 10,
    },
    button: {
        width: '80%',
        height: 50,
        backgroundColor: '#007bff',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});