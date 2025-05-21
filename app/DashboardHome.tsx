import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import WasteReasonModal from './Components/WasteReasonModal';
import ActionItemModal from './Components/ActionItemModal';
import AllWasteReasonsModal from './Components/AllWasteReasonsModal';
import AllActionItemsModal from './Components/AllActionItemsModal';
import { SelectList } from 'react-native-dropdown-select-list';

// API endpoints
const ADMIN_API_BASE = 'http://172.20.10.5:8080/api/admin';
const USER_API_BASE = 'http://172.20.10.5:8080/api/user';
const DEPARTMENTS_API = 'http://172.20.10.5:8080/api/admin/indicators-by-department';

interface Department {
  id: number;
  name: string;
  indicators: Indicator[];
  wasteReasons: WasteReason[];
  actionItems: ActionItem[];
}

interface Indicator {
  id: number;
  name: string;
  targetPerWeek: number;
  dailyValues: DailyValue[];
  values: (string | null)[];
}

interface DailyValue {
  date: string;
  value: string;
}

interface WasteReason {
  id: number;
  reason: string;
  createdAt: string;
}

interface ActionItem {
  id: number;
  action: string;
  createdAt: string;
}

interface UserData {
  id: number | null;
  role: 'ADMIN' | 'TEAM_MEMBER' | 'VIEWER' | null;
  department: string | null;
}

