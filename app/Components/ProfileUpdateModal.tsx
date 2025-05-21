import axios from "axios";
import React, { useState } from "react";
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
import * as SecureStore from "expo-secure-store";

interface ProfileUpdateModalProps {
  visible: boolean;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    registrationNumber: string;
    department: string;
  };
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export function ProfileUpdateModal({ visible, user, onClose, onSubmit }: ProfileUpdateModalProps) {
  const [data, setData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    registrationNumber: user.registrationNumber,
    department: user.department,
  });
  const [loading, setLoading] = useState(false);

  const retrieveId = async () => {
    if (Platform.OS === "web") {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");
      return { userId, token };
    } else {
      const userId = await SecureStore.getItemAsync("userId");
      const token = await SecureStore.getItemAsync("token");
      return { userId, token };
    }
  };

  const submitChanges = async () => {
    setLoading(true);
    try {
      const { userId } = await retrieveId();
      if (!userId) throw new Error("User ID not found");

      await axios.put(
          `http://172.20.10.5:8080/api/admin/update-profile/${userId}`,
          data
      );

      onSubmit(data);
      Alert.alert("Success", "Profile updated successfully!");
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
      <View style={styles.container}>
        <Modal visible={visible} animationType="slide" transparent={true}>
          <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.keyboardAvoidingView}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.header}>
                  <Text style={styles.title}>Update User Profile</Text>
                  <TouchableOpacity onPress={onClose}>
                    <Text style={styles.closeButton}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.formContainer}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>First name</Text>
                    <TextInput
                        style={styles.input}
                        value={data.firstName}
                        onChangeText={(value) =>
                            setData((old) => ({ ...old, firstName: value }))
                        }
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Last name</Text>
                    <TextInput
                        style={styles.input}
                        value={data.lastName}
                        onChangeText={(value) =>
                            setData((old) => ({ ...old, lastName: value }))
                        }
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        value={data.email}
                        onChangeText={(value) =>
                            setData((old) => ({ ...old, email: value }))
                        }
                        keyboardType="email-address"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Registration number</Text>
                    <TextInput
                        style={styles.input}
                        value={data.registrationNumber}
                        onChangeText={(value) =>
                            setData((old) => ({ ...old, registrationNumber: value }))
                        }
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Department</Text>
                    <TextInput
                        style={styles.input}
                        value={data.department}
                        onChangeText={(value) =>
                            setData((old) => ({ ...old, department: value }))
                        }
                    />
                  </View>

                  <TouchableOpacity
                      style={[styles.submitButton, loading && styles.disabledButton]}
                      onPress={submitChanges}
                      disabled={loading}
                  >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.submitButtonText}>Submit</Text>
                    )}
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    fontSize: 24,
    color: "#666",
    paddingHorizontal: 10,
  },
  formContainer: {
    flexGrow: 1,
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
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ProfileUpdateModal;