import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import IncomeHomeScreen from './IncomeHomeScreen';
import ExpenseHomeScreen from './ExpenseHomeScreen';

const initialLayout = { width: 400 };

const HomeScreen = () => {
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'income', title: 'Quản lý thu nhâp' },
        { key: 'expense', title: 'Quản lý chi tiêu' },

    ]);

    const renderScene = SceneMap({
        income: IncomeHomeScreen,
        expense: ExpenseHomeScreen,
    });

    const renderTabBar = props => (
        <TabBar
            {...props}
            style={styles.tabBar}
            labelStyle={styles.tabBarLabel}
            indicatorStyle={styles.tabBarIndicator}
        />

    );
    return (
        <View style={styles.container}>
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={initialLayout}
                renderTabBar={renderTabBar}
            />
        </View>
    )
}

export default HomeScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scene: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabBar: {
        backgroundColor: '#C0C0C0',
        height: 40,
        width: 300,
        borderRadius: 20,
        marginTop: 30,
        alignSelf: 'center',

    },
    tabBarLabel: {
        fontSize: 12,
        color: '#000000',
        fontWeight: 'bold',
    },
})