const DashBoardHome = ({ navigation }: { navigation: any }) => {
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState(0);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [userData, setUserData] = useState<UserData>({
    id: null,
    role: null,
    department: null
  });
  const [allDepartments, setAllDepartments] = useState<{key: string, value: string}[]>([]);
  const [wasteModalVisible, setWasteModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [allWasteModalVisible, setAllWasteModalVisible] = useState(false);
  const [allActionModalVisible, setAllActionModalVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const days = ['Target', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const dayIndexMap: Record<string, number> = {
    'MONDAY': 1,
    'TUESDAY': 2,
    'WEDNESDAY': 3,
    'THURSDAY': 4,
    'FRIDAY': 5,
    'SATURDAY': 6
  };

  const getSecureItem = async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(key);
      } else {
        return await SecureStore.getItemAsync(key);
      }
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return null;
    }
  };

  const fetchUserData = async (): Promise<UserData | null> => {
    try {
      const id = await getSecureItem('userId');
      const role = await getSecureItem('role');
      const department = await getSecureItem('department');

      if (!id || !role || !department) {
        throw new Error('User data not found');
      }

      const user = {
        id: parseInt(id),
        role: role.toUpperCase() as 'ADMIN' | 'TEAM_MEMBER' | 'VIEWER',
        department
      };

      setUserData(user);
      return user;
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load user data');
      navigation.navigate('Login');
      return null;
    }
  };

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const user = await fetchUserData();
      if (!user) return;

      const response = await axios.get(DEPARTMENTS_API);

      const formattedDepts = response.data.map((dept: any) => ({
        key: dept.departmentName.trim(),
        value: dept.departmentName.trim(),
      }));
      setAllDepartments(formattedDepts);

      const transformedData = response.data.map((dept: any) => {
        const indicators = (dept.indicators || [])
          .map((ind: any) => {
            const values = Array(7).fill(null);
            values[0] = ind.targetPerWeek?.toString() || '0';

            (ind.dailyValues || []).forEach((dailyValue: any) => {
              try {
                const dateStr = dailyValue.date;
                const date = new Date(dateStr);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
                const dayIndex = dayIndexMap[dayName];

                if (dayIndex !== undefined && dailyValue.value !== null) {
                  values[dayIndex] = dailyValue.value.toString();
                }
              } catch (e) {
                console.error('Error processing daily value:', e);
              }
            });

            return {
              id: ind.id,
              name: ind.name,
              targetPerWeek: ind.targetPerWeek,
              dailyValues: ind.dailyValues,
              values: values,
            };
          })
          .sort((a: any, b: any) => a.id - b.id); // Sort indicators by `id`

        return {
          id: dept.departmentId,
          name: dept.departmentName.trim(),
          indicators,
          wasteReasons: dept.wasteReasons || [],
          actionItems: dept.actionItems || [],
        };
      });

      setDepartments(transformedData);
      setError(null);

      if (user.role === 'ADMIN' && transformedData.length > 0) {
        setSelectedDepartment(transformedData[0]?.name);
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const addWasteReason = async (reason: string, departmentName: string) => {
    if (userData.role === 'VIEWER') {
      Alert.alert('Error', 'Viewers cannot add waste reasons');
      return;
    }

    setIsAdding(true);
    try {
      const { id, role } = userData;
      if (!id) throw new Error('User ID not found');

      const deptToUse = role === 'TEAM_MEMBER' && userData.department
          ? userData.department
          : departmentName;

      const apiUrl = role === 'ADMIN'
          ? `${ADMIN_API_BASE}/create-waste-reasons/${id}`
          : `${USER_API_BASE}/team-member/create-waste-reasons/${id}`;

      const requestData = role === 'ADMIN'
          ? { reasons: [reason], departmentName: deptToUse }
          : { reasons: [reason] };

      await axios.post(apiUrl, requestData);
      setWasteModalVisible(false);
      fetchDepartments();
      Alert.alert('Success', 'Waste reason added successfully');
    } catch (err: any) {
      console.error('Error adding waste reason:', err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to add waste reason');
    } finally {
      setIsAdding(false);
    }
  };

  const addActionItem = async (action: string, departmentName: string) => {
    if (userData.role === 'VIEWER') {
      Alert.alert('Error', 'Viewers cannot add action items');
      return;
    }

    setIsAdding(true);
    try {
      const { id, role } = userData;
      if (!id) throw new Error('User ID not found');

      const deptToUse = role === 'TEAM_MEMBER' && userData.department
          ? userData.department
          : departmentName;

      const apiUrl = role === 'ADMIN'
          ? `${ADMIN_API_BASE}/create-action-items/${id}`
          : `${USER_API_BASE}/team-member/create-action-items/${id}`;

      const requestData = role === 'ADMIN'
          ? { action, departmentName: deptToUse }
          : { action };

      await axios.post(apiUrl, requestData);
      setActionModalVisible(false);
      fetchDepartments();
      Alert.alert('Success', 'Action item added successfully');
    } catch (err: any) {
      console.error('Error adding action item:', err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to add action item');
    } finally {
      setIsAdding(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      const user = await fetchUserData();
      if (user) {
        await fetchDepartments();
      }
    };
    initializeData();

    const interval = setInterval(fetchDepartments, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (departments.length > 0 && userData.department) {
      const currentDept = userData.role === 'ADMIN'
          ? selectedDepartment || departments[0]?.name
          : userData.department;
      if (currentDept) {
        const deptIndex = departments.findIndex(d => d.name === currentDept);
        if (deptIndex >= 0) {
          setActiveCategory(deptIndex);
        }
      }
    }
  }, [departments, selectedDepartment, userData.department]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDepartments();
  };

  const handlePrevCategory = () => {
    if (activeCategory > 0) {
      setActiveCategory(activeCategory - 1);
      scrollViewRef.current?.scrollTo({ x: 0, animated: true });
    }
  };

  const handleNextCategory = () => {
    if (activeCategory < departments.length - 1) {
      setActiveCategory(activeCategory + 1);
      scrollViewRef.current?.scrollTo({ x: 0, animated: true });
    }
  };

  if (loading && departments.length === 0) {
    return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A6FA5" />
        </View>
    );
  }

  if (error) {
    return (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={48} color="#E74C3C" />
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setError(null);
                fetchDepartments();
              }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
    );
  }

  if (departments.length === 0) {
    return (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="database-remove" size={48} color="#95A5A6" />
          <Text style={styles.emptyText}>No data available</Text>
        </View>
    );
  }

  const currentDepartment = departments[activeCategory];
  const isAdmin = userData.role === 'ADMIN';
  const isViewer = userData.role === 'VIEWER';

  return (
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <MaterialCommunityIcons name="factory" size={28} color="#4A6FA5" />
              <Text style={styles.logoText}>KS Production</Text>
            </View>
            <Text style={styles.headerTitle}>Foaming Project Dashboard</Text>
          </View>
        </View>

        {/* Department Selector */}
        <View style={styles.departmentSelector}>
          <TouchableOpacity
              style={[styles.navButton, activeCategory === 0 && styles.navButtonDisabled]}
              onPress={handlePrevCategory}
              disabled={activeCategory === 0}
          >
            <MaterialCommunityIcons name="chevron-left" size={24} color="#4A6FA5" />
          </TouchableOpacity>

          <Text style={styles.departmentTitle}>{currentDepartment?.name}</Text>

          <TouchableOpacity
              style={[styles.navButton, activeCategory === departments.length - 1 && styles.navButtonDisabled]}
              onPress={handleNextCategory}
              disabled={activeCategory === departments.length - 1}
          >
            <MaterialCommunityIcons name="chevron-right" size={24} color="#4A6FA5" />
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <ScrollView
            contentContainerStyle={styles.scrollContainer}
            refreshControl={
              <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={["#4A6FA5"]}
              />
            }
            ref={scrollViewRef}
        >
          {/* KPIs Table */}
          {currentDepartment?.indicators?.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Weekly Performance</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                >
                  <View style={styles.table}>
                    {/* Table Header */}
                    <View style={styles.tableHeader}>
                      <View style={[styles.tableHeaderCell, styles.firstColumn]}>
                        <Text style={styles.tableHeaderText}>KPI</Text>
                      </View>
                      {days.map((day, index) => (
                          <View
                              key={`day-${index}`}
                              style={[
                                styles.tableHeaderCell,
                                day === 'Target' && styles.targetCell,
                              ]}
                          >
                            <Text style={styles.tableHeaderText}>{day}</Text>
                          </View>
                      ))}
                    </View>

                    {/* Table Rows */}
                    {currentDepartment.indicators.map((indicator) => (
                        <View key={`indicator-${indicator.id}`} style={styles.tableRow}>
                          <View style={[styles.tableCell, styles.firstColumn]}>
                            <Text style={styles.metricText}>{indicator.name}</Text>
                          </View>
                          {indicator.values.map((value, valueIndex) => (
                              <View
                                  key={`value-${valueIndex}`}
                                  style={[
                                    styles.tableCell,
                                    valueIndex === 0 && styles.targetCell,
                                  ]}
                              >
                                <Text style={styles.valueText}>
                                  {value !== null ? value : '-'}
                                </Text>
                              </View>
                          ))}
                        </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
          )}

          {/* Waste Reasons Card */}
          <View style={styles.fullWidthCard}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="alert-octagon" size={20} color="#E74C3C" />
              <Text style={styles.cardTitle}>Top Waste Reasons</Text>
              <View style={styles.cardHeaderActions}>
                {!isViewer && (
                    <TouchableOpacity
                        style={styles.addIcon}
                        onPress={() => setWasteModalVisible(true)}
                    >
                      <MaterialCommunityIcons name="plus" size={24} color="#4A6FA5" />
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={styles.showMoreButton}
                    onPress={() => setAllWasteModalVisible(true)}
                >
                  <Text style={styles.showMoreText}>Show More</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.cardContent}>
              {currentDepartment?.wasteReasons?.length > 0 ? (
                  currentDepartment.wasteReasons.slice(0, 5).map((reason, index) => (
                      <View key={`waste-${index}`} style={styles.listItem}>
                        <Text style={styles.listBullet}>{index + 1}.</Text>
                        <Text style={styles.listText}>{reason.reason}</Text>
                        <Text style={styles.actionTime}>
                          {new Date(reason.createdAt).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Text>
                      </View>
                  ))
              ) : (
                  <Text style={styles.emptyListText}>No waste reasons found</Text>
              )}
            </View>
          </View>

          {/* Action Items Card */}
          <View style={styles.fullWidthCard}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="clipboard-list" size={20} color="#3498DB" />
              <Text style={styles.cardTitle}>Action Items</Text>
              <View style={styles.cardHeaderActions}>
                {!isViewer && (
                    <TouchableOpacity
                        style={styles.addIcon}
                        onPress={() => setActionModalVisible(true)}
                    >
                      <MaterialCommunityIcons name="plus" size={24} color="#4A6FA5" />
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={styles.showMoreButton}
                    onPress={() => setAllActionModalVisible(true)}
                >
                  <Text style={styles.showMoreText}>Show More</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.cardContent}>
              {currentDepartment?.actionItems?.length > 0 ? (
                  currentDepartment.actionItems.slice(0, 5).map((item, index) => (
                      <View key={`action-${index}`} style={styles.actionItem}>
                        <Text style={styles.actionText}>{item.action}</Text>
                        <View style={styles.actionMeta}>
                          <Text style={styles.actionTime}>
                            {new Date(item.createdAt).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Text>
                        </View>
                      </View>
                  ))
              ) : (
                  <Text style={styles.emptyListText}>No action items found</Text>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Modals */}
        {!isViewer && (
            <>
              <WasteReasonModal
                  visible={wasteModalVisible}
                  onClose={() => setWasteModalVisible(false)}
                  onSubmit={addWasteReason}
                  isAdding={isAdding}
                  departments={allDepartments.map(d => d.value)}
                  userRole={userData.role || ''}
                  userDepartment={userData.department || ''}
              />

              <ActionItemModal
                  visible={actionModalVisible}
                  onClose={() => setActionModalVisible(false)}
                  onSubmit={addActionItem}
                  isAdding={isAdding}
                  departments={allDepartments.map(d => d.value)}
                  userRole={userData.role || ''}
                  userDepartment={userData.department || ''}
              />
            </>
        )}

        <AllWasteReasonsModal
            visible={allWasteModalVisible}
            onClose={() => setAllWasteModalVisible(false)}
            wasteReasons={currentDepartment?.wasteReasons || []}
            userId={userData.id || 0}
            refreshData={fetchDepartments}
            isAdmin={isAdmin}
        />

        <AllActionItemsModal
            visible={allActionModalVisible}
            onClose={() => setAllActionModalVisible(false)}
            actionItems={currentDepartment?.actionItems || []}
            userId={userData.id || 0}
            refreshData={fetchDepartments}
            isAdmin={isAdmin}
        />
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 16,
    marginVertical: 16,
    textAlign: 'center',
  },
  emptyText: {
    color: '#95A5A6',
    fontSize: 16,
    marginTop: 16,
  },
  emptyListText: {
    color: '#95A5A6',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: '#4A6FA5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  header: {
    backgroundColor: 'white',
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 10,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A6FA5',
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 16,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  departmentSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  pickerContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
    paddingHorizontal: 10,
  },
  selectBox: {
    borderWidth: 1,
    borderColor: '#ECF0F1',
    borderRadius: 8,
  },
  selectInput: {
    fontSize: 14,
    color: '#2C3E50',
  },
  selectDropdown: {
    borderWidth: 1,
    borderColor: '#ECF0F1',
    borderRadius: 8,
    marginTop: 5,
  },
  departmentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginHorizontal: 20,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  section: {
    margin: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  table: {
    borderRadius: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#4A6FA5',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  tableHeaderCell: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    minWidth: 100,
  },
  tableHeaderText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  targetCell: {
    backgroundColor: '#3A5A80',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  tableCell: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 100,
    justifyContent: 'center',
  },
  firstColumn: {
    minWidth: 150,
    maxWidth: 150,
    borderRightWidth: 1,
    borderRightColor: '#ECF0F1',
  },
  metricText: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  valueText: {
    fontSize: 14,
    color: '#2C3E50',
    textAlign: 'center',
  },
  fullWidthCard: {
    borderRadius: 12,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginLeft: 8,
  },
  cardHeaderActions: {
    flexDirection: 'row',
    marginLeft: 'auto',
    alignItems: 'center',
  },
  cardContent: {
    marginBottom: 12,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listBullet: {
    color: '#E74C3C',
    fontWeight: 'bold',
    marginRight: 8,
    width: 20,
  },
  listText: {
    flex: 1,
    color: '#34495E',
    fontSize: 14,
  },
  actionItem: {
    marginBottom: 12,
  },
  actionText: {
    color: '#34495E',
    fontSize: 14,
    marginBottom: 4,
  },
  actionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionTime: {
    color: '#95A5A6',
    fontSize: 12,
    marginLeft: 8,
    width: 100,
    textAlign: 'right',
  },
  addIcon: {
    padding: 8,
  },
  showMoreButton: {
    padding: 8,
    marginLeft: 8,
  },
  showMoreText: {
    color: '#4A6FA5',
    fontSize: 14,
  },
  navButton: {
    padding: 8,
    borderRadius: 20,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
});

export default DashBoardHome;