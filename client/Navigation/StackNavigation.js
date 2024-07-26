import { KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LoginScreen from '../Screens/LoginScreen';
import HomeScreen from '../Screens/HomeScreen';
import { Entypo } from "@expo/vector-icons";
import { FontAwesome } from '@expo/vector-icons';
import { AntDesign } from "@expo/vector-icons";
import { FontAwesome6 } from '@expo/vector-icons';
import RegisterScreen from '../Screens/RegisterScreen';
import ShowIncomeExpenseScreen from '../Screens/ShowIncomExpenseScreen';
import IncomeCategoryScreen from '../Screens/IncomeCategoryScreen';
import CategoryTabView from '../Screens/CategoryTabView';
import ExpenseCategoryScreen from '../Screens/ExpenseCategoryScreen';
import AddIncomeCategoryScreen from '../Screens/AddIncomeCategoryScreen';
import AddExpenseCategoryScreen from '../Screens/AddExpenseCategoryScreen';
import EditIncomeCategoryScreen from '../Screens/EditIncomeCategoryScreen';
import EditExpenseCategoryScreen from '../Screens/EditExpenseCategoryScreen';
import EditIncomeScreen from '../Screens/EditIncomeScreen';
import EditExpenseScreen from '../Screens/EditExpenseScreen';
import ReportTabView from '../Screens/ReportTabView';
import ReportMonthScreen from '../Screens/ReportMonthScreen';
import ReportYearScreen from '../Screens/ReportYearScreen';
import ProfileSreen from '../Screens/ProfileSreen';
import ReportIncomeCategoryScreen from '../Screens/ReportIncomeCategoryScreen';
import ReportExpenseCategoryScreen from '../Screens/ReportExpenseCategoryScreen';
import ReportInCateYearScreen from '../Screens/ReportInCateYearScreen';
import ReportExCateYearScreen from '../Screens/ReportExCateYearScreen';
import ListExpenseScreen from '../Screens/ListExpenseScreen';
import ListIncomeScreen from '../Screens/ListIncomeScreen';
const StackNavigation = () => {
  const Stack = createNativeStackNavigator();
  const Tab = createBottomTabNavigator();
  const CustomTabLabel = ({ focused, label }) => {
    return <Text style={{ color: focused ? '#3399FF' : '#696969' }}>{label}</Text>;
  };
  function BottomTab() {
    return (
      <SafeAreaView style={{flex:1}}>
        <KeyboardAvoidingView 
         style={{flex:1}}
         behavior={Platform.OS === 'android' ? 'height' : undefined}
         keyboardVerticalOffset={Platform.OS === 'android' ? -100 : 0}>
      <Tab.Navigator screenOptions={{ tabBarStyle: { backgroundColor: "#E5E6E8" } }}>
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: ({ focused }) => <CustomTabLabel focused={focused} label="Trang chủ" />,
            tabBarLabelStyle: { color: "#008E97" },
            headerShown: false,
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Entypo name="home" size={24} color="#3399FF" />
              ) : (
                <AntDesign name="home" size={24} color="#696969" />
              ),
          }}
        />

        <Tab.Screen
          name="ShowIncomeExpense"
          component={ShowIncomeExpenseScreen}
          options={{
            tabBarLabel: ({ focused }) => <CustomTabLabel focused={focused} label="Thu chi" />,
            tabBarLabelStyle: { color: "#008E97" },
            headerShown: false,
            tabBarIcon: ({ focused }) =>
              focused ? (
                <FontAwesome name="calendar" size={24} color="#3399FF" />
              ) : (
                <FontAwesome name="calendar" size={24} color="#696969" />
              ),
          }}
        />
        <Tab.Screen
          name="Report"
          component={ReportTabView}
          options={{
            tabBarLabel: ({ focused }) => <CustomTabLabel focused={focused} label="Báo cáo" />,
            tabBarLabelStyle: { color: "#008E97" },
            headerShown: false,
            tabBarIcon: ({ focused }) =>
              focused ? (
                <FontAwesome6 name="book" size={24} color="#3399FF" />
              ) : (
                <FontAwesome6 name="book" size={24} color="#696969" />
              ),
          }}
        />
         <Tab.Screen
          name="Profle"
          component={ProfileSreen}
          options={{
            tabBarLabel: ({ focused }) => <CustomTabLabel focused={focused} label="Cá nhân" />,
            tabBarLabelStyle: { color: "#008E97" },
            headerShown: false,
            tabBarIcon: ({ focused }) =>
              focused ? (
                <AntDesign name="user" size={24} color="#3399FF" />
              ) : (
                <AntDesign name="user" size={24} color="#696969" />
              ),
          }}
        />
      </Tab.Navigator>
      </KeyboardAvoidingView>
      </SafeAreaView>
    )
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AddIncomeCategory" component={AddIncomeCategoryScreen} options={{ headerShown: false }} />
        <Stack.Screen name="EditIncomeCategory" component={EditIncomeCategoryScreen} options={{ headerShown: false }} />
        <Stack.Screen name="EditExpenseCategory" component={EditExpenseCategoryScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AddExpenseCategory" component={AddExpenseCategoryScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ExpenseCategory" component={ExpenseCategoryScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CategoryTabView" component={CategoryTabView} options={{ headerShown: false }} />
        <Stack.Screen name="ReportMonth" component={ReportMonthScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ReportYear" component={ReportYearScreen} options={{ headerShown: false }} />
        <Stack.Screen name="IncomeCategory" component={EditIncomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="EditIncome" component={EditIncomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="EditExpense" component={EditExpenseScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ReportIncomeCategory" component={ReportIncomeCategoryScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ReportExpenseCategory" component={ReportExpenseCategoryScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ReportInCateYear" component={ReportInCateYearScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ReportExCateYear" component={ReportExCateYearScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ListExpense" component={ListExpenseScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ListIncome" component={ListIncomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="BottomTabs" component={BottomTab} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default StackNavigation

const styles = StyleSheet.create({})