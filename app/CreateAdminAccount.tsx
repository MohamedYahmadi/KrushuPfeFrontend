import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "./types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type CreateAdminAccountScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "CreateAdminAccount"
>;

const { width } = Dimensions.get('window');

const CreateAdminAccount = () => {
    const navigation = useNavigation<CreateAdminAccountScreenNavigationProp>();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [registrationNumber, setRegistrationNumber] = useState('');
    const [department, setDepartment] = useState('');

    const handleCreateAdmin = async () => {
        try {
            const response = await axios.post('http://192.168.1.105:8080/api/user/signup-admin', {
                firstName,
                lastName,
                email,
                password,
                registrationNumber,
                department,
            });
            if (response.status === 200) {
                Alert.alert("Success", "Admin account created successfully!");
                // Add a 5-second delay before navigating to the Login page
                setTimeout(() => {
                    navigation.navigate("Home"); // Navigate back to the login screen
                }, 5000); // 5000 milliseconds = 5 seconds
            } else {
                Alert.alert("Error", "Failed to create admin account.");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "An error occurred while creating the admin account.");
        }
    };

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.formContainer}>
                    <Text style={styles.title}>Create Admin Account</Text>

                    {/* Personal Information Section */}
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

                    {/* Account Information Section */}
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

                    {/* Admin Information Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Admin Information</Text>
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

                    {/* Create Admin Account Button */}
                    <TouchableOpacity style={styles.button} onPress={handleCreateAdmin}>
                        <View style={styles.solidButton}>
                            <Text style={styles.buttonText}>Create Admin Account</Text>
                            <Icon name="arrow-right" size={18} color="#fff" style={styles.buttonIcon} />
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a', // Solid dark background
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
        backgroundColor: '#667eea', // Solid button color
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

export default CreateAdminAccount;