import React from "react";
import { View, Text, StyleSheet } from "react-native";
import DrawerNavigator from "./DrawerNavigator";
import { createDrawerNavigator } from "@react-navigation/drawer";
import Profile from "./Profile";
import CreateAccount from "./CreateAccount";
import Home from "./Home";
import { DashBoardHome } from "./DashboardHome";
import UsersList from "./UsersList";

const Drawer = createDrawerNavigator();

export default function Dashboard() {
  return (
    <Drawer.Navigator initialRouteName="Home">
      <Drawer.Screen name="Home" component={DashBoardHome} />
      <Drawer.Screen name="UsersList" component={UsersList} />
      <Drawer.Screen name="Profile" component={Profile} />
      <Drawer.Screen name="CreateAccount" component={CreateAccount} />
    </Drawer.Navigator>
  );
}
