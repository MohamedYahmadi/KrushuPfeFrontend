// DrawerNavigator.tsx
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeDrawer from './HomeDrawer';
import Profile from './Profile';
import CreateAccount from './CreateAccount';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
    return (
        <Drawer.Navigator initialRouteName="HomeDrawer">
            <Drawer.Screen name="HomeDrawer" component={HomeDrawer} />
            <Drawer.Screen name="Profile" component={Profile} />
            <Drawer.Screen name="CreateAccount" component={CreateAccount} />
        </Drawer.Navigator>
    );
}