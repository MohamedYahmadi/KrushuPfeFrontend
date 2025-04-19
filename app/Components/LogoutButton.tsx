import React, {useState} from "react";
import { TouchableOpacity, Text, Alert, ActivityIndicator } from "react-native";
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
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        setLoading(true);
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
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        } catch (error) {
            console.error("Failed to logout:", error);
            Alert.alert("Logout Failed", "An error occurred while logging out.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutButton}
            disabled={loading}
        >
            {loading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={styles.logoutButtonText}>Logout</Text>
            )}
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