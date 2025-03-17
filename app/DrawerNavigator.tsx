import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import Dashboard from "./Dashboard";
import Profile from "./Profile";
import CreateAccount from "./CreateAccount";
import Home from "./Home";

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator initialRouteName="Home">
      <Drawer.Screen name="Home" component={Profile} />
      <Drawer.Screen name="Dashboard" component={Dashboard} />
      <Drawer.Screen name="Profile" component={Profile} />
      <Drawer.Screen name="CreateAccount" component={CreateAccount} />
    </Drawer.Navigator>
  );
}
