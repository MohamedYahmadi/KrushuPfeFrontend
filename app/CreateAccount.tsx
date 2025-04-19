import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    Dimensions,
    Alert,
    ActivityIndicator,
    Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SelectList } from 'react-native-dropdown-select-list';
import {
    User,
    Mail,
    Lock,
    Building2,
    Users,
    IdCard,
    Eye,
    EyeOff,
    ArrowRight
} from 'lucide-react-native';
import axios from 'axios';

const { width } = Dimensions.get('window');
const API_BASE_URL = 'http://172.20.10.5:8080/api/admin';

export default function CreateAccount() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [registrationNumber, setRegistrationNumber] = useState('');
    const [department, setDepartment] = useState('');
    const [role, setRole] = useState('TEAM_MEMBER');
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingDepartments, setLoadingDepartments] = useState(true);

    const roleOptions = [
        { key: 'TEAM_MEMBER', value: 'Team Member' },
        { key: 'VIEWER', value: 'Viewer' }
    ];

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/all-departments-names`);
                if (Array.isArray(response.data)) {
                    const validDepartments = response.data.filter(
                        name => name && typeof name === 'string' && name.trim()
                    );
                    setDepartments(validDepartments);
                }
            } catch (error) {
                Alert.alert('Error', 'Failed to load departments');
                console.error('Error fetching departments:', error);
            } finally {
                setLoadingDepartments(false);
            }
        };
        fetchDepartments();
    }, []);

    const departmentItems = departments.map(name => ({
        key: name,
        value: name
    }));

    const handleSignUp = async () => {
        if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim() || !registrationNumber.trim()) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        if (role === 'TEAM_MEMBER' && !department) {
            Alert.alert('Error', 'Please select a department for team members');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/create-user`, {
                firstName,
                lastName,
                email,
                password,
                registrationNumber,
                department: role === 'TEAM_MEMBER' ? department : null,
                role
            });

            if (response.status === 200) {
                Alert.alert('Success', 'User account created successfully!');
                setFirstName('');
                setLastName('');
                setEmail('');
                setPassword('');
                setRegistrationNumber('');
                setDepartment('');
                setRole('TEAM_MEMBER');
            } else {
                Alert.alert('Error', 'Failed to create user account');
            }
        } catch (error) {
            console.error('Error creating account:', error);
            Alert.alert('Error', error.response?.data?.message || 'An error occurred while creating the account');
        } finally {
            setLoading(false);
        }
    };

    if (loadingDepartments) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0056b3" />
                <Text style={styles.loadingText}>Loading departments...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <LinearGradient
                colors={['#0056b3', '#003366']}
                style={styles.headerGradient}
            >
                <Text style={styles.headerTitle}>Create New Account</Text>
            </LinearGradient>

            <View style={styles.contentContainer}>
                <View style={styles.card}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Personal Information</Text>
                        <View style={styles.inputContainer}>
                            <User size={24} color="#0056b3" style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="First Name"
                                placeholderTextColor="#666"
                                value={firstName}
                                onChangeText={setFirstName}
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <User size={24} color="#0056b3" style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Last Name"
                                placeholderTextColor="#666"
                                value={lastName}
                                onChangeText={setLastName}
                            />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Account Information</Text>
                        <View style={styles.inputContainer}>
                            <Mail size={24} color="#0056b3" style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Email Address"
                                placeholderTextColor="#666"
                                keyboardType="email-address"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <Lock size={24} color="#0056b3" style={styles.icon} />
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                placeholder="Password"
                                placeholderTextColor="#666"
                                secureTextEntry={!isPasswordVisible}
                                value={password}
                                onChangeText={setPassword}
                            />
                            <Pressable onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
                                {isPasswordVisible ? (
                                    <EyeOff size={24} color="#666" />
                                ) : (
                                    <Eye size={24} color="#666" />
                                )}
                            </Pressable>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Role Information</Text>
                        <View style={styles.selectContainer}>
                            <Users size={24} color="#0056b3" style={styles.icon} />
                            <SelectList
                                setSelected={setRole}
                                data={roleOptions}
                                save="key"
                                search={false}
                                placeholder="Select a role"
                                boxStyles={styles.selectBox}
                                inputStyles={styles.selectInput}
                                dropdownStyles={styles.dropdownStyle}
                                dropdownTextStyles={styles.dropdownText}
                                defaultOption={{ key: role, value: role === 'TEAM_MEMBER' ? 'Team Member' : 'Viewer' }}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <IdCard size={24} color="#0056b3" style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Registration Number"
                                placeholderTextColor="#666"
                                value={registrationNumber}
                                onChangeText={setRegistrationNumber}
                            />
                        </View>

                        {role === 'TEAM_MEMBER' && (
                            <View style={styles.selectContainer}>
                                <Building2 size={24} color="#0056b3" style={styles.icon} />
                                <SelectList
                                    setSelected={setDepartment}
                                    data={departmentItems}
                                    save="key"
                                    search={false}
                                    placeholder="Select department"
                                    boxStyles={styles.selectBox}
                                    inputStyles={styles.selectInput}
                                    dropdownStyles={styles.dropdownStyle}
                                    dropdownTextStyles={styles.dropdownText}
                                    defaultOption={{ key: department, value: department }}
                                />
                            </View>
                        )}
                    </View>

                    <Pressable
                        style={[styles.button, styles.primaryButton]}
                        onPress={handleSignUp}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <View style={styles.buttonContent}>
                                <Text style={styles.buttonText}>Create Account</Text>
                                <ArrowRight size={20} color="#fff" style={styles.buttonIcon} />
                            </View>
                        )}
                    </Pressable>
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
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e1e1e1',
        borderRadius: 10,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
        marginBottom: 12,
    },
    selectContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e1e1e1',
        borderRadius: 10,
        paddingLeft: 15,
        backgroundColor: '#fff',
        marginBottom: 12,
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
    selectBox: {
        flex: 1,
        borderWidth: 0,
        height: 50,
    },
    selectInput: {
        color: '#333',
        fontSize: 16,
    },
    dropdownStyle: {
        borderWidth: 1,
        borderColor: '#e1e1e1',
        borderRadius: 10,
        marginTop: 5,
        backgroundColor: '#fff',
    },
    dropdownText: {
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
        marginTop: 10,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    primaryButton: {
        backgroundColor: '#0056b3',
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 10,
        color: '#333',
        fontSize: 16,
    },
});