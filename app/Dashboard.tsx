import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Platform,
    ActivityIndicator,
    Alert,
    TouchableOpacity
} from "react-native";
import {
    createDrawerNavigator,
    DrawerContentScrollView,
    DrawerItemList
} from "@react-navigation/drawer";
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Inter_600SemiBold, Inter_500Medium } from '@expo-google-fonts/inter';
import {
    Home,
    Users,
    UserPlus,
    Building2,
    PlusCircle,
    UserCircle,
    LogOut,
    BarChart3, List, LucideHistory, MessageCircle
} from "lucide-react-native";
import Profile from "./Profile";
import CreateAccount from "./CreateAccount";
import DashBoardHome from "./DashboardHome";
import UsersList from "./UsersList";
import DepartmentList from "./DepartmentList";
import CreateIndicator from "./CreateIndicator";
import AddIndicatorValueScreen from "./AddIndicatorValueScreen";
import * as SecureStore from "expo-secure-store";
import TeamMemberAddValueScreen from "@/app/TeamMemberAddValueScreen";
import IndicatorManagementScreen from "./IndicatorManagementScreen";
import HistoryDashboard from "@/app/HistoryDashboard";
import UpdateIndicatorValue from "./UpdateIndicatorValue";
import userUpdateIndicatorValue from "./userUpdateIndicatorValue"
import ChatbotScreen from './ChatbotScreen';

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => {
    const handleLogout = async () => {
        try {
            if (Platform.OS === "web") {
                localStorage.clear();
            } else {
                await SecureStore.deleteItemAsync("token");
                await SecureStore.deleteItemAsync("userId");
                await SecureStore.deleteItemAsync("role");
                await SecureStore.deleteItemAsync("department");
            }
            props.navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        } catch (error) {
            console.error("Failed to logout:", error);
            Alert.alert("Logout Error", "Failed to logout. Please try again.");
        }
    };

    return (
        <View style={styles.drawerContainer}>
            <LinearGradient
                colors={['#4c669f', '#3b5998', '#192f6a']}
                style={styles.profileSection}
            >
                <View style={styles.profileInfo}>
                    <View style={styles.avatarContainer}>
                        <UserCircle size={60} color="white" strokeWidth={1.5} />
                    </View>
                </View>
            </LinearGradient>

            <DrawerContentScrollView
                {...props}
                contentContainerStyle={styles.drawerContent}
            >
                <DrawerItemList {...props} />
                <View style={styles.logoutContainer}>
                    <View style={styles.separator} />
                    <View style={styles.logoutButton} onTouchEnd={handleLogout}>
                        <LogOut size={24} color="#FF4B4B" />
                        <Text style={styles.logoutText}>Logout</Text>
                    </View>
                </View>
            </DrawerContentScrollView>
        </View>
    );
};

