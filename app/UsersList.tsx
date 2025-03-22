import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
  Image,
} from "react-native";
import axios from "axios";
import { User } from "./Entites/User";
import Icon from "react-native-vector-icons/MaterialIcons";
import EditUserModal from "./Components/EditUserModal";
import { LinearGradient } from "expo-linear-gradient";

const UsersList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get<User[]>(
          "http://192.168.1.105:8080/api/admin/all-users"
      );
      if (response.status === 200) {
        setUsers(response.data);
      } else {
        setError("Failed to fetch users.");
      }
    } catch (error) {
      console.error(error);
      setError("An error occurred while fetching the users.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const deleteUser = async (userId: number) => {
    try {
      const response = await axios.delete(
          `http://192.168.1.105:8080/api/admin/delete-user/${userId}`
      );
      if (response.status === 200) {
        setUsers(users.filter((user) => user.id !== userId));
        Alert.alert("Success", "User deleted successfully");
        fetchUsers();
      } else {
        Alert.alert("Error", "Failed to delete user");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "An error occurred while deleting the user");
    }
  };

  const confirmDelete = (userId: number) => {
    Alert.alert(
        "Delete User",
        "Are you sure you want to delete this user?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", onPress: () => deleteUser(userId), style: "destructive" },
        ]
    );
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsModalVisible(true);
  };

  const handleUpdateUser = async (updatedData: any) => {
    try {
      if (!selectedUser || !selectedUser.id) {
        Alert.alert("Error", "No user selected for update.");
        return;
      }

      const response = await axios.put(
          `http://192.168.1.105:8080/api/admin/update-user-profile/${selectedUser.id}`,
          updatedData
      );

      if (response.status === 200) {
        const updatedUsers = users.map((user) =>
            user.id === selectedUser.id ? { ...user, ...updatedData } : user
        );
        setUsers(updatedUsers);

        Alert.alert("Success", "User updated successfully");
        setIsModalVisible(false);
      } else {
        Alert.alert("Error", "Failed to update user");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "An error occurred while updating the user");
    }
  };

  const filteredUsers = users.filter(
      (user) =>
          user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6200ee" />
        </View>
    );
  }

  if (error) {
    return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
    );
  }

  return (
      <LinearGradient colors={["#1a1a1a", "#333"]} style={styles.container}>
        <TextInput
            style={styles.searchBar}
            placeholder="Search users..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
        />
        <FlatList
            data={filteredUsers}
            renderItem={({ item }) => (
                <View style={styles.card}>
                  <Image
                      source={require("../assets/images/user-icon.png")}
                      style={styles.userIcon}
                  />
                  <View style={styles.cardContent}>
                    <Text style={styles.name}>
                      {item.firstName} {item.lastName}
                    </Text>
                    <Text style={styles.email}>{item.email}</Text>
                    <Text style={styles.role}>{item.role}</Text>
                    <Text style={styles.registration}>{item.registrationNumber}</Text>
                    {item.department && (
                        <Text style={styles.department}>
                          Department: {item.department}
                        </Text>
                    )}
                  </View>
                  <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleEditUser(item)}
                    >
                      <Icon name="edit" size={24} color="#007AFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => confirmDelete(item.id)}
                    >
                      <Icon name="delete" size={24} color="#ff4444" />
                    </TouchableOpacity>
                  </View>
                </View>
            )}
            keyExtractor={(item) => item.id.toString()}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        />

        {/* New Modal */}
        {selectedUser && (
            <EditUserModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                user={selectedUser}
                onSubmit={handleUpdateUser}
            />
        )}
      </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#ff4444",
    fontSize: 16,
  },
  searchBar: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    color: "#fff",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#fff",
  },
  email: {
    fontSize: 14,
    color: "#bbb",
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: "#888",
    marginBottom: 4,
  },
  registration: {
    fontSize: 14,
    color: "#bbb",
    marginBottom: 4,
  },
  department: {
    fontSize: 14,
    color: "#888",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  editButton: {
    padding: 8,
    marginRight: 8,
  },
  deleteButton: {
    padding: 8,
  },
});

export default UsersList;