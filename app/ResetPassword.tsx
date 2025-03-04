// app/ResetPassword.tsx
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function ResetPassword() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Reset Password</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#888"
                keyboardType="email-address"
            />
            <TouchableOpacity style={styles.button}>
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
        backgroundColor: '#1a1a1a', // Dark background
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff', // White text
        marginBottom: 20,
    },
    input: {
        width: '80%',
        height: 50,
        borderColor: '#444', // Darker border
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 20,
        color: '#fff', // White text
        backgroundColor: '#333', // Dark input background
    },
    button: {
        width: '80%',
        height: 50,
        backgroundColor: '#007bff', // Blue button
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