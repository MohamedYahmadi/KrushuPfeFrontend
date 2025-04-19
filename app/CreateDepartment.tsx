import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Dimensions,
    Alert,
    Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function CreateDepartment() {
    const [departmentName, setDepartmentName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigation();

    const handleCreateDepartment = async () => {
        if (!departmentName.trim()) {
            Alert.alert('Error', 'Please enter a department name');
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post('http://172.20.10.5:8080/api/admin/create-department', {
                name: departmentName,
            });

            if (response.status === 200) {
                const platformMessage =
                    Platform.OS === 'android'
                        ? 'Department created successfully on Android'
                        : 'Department created successfully on iOS';

                Alert.alert('Success', platformMessage, [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate("Dashboard", { screen: 'DashboardHome' }),
                    },
                ]);

                setDepartmentName('');
            } else {
                Alert.alert('Error', 'Failed to create department');
            }
        } catch (error) {
            console.error('Error creating department:', error);
            Alert.alert('Error', error.response?.data?.message || 'An error occurred while creating the department');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.formContainer}>
                    <Text style={styles.title}>Create New Department</Text>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Department Information</Text>
                        <View style={styles.inputContainer}>
                            <Icon name="building-o" size={18} color="#888" style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Department Name"
                                placeholderTextColor="#888"
                                value={departmentName}
                                onChangeText={setDepartmentName}
                                autoCapitalize="words"
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleCreateDepartment}
                        disabled={isLoading}
                    >
                        <View style={styles.solidButton}>
                            <Text style={styles.buttonText}>
                                {isLoading ? 'Creating...' : 'Create Department'}
                            </Text>
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