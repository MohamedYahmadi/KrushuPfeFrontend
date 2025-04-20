import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
    Platform
} from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';
import axios from 'axios';
import { BarChart2, Hash, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'http://172.20.10.5:8080';

const TeamMemberAddValueScreen = ({ navigation }) => {
    const [indicators, setIndicators] = useState([]);
    const [formData, setFormData] = useState({
        indicatorName: '',
        indicatorId: '',
        value: ''
    });
    const [loading, setLoading] = useState({
        indicators: true,
        submitting: false
    });
    const [refreshing, setRefreshing] = useState(false);
    const [userDepartment, setUserDepartment] = useState('');
    const [userId, setUserId] = useState('');

    const getUserData = async () => {
        try {
            let storedUserId, storedDepartment;

            if (Platform.OS === 'web') {
                storedUserId = localStorage.getItem('userId');
                storedDepartment = localStorage.getItem('department');
            } else {
                storedUserId = await SecureStore.getItemAsync('userId');
                storedDepartment = await SecureStore.getItemAsync('department');
            }

            if (storedUserId && storedDepartment) {
                setUserId(storedUserId);
                setUserDepartment(storedDepartment);
                fetchIndicators(storedDepartment);
            } else {
                Alert.alert('Session Expired', 'Please login again');
                navigation.navigate('Login');
            }
        } catch (error) {
            console.error('Storage error:', error);
            Alert.alert('Error', 'Failed to load user data');
        }
    };

    const fetchIndicators = async (departmentName) => {
        try {
            setLoading(prev => ({ ...prev, indicators: true }));
            console.log('Fetching indicators for department:', departmentName);

            const response = await axios.get(
                `${API_BASE_URL}/api/admin/indicators-by-department-name/${encodeURIComponent(departmentName)}`
            );

            console.log('API Response:', response.data);

            if (!response.data || !Array.isArray(response.data)) {
                throw new Error('Received invalid data format from server');
            }

            setIndicators(response.data);
        } catch (error) {
            console.error('API Error:', {
                message: error.message,
                response: error.response?.data,
                config: error.config
            });
            Alert.alert(
                'Error',
                error.response?.data?.message || error.message || 'Failed to load indicators'
            );
            setIndicators([]);
        } finally {
            setLoading(prev => ({ ...prev, indicators: false }));
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        getUserData();
    };

    const indicatorItems = indicators?.map(ind => ({
        key: ind.id.toString(),
        value: ind.name,
        target: ind.targetPerWeek
    })) || [];

    // Handle indicator selection
    const handleIndicatorChange = (selectedKey) => {
        const selectedIndicator = indicators.find(ind => ind.id.toString() === selectedKey);
        setFormData({
            indicatorName: selectedIndicator ? selectedIndicator.name : '',
            indicatorId: selectedKey,
            value: ''
        });
    };


    const handleSubmit = async () => {
        if (!formData.indicatorId || !formData.value.trim()) {
            Alert.alert('Error', 'Please select an indicator and enter a value');
            return;
        }

        setLoading(prev => ({ ...prev, submitting: true }));

        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/user/set-team-member-indicator-value/${userId}`,
                {
                    indicatorName: formData.indicatorName,
                    value: formData.value
                }
            );

            if (response.data?.success) {
                Alert.alert('Success', response.data.message);
                setFormData({
                    indicatorName: '',
                    indicatorId: '',
                    value: ''
                });
                fetchIndicators(userDepartment);
            } else {
                Alert.alert('Error', response.data?.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Submission error:', error);
            Alert.alert(
                'Error',
                error.response?.data?.message || error.message || 'Failed to save value'
            );
        } finally {
            setLoading(prev => ({ ...prev, submitting: false }));
        }
    };


    useEffect(() => {
        getUserData();
    }, []);

    // Loading state
    if (loading.indicators && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0056b3" />
                <Text style={styles.loadingText}>Loading indicators...</Text>
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
                <Text style={styles.headerTitle}>Add Indicator Value</Text>
                <Text style={styles.headerSubtitle}>
                    Department: {userDepartment}
                </Text>
            </LinearGradient>

            <View style={styles.contentContainer}>
                <View style={styles.card}>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Indicator</Text>
                        <View style={styles.inputWrapper}>
                            <BarChart2 size={24} color="#0056b3" style={styles.icon} />
                            <SelectList
                                setSelected={handleIndicatorChange}
                                data={indicatorItems}
                                save="key"
                                search={false}
                                placeholder="Select an indicator"
                                boxStyles={styles.selectBox}
                                inputStyles={styles.selectInput}
                                dropdownStyles={styles.selectDropdown}
                                dropdownItemStyles={styles.selectDropdownItem}
                                dropdownTextStyles={styles.selectDropdownText}
                                defaultOption={{
                                    key: formData.indicatorId,
                                    value: formData.indicatorName
                                }}
                            />
                        </View>
                    </View>


                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Value</Text>
                        <View style={styles.inputWrapper}>
                            <Hash size={24} color="#0056b3" style={styles.icon} />
                            <TextInput
                                style={styles.textInput}
                                value={formData.value}
                                onChangeText={(text) => setFormData(prev => ({
                                    ...prev,
                                    value: text
                                }))}
                                placeholder="Enter the value"
                                placeholderTextColor="#666"
                                editable={!!formData.indicatorId}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>


                    <TouchableOpacity
                        style={[styles.button, styles.primaryButton]}
                        onPress={handleSubmit}
                        disabled={loading.submitting || refreshing}
                    >
                        {loading.submitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Text style={styles.buttonText}>Save Value</Text>
                                <ArrowRight size={20} color="#fff" style={styles.buttonIcon} />
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};


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
    selectDropdownItem: {
        padding: 12,
    },
    selectDropdownText: {
        color: '#333',
        fontSize: 16,
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

export default TeamMemberAddValueScreen;