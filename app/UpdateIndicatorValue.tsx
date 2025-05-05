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
    RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SelectList } from 'react-native-dropdown-select-list';
import { Building2, Gauge, CalendarDays, ArrowRight, AlertCircle } from 'lucide-react-native';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as SecureStore from 'expo-secure-store';

const { width } = Dimensions.get('window');
const API_BASE_URL = 'http://172.20.10.5:8080/api/admin';

export default function UpdateIndicatorValue() {
    const [userId, setUserId] = useState<string | null>(null);
    const [department, setDepartment] = useState('');
    const [indicator, setIndicator] = useState('');
    const [date, setDate] = useState(new Date());
    const [newValue, setNewValue] = useState('');
    const [departments, setDepartments] = useState([]);
    const [indicators, setIndicators] = useState([]);
    const [loading, setLoading] = useState({
        departments: true,
        indicators: false,
        submitting: false
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [showInfo, setShowInfo] = useState(false);

    useEffect(() => {
        const getUserId = async () => {
            try {
                const storedUserId = await SecureStore.getItemAsync('userId');
                if (storedUserId) {
                    setUserId(storedUserId);
                } else {
                    Alert.alert('Error', 'User ID not found');
                }
            } catch (error) {
                console.error('Error getting user ID:', error);
                Alert.alert('Error', 'Failed to load user information');
            }
        };

        getUserId();
    }, []);

    const fetchDepartmentsWithIndicators = async () => {
        try {
            setLoading(prev => ({ ...prev, departments: true }));
            const response = await axios.get(`${API_BASE_URL}/indicators-by-department`);
            setDepartments(response.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load departments');
            console.error('Error fetching departments:', error);
        } finally {
            setLoading(prev => ({ ...prev, departments: false }));
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDepartmentsWithIndicators();
    }, []);

    useEffect(() => {
        if (department) {
            const selectedDept = departments.find(dept => dept.departmentName === department);
            if (selectedDept) {
                const indicatorOptions = selectedDept.indicators.map(ind => ({
                    key: ind.name,
                    value: ind.name
                }));
                setIndicators(indicatorOptions);
            } else {
                setIndicators([]);
            }
        } else {
            setIndicators([]);
        }
    }, [department, departments]);

    const departmentItems = departments.map(dept => ({
        key: dept.departmentName,
        value: dept.departmentName
    }));

    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    const handleUpdate = async () => {
        if (!userId) {
            Alert.alert('Error', 'User ID not available');
            return;
        }

        if (!department || !indicator || !date || !newValue.trim()) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        setLoading(prev => ({ ...prev, submitting: true }));

        try {
            const response = await axios.put(
                `${API_BASE_URL}/update-indicator-value/${Number(userId)}`, // Convert to number
                {
                    departmentName: department,
                    indicatorName: indicator,
                    date: formatDate(date),
                    newValue: newValue
                }
            );

            if (response.data.success) {
                Alert.alert('Success', response.data.message);
                setDepartment('');
                setIndicator('');
                setNewValue('');
                setDate(new Date());
                setShowInfo(true);
            } else {
                Alert.alert('Error', response.data.message);
            }
        } catch (error) {
            console.error('Error updating indicator:', error);
            const errorMessage = error.response?.data?.message ||
                'An error occurred while updating the indicator';
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(prev => ({ ...prev, submitting: false }));
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchDepartmentsWithIndicators();
    };

    if (loading.departments && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0056b3" />
                <Text style={styles.loadingText}>Loading departments...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={["#0056b3"]}
                />
            }
        >
            <LinearGradient
                colors={['#0056b3', '#003366']}
                style={styles.headerGradient}
            >
                <Text style={styles.headerTitle}>Update Indicator Value</Text>
                <Text style={styles.headerSubtitle}>Modify existing indicator values</Text>
            </LinearGradient>

            <View style={styles.contentContainer}>
                {showInfo && (
                    <View style={styles.infoBanner}>
                        <AlertCircle size={20} color="#0056b3" />
                        <Text style={styles.infoText}>
                            Note: Only values from the last 5 weeks are kept in the system.
                        </Text>
                    </View>
                )}

                <View style={styles.card}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Department</Text>
                        <View style={styles.inputWrapper}>
                            <Building2 size={24} color="#0056b3" style={styles.icon} />
                            <SelectList
                                setSelected={setDepartment}
                                data={departmentItems}
                                save="key"
                                search={false}
                                placeholder="Select department"
                                boxStyles={styles.selectBox}
                                inputStyles={styles.selectInput}
                                dropdownStyles={styles.selectDropdown}
                                dropdownTextStyles={styles.selectDropdownText}
                                defaultOption={department ? { key: department, value: department } : null}
                            />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Indicator</Text>
                        <View style={styles.inputWrapper}>
                            <Gauge size={24} color="#0056b3" style={styles.icon} />
                            <SelectList
                                setSelected={setIndicator}
                                data={indicators}
                                save="key"
                                search={false}
                                placeholder={department ? "Select indicator" : "Select department first"}
                                boxStyles={[styles.selectBox, !department && styles.disabledSelect]}
                                inputStyles={styles.selectInput}
                                dropdownStyles={styles.selectDropdown}
                                dropdownTextStyles={styles.selectDropdownText}
                                disabled={!department}
                                defaultOption={indicator ? { key: indicator, value: indicator } : null}
                            />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Date</Text>
                        <Pressable
                            style={styles.inputWrapper}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <CalendarDays size={24} color="#0056b3" style={styles.icon} />
                            <Text style={[styles.textInput, { color: '#333' }]}>
                                {date.toLocaleDateString()}
                            </Text>
                        </Pressable>
                        {showDatePicker && (
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display="default"
                                onChange={handleDateChange}
                            />
                        )}
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>New Value</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Enter new value"
                                placeholderTextColor="#666"
                                value={newValue}
                                onChangeText={setNewValue}
                                keyboardType="numeric"
                                editable={!!indicator}
                            />
                        </View>
                    </View>

                    <Pressable
                        style={[styles.button, styles.primaryButton]}
                        onPress={handleUpdate}
                        disabled={loading.submitting || !department || !indicator || !newValue}
                    >
                        {loading.submitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <View style={styles.buttonContent}>
                                <Text style={styles.buttonText}>Update Value</Text>
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
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#e6e6e6',
    },
    contentContainer: {
        padding: 20,
        marginTop: -30,
    },
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e6f2ff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
        borderLeftWidth: 4,
        borderLeftColor: '#0056b3'
    },
    infoText: {
        marginLeft: 10,
        color: '#0056b3',
        flex: 1,
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
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 12,
        fontWeight: '500',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 10,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
    },
    icon: {
        marginRight: 12,
    },
    selectBox: {
        flex: 1,
        borderWidth: 0,
        height: 50,
        padding: 0,
        backgroundColor: 'transparent',
    },
    selectInput: {
        color: '#333',
        fontSize: 16,
    },
    selectDropdown: {
        borderColor: '#e0e0e0',
        borderRadius: 10,
        marginTop: 5,
        backgroundColor: '#fff',
    },
    selectDropdownText: {
        color: '#333',
        fontSize: 16,
    },
    disabledSelect: {
        opacity: 0.5,
    },
    textInput: {
        flex: 1,
        height: 50,
        color: '#333',
        fontSize: 16,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 10,
        marginTop: 10,
    },
    primaryButton: {
        backgroundColor: '#0056b3',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginRight: 8,
    },
    buttonIcon: {
        marginLeft: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    loadingText: {
        color: '#666',
        marginTop: 12,
        fontSize: 16,
    },
});