import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import axios from 'axios';
import moment from 'moment';
import { BarChart} from 'react-native-gifted-charts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const ReportIncomeCategoryScreen = ({ route }) => {
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
  const [totalExpense, setTotalExpense] = useState(0);
  const [year, setYear] = useState(moment(date).format('YYYY'));
  const [selectedMonth, setSelectedMonth] = useState(moment(date).month() + 1);
  const [monthlyData, setMonthlyData] = useState([]);
  const [selectedMonthData, setSelectedMonthData] = useState([]);
  const [selectedMonthTotalExpense, setSelectedMonthTotalExpense] = useState(0);

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
      fetchCurrentMonthData(userId, categoryId, selectedMonth);
    }
  }, [userId, categoryId, year, selectedMonth]);

  const fetchData = async (userId, categoryId, year) => {
    try {
      const response = await axios.get(`http://10.0.2.2:3000/getMonthlyIncomeReport/${categoryId}`, {
        params: { userId, year }
      });

      if (Array.isArray(response.data)) {
        setCategoryName(response.data[0].category_name);
        prepareChartData(response.data);
        setMonthlyData(response.data);
      } else {
        console.error('Dữ liệu không phải là mảng:', response.data);
      }
    } catch (error) {
      console.log('Lỗi khi lấy dữ liệu báo cáo:', error);
    }
  };

  const fetchCurrentMonthData = async (userId, categoryId, month) => {
    try {
      const response = await axios.get(`http://10.0.2.2:3000/getEachMonthlyIncomeReport/${categoryId}`, {
        params: { userId, year: moment(date).format('YYYY'), month }
      });

      if (Array.isArray(response.data)) {
        setSelectedMonth(month);
        setSelectedMonthData(response.data);
        const total = response.data.reduce((acc, item) => acc + item.amount, 0);
        setSelectedMonthTotalExpense(total);
      } else {
        console.error('Dữ liệu không phải là mảng:', response.data);
      }
    } catch (error) {
      console.log(`Lỗi khi lấy dữ liệu báo cáo cho tháng ${month}:`, error);
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
    setTotalExpense(total);
  };

  const fetchMonthData = (month) => {
    const monthData = monthlyData.filter(d => moment(d.date).month() + 1 === month);
    setSelectedMonthData(monthData);

    const totalExpenseForMonth = monthData.reduce((acc, item) => acc + item.amount, 0);
    setSelectedMonthTotalExpense(totalExpenseForMonth);
  };

  const handleBarPress = (event) => {
    const { label, value } = event;

    const index = chartData.labels.indexOf(label);

    if (index !== -1) {
      const month = index + 1;
      setSelectedMonth(month);
      fetchMonthData(month);
    } else {
      console.error('Label không tìm thấy trong chartData.labels');
    }
  };

  const renderMonthlyItems = () => {
    if (selectedMonthData.length > 0) {
      return (
        <FlatList
          data={selectedMonthData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.itemRow}>
              <View style={styles.dateContainer}>
                <Text style={styles.dateText}>{moment(item.date).format('DD/MM/YYYY')}</Text>
              </View>
              <View style={styles.itemDetails}>
                <AntDesign name={item.category_icon} size={24} color={item.category_color} />
                <Text style={styles.categoryName}>{item.category_name}</Text>
              </View>
              <Text style={styles.itemAmount}>{item.amount.toLocaleString()}đ</Text>
            </View>
          )}
          contentContainerStyle={styles.listContentContainer}
        />
      );
    } else {
      return <Text style={styles.noDataText}>Không có dữ liệu cho tháng này</Text>;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerbox}>
          <TouchableOpacity style={styles.btnback} onPress={() => navigation.goBack()}>
            <AntDesign name="arrowleft" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>
            {`${categoryName} tháng ${selectedMonth ? selectedMonth : 'Tất cả tháng'}: ${selectedMonthTotalExpense.toLocaleString()}đ`}
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
          onPress={(event) => handleBarPress(event)}
        />

        {renderMonthlyItems()}
      </View>
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
    marginBottom: 10,
  },
  btnback: {
    position: 'absolute',
    marginLeft: -70,
    marginTop: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: 10,
    backgroundColor: '#DDDDDD',
    marginVertical: 5,
    borderRadius: 5,
  },
  dateContainer: {
    width: '30%',
  },
  dateText: {
    fontSize: 18,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '30%',
  },
  categoryName: {
    fontSize: 18,
    marginLeft: 5,
  },
  itemAmount: {
    fontSize: 18,
  },
  listContentContainer: {
    paddingBottom: 20,
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },

});

export default ReportIncomeCategoryScreen;
