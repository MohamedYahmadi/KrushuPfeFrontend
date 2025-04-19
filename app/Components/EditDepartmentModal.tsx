import React, { useState, useEffect } from "react";
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Platform,
    KeyboardAvoidingView,
    Alert,
    ActivityIndicator,
} from "react-native";
import { X, Building2 } from "lucide-react-native";
import axios from "axios";

const API_BASE_URL = "http://172.20.10.5:8080/api/admin";

interface Department {
    id: number;
    name: string;
}

interface EditDepartmentModalProps {
    visible: boolean;
    onClose: () => void;
    department: Department | null;
    onSubmit: (updatedData: { name: string }) => void;
}

const EditDepartmentModal = ({
                                 visible,
                                 onClose,
                                 department,
                                 onSubmit,
                             }: EditDepartmentModalProps) => {
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (department) {
            setName(department.name);
        }
    }, [department]);

    const submitChanges = () => {
        if (!department) return;

        setIsLoading(true);
        axios
            .put(`${API_BASE_URL}/rename-department/${department.id}`, { newName: name })
            .then(() => {
                onSubmit({ name });
                onClose();
            })
            .catch((error) => {
                console.error("Error updating department:", error);
                if (error.response && error.response.data) {
                    Alert.alert(
                        "Error",
                        error.response.data.message || "Failed to update department"
                    );
                } else {
                    Alert.alert("Error", "An error occurred while updating the department");
                }
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    if (!department) {
        return null;
    }

    return (
        <Modal visible={visible && !!department} animationType="slide" transparent>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.header}>
                            <View style={styles.headerContent}>
                                <Building2 size={24} color="#0056b3" style={styles.headerIcon} />
                                <Text style={styles.title}>Edit Department</Text>
                            </View>
                            <TouchableOpacity
                                onPress={onClose}
                                style={styles.closeButton}
                            >
                                <X size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.formContainer}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Department Name</Text>
                                <TextInput
                                    style={styles.input}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Enter department name"
                                    placeholderTextColor="#999"
                                    autoFocus
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.submitButton, isLoading && styles.disabledButton]}
                                onPress={submitChanges}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={styles.submitButtonText}>Save Changes</Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        padding: 20,
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 20,
        maxHeight: "80%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    headerContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    headerIcon: {
        marginRight: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: "600",
        color: "#333",
    },
    closeButton: {
        padding: 5,
    },
    formContainer: {
        flexGrow: 1,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: "#666",
        marginBottom: 8,
        fontWeight: "500",
    },
    input: {
        backgroundColor: "#f8f9fa",
        borderWidth: 1,
        borderColor: "#e9ecef",
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        color: "#333",
    },
    submitButton: {
        backgroundColor: "#0056b3",
        borderRadius: 10,
        padding: 15,
        alignItems: "center",
        marginTop: 10,
    },
    submitButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    disabledButton: {
        opacity: 0.6,
    },
});

export default EditDepartmentModal;