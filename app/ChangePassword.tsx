import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Dimensions,
    Alert,
    ActivityIndicator, Platform,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";
import Profile from "./Profile";

const { width } = Dimensions.get("window");

type ChangePasswordScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "ChangePassword"
>;

export default function ChangePassword() {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [isOldPasswordVisible, setIsOldPasswordVisible] = useState(false);
    const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

    const navigation = useNavigation<ChangePasswordScreenNavigationProp>();

    const retrieveData = () => {
        if (Platform.OS === "web") {
            let userId = localStorage.getItem("userId");
            return { userId };
        } else {
            let userId = SecureStore.getItem("userId");
            return { userId };
        }
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "New passwords do not match");
            return;
        }

        setLoading(true);

        const { userId } = retrieveData();

        try {
            const response = await axios.post(
                `http://172.20.10.3:8080/api/user/update-password/${userId}`,
                {
                    oldPassword,
                    newPassword,
                    confirmPassword,
                }
            );

            if (response.status === 200) {
                Alert.alert("Success", "Password changed successfully");
                navigation.navigate("Profile"); // Navigate back to the profile screen
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to change password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const toggleOldPasswordVisibility = () => {
        setIsOldPasswordVisible(!isOldPasswordVisible);
    };

    const toggleNewPasswordVisibility = () => {
        setIsNewPasswordVisible(!isNewPasswordVisible);
    };

    const toggleConfirmPasswordVisibility = () => {
        setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.formContainer}>
                    <Text style={styles.title}>Change Password</Text>

                    {/* Old Password Input */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Current Password</Text>
                        <View style={styles.inputContainer}>
                            <Icon name="lock" size={18} color="#888" style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Old Password"
                                placeholderTextColor="#888"
                                secureTextEntry={!isOldPasswordVisible}
                                value={oldPassword}
                                onChangeText={setOldPassword}
                            />
                            <TouchableOpacity
                                onPress={toggleOldPasswordVisibility}
                                style={styles.eyeIcon}
                            >
                                <Icon
                                    name={isOldPasswordVisible ? "eye-slash" : "eye"}
                                    size={20}
                                    color="#888"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* New Password Input */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>New Password</Text>
                        <View style={styles.inputContainer}>
                            <Icon name="lock" size={18} color="#888" style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="New Password"
                                placeholderTextColor="#888"
                                secureTextEntry={!isNewPasswordVisible}
                                value={newPassword}
                                onChangeText={setNewPassword}
                            />
                            <TouchableOpacity
                                onPress={toggleNewPasswordVisibility}
                                style={styles.eyeIcon}
                            >
                                <Icon
                                    name={isNewPasswordVisible ? "eye-slash" : "eye"}
                                    size={20}
                                    color="#888"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Confirm New Password Input */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Confirm New Password</Text>
                        <View style={styles.inputContainer}>
                            <Icon name="lock" size={18} color="#888" style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Confirm New Password"
                                placeholderTextColor="#888"
                                secureTextEntry={!isConfirmPasswordVisible}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                            <TouchableOpacity
                                onPress={toggleConfirmPasswordVisibility}
                                style={styles.eyeIcon}
                            >
                                <Icon
                                    name={isConfirmPasswordVisible ? "eye-slash" : "eye"}
                                    size={20}
                                    color="#888"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Change Password Button */}
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleChangePassword}
                        disabled={loading}
                    >
                        <View style={styles.solidButton}>
                            <Text style={styles.buttonText}>
                                {loading ? "Changing Password..." : "Change Password"}
                            </Text>
                            {!loading && (
                                <Icon
                                    name="arrow-right"
                                    size={18}
                                    color="#fff"
                                    style={styles.buttonIcon}
                                />
                            )}
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1a1a1a", // Solid dark background
    },
    scrollContainer: {
        flexGrow: 1,
        paddingVertical: 30,
    },
    formContainer: {
        width: width * 0.9,
        alignSelf: "center",
    },
    title: {
        fontSize: 28,
        fontWeight: "600",
        color: "#fff",
        textAlign: "center",
        marginBottom: 30,
        fontFamily: "sans-serif-medium",
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        color: "#ddd",
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 15,
        paddingLeft: 10,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 10,
        marginBottom: 15,
        paddingHorizontal: 15,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 50,
        color: "#fff",
        fontSize: 16,
    },
    eyeIcon: {
        padding: 10,
    },
    button: {
        marginTop: 20,
        borderRadius: 10,
        overflow: "hidden",
    },
    solidButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        backgroundColor: "#667eea", // Solid button color
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
        marginRight: 10,
    },
    buttonIcon: {
        marginTop: 2,
    },
});