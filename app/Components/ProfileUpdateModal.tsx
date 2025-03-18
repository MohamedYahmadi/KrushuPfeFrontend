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
} from "react-native";

export function ProfileUpdateModal(props) {
  const [data, setData] = useState({
    firstName: props.user.firstName,
    lastName: props.user.lastName,
    email: props.user.email,
    registrationNumber: props.user.registrationNumber,
    department: props.user.department,
  });

  const submitChanges = () => {
    props.onSubmit(data); // Call the onSubmit prop with the updated data
  };

  return (
      <View style={styles.container}>
        <Modal visible={props.visible} animationType="slide" transparent={true}>
          <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.keyboardAvoidingView}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.header}>
                  <Text style={styles.title}>Update User Profile</Text>
                  <TouchableOpacity>
                    <Text style={styles.closeButton} onPress={props.onClose}>
                      ✕
                    </Text>
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
                      style={styles.submitButton}
                      onPress={submitChanges}
                  >
                    <Text style={styles.submitButtonText}>Submit</Text>
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
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});