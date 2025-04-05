import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

export default function RequestResetPassword() {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');

    const handleRequestReset = async () => {
        try {
            const response = await axios.post(
                'http://172.20.10.2:8080/api/user/request-password-reset',
                { email }
            );

            if (response.status === 200) {
                Alert.alert('Success', 'Reset code sent to your email');
                navigation.navigate('ResetPassword', { email });
            } else {
                Alert.alert('Error', 'Failed to send reset code');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to send reset code');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Request Password Reset</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#888"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />
            <TouchableOpacity style={styles.button} onPress={handleRequestReset}>
                <Text style={styles.buttonText}>Request Reset Code</Text>
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