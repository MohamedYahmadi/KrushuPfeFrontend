                    import * as React from 'react';
                    import { createNativeStackNavigator } from '@react-navigation/native-stack';
                    import Home from './Home';
                    import Login from './Login';
                    import ResetPassword from './ResetPassword';
                    import CreateAccount from './CreateAccount';
                    import Dashboard from './Dashboard';
                    import MainDrawerNavigator from './DrawerNavigator';
                    import { RootStackParamList } from './types';

                    const Stack = createNativeStackNavigator<RootStackParamList>();

                    const App = () => {
                        return (
                            <Stack.Navigator initialRouteName="Home">
                                <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
                                <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
                                <Stack.Screen name="ResetPassword" component={ResetPassword} options={{ headerShown: false }} />
                                <Stack.Screen name="CreateAccount" component={CreateAccount} options={{ headerShown: false }} />
                                <Stack.Screen name="DrawerNavigator" component={MainDrawerNavigator} options={{ headerShown: false }} />
                                <Stack.Screen name="Dashboard" component={Dashboard} options={{ headerShown: false }} />
                            </Stack.Navigator>
                        );
                    };

                    export default App;