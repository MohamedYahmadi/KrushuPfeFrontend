import React, { useEffect, useId, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Platform,
  Button,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { User } from "./Entites/User"; // Make sure the path is correct
import * as SecureStore from "expo-secure-store";
import { useNavigation } from "expo-router";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";
import { RootStackParamList } from "./types";
import { ProfileUpdateModal } from "./Components/ProfileUpdateModal";
import { UserProfileUpdateModal } from "./Components/UserProfileUpdateModal";

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Login"
>;

export default function Profile({ route }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [userModal, setUserModal] = useState(false);
  const [adminModal, setAdminModal] = useState(false);

  const openModificationModal = () => {
    let role = "";
    if (Platform.OS === "web") {
      role = localStorage.getItem("role");
    } else {
      role = SecureStore.getItem("role");
    }

    if (role == "Admin") setAdminModal(true);
    else setUserModal(true);
  };

  const navigation = useNavigation<LoginScreenNavigationProp>();

  const retrieveData = () => {
    if (Platform.OS === "web") {
      let userId = localStorage.getItem("userId");
      let token = localStorage.getItem("token");
      return { userId, token };
    } else {
      let userId = SecureStore.getItem("userId");
      let token = SecureStore.getItem("token");

      return { userId, token };
    }
  };

  useEffect(() => {
    let data = retrieveData();

    if (!data.userId || !data.token) {
      navigation.navigate("Login");
    }

    fetchUserProfile(data.userId);
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const response = await axios.get<User>(
        `http://192.168.1.108:8080/api/user/profile/${userId}`
      );
      setUser(response.data);
    } catch (err) {
      setError("Failed to fetch user profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator />;
  if (error) return <Text>Error: {error}</Text>;

  return (
    <LinearGradient colors={["#1a1a1a", "#333"]} style={styles.container}>
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: "https://via.placeholder.com/150" }} // Placeholder image URL
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={styles.profileEmail}>{user?.email}</Text>
      </View>

      <View style={styles.card}>
        {user && (
          <>
            <View style={styles.infoContainer}>
              <MaterialIcons
                name="person"
                size={24}
                color="#ccc"
                style={styles.icon}
              />
              <Text style={styles.label}>First Name</Text>
              <Text style={styles.value}>{user.firstName}</Text>
            </View>
            <View style={styles.infoContainer}>
              <MaterialIcons
                name="person-outline"
                size={24}
                color="#ccc"
                style={styles.icon}
              />
              <Text style={styles.label}>Last Name</Text>
              <Text style={styles.value}>{user.lastName}</Text>
            </View>
            <View style={styles.infoContainer}>
              <MaterialIcons
                name="email"
                size={24}
                color="#ccc"
                style={styles.icon}
              />
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{user.email}</Text>
            </View>
            <View style={styles.infoContainer}>
              <MaterialIcons
                name="group"
                size={24}
                color="#ccc"
                style={styles.icon}
              />
              <Text style={styles.label}>Role</Text>
              <Text style={styles.value}>{user.role}</Text>
            </View>
            <View style={styles.infoContainer}>
              <MaterialIcons
                name="assignment"
                size={24}
                color="#ccc"
                style={styles.icon}
              />
              <Text style={styles.label}>Registration Number</Text>
              <Text style={styles.value}>{user.registrationNumber}</Text>
            </View>
            {user.department && (
              <View style={styles.infoContainer}>
                <MaterialIcons
                  name="location-on"
                  size={24}
                  color="#ccc"
                  style={styles.icon}
                />
                <Text style={styles.label}>Department</Text>
                <Text style={styles.value}>{user.department}</Text>
              </View>
            )}

            <Button
              title="Modify profile informations"
              onPress={openModificationModal}
            />
          </>
        )}
      </View>

      <ProfileUpdateModal
        visible={adminModal}
        user={user}
        onClose={() => setAdminModal(false)}
      />

      <UserProfileUpdateModal
        visible={userModal}
        user={user}
        onClose={() => setUserModal(false)}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 30,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  profileEmail: {
    fontSize: 16,
    color: "#ccc",
  },
  card: {
    backgroundColor: "#2a2a2a",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  icon: {
    marginRight: 15,
  },
  label: {
    fontSize: 14,
    color: "#ccc",
  },
  value: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
});
