import React, { useState, useEffect } from "react";
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Dimensions,
    ActivityIndicator,
    Alert
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialIcons";
import { SelectList } from "react-native-dropdown-select-list";
import axios from "axios";
import * as SecureStore from 'expo-secure-store';

const { width } = Dimensions.get("window");

const EditUserModal = ({ visible, onClose, user, onSubmit }) => {
    const [formData, setFormData] = useState({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        department: user.department || "",
        registrationNumber: user.registrationNumber || "",
        role: user.role || "TEAM_MEMBER"
    });
    const [departments, setDepartments] = useState([]);
    const [roles, setRoles] = useState([
        { key: "ADMIN", value: "Admin" },
        { key: "TEAM_MEMBER", value: "Team Member" },
        { key: "VIEWER", value: "Viewer" }
    ]);
    const [loading, setLoading] = useState(false);
    const [adminId, setAdminId] = useState(null);

    useEffect(() => {
        const fetchAdminId = async () => {
            try {
                const id = await SecureStore.getItemAsync('userId');
                setAdminId(id);
            } catch (error) {
                console.error("Error fetching admin ID:", error);
            }
        };

        const fetchDepartments = async () => {
            try {
                const response = await axios.get("http://172.20.10.5:8080/api/admin/all-departments-names");
                if (Array.isArray(response.data)) {
                    setDepartments(
                        response.data.map((name) => ({ key: name, value: name }))
                    );
                }
            } catch (error) {
                console.error("Error fetching departments:", error);
            }
        };

        fetchAdminId();
        fetchDepartments();
    }, []);

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async () => {
        if (!adminId) {
            Alert.alert("Error", "Admin ID not found");
            return;
        }

        // Basic validation
        if (!formData.firstName || !formData.lastName || !formData.email) {
            Alert.alert("Error", "Please fill in all required fields");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.put(
                `http://172.20.10.5:8080/api/admin/update-user-profile/${user.id}`,
                formData
            );

            if (response.status === 200) {
                onSubmit(formData); // Update local state
                Alert.alert("Success", response.data);
                onClose();
            } else {
                throw new Error(response.data?.message || "Failed to update profile");
            }
        } catch (error) {
            console.error("Update error:", error);
            Alert.alert(
                "Error",
                error.response?.data?.message ||
                error.message ||
                "An error occurred while updating the profile"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <LinearGradient
                        colors={["#0056b3", "#003366"]}
                        style={styles.headerGradient}
                    >
                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>Edit User Profile</Text>
                            <TouchableOpacity onPress={onClose}>
                                <Icon name="close" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                    <ScrollView style={styles.contentContainer}>
                        <View style={styles.card}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>First Name*</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="First Name"
                                    placeholderTextColor="#666"
                                    value={formData.firstName}
                                    onChangeText={(text) => handleChange('firstName', text)}
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Last Name*</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Last Name"
                                    placeholderTextColor="#666"
                                    value={formData.lastName}
                                    onChangeText={(text) => handleChange('lastName', text)}
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Email*</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email"
                                    placeholderTextColor="#666"
                                    value={formData.email}
                                    onChangeText={(text) => handleChange('email', text)}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Department</Text>
                                <SelectList
                                    setSelected={(val) => handleChange('department', val)}
                                    data={departments}
                                    save="key"
                                    placeholder="Select Department"
                                    boxStyles={styles.selectBox}
                                    inputStyles={styles.selectInput}
                                    dropdownStyles={styles.dropdownStyle}
                                    dropdownTextStyles={styles.dropdownText}
                                    defaultOption={{
                                        key: formData.department,
                                        value: formData.department
                                    }}
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Registration Number</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Registration Number"
                                    placeholderTextColor="#666"
                                    value={formData.registrationNumber}
                                    onChangeText={(text) => handleChange('registrationNumber', text)}
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Role*</Text>
                                <SelectList
                                    setSelected={(val) => handleChange('role', val)}
                                    data={roles}
                                    save="key"
                                    placeholder="Select Role"
                                    boxStyles={styles.selectBox}
                                    inputStyles={styles.selectInput}
                                    dropdownStyles={styles.dropdownStyle}
                                    dropdownTextStyles={styles.dropdownText}
                                    defaultOption={{
                                        key: formData.role,
                                        value: roles.find(r => r.key === formData.role)?.value
                                    }}
                                />
                            </View>

                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.submitButtonText}>Save Changes</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContainer: {
        width: "90%",
        maxHeight: "80%",
        backgroundColor: "#f5f5f5",
        borderRadius: 15,
        overflow: "hidden",
    },
    headerGradient: {
        padding: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff",
    },
    contentContainer: {
        padding: 20,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: "#444",
        marginBottom: 8,
        fontWeight: "500",
    },
    input: {
        height: 50,
        color: "#333",
        fontSize: 16,
        backgroundColor: "#f5f5f5",
        borderRadius: 10,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    selectBox: {
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 10,
        height: 50,
        backgroundColor: "#f5f5f5",
    },
    selectInput: {
        color: "#333",
        fontSize: 16,
    },
    dropdownStyle: {
        borderWidth: 1,
        borderColor: "#e1e1e1",
        borderRadius: 10,
        marginTop: 5,
        backgroundColor: "#fff",
    },
    dropdownText: {
        color: "#333",
        fontSize: 16,
    },
    submitButton: {
        height: 50,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0056b3",
        marginTop: 20,
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});

export default EditUserModal;