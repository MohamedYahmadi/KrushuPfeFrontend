import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { User } from "./Entites/User"; // Import the User interface

const UsersList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get<User[]>(
        "http://localhost:8080/api/admin/all-users"
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
    }
  };

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error}</Text>;

  return (
    <FlatList
      data={users}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <Text style={styles.name}>
            {item.firstName} {item.lastName}
          </Text>
          <Text style={styles.email}>{item.email}</Text>
          <Text style={styles.role}>{item.role}</Text>
          <Text style={styles.registration}>{item.registrationNumber}</Text>
          {item.department && (
            <Text style={styles.department}>Department: {item.department}</Text>
          )}
        </View>
      )}
      keyExtractor={(item) => item.id.toString()}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  studentInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: "#ccc",
  },
  registration: {
    fontSize: 14,
    color: "#444",
  },
  department: {
    fontSize: 14,
    color: "#888",
  },
  deleteButton: {
    padding: 8,
    marginLeft: 16,
  },
});

export default UsersList;
