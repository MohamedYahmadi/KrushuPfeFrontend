import React from "react";
import { TouchableOpacity, Text, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

type LogoutButtonNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "Login"
>;

const LogoutButton: React.FC = () => {
    const navigation = useNavigation<LogoutButtonNavigationProp>();

    const handleLogout = async () => {
        try {
            if (Platform.OS === "web") {
                localStorage.removeItem("token");
                localStorage.removeItem("userId");
                localStorage.removeItem("role");
            } else {
                await SecureStore.deleteItemAsync("token");
                await SecureStore.deleteItemAsync("userId");
                await SecureStore.deleteItemAsync("role");
            }
            navigation.navigate("Login");
        } catch (error) {
            console.error("Failed to logout:", error);
            Alert.alert("Logout Failed", "An error occurred while logging out.");
        }
    };

    return (
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
    );
};

const styles = {
    logoutButton: {
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        backgroundColor: "#ff4444",
        borderRadius: 8,
        alignItems: "center",
    },
    logoutButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
};

export default LogoutButton;