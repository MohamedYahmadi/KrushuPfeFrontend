import React, { useEffect, useState } from "react";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import Profile from "./Profile";
import CreateAccount from "./CreateAccount";
import { DashBoardHome } from "./DashboardHome";
import UsersList from "./UsersList";
import LogoutButton from "./Components/LogoutButton";
import * as SecureStore from "expo-secure-store";
import {Platform} from "react-native";

const Drawer = createDrawerNavigator();

// Custom Drawer Content Component
const CustomDrawerContent = (props) => {
    return (
        <DrawerContentScrollView {...props}>
            <DrawerItemList {...props} />
            <LogoutButton />
        </DrawerContentScrollView>
    );
};

export default function Dashboard() {
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                if (Platform.OS === "web") {
                    const role = localStorage.getItem("role");
                    setUserRole(role);
                } else {
                    const role = await SecureStore.getItemAsync("role");
                    setUserRole(role);
                }
            } catch (error) {
                console.error("Failed to fetch user role:", error);
            }
        };

        fetchUserRole();
    }, []);

    return (
        <Drawer.Navigator
            initialRouteName="Home"
            drawerContent={(props) => <CustomDrawerContent {...props} />}
        >
            <Drawer.Screen name="Home" component={DashBoardHome} />
            <Drawer.Screen name="Profile" component={Profile} />
            {userRole === "Admin" && (
                <>
                    <Drawer.Screen name="UsersList" component={UsersList} />
                    <Drawer.Screen name="CreateAccount" component={CreateAccount} />
                </>
            )}
        </Drawer.Navigator>
    );
}