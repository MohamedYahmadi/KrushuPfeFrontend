// app/CreateAccount.tsx
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function CreateAccount() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create Account</Text>
            <TextInput
                style={styles.input}
                placeholder="First Name"
                placeholderTextColor="#888"
                keyboardType="email-address"
            />
            <TextInput
                style={styles.input}
                placeholder="Last Name"
                placeholderTextColor="#888"
                keyboardType="email-address"
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#888"
                keyboardType="email-address"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#888"
                secureTextEntry
            />
            <TextInput
                style={styles.input}
                placeholder="Team Name"
                placeholderTextColor="#888"
                keyboardType="email-address"
            />
            <TextInput
                style={styles.input}
                placeholder="Registration Number"
                placeholderTextColor="#888"
                keyboardType="email-address"
            />
            <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Sign Up</Text>
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