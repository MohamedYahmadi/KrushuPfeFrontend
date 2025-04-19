import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Check } from 'lucide-react-native';

interface CreateDepartmentModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (name: string) => void;
}

const CreateDepartmentModal: React.FC<CreateDepartmentModalProps> = ({
                                                                         visible,
                                                                         onClose,
                                                                         onSubmit
                                                                     }) => {
    const [departmentName, setDepartmentName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!departmentName.trim()) {
            Alert.alert('Error', 'Please enter a department name');
            return;
        }

        setIsLoading(true);
        try {
            await onSubmit(departmentName);
            setDepartmentName('');
        } finally {
            setIsLoading(false);
        }
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
                    <LinearGradient
                        colors={['#0056b3', '#003366']}
                        style={styles.modalHeader}
                    >
                        <Text style={styles.modalTitle}>Create New Department</Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color="#fff" />
                        </TouchableOpacity>
                    </LinearGradient>

                    <View style={styles.modalContent}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Department Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter department name"
                                value={departmentName}
                                onChangeText={setDepartmentName}
                                autoCapitalize="words"
                                autoFocus
                            />
                        </View>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={onClose}
                                disabled={isLoading}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={handleSubmit}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Check size={20} color="#fff" style={styles.buttonIcon} />
                                        <Text style={styles.submitButtonText}>Create</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
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
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    modalContent: {
        padding: 20,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    cancelButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#dc3545',
    },
    cancelButtonText: {
        color: '#dc3545',
        fontSize: 16,
        fontWeight: '500',
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#28a745',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 8,
    },
    buttonIcon: {
        marginRight: 8,
    },
});

export default CreateDepartmentModal;