import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';

interface WasteReason {
    id: number;
    reason: string;
    createdAt: string;
}

interface AllWasteReasonsModalProps {
    visible: boolean;
    onClose: () => void;
    wasteReasons: WasteReason[];
    userId: number;
    refreshData: () => void;
    isAdmin: boolean;
}

const AllWasteReasonsModal: React.FC<AllWasteReasonsModalProps> = ({
                                                                       visible,
                                                                       onClose,
                                                                       wasteReasons,
                                                                       userId,
                                                                       refreshData,
                                                                       isAdmin,
                                                                   }) => {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editedReason, setEditedReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleUpdate = async (wasteReasonId: number) => {
        if (!editedReason.trim()) {
            Alert.alert('Error', 'Reason cannot be empty');
            return;
        }

        setIsLoading(true);
        try {
            await axios.put(`http://172.20.10.5:8080/api/admin/waste-reasons/${wasteReasonId}`, {
                userId,
                newReason: editedReason,
            });
            refreshData();
            setEditingId(null);
            Alert.alert('Success', 'Waste reason updated successfully');
        } catch (error) {
            console.error('Error updating waste reason:', error);
            Alert.alert('Error', 'Failed to update waste reason');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (wasteReasonId: number) => {
        Alert.alert(
            "Confirm Delete",
            "Are you sure you want to delete this waste reason?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Delete",
                    onPress: async () => {
                        setIsLoading(true);
                        try {
                            await axios.delete(`http://172.20.10.5:8080/api/admin/waste-reasons/${wasteReasonId}`, {
                                data: { userId },
                            });
                            refreshData();
                            Alert.alert('Success', 'Waste reason deleted successfully');
                        } catch (error) {
                            console.error('Error deleting waste reason:', error);
                            Alert.alert('Error', 'Failed to delete waste reason');
                        } finally {
                            setIsLoading(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>All Waste Reasons</Text>
                        <TouchableOpacity onPress={onClose}>
                            <MaterialCommunityIcons name="close" size={24} color="#4A6FA5" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalContent}>
                        {wasteReasons.length === 0 ? (
                            <Text style={styles.emptyText}>No waste reasons found</Text>
                        ) : (
                            wasteReasons.map((reason, index) => (
                                <React.Fragment key={`waste-${reason.id}`}>
                                    {editingId === reason.id ? (
                                        <View style={styles.editContainer}>
                                            <TextInput
                                                style={styles.editInput}
                                                value={editedReason}
                                                onChangeText={setEditedReason}
                                                autoFocus
                                                multiline
                                            />
                                            <View style={styles.editButtons}>
                                                <TouchableOpacity
                                                    style={styles.cancelButton}
                                                    onPress={() => setEditingId(null)}
                                                    disabled={isLoading}
                                                >
                                                    <Text style={styles.buttonText}>Cancel</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={styles.saveButton}
                                                    onPress={() => handleUpdate(reason.id)}
                                                    disabled={isLoading}
                                                >
                                                    <Text style={styles.buttonText}>Save</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ) : (
                                        <View style={styles.listItem}>
                                            <Text style={styles.listBullet}>{index + 1}.</Text>
                                            <Text style={styles.listText}>{reason.reason}</Text>
                                            <Text style={styles.dateTimeText}>
                                                {new Date(reason.createdAt).toLocaleString([], {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </Text>
                                            {isAdmin && (
                                                <View style={styles.actionButtons}>
                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            setEditingId(reason.id);
                                                            setEditedReason(reason.reason);
                                                        }}
                                                    >
                                                        <MaterialCommunityIcons
                                                            name="pencil"
                                                            size={20}
                                                            color="#4A6FA5"
                                                        />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        onPress={() => handleDelete(reason.id)}
                                                        disabled={isLoading}
                                                    >
                                                        <MaterialCommunityIcons
                                                            name="trash-can"
                                                            size={20}
                                                            color="#E74C3C"
                                                        />
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        </View>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        width: '90%',
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ECF0F1',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2C3E50',
    },
    modalContent: {
        padding: 16,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        paddingVertical: 8,
    },
    listBullet: {
        color: '#E74C3C',
        fontWeight: 'bold',
        marginRight: 8,
        width: 20,
    },
    listText: {
        flex: 1,
        color: '#34495E',
        fontSize: 14,
    },
    dateTimeText: {
        color: '#95A5A6',
        fontSize: 12,
        marginLeft: 8,
        width: 60,
        textAlign: 'right',
    },
    actionButtons: {
        flexDirection: 'row',
        marginLeft: 16,
        width: 60,
        justifyContent: 'space-between',
    },
    emptyText: {
        color: '#95A5A6',
        textAlign: 'center',
        marginVertical: 16,
    },
    editContainer: {
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    editInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        padding: 10,
        backgroundColor: 'white',
        marginBottom: 10,
        minHeight: 50,
    },
    editButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
    },
    saveButton: {
        backgroundColor: '#4A6FA5',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 4,
    },
    cancelButton: {
        backgroundColor: '#95A5A6',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 4,
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
    },
});

export default AllWasteReasonsModal;