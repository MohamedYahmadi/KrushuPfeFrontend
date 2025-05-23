import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    Pressable,
    ActivityIndicator,
    RefreshControl,
    TextInput,
    Alert,
    TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Pencil, Trash2, Search, Building2, Plus } from 'lucide-react-native';
import axios from 'axios';
import EditDepartmentModal from './Components/EditDepartmentModal';
import CreateDepartmentModal from './Components/CreateDepartmentModal';

const API_BASE_URL = 'http://172.20.10.5:8080/api/admin';

interface Department {
    id: number;
    name: string;
}

interface CreateDepartmentData {
    name: string;
}

interface RenameDepartmentDto {
    newName: string;
}

export default function DepartmentList() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const namesResponse = await axios.get<string[]>(`${API_BASE_URL}/all-departments-names`);

            const departmentsResponse = await axios.get<Department[]>(`${API_BASE_URL}/all-departments`);

            setDepartments(departmentsResponse.data);
            setError(null);
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err instanceof Error ? err.message : 'Failed to load departments');
            setDepartments([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const handleCreateDepartment = async (departmentName: string) => {
        try {
            setLoading(true);
            const response = await axios.post(`${API_BASE_URL}/create-department`, {
                name: departmentName,
            } as CreateDepartmentData);

            if (response.status === 200) {
                await fetchDepartments();
                Alert.alert('Success', 'Department created successfully');
                setIsCreateModalVisible(false);
            } else {
                Alert.alert('Error', 'Failed to create department');
            }
        } catch (err) {
            console.error('Error creating department:', err);
            let errorMessage = 'An error occurred while creating the department';
            if (axios.isAxiosError(err) && err.response) {
                errorMessage = err.response.data || errorMessage;
            }
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateDepartment = async (updatedData: { name: string }) => {
        try {
            if (!selectedDepartment?.id) {
                Alert.alert('Error', 'No department selected');
                return;
            }

            setLoading(true);
            const payload: RenameDepartmentDto = { newName: updatedData.name };

            const response = await axios.put(
                `${API_BASE_URL}/rename-department/${selectedDepartment.id}`,
                payload
            );

            if (response.status === 200) {
                setDepartments(prev =>
                    prev.map(dept =>
                        dept.id === selectedDepartment.id
                            ? { ...dept, name: updatedData.name }
                            : dept
                    )
                );
                Alert.alert('Success', 'Department updated successfully');
                setIsEditModalVisible(false);
            } else {
                Alert.alert('Error', response.data || 'Failed to update department');
            }
        } catch (error) {
            console.error('Error updating department:', error);
            let errorMessage = 'An unexpected error occurred';
            if (axios.isAxiosError(error) && error.response) {
                errorMessage = error.response.data || errorMessage;
            }
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteDepartment = async (departmentId: number) => {
        try {
            setLoading(true);
            const response = await axios.delete(`${API_BASE_URL}/delete-department/${departmentId}`);

            if (response.status === 200) {
                await fetchDepartments();
                Alert.alert('Success', 'Department deleted successfully');
            } else {
                Alert.alert('Error', response.data || 'Failed to delete department');
            }
        } catch (error) {
            console.error('Error deleting department:', error);
            let errorMessage = 'An unexpected error occurred';
            if (axios.isAxiosError(error) && error.response) {
                errorMessage = error.response.data || errorMessage;
            }
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleEditDepartment = (department: Department) => {
        setSelectedDepartment(department);
        setIsEditModalVisible(true);
    };

    const confirmDelete = (departmentId: number) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this department?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    onPress: () => handleDeleteDepartment(departmentId),
                },
            ]
        );
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchDepartments();
    };

    const filteredDepartments = (departments || []).filter(dept =>
        dept?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#0056b3" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Error: {error}</Text>
                <TouchableOpacity onPress={fetchDepartments} style={styles.retryButton}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const renderDepartmentCard = ({ item }: { item: Department }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Building2 size={24} color="#0056b3" />
                <Text style={styles.departmentName}>{item.name}</Text>
            </View>
            <View style={styles.cardActions}>
                <Pressable
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => handleEditDepartment(item)}
                    disabled={loading}
                >
                    <Pencil size={20} color="#0056b3" />
                    <Text style={styles.actionButtonText}>Edit</Text>
                </Pressable>
                <Pressable
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => confirmDelete(item.id)}
                    disabled={loading}
                >
                    <Trash2 size={20} color="#dc3545" />
                    <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
                </Pressable>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0056b3', '#003366']}
                style={styles.header}
            >
                <Text style={styles.headerTitle}>Departments</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setIsCreateModalVisible(true)}
                    disabled={loading}
                >
                    <Plus size={24} color="#fff" />
                </TouchableOpacity>
            </LinearGradient>

            <View style={styles.content}>
                <View style={styles.searchContainer}>
                    <Search size={20} color="#666" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search departments..."
                        placeholderTextColor="#666"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        editable={!loading}
                    />
                </View>

                <FlatList
                    data={filteredDepartments}
                    renderItem={renderDepartmentCard}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#0056b3']}
                            enabled={!loading}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                {departments.length === 0 ? 'No departments available' : 'No matching departments'}
                            </Text>
                        </View>
                    }
                />
            </View>

            {selectedDepartment && (
                <EditDepartmentModal
                    visible={isEditModalVisible}
                    onClose={() => {
                        setIsEditModalVisible(false);
                        setSelectedDepartment(null);
                    }}
                    department={selectedDepartment}
                    onSubmit={handleUpdateDepartment}
                />
            )}

            <CreateDepartmentModal
                visible={isCreateModalVisible}
                onClose={() => setIsCreateModalVisible(false)}
                onSubmit={handleCreateDepartment}
                isLoading={loading}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        padding: 20,
        paddingTop: 40,
        paddingBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        marginTop: -20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    listContainer: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    departmentName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginLeft: 12,
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 6,
        borderWidth: 1,
    },
    actionButtonText: {
        marginLeft: 4,
        fontSize: 14,
        fontWeight: '500',
    },
    editButton: {
        borderColor: '#0056b3',
        backgroundColor: '#fff',
    },
    deleteButton: {
        borderColor: '#dc3545',
        backgroundColor: '#fff',
    },
    deleteButtonText: {
        color: '#dc3545',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    errorText: {
        color: '#dc3545',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#0056b3',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
    },
    retryButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});