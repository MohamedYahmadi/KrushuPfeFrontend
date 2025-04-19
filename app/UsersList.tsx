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
import { CreditCard as Edit2, Trash2, Search, Mail, CircleUser as UserCircle2, Building2, IdCard } from "lucide-react-native";
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
          "http://172.20.10.5:8080/api/admin/all-users"
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
          `http://172.20.10.5:8080/api/admin/delete-user/${userId}`
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
          `http://172.20.10.5:8080/api/admin/update-user-profile/${selectedUser.id}`,
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0056b3" />
        </View>
    );
  }

  if (error) {
    return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
    );
  }

  return (
      <View style={styles.container}>
        <LinearGradient
            colors={['#0056b3', '#003366']}
            style={styles.headerGradient}
        >
          <Text style={styles.headerTitle}>Users Management</Text>
          <View style={styles.searchContainer}>
            <Search size={20} color="#fff" style={styles.searchIcon} />
            <TextInput
                style={styles.searchBar}
                placeholder="Search users..."
                placeholderTextColor="#e6e6e6"
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
          </View>
        </LinearGradient>

        <FlatList
            style={styles.listContainer}
            contentContainerStyle={styles.listContentContainer}
            data={filteredUsers}
            renderItem={({ item }) => (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop' }}
                        style={styles.userImage}
                    />
                    <View style={styles.headerInfo}>
                      <Text style={styles.userName}>
                        {item.firstName} {item.lastName}
                      </Text>
                      <Text style={styles.userRole}>{item.role}</Text>
                    </View>
                  </View>

                  <View style={styles.infoSection}>
                    <View style={styles.infoContainer}>
                      <Mail size={16} color="#0056b3" style={styles.icon} />
                      <View style={styles.infoTextContainer}>
                        <Text style={styles.label}>Email</Text>
                        <Text style={styles.value}>{item.email}</Text>
                      </View>
                    </View>

                    <View style={styles.infoContainer}>
                      <IdCard size={16} color="#0056b3" style={styles.icon} />
                      <View style={styles.infoTextContainer}>
                        <Text style={styles.label}>Registration Number</Text>
                        <Text style={styles.value}>{item.registrationNumber}</Text>
                      </View>
                    </View>

                    {item.department && (
                        <View style={styles.infoContainer}>
                          <Building2 size={16} color="#0056b3" style={styles.icon} />
                          <View style={styles.infoTextContainer}>
                            <Text style={styles.label}>Department</Text>
                            <Text style={styles.value}>{item.department}</Text>
                          </View>
                        </View>
                    )}
                  </View>

                  <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.button, styles.editButton]}
                        onPress={() => handleEditUser(item)}
                    >
                      <Edit2 size={16} color="#fff" />
                      <Text style={styles.buttonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, styles.deleteButton]}
                        onPress={() => confirmDelete(item.id)}
                    >
                      <Trash2 size={16} color="#fff" />
                      <Text style={styles.buttonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
            )}
            keyExtractor={(item) => item.id.toString()}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        />

        {selectedUser && (
            <EditUserModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                user={selectedUser}
                onSubmit={handleUpdateUser}
            />
        )}
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 16,
    textAlign: 'center',
  },
  headerGradient: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchBar: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    padding: 0,
  },
  listContainer: {
    flex: 1,
  },
  listContentContainer: {
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    color: '#666',
  },
  infoSection: {
    marginBottom: 12,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  icon: {
    marginRight: 10,
  },
  infoTextContainer: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 6,
    gap: 6,
  },
  editButton: {
    backgroundColor: '#0056b3',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default UsersList;