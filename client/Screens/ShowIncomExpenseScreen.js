import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons';
import moment from 'moment';

const ShowIncomeExpenseScreen = () => {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState('');
  const [incomeData, setIncomeData] = useState({});
  const [expenseData, setExpenseData] = useState({});
  const [userId, setUserId] = useState(null);
  const [currentMonthYear, setCurrentMonthYear] = useState('');
  const scrollViewRef = useRef(null);

  const calculateTotal = (data) => {
    return Object.values(data).reduce((total, items) => {
      return total + items.reduce((sum, item) => sum + parseFloat(item.amount), 0);
    }, 0);
  };

  const formatCurrency = (amount) => {
    return typeof amount === 'number' ? amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : amount;
  };

  const fetchUserIdAndData = useCallback(async () => {
    try {
      const userIdFromStorage = await AsyncStorage.getItem('userId');
      if (userIdFromStorage) {
        const userIdInt = parseInt(userIdFromStorage, 10);
        setUserId(userIdInt);
        await fetchIncomeData(userIdInt, selectedDate);
        await fetchExpenseData(userIdInt, selectedDate);
      }
    } catch (error) {
      console.log('Error fetching userId from AsyncStorage:', error);
    }
  }, [selectedDate]);

  const fetchIncomeData = useCallback(async (userId, date) => {
    try {
      const response = await axios.get(`http://10.0.2.2:3000/getincome/${userId}?month=${date}`);
      const incomeByDate = response.data.reduce((acc, item) => {
        const dateKey = moment(item.date).format('YYYY-MM-DD');
        acc[dateKey] = acc[dateKey] || [];
        acc[dateKey].push(item);
        return acc;
      }, {});
      setIncomeData(incomeByDate);
    } catch (error) {
      console.log('Error fetching income data', error);
    }
  }, []);

  const fetchExpenseData = useCallback(async (userId, date) => {
    try {
      const response = await axios.get(`http://10.0.2.2:3000/getexpense/${userId}?month=${date}`);
      const expenseByDate = response.data.reduce((acc, item) => {
        const dateKey = moment(item.date).format('YYYY-MM-DD');
        acc[dateKey] = acc[dateKey] || [];
        acc[dateKey].push(item);
        return acc;
      }, {});
      setExpenseData(expenseByDate);
    } catch (error) {
      console.log('Error fetching expense data', error);
    }
  }, []);

  useEffect(() => {
    const today = moment().format('YYYY-MM-DD');
    setCurrentMonthYear(today);
    setSelectedDate(today);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUserIdAndData();
    }, [fetchUserIdAndData])
  );

  const handleMonthChange = (month) => {
    const yearMonth = `${month.year}-${month.month < 10 ? '0' + month.month : month.month}-01`;
    setCurrentMonthYear(yearMonth);
    setSelectedDate(yearMonth);
  };

  const HandleEditIncome = (item) => {
    navigation.navigate('EditIncome', {
      id: item.id,
      category_id: item.category_id,
      name: item.category_name,
      amount: item.amount,
      icon: item.category_icon,
      color: item.category_color,
      date: item.date,
    });
  };

  const HandleEditExpress = (item) => {
    navigation.navigate('EditExpense', {
      id: item.id,
      category_id: item.category_id,
      name: item.category_name,
      amount: item.amount,
      icon: item.category_icon,
      color: item.category_color,
      date: item.date,
    });
  };

  const renderDay = (day) => {
    const incomeItems = incomeData[day.dateString] || [];
    const expenseItems = expenseData[day.dateString] || [];

    const totalIncome = calculateTotal({ [day.dateString]: incomeItems });
    const totalExpense = calculateTotal({ [day.dateString]: expenseItems });

    // Đổi định dạng ngày ở đây
    const formattedDate = moment(day.dateString).format('DD-MM-YYYY');

    return (
      <View style={styles.dayContainer}>
        <Text style={styles.dayText}>{formattedDate}</Text>
        <View style={styles.amountContainer}>
          {totalIncome > 0 && <Text style={{ color: '#00CCFF' }}>{formatCurrency(totalIncome)}</Text>}
          {totalExpense > 0 && <Text style={{ color: 'red' }}>{formatCurrency(totalExpense)}</Text>}
          {totalIncome > 0 || totalExpense > 0 ? (
            <Text style={{ color: 'white' }}>
              {totalIncome > 0 ? `+${formatCurrency(totalIncome)}` : ''}
              {totalExpense > 0 ? `-${formatCurrency(totalExpense)}` : ''}
            </Text>
          ) : null}
        </View>
      </View>
    );
  };

  const getMarkedDates = () => {
    const markedDates = {};
    Object.keys(incomeData).forEach(date => {
      markedDates[date] = { dots: [{ key: 'income', color: 'green' }], marked: true };
    });
    Object.keys(expenseData).forEach(date => {
      markedDates[date] = { dots: [{ key: 'expense', color: 'red' }], marked: true };
    });
    return markedDates;
  };

  const totalIncome = calculateTotal(incomeData);
  const totalExpense = calculateTotal(expenseData);
  const totalAmount = totalIncome - totalExpense;

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: findYPosition(day.dateString), animated: true });
    }
  };

  const findYPosition = (dateString) => {
    const allKeys = Object.keys(combinedData);
    const index = allKeys.indexOf(dateString);

    if (index === -1) return 0; // Nếu không tìm thấy, trả về 0

    let position = 0;

    for (let i = 0; i < index; i++) {
      const incomeLength = combinedData[allKeys[i]].income.length;
      const expenseLength = combinedData[allKeys[i]].expense.length;

      position += 100 + (incomeLength > 0 ? (incomeLength * 10) : 0) + (expenseLength > 0 ? (expenseLength * 40) : 0);
    }

    const offset = 50; // Điều chỉnh giá trị này nếu cần
    return position - offset;
  };

  const combinedData = {};

  // Kết hợp dữ liệu thu và chi
  Object.keys(incomeData).forEach(date => {
    if (!combinedData[date]) {
      combinedData[date] = { income: [], expense: [] };
    }
    combinedData[date].income = incomeData[date];
  });

  Object.keys(expenseData).forEach(date => {
    if (!combinedData[date]) {
      combinedData[date] = { income: [], expense: [] };
    }
    combinedData[date].expense = expenseData[date];
  });

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Thu chi</Text>
      <Calendar
        current={currentMonthYear}
        markingType={'custom'}
        markedDates={getMarkedDates()}
        theme={{
          calendarBackground: 'white',
          textSectionTitleColor: 'black',
          dayTextColor: 'black',
          todayTextColor: 'red',
          selectedDayBackgroundColor: 'green',
          monthTextColor: 'black',
          arrowColor: 'black',
          textDisabledColor: 'gray',
        }}
        onDayPress={handleDayPress}
        onMonthChange={handleMonthChange}
      />
      <View style={styles.displayIE}>
        <View style={styles.displayBox}>
          <Text style={{ color: 'black' }}>Thu nhập</Text>
          <Text style={{ color: '#00CCFF' }}>{formatCurrency(totalIncome)}</Text>
        </View>
        <View style={styles.displayBox}>
          <Text style={{ color: 'black' }}>Chi tiêu</Text>
          <Text style={{ color: 'red' }}>{formatCurrency(totalExpense)}</Text>
        </View>
        <View style={styles.displayBox}>
          <Text style={{ color: 'black' }}>Tổng</Text>
          <Text style={{ color: totalAmount >= 0 ? 'green' : 'red' }}>
            {totalAmount >= 0 ? `+${formatCurrency(totalAmount)}` : formatCurrency(totalAmount)}
          </Text>
        </View>
      </View>
      <ScrollView ref={scrollViewRef}>
        {Object.keys(combinedData).map((dateString) => {
          const { income, expense } = combinedData[dateString];

          // Đổi định dạng ngày
          const formattedDate = moment(dateString).format('DD-MM-YYYY');

          // Kiểm tra nếu không có thu nhập và chi tiêu
          if (income.length === 0 && expense.length === 0) {
            return null; // Không hiển thị gì nếu không có dữ liệu
          }

          return (
            <View key={`combined-${dateString}`}>
              <View style={{ backgroundColor: 'gray' }}>
                <Text style={{ color: 'white' }}>{formattedDate}</Text>
              </View>
              {income.length > 0 && (
                <>
                  <Text style={{ color: 'black', marginLeft: 20 }}>Thu nhập:</Text>
                  {income.map((item, itemIndex) => (
                    <View
                      onPress={() => HandleEditIncome(item)}
                      key={`income-${itemIndex}`}
                      style={styles.itemRow}
                    >
                      <View style={styles.itemDetails}>
                        <AntDesign name={item.category_icon} size={24} color={item.category_color} />
                        <Text style={{ color: 'black', marginLeft: 20 }}>{item.category_name}</Text>
                      </View>
                      <Text style={{ color: '#00CCFF', marginLeft: 20 }}>{item.amount}</Text>
                    </View>
                  ))}
                </>
              )}
              {expense.length > 0 && (
                <>
                  <Text style={{ color: 'black', marginLeft: 20 }}>Chi tiêu:</Text>
                  {expense.map((item, itemIndex) => (
                    <View onPress={() => HandleEditExpress(item)} key={`expense-${itemIndex}`} style={styles.itemRow}>
                      <View style={styles.itemDetails}>
                        <AntDesign name={item.category_icon} size={24} color={item.category_color} />
                        <Text style={{ color: 'black', marginLeft: 20 }}>{item.category_name}</Text>
                      </View>
                      <Text style={{ color: 'red', marginLeft: 20 }}>{item.amount}</Text>
                    </View>
                  ))}
                </>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    color: 'black',
    textAlign: 'center',
    marginVertical: 20,
    fontWeight: 'bold',
  },
  displayIE: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  displayBox: {
    marginHorizontal: 5,
    padding: 10,
    alignItems: 'center',
  },
  dayContainer: {
    padding: 10,
  },
  dayText: {
    color: 'white',
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default ShowIncomeExpenseScreen;
