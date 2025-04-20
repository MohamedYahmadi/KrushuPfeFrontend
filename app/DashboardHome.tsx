import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Text, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';

const API_URL = 'http://172.20.10.5:8080/api/admin/indicators-by-department';

const DashBoardHome = () => {
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState(0);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const scrollViewRef = useRef(null);
  const windowWidth = Dimensions.get('window').width;

  const days = ['Target', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const actionItems = [
    "1) Assurer do no speed, la documentation - selon la variante",
    "2) Ajustement Machine + Supervision avec la variante",
    "3) Simplification workflow by process & travail (Supervision) avec la variante"
  ];

  const topWasteReasons = [
    "1) Scrap vs Unpack",
    "2) Downtime / Waiting",
    "3) Inventory"
  ];

  const dayIndexMap = {
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6
  };

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);

      const now = new Date();
      const dayOfWeek = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      monday.setHours(0, 0, 0, 0);

      const transformedData = response.data.map(dept => ({
        id: dept.departmentId,
        name: dept.departmentName.trim(),
        indicators: (dept.indicators || []).map(ind => {

          const values = [
            ind.targetPerWeek,
            ...Array(6).fill(null)
          ];


          (ind.dailyValues || []).forEach(dailyValue => {
            const date = new Date(dailyValue.date);
            if (date >= monday) {
              const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
              const dayIndex = dayIndexMap[dayName];
              if (dayIndex && dayIndex <= 6) {
                values[dayIndex] = dailyValue.value;
              }
            }
          });

          return {
            id: ind.id,
            name: ind.name,
            target: ind.targetPerWeek,
            values: values
          };
        })
      }));

      setDepartments(transformedData);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDepartments();
  };

  const handlePrevCategory = () => {
    if (activeCategory > 0) {
      setActiveCategory(activeCategory - 1);
    }
  };

  const handleNextCategory = () => {
    if (activeCategory < departments.length - 1) {
      setActiveCategory(activeCategory + 1);
    }
  };

  if (loading) {
    return (
        <View style={[styles.container, styles.centerContainer]}>
          <Text>Loading data...</Text>
        </View>
    );
  }

  if (error) {
    return (
        <View style={[styles.container, styles.centerContainer]}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
    );
  }

  if (departments.length === 0) {
    return (
        <View style={[styles.container, styles.centerContainer]}>
          <Text>No data available</Text>
        </View>
    );
  }

  const tableWidth = 150 + (days.length * 80) + 200;
  const isTableWiderThanScreen = tableWidth > windowWidth;

  return (
      <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#6200ee"]}
            />
          }
      >
        <View style={[styles.container, { paddingTop: insets.top }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>KS</Text>
              <View>
                <Text style={styles.logoSubtitle}>Production</Text>
                <Text style={styles.logoSubtitle}>System</Text>
              </View>
            </View>
            <Text style={styles.headerTitle}>Shop Floor Management Foaming PROJECT</Text>
          </View>

          <View style={styles.categoryNavigation}>
            <TouchableOpacity
                style={[styles.navButton, activeCategory === 0 && styles.navButtonDisabled]}
                onPress={handlePrevCategory}
                disabled={activeCategory === 0}
            >
              <Text style={styles.navButtonText}>{"<"}</Text>
            </TouchableOpacity>
            <Text style={styles.categoryTitle}>{departments[activeCategory]?.name}</Text>
            <TouchableOpacity
                style={[styles.navButton, activeCategory === departments.length - 1 && styles.navButtonDisabled]}
                onPress={handleNextCategory}
                disabled={activeCategory === departments.length - 1}
            >
              <Text style={styles.navButtonText}>{">"}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              ref={scrollViewRef}
              style={styles.horizontalScrollView}
          >
            <View style={styles.tableContainer}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <View style={styles.categoryCell}>
                  <Text style={styles.headerText}>KPI</Text>
                </View>
                {days.map((day, index) => (
                    <View
                        key={`day-${index}`}
                        style={[
                          styles.dayCell,
                          day === 'Target' ? styles.targetCell : null,
                          index === 0 ? styles.firstColumn : null,
                        ]}
                    >
                      <Text style={styles.headerText}>{day}</Text>
                    </View>
                ))}
                <View style={[styles.notesCell, styles.lastColumn]}>
                  <Text style={styles.headerText}>Top waste per day - Reasons</Text>
                </View>
              </View>


              {departments[activeCategory]?.indicators?.map((indicator, index) => (
                  <View key={`indicator-${indicator.id || index}`} style={styles.metricRow}>
                    <View style={styles.categoryCell}>
                      <Text style={styles.metricText}>{indicator.name}</Text>
                    </View>
                    {indicator.values.map((value, valueIndex) => (
                        <View
                            key={`value-${valueIndex}`}
                            style={[
                              styles.valueCell,
                              valueIndex === 0 ? styles.targetCell : null,
                              valueIndex === 0 ? styles.firstColumn : null,
                            ]}
                        >
                          <Text style={styles.valueText}>
                            {value !== null ? value : '-'}
                          </Text>
                        </View>
                    ))}
                    {index < topWasteReasons.length ? (
                        <View style={[styles.notesCell, styles.lastColumn]}>
                          <Text style={styles.notesText}>{topWasteReasons[index]}</Text>
                        </View>
                    ) : (
                        <View style={[styles.notesCell, styles.lastColumn]} />
                    )}
                  </View>
              ))}
            </View>
          </ScrollView>

          {isTableWiderThanScreen && (
              <View style={styles.scrollIndicator}>
                <Text style={styles.scrollIndicatorText}>← Swipe to see more →</Text>
              </View>
          )}

          <View style={styles.actionSection}>
            <View style={styles.actionHeader}>
              <Text style={styles.actionHeaderText}>Action Settings</Text>
            </View>
            <View style={styles.actionSubHeader}>
              <Text style={styles.actionSubHeaderText}>Action</Text>
            </View>
            <View style={styles.actionItems}>
              {actionItems.map((item, index) => (
                  <Text key={`action-${index}`} style={styles.actionItemText}>{item}</Text>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  errorText: {
    color: 'red',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6b4c8c',
    marginRight: 5,
  },
  logoSubtitle: {
    fontSize: 12,
    color: '#6b4c8c',
    lineHeight: 14,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  categoryNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  navButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 10,
  },
  navButtonDisabled: {
    backgroundColor: '#f8f8f8',
  },
  navButtonText: {
    fontSize: 18,
    color: '#6b4c8c',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6b4c8c',
    paddingHorizontal: 20,
  },
  horizontalScrollView: {
    flex: 1,
  },
  tableContainer: {
    margin: 16,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#6b4c8c',
  },
  categoryCell: {
    width: 150,
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: '#8a6bab',
    justifyContent: 'center',
  },
  dayCell: {
    width: 80,
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: '#8a6bab',
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetCell: {
    backgroundColor: '#8a6bab',
  },
  firstColumn: {
    borderLeftWidth: 2,
    borderLeftColor: '#8a6bab',
  },
  lastColumn: {
    borderRightWidth: 2,
    borderRightColor: '#8a6bab',
  },
  notesCell: {
    width: 200,
    padding: 12,
    justifyContent: 'center',
  },
  headerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  metricRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  metricText: {
    fontSize: 14,
    color: '#333',
  },
  valueCell: {
    width: 80,
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#333',
  },
  notesText: {
    fontSize: 14,
    color: '#333',
  },
  scrollIndicator: {
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: 'rgba(107, 76, 140, 0.1)',
  },
  scrollIndicatorText: {
    fontSize: 12,
    color: '#6b4c8c',
  },
  actionSection: {
    margin: 16,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionHeader: {
    backgroundColor: '#6b4c8c',
    padding: 12,
  },
  actionHeaderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  actionSubHeader: {
    backgroundColor: '#8a6bab',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  actionSubHeaderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  actionItems: {
    padding: 16,
  },
  actionItemText: {
    fontSize: 14,
    marginBottom: 10,
    color: '#333',
  },
});

export default DashBoardHome;