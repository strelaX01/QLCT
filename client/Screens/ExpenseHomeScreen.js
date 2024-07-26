import React, { useState, useCallback, useRef } from 'react';
import {
    StyleSheet, View, Text, TouchableOpacity, RefreshControl,
    TouchableWithoutFeedback, TextInput, FlatList, Alert, ScrollView,
    Modal
}
    from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AntDesign } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';
import moment from 'moment';

const ExpenseHomeScreen = () => {
    const [chosenDate, setChosenDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const navigation = useNavigation();
    const [userId, setUserId] = useState(null);
    const [categories, setCategories] = useState([]);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [incomeData, setIncomeData] = useState({});
    const scrollViewRef = useRef(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
    const [income, setIncome] = useState(null);



    useFocusEffect(
        useCallback(() => {
            fetchUserId();
        }, [])
    );

    useFocusEffect(
        useCallback(() => {
            fetchCategories();
        }, [userId])
    );

    useFocusEffect(
        useCallback(() => {
            if (userId) {
                fetchExpenseData(userId, moment(chosenDate).format('YYYY-MM-DD'));
            }
        }, [userId, chosenDate])
    );


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

    const fetchCategories = useCallback(async () => {
        try {
            const isConnected = await isNetworkConnected();

            if (isConnected) {
                const response = await axios.post('http://10.0.2.2:3000/GetExpenseCategories', { userId });
                setCategories(response.data);
            } else {
                Alert.alert('Thông báo', 'Không có kết nối mạng. Không thể lấy danh mục.');
                setCategories([]);
            }
        } catch (error) {
            Alert.alert('Thông báo', 'Lỗi khi lấy danh sách danh mục');
        } finally {
            setRefreshing(false);
        }
    }, [userId]);


    const fetchExpenseData = useCallback(async (userId, date) => {
        try {
            const response = await axios.get(`http://10.0.2.2:3000/getexpenseday/${userId}?date=${date}`);
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



    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchCategories().then(() => setRefreshing(false));
    }, [fetchCategories]);

    const isNetworkConnected = async () => {
        const state = await NetInfo.fetch();
        return state.isConnected;
    };

    const renderCategoryItem = ({ item }) => {
        const selectCategory = () => {
            setSelectedCategory(item);
        };

        return (
            <TouchableOpacity
                style={[
                    styles.categoryItem,
                    selectedCategory === item && styles.selectedCategoryContainer
                ]}
                onPress={selectCategory}
            >
                <View style={styles.categoryContent}>
                    <AntDesign name={item.icon} size={24} color={item.color} style={styles.categoryIcon} />
                    <Text style={styles.categoryText}>{item.category_name}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    const saveexpense = async () => {
        if (!selectedCategory || !selectedCategory.id) {
            Alert.alert('Thông báo', 'Vui lòng chọn danh mục trước khi lưu.');
            return;
        }

        if (isNaN(amount) || parseFloat(amount) <= 0) {
            Alert.alert('Lỗi lưu chi tiêu', 'Số tiền phải là một số hợp lệ và lớn hơn 0');
            return;
        }

        const incomeData = {
            userId: userId,
            category_id: selectedCategory.id,
            amount: amount,
            description: description,
            date: chosenDate.toISOString().split('T')[0],
        };

        try {
            const isConnected = await isNetworkConnected();

            if (isConnected) {
                // Nếu có kết nối, gửi yêu cầu lưu thu nhập lên máy chủ
                const response = await axios.post('http://10.0.2.2:3000/saveexpense', incomeData);
                if (response.status === 201) {
                    Alert.alert('Thông báo', 'Lưu chi tiêu thành công.');
                    setAmount('');
                    setDescription('');
                    setSelectedCategory(null);
                    fetchExpenseData(userId, moment(chosenDate).format('YYYY-MM-DD'));
                } else {
                    Alert.alert('Thông báo', 'Lưu chi tiêu thất bại.');
                }
            } else {
                // Nếu không có kết nối, lưu thu nhập vào AsyncStorage để đồng bộ sau
                const existingOfflineData = JSON.parse(await AsyncStorage.getItem('offlineExpenseData')) || [];
                existingOfflineData.push(incomeData);
                await AsyncStorage.setItem('offlineExpenseData', JSON.stringify(existingOfflineData));
                Alert.alert('Thông báo', 'Không có kết nối mạng. Dữ liệu đã được lưu cục bộ và sẽ được đồng bộ khi có kết nối.');
                setAmount('');
                setDescription('');
                setSelectedCategory(null);
            }
        } catch (error) {
            Alert.alert('Thông báo', 'Đã xảy ra lỗi khi lưu chi tiêu.');
            console.error(error);
        }
    };

    const syncOfflineData = async () => {
        try {
            const offlineData = JSON.parse(await AsyncStorage.getItem('offlineExpenseData')) || [];
            if (offlineData.length === 0) return;

            const isConnected = await isNetworkConnected();
            if (isConnected) {
                // Đồng bộ dữ liệu lên máy chủ
                await Promise.all(offlineData.map(async (data) => {
                    await axios.post('http://10.0.2.2:3000/saveexpense', data);
                }));

                // Xóa dữ liệu đã đồng bộ khỏi AsyncStorage
                await AsyncStorage.removeItem('offlineExpenseData');
                Alert.alert('Thông báo', 'Dữ liệu đã được đồng bộ với máy chủ.');
            }
        } catch (error) {
            console.error('Lỗi khi đồng bộ dữ liệu:', error);
        }
    };


    const nextDate = () => {
        const nextDay = new Date(chosenDate);
        nextDay.setDate(chosenDate.getDate() + 1);
        setChosenDate(nextDay);
    };

    const prevDate = () => {
        const prevDay = new Date(chosenDate);
        prevDay.setDate(chosenDate.getDate() - 1);
        setChosenDate(prevDay);
    };

    const handleDatePress = () => {
        setShowDatePicker(true);
    };

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || chosenDate;
        setShowDatePicker(false);
        setChosenDate(currentDate);
    };


    const HandleEditExpense = (item) => {
        setIncome(item);
        setModalVisible(true);
    };

    const handleEditModalOption = () => {
        navigation.navigate('EditExpense', {
            id: income.id,
            category_id: income.category_id,
            name: income.category_name,
            amount: income.amount,
            olddescription: income.description,
            icon: income.category_icon,
            color: income.category_color,
            date: income.date,
        });
        setModalVisible(false);
    };

    const handleDeleteConfirmation = () => {
        setConfirmDeleteVisible(true);
    };

    const handleDeleteIncome = async () => {
        try {
            const response = await axios.delete(`http://10.0.2.2:3000/deleteexpense/${income.id}`);
            if (response.status === 200) {
                Alert.alert('Thông báo', 'Xóa chi tiêu thành công.');
                fetchExpenseData(userId, moment(chosenDate).format('YYYY-MM-DD'));
                setModalVisible(false);
            } else {
                Alert.alert('Thông báo', 'Xóa chi tiêu không thành công.');
            }
        } catch (error) {
            Alert.alert('Lỗi xóa thu nhập', 'Đã xảy ra lỗi khi xóa chi tiêu.');
        } finally {
            setConfirmDeleteVisible(false);
        }
    };

    const handleViewExpenses = () => {
        navigation.navigate('ListExpense' , { userId: userId ,date: moment(chosenDate).format('YYYY-MM-DD')} );
    }


    return (
        <View style={styles.container}>
            <View style={styles.datecontainer}>
                <View style={styles.header}>
                    <Text style={styles.headerText}>Ngày</Text>
                </View>
                <TouchableOpacity onPress={prevDate}>
                    <View style={styles.button}>
                        <Text style={styles.buttonText}>
                            <AntDesign name="left" size={24} color="#9C9C9C" />
                        </Text>
                    </View>
                </TouchableOpacity>
                <TouchableWithoutFeedback onPress={handleDatePress}>
                    <View style={[styles.dateContainer2, { borderColor: '#1A1A1A' }]}>
                        <Text style={styles.selectedDateText}>
                            {moment(chosenDate).format('DD/MM/YYYY')}
                        </Text>
                    </View>
                </TouchableWithoutFeedback>
                <TouchableOpacity onPress={nextDate}>
                    <View style={styles.button}>
                        <Text style={styles.buttonText}>
                            <AntDesign name="right" size={24} color="#9C9C9C" />
                        </Text>
                    </View>
                </TouchableOpacity>

                {showDatePicker && (
                    <DateTimePicker
                        value={chosenDate}
                        mode="date"
                        display="default"
                        onChange={onChange}
                    />
                )}
            </View>

            <View style={styles.revenueview}>
                <View style={styles.Reveue}>
                    <Text style={styles.TextReveue}>Tiền chi</Text>
                </View>
                <View style={styles.inputbox}>
                    <TextInput onChangeText={setAmount} style={styles.TextIP} placeholder="Nhập số tiền" value={amount} />
                    <Text style={{ fontSize: 20, paddingLeft: 10, color: '#fff' }}>đ</Text>
                </View>
            </View>

            <View style={styles.revenueview}>
                <View style={styles.Reveue}>
                    <Text style={styles.TextReveue}>Ghi chú</Text>
                </View>
                <View style={styles.inputbox}>
                    <TextInput onChangeText={setDescription} style={styles.TextIP} placeholder="Ghi chú" value={description} />
                </View>
            </View>

            <View>
                <View style={styles.categoryHeader}>
                    <Text style={styles.TextReveue}>Danh mục</Text>
                    <TouchableOpacity style={styles.iconpen} onPress={() => navigation.navigate('CategoryTabView', { initialIndex: 1 })}>
                        <FontAwesome name="pencil" size={24} color="black" />
                    </TouchableOpacity>
                </View>

                <View style={styles.flastlistview}>
                    {categories.length > 0 ? (
                        <FlatList
                            data={categories}
                            renderItem={renderCategoryItem}
                            keyExtractor={(item) => item.id.toString()}
                            contentContainerStyle={styles.listContainer}
                            numColumns={3}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                />
                            }
                            style={styles.flatList}
                        />
                    ) : (
                        <Text style={styles.emptyMessage}>Không có danh mục nào.</Text>
                    )}
                </View>
                <View style={styles.AddView}>
                    <TouchableOpacity style={styles.btnadd} onPress={saveexpense}>
                        <Text style={styles.textAdd}>Thêm chi tiêu</Text>
                    </TouchableOpacity>
                </View>

                <View>
                    <TouchableOpacity style={styles.viewExpensesButton} onPress={handleViewExpenses}>
                        <Text style={styles.viewExpensesText}>Xem danh sách chi tiêu</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={styles.modalText}>Thao tác</Text>
                            <TouchableOpacity onPress={() => { setModalVisible(false, null) }} style={{ left: 100 }}>
                                <AntDesign name="close" size={24} color="black" />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={styles.modalButtonEdit} onPress={handleEditModalOption} >
                            <Text style={styles.modalButtonText}>Sửa</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalButtonDelete} onPress={handleDeleteConfirmation}>
                            <Text style={styles.modalButtonText}>Xóa</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal Xác Nhận Xóa */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={confirmDeleteVisible}
                onRequestClose={() => {
                    setConfirmDeleteVisible(false);
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>Xác nhận xóa</Text>
                        <TouchableOpacity style={styles.modalButtonDelete} onPress={handleDeleteIncome}>
                            <Text style={styles.modalButtonText}>Xác nhận xóa</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => {
                                setConfirmDeleteVisible(false);
                            }}
                        >
                            <Text style={styles.modalButtonText}>Hủy</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </View>
    );
};


export default ExpenseHomeScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        marginTop: 0,
    },
    listContainer: {
        marginBottom: -90,

    },
    flastlistview: {
        height: 200,
    },
    datecontainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    header: {
        marginRight: 20,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
    },
    dateContainer2: {
        padding: 10,
        backgroundColor: '#F5F5F5',
        borderRadius: 5,
        marginRight: 20,
    },
    selectedDateText: {
        fontSize: 18,
        color: '#4F4F4F',
        marginTop: -10,
    },
    button: {
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginBottom: 10,
    },
    buttonText: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    revenueview: {
        marginTop: 5,
        padding: 10,
        borderRadius: 10,
        flexDirection: 'row',
    },
    Reveue: {
        marginRight: 20,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#9C9C9C',
    },
    TextReveue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
    },
    inputbox: {
        borderRadius: 5,
        flex: 1,
        flexDirection: 'row',

    },
    TextIP: {
        fontSize: 18,
        fontWeight: 'bold',
        backgroundColor: '#F5F5F5',
        borderRadius: 5,
        padding: 5,
        flex: 1,
        color: '#9C9C9C',
    },
    emptyMessage: {
        textAlign: 'center',
        fontSize: 16,
        color: '#9C9C9C',
        marginTop: 10,
    },

    categoryItem: {
        flex: 1,
        margin: 5,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#9C9C9C',
        maxWidth: '30%',
    },
    categoryTextInput: {
        fontSize: 16,
        backgroundColor: '#9C9C9C',
        borderRadius: 5,
        padding: 5,
        flex: 1,
    },
    categoryText: {
        marginTop: 5,
        fontSize: 16,
        color: 'black',
        textAlign: 'center',
    },

    AddView: {
        marginTop: 20,
        alignItems: 'center',
    },
    btnadd: {
        backgroundColor: '#33CCCC',
        padding: 10,
        borderRadius: 10,
        width: '80%',
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    iconpen: {
        marginLeft: 'auto',
    },
    categoryContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryIcon: {
        marginBottom: 5,
    },
    selectedCategoryContainer: {
        borderColor: 'green',
    },
    textAdd: {
        fontSize: 18,
        color: '#fff',
        textAlign: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        width: '80%',
        alignItems: 'center',
    },
    modalText: {
        fontSize: 18,
        marginBottom: 20,
    },
    modalButton: {
        marginTop: 10,
        backgroundColor: '#008000',
        padding: 10,
        borderRadius: 5,
        width: '80%',
    },
    modalButtonEdit: {
        marginTop: 10,
        backgroundColor: '#33CCCC',
        padding: 10,
        borderRadius: 5,
        width: '80%',
    },
    modalButtonDelete: {
        marginTop: 10,
        backgroundColor: '#990000',
        padding: 10,
        borderRadius: 5,
        width: '80%',
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
    },
    viewExpensesButton: {
        backgroundColor: '#0099FF',
        padding: 10,
        borderRadius: 10,
        marginTop: 20,
        alignItems: 'center',
    },
    viewExpensesText: {
        fontSize: 18,
        color: '#fff',
        textAlign: 'center',
    },
})