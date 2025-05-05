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
                                    ActivityIndicator,
                                    Platform,
                                } from "react-native";
                                import Icon from "react-native-vector-icons/FontAwesome";
                                import axios from "axios";
                                import * as SecureStore from "expo-secure-store";
                                import { useNavigation } from "@react-navigation/native";
                                import { NativeStackNavigationProp } from "@react-navigation/native-stack";
                                import { LinearGradient } from "expo-linear-gradient";
                                import { RootStackParamList } from "./types";

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
                                                `http://172.20.10.5:8080/api/user/update-password/${userId}`,
                                                {
                                                    oldPassword,
                                                    newPassword,
                                                    confirmPassword,
                                                }
                                            );

                                            if (response.status === 200) {
                                                Alert.alert("Success", "Password changed successfully", [
                                                    {
                                                        text: "OK",
                                                        onPress: () => navigation.navigate("Dashboard", { screen: "Profile" })
                                                    }
                                                ]);
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
                                        <ScrollView style={styles.container}>
                                            <LinearGradient
                                                colors={['#0056b3', '#003366']}
                                                style={styles.headerGradient}
                                            >
                                                <View style={styles.header}>
                                                    <TouchableOpacity
                                                        style={styles.backButton}
                                                        onPress={() => navigation.navigate("Dashboard", { screen: "Profile" })}
                                                    >
                                                        <Icon name="arrow-left" size={20} color="#fff" />
                                                    </TouchableOpacity>
                                                    <Text style={styles.headerTitle}>Change Password</Text>
                                                </View>
                                            </LinearGradient>

                                            <View style={styles.contentContainer}>
                                                <View style={styles.card}>
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
                                            </View>
                                        </ScrollView>
                                    );
                                }

                                const styles = StyleSheet.create({
                                    container: {
                                        flex: 1,
                                        backgroundColor: "#f5f5f5",
                                    },
                                    headerGradient: {
                                        padding: 20,
                                        paddingTop: 40,
                                        paddingBottom: 40,
                                    },
                                    header: {
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                    },
                                    backButton: {
                                        marginRight: 15,
                                    },
                                    headerTitle: {
                                        fontSize: 24,
                                        fontWeight: "bold",
                                        color: "#fff",
                                    },
                                    contentContainer: {
                                        padding: 20,
                                        marginTop: -30,
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
                                    section: {
                                        marginBottom: 25,
                                    },
                                    sectionTitle: {
                                        color: "#333",
                                        fontSize: 16,
                                        fontWeight: "500",
                                        marginBottom: 15,
                                    },
                                    inputContainer: {
                                        flexDirection: "row",
                                        alignItems: "center",
                                        backgroundColor: "#f0f0f0",
                                        borderRadius: 10,
                                        paddingHorizontal: 15,
                                    },
                                    icon: {
                                        marginRight: 10,
                                    },
                                    input: {
                                        flex: 1,
                                        height: 50,
                                        color: "#333",
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
                                        backgroundColor: "#0056b3",
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