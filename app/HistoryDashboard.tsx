import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, RefreshControl, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';

const API_URL = 'http://172.20.10.5:8080/api/admin/weekly-history';

const HistoryDashboard = () => {
    const insets = useSafeAreaInsets();
    const [activeCategory, setActiveCategory] = useState(0);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const windowWidth = Dimensions.get('window').width;

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const shortDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const response = await axios.get(API_URL);
            setDepartments(response.data);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to load history');
            console.error('API Error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchHistory();
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
                <Text>Loading history data...</Text>
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
                <Text>No historical data available</Text>
            </View>
        );
    }

    return (
        <ScrollView
            contentContainerStyle={styles.scrollContainer}
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
                    <Text style={styles.headerTitle}>Weekly Performance History</Text>
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

                {departments[activeCategory]?.indicators?.map(indicator => (
                    <View key={`indicator-${indicator.id}`} style={styles.indicatorCard}>
                        <View style={styles.indicatorHeader}>
                            <Text style={styles.indicatorName}>{indicator.name}</Text>
                            <Text style={styles.indicatorTarget}>Target: {indicator.target}</Text>
                        </View>

                        {indicator.weeklyData.map((weekData, weekIndex) => (
                            <View key={`week-${weekIndex}`} style={styles.weekCard}>
                                <View style={styles.weekHeader}>
                                    <Text style={styles.weekLabel}>{weekData.weekLabel}</Text>
                                    <Text style={styles.weekDates}>{weekData.dateRange}</Text>
                                </View>

                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <View style={styles.daysContainer}>
                                        {/* Day Headers */}
                                        <View style={styles.daysHeader}>
                                            {shortDays.map((day, i) => (
                                                <View key={`header-${i}`} style={styles.dayHeader}>
                                                    <Text style={styles.dayHeaderText}>{day}</Text>
                                                </View>
                                            ))}
                                        </View>

                                        <View style={styles.daysValues}>
                                            {days.map(day => (
                                                <View key={`value-${day}`} style={styles.dayValue}>
                                                    <Text style={styles.dayValueText}>
                                                        {weekData.dailyValues[day] || '-'}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                </ScrollView>
                            </View>
                        ))}
                    </View>
                ))}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    centerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: '#d9534f',
        textAlign: 'center',
    },
    header: {
        backgroundColor: '#fff',
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        elevation: 2,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
    },
    logoText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#6b4c8c',
        marginRight: 8,
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
        opacity: 0.5,
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
    indicatorCard: {
        margin: 16,
        borderRadius: 8,
        backgroundColor: '#fff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        overflow: 'hidden',
    },
    indicatorHeader: {
        backgroundColor: '#6b4c8c',
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    indicatorName: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    indicatorTarget: {
        color: '#fff',
        fontSize: 14,
    },
    weekCard: {
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    weekHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    weekLabel: {
        fontWeight: 'bold',
        color: '#6b4c8c',
    },
    weekDates: {
        color: '#666',
    },
    daysContainer: {
        minWidth: '100%',
    },
    daysHeader: {
        flexDirection: 'row',
        backgroundColor: '#8a6bab',
    },
    dayHeader: {
        width: 60,
        padding: 10,
        alignItems: 'center',
        borderRightWidth: 1,
        borderRightColor: '#9d7cbb',
    },
    dayHeaderText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    daysValues: {
        flexDirection: 'row',
    },
    dayValue: {
        width: 60,
        padding: 12,
        alignItems: 'center',
        borderRightWidth: 1,
        borderRightColor: '#f0f0f0',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    dayValueText: {
        fontSize: 14,
        color: '#333',
    },
});

export default HistoryDashboard;