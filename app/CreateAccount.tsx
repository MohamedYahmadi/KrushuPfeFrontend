import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';

const { width } = Dimensions.get('window');

export default function CreateAccount() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [teamName, setTeamName] = useState('');
    const [registrationNumber, setRegistrationNumber] = useState('');
    const [department, setDepartment] = useState(''); // New state for department

    const handleSignUp = async () => {
        try {
            const response = await axios.post('http://172.20.10.2:8080/api/admin/create-user', {
                firstName,
                lastName,
                email,
                password,
                teamName,
                registrationNumber,
                department,
                role: 'TEAM_MEMBER',
            });
            if (response.status === 200) {
                alert('User.ts account created successfully!');
            } else {
                alert('Failed to create user account.');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred while creating the user account.');
        }
    };

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.formContainer}>
                    <Text style={styles.title}>Create New Account</Text>


                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Personal Information</Text>
                        <View style={styles.inputContainer}>
                            <Icon name="user-o" size={18} color="#888" style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="First Name"
                                placeholderTextColor="#888"
                                value={firstName}
                                onChangeText={setFirstName}
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <Icon name="user-o" size={18} color="#888" style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Last Name"
                                placeholderTextColor="#888"
                                value={lastName}
                                onChangeText={setLastName}
                            />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Account Information</Text>
                        <View style={styles.inputContainer}>
                            <Icon name="envelope-o" size={18} color="#888" style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Email Address"
                                placeholderTextColor="#888"
                                keyboardType="email-address"
                                value={email}
                                onChangeText={setEmail}
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <Icon name="lock" size={20} color="#888" style={styles.icon} />
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                placeholder="Password"
                                placeholderTextColor="#888"
                                secureTextEntry={!isPasswordVisible}
                                value={password}
                                onChangeText={setPassword}
                            />
                            <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
                                <Icon
                                    name={isPasswordVisible ? 'eye-slash' : 'eye'}
                                    size={20}
                                    color="#888"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Team Information</Text>
                        <View style={styles.inputContainer}>
                            <Icon name="users" size={18} color="#888" style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Team Name"
                                placeholderTextColor="#888"
                                value={teamName}
                                onChangeText={setTeamName}
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <Icon name="id-card-o" size={16} color="#888" style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Registration Number"
                                placeholderTextColor="#888"
                                value={registrationNumber}
                                onChangeText={setRegistrationNumber}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Icon name="building-o" size={18} color="#888" style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Department"
                                placeholderTextColor="#888"
                                value={department}
                                onChangeText={setDepartment}
                            />
                        </View>
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleSignUp}>
                        <View style={styles.solidButton}>
                            <Text style={styles.buttonText}>Create Account</Text>
                            <Icon name="arrow-right" size={18} color="#fff" style={styles.buttonIcon} />
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
    },
    scrollContainer: {
        flexGrow: 1,
        paddingVertical: 30,
    },
    formContainer: {
        width: width * 0.9,
        alignSelf: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '600',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 30,
        fontFamily: 'sans-serif-medium',
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        color: '#ddd',
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 15,
        paddingLeft: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 10,
        marginBottom: 15,
        paddingHorizontal: 15,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 50,
        color: '#fff',
        fontSize: 16,
    },
    eyeIcon: {
        padding: 10,
    },
    button: {
        marginTop: 20,
        borderRadius: 10,
        overflow: 'hidden',
    },
    solidButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        backgroundColor: '#667eea',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginRight: 10,
    },
    buttonIcon: {
        marginTop: 2,
    },
});