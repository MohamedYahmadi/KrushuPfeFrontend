import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Text,
    RefreshControl,
    Dimensions,
    Modal,
    Alert,
    Platform,
    ActionSheetIOS
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { WebView } from 'react-native-webview';
import * as Print from 'expo-print';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { generatePrintHTML } from "@/app/Templates/Print-Template";

const API_URL = 'http://172.20.10.5:8080/api/admin';
const PRINT_API_URL = `${API_URL}/print-department`;

const HistoryDashboard = () => {
    const insets = useSafeAreaInsets();
    const [activeCategory, setActiveCategory] = useState(0);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [printModalVisible, setPrintModalVisible] = useState(false);
    const [printHtml, setPrintHtml] = useState('');
    const windowWidth = Dimensions.get('window').width;

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const shortDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/weekly-history`);

            const transformedData = response.data.map(dept => ({
                ...dept,
                indicators: dept.indicators.map(indicator => ({
                    ...indicator,
                    weeklyData: indicator.weeklyData.map(week => ({
                        ...week,
                        dailyValuesArray: Object.entries(week.dailyValues)
                            // Sort the days according to our predefined order
                            .sort(([dayA], [dayB]) => {
                                return days.indexOf(dayA) - days.indexOf(dayB);
                            })
                            .map(([day, value]) => ({
                                day,
                                value
                            }))
                    }))
                }))
            }));

            setDepartments(transformedData);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to load history');
            console.error('API Error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handlePrintDepartment = async (departmentId) => {
        try {
            const response = await axios.get(`${PRINT_API_URL}/${departmentId}`);
            const html = generatePrintHTML(response.data);

            if (Platform.OS === 'web') {
                const printWindow = window.open('', '_blank');
                if (!printWindow) {
                    throw new Error('Popup blocked. Please allow popups for this site.');
                }
                printWindow.document.write(html);
                printWindow.document.close();
                setTimeout(() => printWindow.print(), 500);
            } else if (Platform.OS === 'ios') {
                ActionSheetIOS.showActionSheetWithOptions(
                    {
                        options: ['Cancel', 'Preview', 'Save as PDF', 'Print'],
                        cancelButtonIndex: 0,
                    },
                    async (buttonIndex) => {
                        if (buttonIndex === 1) {
                            setPrintHtml(html);
                            setPrintModalVisible(true);
                        } else if (buttonIndex === 2) {
                            await handleSaveAsPDF(html);
                        } else if (buttonIndex === 3) {
                            await handlePrint(html);
                        }
                    }
                );
            } else {
                setPrintHtml(html);
                setPrintModalVisible(true);
            }
        } catch (error) {
            console.error('Print preparation failed:', error);
            let errorMessage = error.message || 'Failed to prepare print document';

            if (error.response) {
                errorMessage = `Server error: ${error.response.status}`;
                if (error.response.status === 404) {
                    errorMessage = 'Department data not found';
                }
            } else if (error.request) {
                errorMessage = 'Network error - could not reach server';
            }

            Alert.alert('Print Error', errorMessage);
        }
    };

    const handleSaveAsPDF = async (html) => {
        try {
            const { uri } = await Print.printToFileAsync({
                html: html || printHtml,
            });
            Alert.alert('Success', `PDF saved to: ${uri}`);
        } catch (error) {
            Alert.alert('Error', 'Failed to save PDF');
        }
    };

    const handlePrint = async (html) => {
        try {
            await Print.printAsync({
                html: html || printHtml,
            });
            setPrintModalVisible(false);
        } catch (error) {
            Alert.alert('Print Failed', error.message);
        }
    };

    useEffect(() => {
        fetchHistory();
        const interval = setInterval(fetchHistory, 60000);
        return () => clearInterval(interval);
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
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={fetchHistory}
                >
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
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
        <>
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
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Text style={styles.logoText}>KS</Text>
                            <View>
                                <Text style={styles.logoSubtitle}>Production</Text>
                                <Text style={styles.logoSubtitle}>System</Text>
                            </View>
                        </View>
                        <Text style={styles.headerTitle}>Weekly Performance History</Text>
                        <TouchableOpacity
                            style={styles.printIconButton}
                            onPress={() => handlePrintDepartment(departments[activeCategory]?.id)}
                        >
                            <Icon name="print" size={24} color="#fff" />
                        </TouchableOpacity>
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
                                            <View style={styles.daysHeader}>
                                                {weekData.dailyValuesArray.map((day, i) => (
                                                    <View key={`header-${i}`} style={styles.dayHeader}>
                                                        <Text style={styles.dayHeaderText}>{day.day.substring(0,2)}</Text>
                                                    </View>
                                                ))}
                                            </View>

                                            <View style={styles.daysValues}>
                                                {weekData.dailyValuesArray.map((day, i) => (
                                                    <View key={`value-${i}`} style={styles.dayValue}>
                                                        <Text style={styles.dayValueText}>
                                                            {day.value || '-'}
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

            <Modal
                visible={printModalVisible}
                animationType="slide"
                onRequestClose={() => setPrintModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <WebView
                        originWhitelist={['*']}
                        source={{ html: printHtml }}
                        style={styles.webview}
                    />
                    <View style={styles.printActions}>
                        <TouchableOpacity
                            style={styles.printActionButton}
                            onPress={() => setPrintModalVisible(false)}
                        >
                            <Text style={styles.printActionText}>Cancel</Text>
                        </TouchableOpacity>
                        {Platform.OS === 'ios' && (
                            <TouchableOpacity
                                style={[styles.printActionButton, styles.printButtonSecondary]}
                                onPress={() => handleSaveAsPDF()}
                            >
                                <Text style={[styles.printActionText, styles.printButtonSecondaryText]}>Save as PDF</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={[styles.printActionButton, styles.printButtonPrimary]}
                            onPress={() => handlePrint()}
                        >
                            <Text style={[styles.printActionText, styles.printButtonPrimaryText]}>Print</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
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
        marginBottom: 15,
    },
    retryButton: {
        backgroundColor: '#6b4c8c',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    retryButtonText: {
        color: 'white',
        fontWeight: 'bold',
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
    printButton: {
        backgroundColor: '#6b4c8c',
        padding: 8,
        borderRadius: 20,
        marginHorizontal: 10,
    },
    printButtonText: {
        color: 'white',
        fontSize: 14,
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
    modalContainer: {
        flex: 1,
        marginTop: 50,
    },
    webview: {
        flex: 1,
    },
    printActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 15,
        backgroundColor: '#f8f8f8',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    printActionButton: {
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#e0e0e0',
        width: '30%',
        alignItems: 'center',
    },
    printActionText: {
        color: '#333',
        fontWeight: 'bold',
    },
    printButtonPrimary: {
        backgroundColor: '#6b4c8c',
    },
    printButtonPrimaryText: {
        color: 'white',
    },
    printButtonSecondary: {
        backgroundColor: '#4a6b8c',
    },
    printButtonSecondaryText: {
        color: 'white',
    },
    printIconButton: {
        backgroundColor: '#6b4c8c',
        padding: 10,
        borderRadius: 50,
        position: 'absolute',
        right: 16,
        top: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
});

export default HistoryDashboard;