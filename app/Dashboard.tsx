import React, { useState } from "react";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import { useFocusEffect } from '@react-navigation/native';
import Profile from "./Profile";
import CreateAccount from "./CreateAccount";
import  DashBoardHome  from "./DashboardHome";
import UsersList from "./UsersList";
import LogoutButton from "./Components/LogoutButton";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const Drawer = createDrawerNavigator();

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

    const fetchUserRole = async () => {
        try {
            let role;
            if (Platform.OS === "web") {
                role = localStorage.getItem("role");
            } else {
                role = await SecureStore.getItemAsync("role");
            }
            setUserRole(role);
        } catch (error) {
            console.error("Failed to fetch user role:", error);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchUserRole();
        }, [])
    );

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