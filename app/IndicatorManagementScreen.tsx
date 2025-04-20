import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
    Dimensions,
    TouchableOpacity, Alert
} from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';
import axios from 'axios';
import { Building2, BarChart2, List, Edit, Trash2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import EditIndicatorModal from './Components/EditIndicatorModal';

const { width } = Dimensions.get('window');
const API_BASE_URL = 'http://172.20.10.5:8080/api/admin';

interface Indicator {
    id: number;
    name: string;
    targetPerWeek: number;
}

const IndicatorManagementScreen = () => {
    const [departments, setDepartments] = useState<string[]>([]);
    const [selectedDepartment, setSelectedDepartment] = useState<string>('');
    const [indicators, setIndicators] = useState<Indicator[]>([]);
    const [loading, setLoading] = useState({
        departments: true,
        indicators: false,
        action: false
    });
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null);

    const fetchDepartments = async () => {
        try {
            setLoading(prev => ({ ...prev, departments: true }));
            const response = await axios.get(`${API_BASE_URL}/all-departments-names`);
            setDepartments(response.data);
        } catch (error) {
            console.error('Failed to fetch departments:', error);
            Alert.alert('Error', 'Failed to load departments');
        } finally {
            setLoading(prev => ({ ...prev, departments: false }));
        }
    };

    const fetchIndicators = async (department: string) => {
        try {
            setLoading(prev => ({ ...prev, indicators: true }));
            const response = await axios.get(`${API_BASE_URL}/indicators-by-department-name/${department}`);
            setIndicators(response.data);
        } catch (error) {
            console.error('Failed to fetch indicators:', error);
            setIndicators([]);
            Alert.alert('Error', 'Failed to load indicators');
        } finally {
            setLoading(prev => ({ ...prev, indicators: false }));
        }
    };

    const handleDeleteIndicator = async (indicatorId: number) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this indicator?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Delete',
                    onPress: async () => {
                        try {
                            setLoading(prev => ({ ...prev, action: true }));
                            const response = await axios.delete(`${API_BASE_URL}/delete-indicator/${indicatorId}`);

                            if (response.status === 200) {
                                Alert.alert('Success', 'Indicator deleted successfully');
                                if (selectedDepartment) {
                                    fetchIndicators(selectedDepartment);
                                }
                            }
                        } catch (error) {
                            console.error('Delete error:', error);
                            Alert.alert('Error', 'Failed to delete indicator');
                        } finally {
                            setLoading(prev => ({ ...prev, action: false }));
                        }
                    }
                }
            ]
        );
    };

    const openEditModal = (indicator: Indicator) => {
        setSelectedIndicator(indicator);
        setModalVisible(true);
    };

    const handleUpdateSuccess = () => {
        setModalVisible(false);
        if (selectedDepartment) {
            fetchIndicators(selectedDepartment);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    useEffect(() => {
        if (selectedDepartment) {
            fetchIndicators(selectedDepartment);
        } else {
            setIndicators([]);
        }
    }, [selectedDepartment]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchDepartments().finally(() => setRefreshing(false));
        if (selectedDepartment) {
            fetchIndicators(selectedDepartment);
        }
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
        <>
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
                    <Text style={styles.headerTitle}>Indicator Management</Text>
                    <Text style={styles.headerSubtitle}>Manage indicators by department</Text>
                </LinearGradient>

                <View style={styles.contentContainer}>
                    <View style={styles.card}>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Select Department</Text>
                            <View style={styles.selectContainer}>
                                <Building2 size={24} color="#0056b3" style={styles.icon} />
                                <SelectList
                                    setSelected={(val) => setSelectedDepartment(val)}
                                    data={departments.map(dept => ({ key: dept, value: dept }))}
                                    save="key"
                                    search={false}
                                    placeholder="Select a department"
                                    boxStyles={styles.selectBox}
                                    inputStyles={styles.selectInput}
                                    dropdownStyles={styles.dropdownStyle}
                                    dropdownTextStyles={styles.dropdownText}
                                />
                            </View>
                        </View>


                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <BarChart2 size={20} color="#0056b3" />
                                <Text style={styles.sectionTitle}>
                                    {selectedDepartment ? `${selectedDepartment} Indicators` : 'Select a department'}
                                </Text>
                            </View>

                            {loading.indicators ? (
                                <ActivityIndicator size="small" color="#0056b3" />
                            ) : indicators.length > 0 ? (
                                <View style={styles.indicatorList}>
                                    {indicators.map((indicator) => (
                                        <View key={indicator.id} style={styles.indicatorItem}>
                                            <View style={styles.indicatorInfo}>
                                                <Text style={styles.indicatorName}>{indicator.name}</Text>
                                                <Text style={styles.indicatorTarget}>
                                                    Target: {indicator.targetPerWeek}/week
                                                </Text>
                                            </View>
                                            <View style={styles.actionsContainer}>
                                                <TouchableOpacity
                                                    style={styles.actionButton}
                                                    onPress={() => openEditModal(indicator)}
                                                    disabled={loading.action}
                                                >
                                                    <Edit size={18} color="#0056b3" />
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={[styles.actionButton, styles.deleteButton]}
                                                    onPress={() => handleDeleteIndicator(indicator.id)}
                                                    disabled={loading.action}
                                                >
                                                    <Trash2 size={18} color="#FF4B4B" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <View style={styles.emptyState}>
                                    <List size={40} color="#ccc" />
                                    <Text style={styles.emptyText}>
                                        {selectedDepartment
                                            ? 'No indicators found for this department'
                                            : 'Please select a department to view indicators'}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </ScrollView>


            <EditIndicatorModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                indicator={selectedIndicator}
                onUpdateSuccess={handleUpdateSuccess}
            />
        </>
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
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginLeft: 10,
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
    indicatorList: {
        marginTop: 10,
    },
    indicatorItem: {
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#0056b3',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    indicatorInfo: {
        flex: 1,
    },
    indicatorName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 5,
    },
    indicatorTarget: {
        fontSize: 14,
        color: '#666',
    },
    actionsContainer: {
        flexDirection: 'row',
        marginLeft: 10,
    },
    actionButton: {
        padding: 8,
        borderRadius: 20,
        marginLeft: 5,
        backgroundColor: '#f0f0f0',
    },
    deleteButton: {
        backgroundColor: '#ffeeee',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
    },
    emptyText: {
        marginTop: 10,
        color: '#888',
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
        fontSize: 16,
    },
});

export default IndicatorManagementScreen;