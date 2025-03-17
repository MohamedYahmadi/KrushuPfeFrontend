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
} from "react-native";
import axios from "axios";
import { User } from "./Entites/User"; // Import the User interface
import Icon from "react-native-vector-icons/MaterialIcons"; // Import icons

const UsersList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get<User[]>(
          "http://192.168.1.108:8080/api/admin/all-users"
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
      <View style={styles.container}>
        <TextInput
            style={styles.searchBar}
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={setSearchQuery}
        />
        <FlatList
            data={filteredUsers}
            renderItem={({ item }) => (
                <View style={styles.card}>
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
                  <TouchableOpacity style={styles.deleteButton}>
                    <Icon name="delete" size={24} color="#ff4444" />
                  </TouchableOpacity>
                </View>
            )}
            keyExtractor={(item) => item.id.toString()}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        />
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  email: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: "#888",
    marginBottom: 4,
  },
  registration: {
    fontSize: 14,
    color: "#444",
    marginBottom: 4,
  },
  department: {
    fontSize: 14,
    color: "#888",
  },
  deleteButton: {
    padding: 8,
  },
});

export default UsersList;