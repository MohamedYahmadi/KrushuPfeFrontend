import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    Dimensions,
    Alert,
    Platform,
    ActivityIndicator,
    Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SelectList } from 'react-native-dropdown-select-list';
import { ChartBar, Building2, Target, ArrowRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const { width } = Dimensions.get('window');
const API_BASE_URL = 'http://172.20.10.5:8080/api/admin';

export default function CreateIndicator() {
    const [indicatorName, setIndicatorName] = useState('');
    const [departmentName, setDepartmentName] = useState('');
    const [targetPerWeek, setTargetPerWeek] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [loadingDepartments, setLoadingDepartments] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/all-departments-names`);
                if (Array.isArray(response.data)) {
                    const validDepartments = response.data.filter(
                        name => name && typeof name === 'string' && name.trim()
                    );
                    setDepartments(validDepartments);
                } else {
                    throw new Error('Invalid departments data format');
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

    const handleDepartmentChange = (selectedName) => {
        setDepartmentName(selectedName);
    };

    const handleCreateIndicator = async () => {
        if (!indicatorName.trim()) {
            Alert.alert('Error', 'Please enter an indicator name');
            return;
        }

        if (!departmentName) {
            Alert.alert('Error', 'Please select a department');
            return;
        }

        if (!targetPerWeek.trim()) {
            Alert.alert('Error', 'Please enter a target per week');
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/create-indicator`, {
                name: indicatorName,
                departmentName: departmentName,
                targetPerWeek: parseFloat(targetPerWeek),
            });

            if (response.status === 200) {
                Alert.alert('Success', 'Indicator created successfully', [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate("Dashboard", { screen: 'DashboardHome' }),
                    },
                ]);

                setIndicatorName('');
                setDepartmentName('');
                setTargetPerWeek('');
            } else {
                Alert.alert('Error', 'Failed to create indicator');
            }
        } catch (error) {
            console.error('Error creating indicator:', error);
            Alert.alert('Error', error.response?.data?.message || 'An error occurred while creating the indicator');
        } finally {
            setIsLoading(false);
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
                <Text style={styles.headerTitle}>Create New Indicator</Text>
            </LinearGradient>

            <View style={styles.contentContainer}>
                <View style={styles.card}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Indicator Information</Text>
                        <View style={styles.inputContainer}>
                            <ChartBar size={24} color="#0056b3" style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Indicator Name"
                                placeholderTextColor="#666"
                                value={indicatorName}
                                onChangeText={setIndicatorName}
                                autoCapitalize="words"
                            />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Department Information</Text>
                        <View style={styles.selectContainer}>
                            <Building2 size={24} color="#0056b3" style={styles.icon} />
                            <SelectList
                                setSelected={handleDepartmentChange}
                                data={departmentItems.length ? departmentItems : [{key: '', value: 'No departments available'}]}
                                save="key"
                                search={false}
                                placeholder="Select a department"
                                boxStyles={styles.selectBox}
                                inputStyles={styles.selectInput}
                                dropdownStyles={styles.dropdownStyle}
                                dropdownTextStyles={styles.dropdownText}
                                defaultOption={{ key: departmentName, value: departmentName }}
                                disabled={!departmentItems.length}
                            />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Target Information</Text>
                        <View style={styles.inputContainer}>
                            <Target size={24} color="#0056b3" style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Target Per Week"
                                placeholderTextColor="#666"
                                value={targetPerWeek}
                                onChangeText={setTargetPerWeek}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    <Pressable
                        style={[styles.button, styles.primaryButton]}
                        onPress={handleCreateIndicator}
                        disabled={isLoading || !departmentItems.length}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <View style={styles.buttonContent}>
                                <Text style={styles.buttonText}>Create Indicator</Text>
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
    },
    selectContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e1e1e1',
        borderRadius: 10,
        paddingLeft: 15,
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