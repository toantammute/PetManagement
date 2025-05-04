import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AddPet from './src/addPet';
import Login from './src/login';
import { useAuth } from './context/AuthContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './src/(tabs)/_layout';
import PetDetail from './src/petDetail';
import SignUp from './src/signup';
import Splash from './src/SplashScreen';

import ProductList from './src/products';
import ProductDetailScreen from './src/productDetail';
import CartScreen from './src/cart';
import AddLog from './src/addLog';
import AddSchedule from './src/addSchedule';
import AddAppointment from './src/addAppointment';
import DiaryDetail from './src/diaryDetail';
// import PetDetail from './src/(tabs)/pets';
// import AddPet from './src/addPet';


const Stack = createNativeStackNavigator();


const AppNavigator = () => {
    const { accessToken } = useAuth();
    
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {accessToken ? (
                    <>
                        <Stack.Screen name="Layout" component={Layout} />
                        <Stack.Screen name="AddPet" component={AddPet} />
                        <Stack.Screen name="PetDetail" component={PetDetail} />
                        <Stack.Screen name="ProductList" component={ProductList} />
                        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
                        <Stack.Screen name="Cart" component={CartScreen} />
                        <Stack.Screen name="AddLog" component={AddLog} />
                        <Stack.Screen name="AddSchedule" component={AddSchedule} />
                        <Stack.Screen name="AddAppointment" component={AddAppointment} />
                        <Stack.Screen name="DiaryDetail" component={DiaryDetail} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="Login" component={Login} />
                        <Stack.Screen name="SignUp" component={SignUp} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
