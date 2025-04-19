import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User } from './Entites/User';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { ProfileUpdateModal } from './Components/ProfileUpdateModal';
import { UserProfileUpdateModal } from './Components/UserProfileUpdateModal';
import { Settings, Key, Building2, Mail, UserCircle2, IdCard } from 'lucide-react-native';
import axios from 'axios';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function Profile({ route }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userModal, setUserModal] = useState(false);
  const [adminModal, setAdminModal] = useState(false);

  const navigation = useNavigation<LoginScreenNavigationProp>();

  const openModificationModal = () => {
    const role = Platform.OS === 'web'
        ? localStorage.getItem('role')
        : SecureStore.getItem('role');

    if (role === 'Admin') setAdminModal(true);
    else setUserModal(true);
  };

  const retrieveData = () => {
    if (Platform.OS === 'web') {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      return { userId, token };
    } else {
      const userId = SecureStore.getItem('userId');
      const token = SecureStore.getItem('token');
      return { userId, token };
    }
  };

  useEffect(() => {
    const data = retrieveData();
    if (!data.userId || !data.token) {
      navigation.navigate('Login');
      return;
    }
    fetchUserProfile(data.userId);
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const response = await axios.get<User>(
          `http://172.20.10.5:8080/api/user/profile/${userId}`
      );
      setUser(response.data);
    } catch (err) {
      setError('Failed to fetch user profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (updatedData: Partial<User>) => {
    try {
      const data = retrieveData();
      const role = data.role;
      const endpoint = role === 'Admin'
          ? `http://172.20.10.5:8080/api/admin/update-profile/${data.userId}`
          : `http://172.20.10.5:8080/api/user/update-profile/${data.userId}`;

      const response = await axios.put(endpoint, updatedData);

      fetchUserProfile(data.userId);
      setAdminModal(false);
      setUserModal(false);
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

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
      <ScrollView style={styles.container}>
        <LinearGradient
            colors={['#0056b3', '#003366']}
            style={styles.headerGradient}
        >
          <View style={styles.profileHeader}>
            <Image
                source={{ uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop' }}
                style={styles.profileImage}
            />
            <Text style={styles.profileName}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
        </LinearGradient>

        <View style={styles.contentContainer}>
          <View style={styles.card}>
            {user && (
                <>
                  <View style={styles.infoSection}>
                    <View style={styles.infoContainer}>
                      <UserCircle2 size={24} color="#0056b3" style={styles.icon} />
                      <View style={styles.infoTextContainer}>
                        <Text style={styles.label}>First Name</Text>
                        <Text style={styles.value}>{user.firstName}</Text>
                      </View>
                    </View>

                    <View style={styles.infoContainer}>
                      <UserCircle2 size={24} color="#0056b3" style={styles.icon} />
                      <View style={styles.infoTextContainer}>
                        <Text style={styles.label}>Last Name</Text>
                        <Text style={styles.value}>{user.lastName}</Text>
                      </View>
                    </View>

                    <View style={styles.infoContainer}>
                      <Mail size={24} color="#0056b3" style={styles.icon} />
                      <View style={styles.infoTextContainer}>
                        <Text style={styles.label}>Email</Text>
                        <Text style={styles.value}>{user.email}</Text>
                      </View>
                    </View>

                    <View style={styles.infoContainer}>
                      <IdCard size={24} color="#0056b3" style={styles.icon} />
                      <View style={styles.infoTextContainer}>
                        <Text style={styles.label}>Role</Text>
                        <Text style={styles.value}>{user.role}</Text>
                      </View>
                    </View>

                    <View style={styles.infoContainer}>
                      <Building2 size={24} color="#0056b3" style={styles.icon} />
                      <View style={styles.infoTextContainer}>
                        <Text style={styles.label}>Registration Number</Text>
                        <Text style={styles.value}>{user.registrationNumber}</Text>
                      </View>
                    </View>

                    {user.department && (
                        <View style={styles.infoContainer}>
                          <Building2 size={24} color="#0056b3" style={styles.icon} />
                          <View style={styles.infoTextContainer}>
                            <Text style={styles.label}>Department</Text>
                            <Text style={styles.value}>{user.department}</Text>
                          </View>
                        </View>
                    )}
                  </View>

                  <View style={styles.buttonContainer}>
                    <Pressable
                        style={[styles.button, styles.primaryButton]}
                        onPress={openModificationModal}
                    >
                      <Settings size={20} color="#fff" style={styles.buttonIcon} />
                      <Text style={styles.buttonText}>Modify Profile</Text>
                    </Pressable>

                    <Pressable
                        style={[styles.button, styles.secondaryButton]}
                        onPress={() => navigation.navigate('ChangePassword')}
                    >
                      <Key size={20} color="#0056b3" style={styles.buttonIcon} />
                      <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                        Change Password
                      </Text>
                    </Pressable>
                  </View>
                </>
            )}
          </View>
        </View>

        <ProfileUpdateModal
            visible={adminModal}
            user={user}
            onClose={() => setAdminModal(false)}
            onSubmit={handleProfileUpdate}
        />

        <UserProfileUpdateModal
            visible={userModal}
            user={user}
            onClose={() => setUserModal(false)}
            onSubmit={handleProfileUpdate}
        />
      </ScrollView>
  );
}

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
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
    marginBottom: 15,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 16,
    color: '#e6e6e6',
  },
  contentContainer: {
    padding: 20,
    marginTop: -30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  infoSection: {
    marginBottom: 25,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  icon: {
    marginRight: 15,
  },
  infoTextContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#0056b3',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#0056b3',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButtonText: {
    color: '#0056b3',
  },
});