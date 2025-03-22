import React, { useState } from "react";
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const EditUserModal = ({ visible, onClose, user, onSubmit }) => {
    const [firstName, setFirstName] = useState(user.firstName);
    const [lastName, setLastName] = useState(user.lastName);
    const [email, setEmail] = useState(user.email);
    const [department, setDepartment] = useState(user.department || "");
    const [registrationNumber, setRegistrationNumber] = useState(
        user.registrationNumber || ""
    );

    const handleSubmit = () => {
        const updatedData = {
            firstName,
            lastName,
            email,
            department,
            registrationNumber,
        };
        onSubmit(updatedData);
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>

                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Edit User Profile</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Icon name="close" size={24} color="#ff4444" />
                        </TouchableOpacity>
                    </View>


                    <TextInput
                        style={styles.input}
                        placeholder="First Name"
                        placeholderTextColor="#888"
                        value={firstName}
                        onChangeText={setFirstName}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Last Name"
                        placeholderTextColor="#888"
                        value={lastName}
                        onChangeText={setLastName}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#888"
                        value={email}
                        onChangeText={setEmail}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Department"
                        placeholderTextColor="#888"
                        value={department}
                        onChangeText={setDepartment}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Registration Number"
                        placeholderTextColor="#888"
                        value={registrationNumber}
                        onChangeText={setRegistrationNumber}
                    />


                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                        <Text style={styles.submitButtonText}>Save Changes</Text>
                    </TouchableOpacity>
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
        backgroundColor: "#1a1a1a",
        borderRadius: 10,
        padding: 20,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
    },
    input: {
        backgroundColor: "#333",
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
        color: "#fff",
    },
    submitButton: {
        backgroundColor: "#6200ee",
        borderRadius: 5,
        padding: 15,
        alignItems: "center",
        marginTop: 10,
    },
    submitButtonText: {
        color: "#fff",
        fontWeight: "bold",
    },
});

export default EditUserModal;