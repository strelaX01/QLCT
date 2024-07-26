import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import IncomeCategoryScreen from './IncomeCategoryScreen';
import ExpenseCategoryScreen from './ExpenseCategoryScreen';
import { useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';

const initialLayout = { width: 400 };

const CategoryTabView = ({ route }) => {
    const navigation = useNavigation();
    const initialIndex = route.params?.initialIndex || 0; // Sử dụng initialIndex từ route.params nếu có, mặc định là 0

    const [index, setIndex] = useState(initialIndex);
    const [routes] = useState([
        { key: 'income', title: 'Tiền thu' },
        { key: 'expense', title: 'Tiền chi' },
    ]);

    useEffect(() => {
        setIndex(initialIndex); // Cập nhật index khi initialIndex thay đổi
    }, [initialIndex]);

    const handleBack = () => {
        navigation.goBack();
    }

    const renderScene = SceneMap({
        income: IncomeCategoryScreen,
        expense: ExpenseCategoryScreen,
    });

    const renderTabBar = props => (
        <View>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <AntDesign name="arrowleft" size={24} color="black" />
            </TouchableOpacity>
            <TabBar
                {...props}
                style={styles.tabBar}
                labelStyle={styles.tabBarLabel}
                indicatorStyle={styles.tabBarIndicator}
                swipeEnabled={false}
            />
        </View>
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
    );
}

export default CategoryTabView;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    tabBar: {
        backgroundColor: '#C0C0C0',
        height: 40,
        width: 200,
        borderRadius: 20,
        marginTop: 30,
        alignSelf: 'center',
    },
    tabBarLabel: {
        fontSize: 12,
        color: 'black',
    },
    backButton: {
        position: 'absolute',
        left: 10,
        top: 35,
        zIndex: 1,
    },
});
