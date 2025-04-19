import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Dimensions, RefreshControl } from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';
import axios from 'axios';
import { BarChart2, Building2, Hash, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const API_BASE_URL = 'http://172.20.10.5:8080/api/admin';

const AddIndicatorValueScreen = () => {
    const [departments, setDepartments] = useState([]);
    const [indicators, setIndicators] = useState([]);
    const [formData, setFormData] = useState({
        departmentName: '',
        departmentId: '',
        indicatorName: '',
        indicatorId: '',
        value: ''
    });
    const [loading, setLoading] = useState({
        departments: true,
        indicators: false,
        submitting: false
    });
    const [refreshing, setRefreshing] = useState(false);

    // Prepare data for dropdowns
    const departmentItems = departments.map(dept => ({
        key: dept.departmentId.toString(),
        value: dept.departmentName
    }));

    const indicatorItems = indicators.map(ind => ({
        key: ind.id.toString(),
        value: ind.name
    }));

    // Fetch departments
    const fetchData = async () => {
        try {
            setLoading(prev => ({ ...prev, departments: true }));
            const response = await axios.get(`${API_BASE_URL}/indicators-by-department`);
            setDepartments(response.data);

            if (formData.departmentId) {
                const deptExists = response.data.some(
                    dept => dept.departmentId.toString() === formData.departmentId
                );
                if (!deptExists) {
                    setFormData({
                        departmentName: '',
                        departmentId: '',
                        indicatorName: '',
                        indicatorId: '',
                        value: ''
                    });
                }
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to load departments and indicators');
            console.error('API Error:', error);
        } finally {
            setLoading(prev => ({ ...prev, departments: false }));
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (formData.departmentId) {
            const selectedDept = departments.find(dept => dept.departmentId.toString() === formData.departmentId);
            if (selectedDept) {
                setIndicators(selectedDept.indicators);
            } else {
                setIndicators([]);
            }
        } else {
            setIndicators([]);
        }
    }, [formData.departmentId, departments]);

    const handleDepartmentChange = (selectedKey) => {
        const selectedDept = departments.find(dept => dept.departmentId.toString() === selectedKey);
        setFormData({
            departmentName: selectedDept ? selectedDept.departmentName : '',
            departmentId: selectedKey,
            indicatorName: '',
            indicatorId: '',
            value: ''
        });
    };

    const handleIndicatorChange = (selectedKey) => {
        const selectedIndicator = indicators.find(ind => ind.id.toString() === selectedKey);
        setFormData(prev => ({
            ...prev,
            indicatorName: selectedIndicator ? selectedIndicator.name : '',
            indicatorId: selectedKey,
            value: ''
        }));
    };

    const handleSubmit = async () => {
        if (!formData.departmentId || !formData.indicatorId || !formData.value.trim()) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        setLoading(prev => ({ ...prev, submitting: true }));

        try {
            const response = await axios.post(`${API_BASE_URL}/set-value`, {
                departmentName: formData.departmentName,
                indicatorName: formData.indicatorName,
                value: formData.value
            });

            if (response.data.success) {
                Alert.alert('Success', response.data.message);
                setFormData(prev => ({
                    ...prev,
                    indicatorName: '',
                    indicatorId: '',
                    value: ''
                }));
                fetchData();
            } else {
                Alert.alert('Error', response.data.message);
            }
        } catch (error) {
            console.error('Submission error:', error);
            Alert.alert('Error', error.response?.data?.message || error.message || 'Failed to save value');
        } finally {
            setLoading(prev => ({ ...prev, submitting: false }));
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    if (loading.departments && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0056b3" />
                <Text style={styles.loadingText}>Loading data...</Text>
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
                <Text style={styles.headerSubtitle}>Enter new measurement data</Text>
            </LinearGradient>

            <View style={styles.contentContainer}>
                <View style={styles.card}>
                    {/* Department Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Department</Text>
                        <View style={styles.inputWrapper}>
                            <Building2 size={24} color="#0056b3" style={styles.icon} />
                            <SelectList
                                setSelected={handleDepartmentChange}
                                data={departmentItems}
                                save="key"
                                search={false}
                                placeholder="Select a department"
                                boxStyles={styles.selectBox}
                                inputStyles={styles.selectInput}
                                dropdownStyles={styles.selectDropdown}
                                dropdownItemStyles={styles.selectDropdownItem}
                                dropdownTextStyles={styles.selectDropdownText}
                                defaultOption={{ key: formData.departmentId, value: formData.departmentName }}
                            />
                        </View>
                    </View>

                    {/* Indicator Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Indicator</Text>
                        <View style={styles.inputWrapper}>
                            <BarChart2 size={24} color="#0056b3" style={styles.icon} />
                            <SelectList
                                setSelected={handleIndicatorChange}
                                data={indicatorItems}
                                save="key"
                                search={false}
                                placeholder={formData.departmentId ? "Select an indicator" : "Select department first"}
                                boxStyles={[styles.selectBox, !formData.departmentId && styles.disabledSelect]}
                                inputStyles={styles.selectInput}
                                dropdownStyles={styles.selectDropdown}
                                dropdownItemStyles={styles.selectDropdownItem}
                                dropdownTextStyles={styles.selectDropdownText}
                                disabled={!formData.departmentId}
                                defaultOption={{ key: formData.indicatorId, value: formData.indicatorName }}
                            />
                        </View>
                    </View>

                    {/* Value Section */}
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

                    {/* Submit Button */}
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

export default AddIndicatorValueScreen;