export default function Dashboard() {
    const [userRole, setUserRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [fontsLoaded] = useFonts({
        Inter_600SemiBold,
        Inter_500Medium,
    });

    const fetchUserRole = async () => {
        try {
            setLoading(true);
            let role;
            if (Platform.OS === "web") {
                role = localStorage.getItem("role");
            } else {
                role = await SecureStore.getItemAsync("role");
            }

            if (!role) {
                throw new Error("User role not found in storage");
            }

            setUserRole(role.toUpperCase());
        } catch (error) {
            console.error("Failed to fetch user role:", error);
            Alert.alert("Error", "Failed to load user permissions");
            setUserRole(null);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchUserRole();
        }, [])
    );

    useEffect(() => {
        console.log("Current user role:", userRole);
    }, [userRole]);

    if (!fontsLoaded || loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b5998" />
                <Text style={styles.loadingText}>Loading dashboard...</Text>
            </View>
        );
    }

    if (!userRole) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Unable to verify user permissions</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={fetchUserRole}
                >
                    <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <Drawer.Navigator
            initialRouteName="Home"
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                drawerStyle: styles.drawer,
                drawerActiveBackgroundColor: '#e6e9ff',
                drawerActiveTintColor: '#3b5998',
                drawerInactiveTintColor: '#333',
                drawerLabelStyle: styles.drawerLabel,
                drawerItemStyle: styles.drawerItem,
                drawerIconContainerStyle: styles.drawerIconContainer,
                headerStyle: styles.header,
                headerTintColor: '#fff',
                headerTitleStyle: styles.headerTitle,
            }}
        >
            <Drawer.Screen
                name="Home"
                component={DashBoardHome}
                options={{
                    title: "Dashboard",
                    drawerIcon: ({ color, size }) => <Home size={size} color={color} />
                }}
            />
            <Drawer.Screen
                name="Profile"
                component={Profile}
                options={{
                    title: "My Profile",
                    drawerIcon: ({ color, size }) => <UserCircle size={size} color={color} />
                }}
            />
            <Drawer.Screen
                name="Chatbot"
                component={ChatbotScreen}
                options={{
                    title: "AI Assistant",
                    drawerIcon: ({ color, size }) => <MessageCircle size={size} color={color} />
                }}
            />

            {userRole !== "VIEWER" && (
                <>
                    {userRole === "ADMIN" && (
                        <>
                            <Drawer.Screen
                                name="AddIndicatorValue"
                                component={AddIndicatorValueScreen}
                                options={{
                                    title: "Add Indicator Value",
                                    drawerIcon: ({ color, size }) => <BarChart3 size={size} color={color} />
                                }}
                            />
                            <Drawer.Screen
                                name="UsersList"
                                component={UsersList}
                                options={{
                                    title: "User Management",
                                    drawerIcon: ({ color, size }) => <Users size={size} color={color} />
                                }}
                            />
                            <Drawer.Screen
                                name="CreateAccount"
                                component={CreateAccount}
                                options={{
                                    title: "Create User",
                                    drawerIcon: ({ color, size }) => <UserPlus size={size} color={color} />
                                }}
                            />
                            <Drawer.Screen
                                name="DepartmentList"
                                component={DepartmentList}
                                options={{
                                    title: "Manage Departments",
                                    drawerIcon: ({ color, size }) => <Building2 size={size} color={color} />
                                }}
                            />
                            <Drawer.Screen
                                name="CreateIndicator"
                                component={CreateIndicator}
                                options={{
                                    title: "Create Indicator",
                                    drawerIcon: ({ color, size }) => <PlusCircle size={size} color={color} />
                                }}
                            />
                            <Drawer.Screen
                                name="IndicatorManagement"
                                component={IndicatorManagementScreen}
                                options={{
                                    title: "Indicator Management",
                                    drawerIcon: ({ color, size }) => <List size={size} color={color} />
                                }}
                            />
                            <Drawer.Screen
                                name="UpdateIndicatorValue"
                                component={UpdateIndicatorValue}
                                options={{
                                    title: "Update Indicator Value",
                                    drawerIcon: ({ color, size }) => <BarChart3 size={size} color={color} />
                                }}
                                />
                            <Drawer.Screen
                                name="weeklyReport"
                                component={HistoryDashboard}
                                options={{
                                    title: "Weekly Report",
                                    drawerIcon: ({ color, size }) => <LucideHistory size={size} color={color} />
                                }}
                            />
                        </>
                    )}

                    {userRole === "TEAM_MEMBER" && (
                        <>
                            <Drawer.Screen
                                name="TeamMemberAddValue"
                                component={TeamMemberAddValueScreen}
                                options={{
                                    title: "Add Indicator Value",
                                    drawerIcon: ({ color, size }) => <BarChart3 size={size} color={color} />
                                }}
                            />
                            <Drawer.Screen
                                name="UpdateIndicatorValue"
                                component={userUpdateIndicatorValue}
                                options={{
                                    title: "Update Indicator Value",
                                    drawerIcon: ({ color, size }) => <BarChart3 size={size} color={color} />
                                }}
                            />
                        </>
                    )}
                </>
            )}
        </Drawer.Navigator>
    );
}

const styles = StyleSheet.create({
    drawerContainer: {
        flex: 1,
    },
    profileSection: {
        padding: 20,
        paddingTop: 40,
    },
    profileInfo: {
        alignItems: 'center',
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    drawerContent: {
        flex: 1,
        paddingTop: 10,
    },
    drawer: {
        width: 270,
        backgroundColor: '#fff',
    },
    drawerLabel: {
        fontFamily: 'Inter_500Medium',
        fontSize: 14,
        marginLeft: -12,
    },
    drawerItem: {
        marginVertical: 0,
        paddingHorizontal: 4,
    },
    drawerIconContainer: {
        marginRight: 14,
    },
    header: {
        backgroundColor: '#3b5998',
        elevation: 0,
        shadowOpacity: 0,
    },
    headerTitle: {
        color: '#fff',
        fontFamily: 'Inter_600SemiBold',
    },
    logoutContainer: {
        marginTop: 'auto',
        padding: 20,
    },
    separator: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginBottom: 20,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    logoutText: {
        marginLeft: 32,
        color: '#FF4B4B',
        fontSize: 16,
        fontFamily: 'Inter_600SemiBold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 10,
        color: '#333',
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    errorText: {
        color: '#FF4B4B',
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#3b5998',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
    },
});