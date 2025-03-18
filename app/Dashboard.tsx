import React from "react";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import Profile from "./Profile";
import CreateAccount from "./CreateAccount";
import Home from "./Home";
import { DashBoardHome } from "./DashboardHome";
import UsersList from "./UsersList";
import LogoutButton from "./Components/LogoutButton";

const Drawer = createDrawerNavigator();

// Custom Drawer Content Component
const CustomDrawerContent = (props) => {
    return (
        <DrawerContentScrollView {...props}>
            {/* Render the default drawer items */}
            <DrawerItemList {...props} />
            {/* Add the Logout Button at the bottom */}
            <LogoutButton />
        </DrawerContentScrollView>
    );
};

export default function Dashboard() {
    return (
        <Drawer.Navigator
            initialRouteName="Home"
            drawerContent={(props) => <CustomDrawerContent {...props} />}
        >
            <Drawer.Screen name="Home" component={DashBoardHome} />
            <Drawer.Screen name="UsersList" component={UsersList} />
            <Drawer.Screen name="Profile" component={Profile} />
            <Drawer.Screen name="CreateAccount" component={CreateAccount} />
        </Drawer.Navigator>
    );
}