import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import ReportMonthScreen from './ReportMonthScreen';
import ReportYearScreen from './ReportYearScreen';
const initialLayout = { width: 400 };

const ReportTabView = ({ route }) => {
  const navigation = useNavigation();
    const initialIndex = route.params?.initialIndex || 0; 

    const [index, setIndex] = useState(initialIndex);
    const [routes] = useState([
        { key: 'month', title: 'Hàng tháng' },
        { key: 'year', title: 'Hàng năm' },
    ]);

    useEffect(() => {
        setIndex(initialIndex); 
    }, [initialIndex]);

    const handleBack = () => {
        navigation.goBack();
    }

    const renderScene = SceneMap({
      month: ReportMonthScreen,
      year: ReportYearScreen,
    });

    const renderTabBar = props => (
        <View>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <AntDesign name="arrowleft" size={24} color="white" />
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

export default ReportTabView

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
backButton: {
    position: 'absolute',
    left: 10,
    top: 35,
    zIndex: 1,
},
})