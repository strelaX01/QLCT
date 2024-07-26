import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import axios from 'axios';
import moment from 'moment';
import { BarChart } from 'react-native-gifted-charts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const ReportExCateYearScreen = ({ route }) => {
    const navigation = useNavigation();
    const { categoryId, date } = route.params;
    const [userId, setUserId] = useState(null);
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [{
            data: [],
            color: [],
        }],
    });

    const [categoryName, setCategoryName] = useState('');
    const [totalIncome, setTotalIncome] = useState(0);
    const [year, setYear] = useState(moment(date).format('YYYY'));
    const [annualData, setAnnualData] = useState([]);

    useEffect(() => {
        fetchUserId();
    }, []);

    const fetchUserId = async () => {
        try {
            const userIdFromStorage = await AsyncStorage.getItem('userId');
            if (userIdFromStorage !== null) {
                setUserId(parseInt(userIdFromStorage, 10));
            } else {
                console.error('userId không tồn tại trong AsyncStorage');
            }
        } catch (error) {
            console.error('Lỗi khi lấy userId từ AsyncStorage:', error);
        }
    };

    useEffect(() => {
        if (userId !== null) {
            fetchData(userId, categoryId, year);
        }
    }, [userId, categoryId, year]);

    const fetchData = async (userId, categoryId, year) => {
        try {
            const response = await axios.get(`http://10.0.2.2:3000/getYearlyExpenseReport/${categoryId}`, {
                params: { userId, year }
            });

            if (Array.isArray(response.data)) {
                setCategoryName(response.data[0].category_name);
                prepareChartData(response.data);
                setAnnualData(response.data);
            } else {
                console.error('Dữ liệu không phải là mảng:', response.data);
            }
        } catch (error) {
            console.log('Lỗi khi lấy dữ liệu báo cáo:', error);
        }
    };

    const prepareChartData = (data) => {
        const labels = [];
        const dataset = {
            data: [],
            color: [],
        };

        const monthlyTotals = {};

        data.forEach(item => {
            const month = moment(item.date).month() + 1;
            const amount = item.amount;

            if (!monthlyTotals[month]) {
                monthlyTotals[month] = { total: 0, color: item.category_color };
            }

            monthlyTotals[month].total += amount;
        });

        for (let month = 1; month <= 12; month++) {
            const monthName = moment().month(month - 1).format('MMM');
            labels.push(monthName);
            dataset.data.push(monthlyTotals[month] ? monthlyTotals[month].total : 0);
            dataset.color.push(monthlyTotals[month] ? monthlyTotals[month].color : '#FEC89A');
        }

        setChartData({
            labels,
            datasets: [dataset]
        });

        const total = dataset.data.reduce((acc, val) => acc + val, 0);
        setTotalIncome(total);
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <View style={styles.headerbox}>
                    <TouchableOpacity style={styles.btnback} onPress={() => navigation.goBack()}>
                        <AntDesign name="arrowleft" size={24} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.title}>
                        {`${categoryName} năm ${year}`}
                    </Text>
                </View>
                <BarChart
                    data={chartData.labels.map((label, index) => ({
                        value: chartData.datasets[0].data[index],
                        label,
                        color: chartData.datasets[0].color[index],
                    }))}
                    width={Dimensions.get('window').width - 30}
                    height={250}
                    barWidth={20}
                    frontColor="black"
                    yAxisThickness={0}
                    xAxisThickness={0}
                    xAxisLabelStyle={{ color: '#000000' }}
                    yAxisLabelStyle={{ color: '#000000' }}
                    verticalLabelRotation={0}
                    style={{
                        marginVertical: 8,
                        borderRadius: 16,
                        backgroundColor: '#ffffff',
                    }}
                />
            </View>
            <View style={styles.totalcontainer}>
                <Text style={styles.totaltext}>Tổng:</Text>
                <Text style={styles.incomeamount}>{totalIncome.toLocaleString()}đ</Text>
            </View>
            <ScrollView style={styles.scrollContainer}>
                <View style={styles.monthscontainer}>
                    {chartData.labels.map((label, index) => (
                        <View key={index} style={styles.monthsheader}>
                            <Text>Tháng {index + 1}</Text>
                            <Text style={styles.monthtotal}>{chartData.datasets[0].data[index].toLocaleString()}đ</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    headerContainer: {
        alignItems: 'center',
    },
    headerbox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    btnback: {
        marginRight: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        flex: 1,
        textAlign: 'center',
    },
    totalcontainer: {
        marginTop: 20,
        width: '100%',
        backgroundColor: '#EEEEEE',
        justifyContent: 'space-between',
        flexDirection: 'row',
        padding: 10,
    },
    totaltext: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#888888',
    },
    incomeamount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'red',
    },
    scrollContainer: {
        flex: 1,
    },
    monthscontainer: {
        marginTop: 20,
        width: '100%',
    },
    monthsheader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#DDDDDD',
        padding: 10,
        marginBottom: 5,
    },
    monthtotal: {
        fontWeight: 'bold',
        color: 'red',
    },
});

export default ReportExCateYearScreen;
