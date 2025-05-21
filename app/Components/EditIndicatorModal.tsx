import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert
} from 'react-native';
import { Check, X } from 'lucide-react-native';
import axios from 'axios';

const API_BASE_URL = 'http://172.20.10.5:8080/api/admin';

interface EditIndicatorModalProps {
    visible: boolean;
    onClose: () => void;
    indicator: {
        id: number;
        name: string;
        targetPerWeek: number;
    } | null;
    onUpdateSuccess: () => void;
}

const EditIndicatorModal: React.FC<EditIndicatorModalProps> = ({
                                                                   visible,
                                                                   onClose,
                                                                   indicator,
                                                                   onUpdateSuccess
                                                               }) => {
    const [formData, setFormData] = useState({
        name: '',
        targetPerWeek: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (indicator) {
            setFormData({
                name: indicator.name,
                targetPerWeek: indicator.targetPerWeek.toString()
            });
        }
    }, [indicator]);

    const handleUpdateIndicator = async () => {
        if (!formData.name.trim() || !formData.targetPerWeek.trim()) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        if (!indicator) return;

        try {
            setLoading(true);

            const updateData = {
                indicatorId: indicator.id,
                newName: formData.name,
                newTargetPerWeek: formData.targetPerWeek
            };

            const response = await axios.put(
                `${API_BASE_URL}/update-indicator/${indicator.id}`,
                updateData
            );

            if (response.status === 200) {
                Alert.alert('Success', 'Indicator updated successfully');
                onUpdateSuccess();
            }
        } catch (error) {
            console.error('Update error:', error);
            Alert.alert('Error', 'Failed to update indicator');
        } finally {
            setLoading(false);
        }
    };

    if (!indicator) return null;

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Edit Indicator</Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Indicator Name</Text>
                        <TextInput
                            style={styles.textInput}
                            value={formData.name}
                            onChangeText={(text) => setFormData(prev => ({
                                ...prev,
                                name: text
                            }))}
                            placeholder="Enter indicator name"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Target Per Week</Text>
                        <TextInput
                            style={styles.textInput}
                            value={formData.targetPerWeek}
                            onChangeText={(text) => setFormData(prev => ({
                                ...prev,
                                targetPerWeek: text
                            }))}
                            placeholder="Enter target value"
                            keyboardType="default"
                        />
                    </View>

                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton]}
                            onPress={onClose}
                            disabled={loading}
                        >
                            <X size={18} color="#FF4B4B" />
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.saveButton]}
                            onPress={handleUpdateIndicator}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Check size={18} color="#fff" />
                                    <Text style={styles.saveButtonText}>Save</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 15,
    },
    inputLabel: {
        marginBottom: 5,
        color: '#666',
        fontWeight: '500',
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    modalButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        width: '48%',
    },
    cancelButton: {
        backgroundColor: '#ffeeee',
        borderWidth: 1,
        borderColor: '#FF4B4B',
    },
    saveButton: {
        backgroundColor: '#0056b3',
    },
    cancelButtonText: {
        color: '#FF4B4B',
        marginLeft: 5,
        fontWeight: '500',
    },
    saveButtonText: {
        color: 'white',
        marginLeft: 5,
        fontWeight: '500',
    },
});

export default EditIndicatorModal;