import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Dimensions,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "./types";
import { LinearGradient } from "expo-linear-gradient";

type HomeScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "Home"
>;

const { width, height } = Dimensions.get("window");

export default function Home() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  return (
      <ImageBackground
          source={require("../assets/images/img.png")} // Replace with your background image
          style={styles.background}
      >
        <LinearGradient
            colors={["rgba(0, 0, 0, 0.6)", "rgba(0, 0, 0, 0.8)"]} // Dark overlay
            style={styles.overlay}
        >
          <View style={styles.container}>
            <Text style={styles.welcomeText}>ABS Efficiency</Text>
            <Text style={styles.subtitle}>
              Streamline your workflow with our powerful tools.
            </Text>
            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate("Login")}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: width,
    height: height,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "90%",
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff", // White text
    textAlign: "center",
    marginBottom: 10,
    fontFamily: "sans-serif-medium", // Use a modern font
  },
  subtitle: {
    fontSize: 16,
    color: "#ddd", // Light gray text
    textAlign: "center",
    marginBottom: 40,
    fontFamily: "sans-serif", // Use a modern font
  },
  button: {
    width: "80%",
    height: 50,
    backgroundColor: "#007bff", // Blue button
    borderRadius: 25, // Rounded corners
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#007bff", // Button shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5, // For Android
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});