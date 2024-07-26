import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { TabView, SceneMap } from 'react-native-tab-view';
import PieChart from 'react-native-pie-chart';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import moment from 'moment';
import Svg, { Text as SvgText, G } from 'react-native-svg';
import axios from 'axios';
const ReportMonthScreen = () => {
  const navigation = useNavigation();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [modalVisible, setModalVisible] = useState(false);
  const [index, setIndex] = useState(0);
  const [userId, setUserId] = useState(null);
  const [incomeData, setIncomeData] = useState({});
  const [expenseData, setExpenseData] = useState({});
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const netAmount = income - expense;


  const [routes] = useState([
    { key: 'income', title: 'báo cáo thu nhập' },
    { key: 'expense', title: 'Báo cáo chi tiêu' },
  ]);

  const widthAndHeight = 250;

  const years = Array.from({ length: 3000 - 2010 + 1 }, (_, index) => 2010 + index);

  useEffect(() => {
    fetchUserId();
  }, [userId]);

  useFocusEffect(
    React.useCallback(() => {
      if (userId !== null) {
        fetchIncomeData(userId, selectedYear, selectedMonth + 1);
        fetchExpenseData(userId, selectedYear, selectedMonth + 1);
      }
    }, [userId, selectedMonth, selectedYear])
  );

  useEffect(() => {
    if (userId !== null) {
      fetchIncomeData(userId, selectedYear, selectedMonth + 1);
      fetchExpenseData(userId, selectedYear, selectedMonth + 1);
    }
  }, [selectedMonth, selectedYear, userId]);

  useEffect(() => {
    if (userId !== null) {
      if (index === 0) {
        fetchIncomeData(userId, selectedYear, selectedMonth + 1);
      } else {
        fetchExpenseData(userId, selectedYear, selectedMonth + 1);
      }
    }
  }, [index, userId, selectedMonth, selectedYear]);

  useEffect(() => {
    const totalIncome = Object.values(incomeData).flat().reduce((acc, item) => acc + item.amount, 0);
    const totalExpense = Object.values(expenseData).flat().reduce((acc, item) => acc + item.amount, 0);
    setIncome(totalIncome);
    setExpense(totalExpense);
  }, [incomeData, expenseData]);


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

  const fetchIncomeData = useCallback(async (userId, year, month) => {
    try {
      const formattedDate = `${year}-${month.toString().padStart(2, '0')}`;
      const response = await axios.get(`http://10.0.2.2:3000/getincome/${userId}?month=${formattedDate}`);
      const incomeByDate = response.data.reduce((acc, item) => {
        const dateKey = moment(item.date).format('YYYY-MMM');
        acc[dateKey] = acc[dateKey] || [];
        acc[dateKey].push(item);
        return acc;
      }, {});
      setIncomeData(incomeByDate);
    } catch (error) {
      console.log('Error fetching income data', error);
    }
  }, []);

  const fetchExpenseData = useCallback(async (userId, year, month) => {
    try {
      const formattedDate = `${year}-${month.toString().padStart(2, '0')}`;
      const response = await axios.get(`http://10.0.2.2:3000/getexpense/${userId}?month=${formattedDate}`);
      const expenseByDate = response.data.reduce((acc, item) => {
        const dateKey = moment(item.date).format('YYYY-MMM');
        acc[dateKey] = acc[dateKey] || [];
        acc[dateKey].push(item);
        return acc;
      }, {});
      setExpenseData(expenseByDate);
    } catch (error) {
      console.log('Error fetching expense data', error);
    }
  }, []);

  const handleSelect = () => {
    setModalVisible(true);
  };

  const handleSubmit = () => {
    setModalVisible(false);
    fetchIncomeData(userId, `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}`);
    fetchExpenseData(userId, `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}`);
  };

  const handlePreviousMonth = () => {
    setSelectedMonth((prev) => (prev === 0 ? 11 : prev - 1));
    if (selectedMonth === 0) {
      setSelectedYear((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    setSelectedMonth((prev) => (prev === 11 ? 0 : prev + 1));
    if (selectedMonth === 11) {
      setSelectedYear((prev) => prev + 1);
    }
  };


  useEffect(() => {
    const currentDate = new Date();
    setSelectedMonth(currentDate.getMonth());
    setSelectedYear(currentDate.getFullYear());
  }, []);

  const getIncomeChartData = () => {
    const series = [];
    const sliceColor = [];
    const labelsSet = new Set(); // Sử dụng Set để lưu trữ các mục duy nhất
    const labelsMap = {}; // Đối tượng để tính tổng số tiền cho mỗi mục

    // Tính tổng thu nhập và thêm dữ liệu vào Set và đối tượng
    Object.values(incomeData).forEach(items => {
      items.forEach(item => {
        if (!labelsSet.has(item.category_name)) {
          labelsSet.add(item.category_name);
          labelsMap[item.category_name] = {
            amount: item.amount,
            color: item.category_color
          };
        } else {
          labelsMap[item.category_name].amount += item.amount;
        }
      });
    });

    // Thêm dữ liệu vào series và sliceColor từ đối tượng labelsMap
    labelsSet.forEach(name => {
      series.push(labelsMap[name].amount);
      sliceColor.push(labelsMap[name].color);
    });

    // Chuyển đổi Set thành mảng labels
    const labels = Array.from(labelsSet).map(name => ({
      name: name,
      amount: labelsMap[name].amount,
      color: labelsMap[name].color
    }));

    return { series, sliceColor, labels };
  };

  const getExpenseChartData = () => {
    const series = [];
    const sliceColor = [];
    const labelsSet = new Set(); // Sử dụng Set để lưu trữ các mục duy nhất
    const labelsMap = {}; // Đối tượng để tính tổng số tiền cho mỗi mục

    // Tính tổng chi tiêu và thêm dữ liệu vào Set và đối tượng
    Object.values(expenseData).forEach(items => {
      items.forEach(item => {
        if (!labelsSet.has(item.category_name)) {
          labelsSet.add(item.category_name);
          labelsMap[item.category_name] = {
            amount: item.amount,
            color: item.category_color
          };
        } else {
          labelsMap[item.category_name].amount += item.amount;
        }
      });
    });

    // Thêm dữ liệu vào series và sliceColor từ đối tượng labelsMap
    labelsSet.forEach(name => {
      series.push(labelsMap[name].amount);
      sliceColor.push(labelsMap[name].color);
    });

    // Chuyển đổi Set thành mảng labels
    const labels = Array.from(labelsSet).map(name => ({
      name: name,
      amount: labelsMap[name].amount,
      color: labelsMap[name].color
    }));

    return { series, sliceColor, labels };
  };

  const { series: seriesIncome, sliceColor: sliceColorIncome, labels: labelsIncome } = getIncomeChartData();
  const { series: seriesExpense, sliceColor: sliceColorExpense, labels: labelsExpense } = getExpenseChartData();


  const date = moment(`${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}`, 'YYYY-MM').format('YYYY-MM');
  
  const renderScene = SceneMap({
    income: () => (
      <View style={styles.chartContainer}>
        {seriesIncome.length > 0 && seriesIncome.reduce((a, b) => a + b, 0) > 0 ? (
          <>
            <PieChart
              widthAndHeight={widthAndHeight}
              series={seriesIncome}
              sliceColor={sliceColorIncome}
              coverRadius={0.45}
              coverFill={'#FFF'}
            />
            <Svg height={widthAndHeight} width={widthAndHeight} style={styles.svg}>
              <G>
                {labelsIncome.map((label, index) => {
                  const total = seriesIncome.reduce((a, b) => a + b, 0);
                  const angle = ((2 * Math.PI) / total) * seriesIncome.slice(0, index).reduce((a, b) => a + b, 0) + ((2 * Math.PI) / total) * (seriesIncome[index] / 2);
                  const radius = widthAndHeight / 2;
                  const labelRadius = radius * 0.75; // Khoảng cách nhãn từ tâm
                  const labelX = radius + labelRadius * Math.cos(angle);
                  const labelY = radius + labelRadius * Math.sin(angle);
                  return (
                    <SvgText
                      key={index}
                      x={labelX}
                      y={labelY}
                      fill={label.color}
                      fontSize="14"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                    </SvgText>
                  );
                })}
              </G>
            </Svg>
            <View style={styles.itemList}>
              {index === 0 && Object.values(incomeData).map((items) => {
                const uniqueItems = {};
                items.forEach(item => {
                  if (!uniqueItems[item.category_id]) {
                    uniqueItems[item.category_id] = {
                      ...item,
                      totalAmount: item.amount
                    };
                  } else {
                    uniqueItems[item.category_id].totalAmount += item.amount;
                  }
                });
  
                return Object.values(uniqueItems).map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.item}
                    onPress={() => navigation.navigate('ReportIncomeCategory', { categoryId: item.category_id, date })}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <AntDesign name={item.category_icon} size={24} color={item.category_color} />
                      <Text style={styles.itemText}>{item.category_name}</Text>
                    </View>
                    <Text style={[styles.itemText, styles.amountIncomeText]}>{item.totalAmount.toLocaleString()}</Text>
                  </TouchableOpacity>
                ));
              })}
            </View>
          </>
        ) : (
          <Text>Không có dữ liệu thu nhập cho tháng này.</Text>
        )}
      </View>
    ),
    expense: () => (
      <View style={styles.chartContainer}>
        {seriesExpense.length > 0 && seriesExpense.reduce((a, b) => a + b, 0) > 0 ? (
          <>
            <PieChart
              widthAndHeight={widthAndHeight}
              series={seriesExpense}
              sliceColor={sliceColorExpense}
              coverRadius={0.45}
              coverFill={'#FFF'}
            />
            <Svg height={widthAndHeight} width={widthAndHeight} style={styles.svg}>
              <G>
                {labelsExpense.map((label, index) => {
                  const total = seriesExpense.reduce((a, b) => a + b, 0);
                  const angle = ((2 * Math.PI) / total) * seriesExpense.slice(0, index).reduce((a, b) => a + b, 0) + ((2 * Math.PI) / total) * (seriesExpense[index] / 2);
                  const radius = widthAndHeight / 2;
                  const labelRadius = radius * 0.75; // Khoảng cách nhãn từ tâm
                  const labelX = radius + labelRadius * Math.cos(angle);
                  const labelY = radius + labelRadius * Math.sin(angle);
                  return (
                    <SvgText
                      key={index}
                      x={labelX}
                      y={labelY}
                      fill={label.color}
                      fontSize="14"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                    </SvgText>
                  );
                })}
              </G>
            </Svg>
            <View style={styles.itemList}>
              {Object.values(expenseData).map((items) => {
                const uniqueItems = {};
                items.forEach(item => {
                  if (!uniqueItems[item.category_id]) {
                    uniqueItems[item.category_id] = {
                      ...item,
                      totalAmount: item.amount
                    };
                  } else {
                    uniqueItems[item.category_id].totalAmount += item.amount;
                  }
                });
  
                return Object.values(uniqueItems).map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.item}
                    onPress={() => navigation.navigate('ReportExpenseCategory', { categoryId: item.category_id, date })}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <AntDesign name={item.category_icon} size={24} color={item.category_color} />
                      <Text style={styles.itemText}>{item.category_name}</Text>
                    </View>
                    <Text style={[styles.itemText, styles.amountExpenseText]}>{item.totalAmount.toLocaleString()}</Text>
                  </TouchableOpacity>
                ));
              })}
            </View>
          </>
        ) : (
          
          <Text>Không có dữ liệu chi tiêu cho tháng này.</Text>
        )}
      </View>
    ),
  });
  



  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.monthYearContainer}>
        <TouchableOpacity onPress={handlePreviousMonth} style={styles.navButton}>
          <Text style={styles.navButtonText}>{'<'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSelect} style={styles.inputField}>
          <Text style={styles.inputText}>
            {selectedMonth + 1} / {selectedYear}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
          <Text style={styles.navButtonText}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.reportContainer}>
        <View style={styles.boxIE}>
          <View style={styles.button}>
            <Text style={styles.buttonTextIncome}>Thu: {income.toLocaleString()}</Text>
          </View>
          <View style={styles.button}>
            <Text style={styles.buttonTextExpense}>Chi: {expense.toLocaleString()}</Text>
          </View>
        </View>
        <View style={styles.buttonIE}>
          <Text style={[styles.reportText, netAmount < 0 ? styles.redText : null]}>
            Tổng thu chi: {netAmount.toLocaleString()}
          </Text>
        </View>
      </View>

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        style={{ marginBottom: 100 }}
        tabBarStyle={styles.tabBar}
        renderTabBar={(props) => (
          <View style={styles.tabBar}>
            {props.navigationState.routes.map((route, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => props.jumpTo(route.key)}
                style={[
                  styles.tabItem,
                  index === i ? styles.activeTab : styles.inactiveTab,
                ]}
              >
                <Text style={index === i ? styles.activeTabText : styles.inactiveTabText}>
                  {route.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Picker
            selectedValue={selectedMonth}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedMonth(itemValue)}
          >
            {Array.from({ length: 12 }, (_, index) => (
              <Picker.Item key={index} label={`Tháng ${index + 1}`} value={index} />
            ))}
          </Picker>
          <Picker
            selectedValue={selectedYear}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedYear(itemValue)}
          >
            {years.map((year) => (
              <Picker.Item key={year} label={`${year}`} value={year} />
            ))}
          </Picker>
          <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
    backgroundColor: '#f0f0f0',
  },
  monthYearContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
    paddingVertical: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputField: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#fff',
    width: '70%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  navButton: {
    marginHorizontal: 10,
    padding: 8,
    borderRadius: 5,
  },
  navButtonText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
  },
  reportContainer: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 10,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  reportText: {
    fontSize: 20,
    marginBottom: 5,
    color: 'green',
    fontWeight: 'bold',
  },
  button: {
    flex: 1,
    alignItems: 'center',
    margin: 5,
    padding: 10,
    borderRadius: 5,
  },
  buttonTextIncome: {
    color: '#00CCFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  buttonTextExpense: {
    color: '#FF9900',
    fontWeight: 'bold',
    fontSize: 18,
  },
  chartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemList: {
    marginTop: 20,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    alignItems: 'center',
    width: '90%',
  },
  itemText: {
    fontSize: 16,
    marginLeft: 10,
  },
  amountText: {
    color: '#FF9900',
    fontWeight: 'bold',
  },
  amountIncomeText: {
    color: '#00CCFF',
  },
  amountExpenseText: {
    color: 'red',
  },
  amountTextExpense: {
    color: 'red',
    fontWeight: 'bold',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: 'white',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: 'blue',
  },
  inactiveTab: {
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabText: {
    color: 'blue',
    fontWeight: 'bold',
  },
  inactiveTabText: {
    color: 'gray',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  picker: {
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  boxIE: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  buttonIE: {
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  redText: {
    color: 'red',
  },

});

export default ReportMonthScreen;
