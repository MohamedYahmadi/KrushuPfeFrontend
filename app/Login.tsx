import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "./types";
import axios from "axios";
import Icon from "react-native-vector-icons/FontAwesome";
import * as SecureStore from "expo-secure-store";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

type LoginScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "Login"
>;

const Login: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const saveCredentials = async (token, id, role) => {
    if (Platform.OS === "web") {
      localStorage.setItem("token", token);
      localStorage.setItem("userId", id);
      localStorage.setItem("role", role);
    } else {
      try {
        await SecureStore.setItemAsync("userId", id);
        await SecureStore.setItemAsync("token", token);
        await SecureStore.setItemAsync("role", role);
        console.log("Credentials saved successfully!");
      } catch (error) {
        console.error("Failed to save credentials:", error);
      }
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post(
          "http://192.168.1.102:8080/api/user/login",
          { email, password }
      );
      if (response.status === 200) {
        saveCredentials(
            response.data.token,
            String(response.data.id),
            response.data.role
        );
        navigation.navigate("Dashboard");
      } else {
        alert("Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error(error);
      alert("Login failed. Please check your credentials.");
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
      <LinearGradient
          colors={["#1a1a1a", "#333"]}
          style={styles.container}
      >
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoidingView}
        >
          <View style={styles.content}>

            <Image
                source={require("../assets/images/img.png")}
                style={styles.logo}
                resizeMode="contain"
            />

            <Text style={styles.welcomeText}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Please login to continue</Text>

            <View style={styles.inputContainer}>
              <Icon name="envelope" size={20} color="#888" style={styles.icon} />
              <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#888"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="lock" size={20} color="#888" style={styles.icon} />
              <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Enter your password"
                  placeholderTextColor="#888"
                  secureTextEntry={!isPasswordVisible}
                  value={password}
                  onChangeText={setPassword}
              />
              <TouchableOpacity
                  onPress={togglePasswordVisibility}
                  style={styles.eyeIcon}
              >
                <Icon
                    name={isPasswordVisible ? "eye-slash" : "eye"}
                    size={20}
                    color="#888"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => navigation.navigate("RequestResetPassword")} // Updated to navigate to RequestResetPassword
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardAvoidingView: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "90%",
    alignItems: "center",
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#bbb",
    textAlign: "center",
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 15,
    width: "100%",
  },
  icon: {
    marginRight: 10,
  },
  input: {
    height: 50,
    color: "#fff",
    fontSize: 16,
    flex: 1,
  },
  eyeIcon: {
    padding: 10,
  },
  loginButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#007bff",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#007bff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  forgotPassword: {
    alignItems: "center",
  },
  forgotPasswordText: {
    color: "#007bff",
    textDecorationLine: "underline",
    fontSize: 14,
  },
});

export default Login;