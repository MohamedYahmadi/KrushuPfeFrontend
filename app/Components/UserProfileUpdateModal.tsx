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
  ActivityIndicator,
  Alert,
} from "react-native";
import * as SecureStore from "expo-secure-store";

interface UserProfileUpdateModalProps {
  visible: boolean;
  user: {
    firstName: string;
    lastName: string;
  };
  onClose: () => void;
  onSubmit: (data: { firstName: string; lastName: string }) => void;
}

export function UserProfileUpdateModal({ visible, user, onClose, onSubmit }: UserProfileUpdateModalProps) {
  const [data, setData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
  });
  const [loading, setLoading] = useState(false);

  const retrieveId = async () => {
    if (Platform.OS === "web") {
      const userId = localStorage.getItem("userId");
      return { userId };
    } else {
      const userId = await SecureStore.getItemAsync("userId");
      return { userId };
    }
  };

  const submitChanges = async () => {
    setLoading(true);
    try {
      const { userId } = await retrieveId();
      if (!userId) throw new Error("User ID not found");

      await axios.put(
          `http://172.20.10.5:8080/api/user/update-profile/${userId}`,
          {
            firstName: data.firstName,
            lastName: data.lastName
          }
      );

      onSubmit(data);
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
                  <Text style={styles.title}>Update Profile</Text>
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

export default UserProfileUpdateModal;