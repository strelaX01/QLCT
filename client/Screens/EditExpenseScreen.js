import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, RefreshControl, TouchableWithoutFeedback, TextInput, FlatList, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AntDesign } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';

const EditExpenseScreen = () => {
    const route = useRoute();
    const { id, name, amount, olddescription, icon, color, date } = route.params;
    const [chosenDate, setChosenDate] = useState(new Date(date));
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const navigation = useNavigation();
    const [userId, setUserId] = useState(null);
    const [categories, setCategories] = useState([]);
    const [inputAmount, setInputAmount] = useState(amount.toString());
    const [description, setDescription] = useState(olddescription);
    const [refreshing, setRefreshing] = useState(false);

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
                await AsyncStorage.setItem('expenseCategories', JSON.stringify(response.data));
            } else {
                const storedCategories = await AsyncStorage.getItem('expenseCategories');
                if (storedCategories !== null) {
                    setCategories(JSON.parse(storedCategories));
                } else {
                    setCategories([]);
                }
                Alert.alert('Thông báo', 'Không có kết nối mạng. Hiển thị dữ liệu từ lưu trữ tạm thời.');
            }
        } catch (error) {
            Alert.alert('Thông báo', 'Lỗi khi lấy danh sách danh mục');
        } finally {
            setRefreshing(false);
        }
    }, [userId]);



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

    const UpdateIncome = async () => {
        if (!selectedCategory || !selectedCategory.id) {
            Alert.alert('Thông báo', 'Vui lòng chọn danh mục trước khi lưu.');
            return;
        }

        if (isNaN(amount) || parseFloat(amount) <= 0) {
            Alert.alert('Lỗi lưu thu nhập', 'Số tiền phải là một số hợp lệ và lớn hơn 0');
            return;
        }

        try {
            const incomeData = {
                id,
                userId,
                category_id: selectedCategory.id,
                amount: parseFloat(inputAmount),
                description,
                date: chosenDate.toLocaleDateString('vi-VN'),
            };

            const response = await axios.post('http://10.0.2.2:3000/Updateexpense', incomeData);
            if (response.status === 200) {
                const { category_name, category_color, category_icon } = response.data;
                Alert.alert('Thông báo', 'sửa khoản chi thành công.');
                setInputAmount('');
                setDescription('');
                setSelectedCategory({
                    category_id: selectedCategory.category_id,
                    category_name,
                    category_color,
                    category_icon,
                });
                navigation.goBack();
            } else {
                Alert.alert('Thông báo', 'sửa khoản chi thất bại.');
            }
        } catch (error) {
            if (error.response) {
                const status = error.response.status;
                switch (status) {
                    case 400:
                        Alert.alert('Lỗi sửa khoản chi', 'Số tiền phải là một số hợp lệ và lớn hơn 0');
                        break;
                    case 401:
                        Alert.alert('Lỗi sửa khoản chi', 'Số tiền không được để trống');
                        break;
                    case 402:
                        Alert.alert('Lỗi sửa khoản chi', 'Ghi chú không được để trống');
                        break;
                    case 404:
                        Alert.alert('Lỗi sửa khoản chi', 'Không tìm thấy bản ghi để cập nhật');
                        break;
                    default:
                        Alert.alert('Lỗi sửa khoản chi', 'sửa khoản chi không thành công. Vui lòng thử lại sau.');
                        break;
                }
            }
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

    return (
        <View style={styles.container}>
            <View style={styles.headerback}>
                <TouchableOpacity onPress={() => {navigation.goBack()}}>
                    <AntDesign name="arrowleft" size={24} color="black" onPress={() => navigation.goBack()} />
                </TouchableOpacity>
                <Text style={styles.headertext}>Chỉnh sửa khoản chi</Text>
            </View>
            <View style={styles.datecontainer}>
                <View style={styles.header}>
                    <Text style={styles.headerText}>Ngày</Text>
                </View>
                <TouchableOpacity onPress={prevDate}>
                    <View style={styles.button}>
                        <Text style={styles.buttonText}>
                            <AntDesign name="left" size={24} color="black" />
                        </Text>
                    </View>
                </TouchableOpacity>
                <TouchableWithoutFeedback onPress={handleDatePress}>
                    <View style={[styles.dateContainer, { borderColor: '#1A1A1A' }]}>
                        <Text style={styles.selectedDateText}>
                            {chosenDate.toLocaleDateString('vi-VN')}
                        </Text>
                    </View>
                </TouchableWithoutFeedback>
                <TouchableOpacity onPress={nextDate}>
                    <View style={styles.button}>
                        <Text style={styles.buttonText}>
                            <AntDesign name="right" size={24} color="black" />
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
                    <TextInput
                        onChangeText={setInputAmount}
                        style={styles.TextIP}
                        placeholder="Nhập số tiền"
                        value={inputAmount}
                        keyboardType="numeric"
                    />
                    <Text style={{ fontSize: 20, paddingLeft: 10, color: 'black' }}>đ</Text>
                </View>
            </View>

            <View style={styles.revenueview}>
                <View style={styles.Reveue}>
                    <Text style={styles.TextReveue}>Ghi chú</Text>
                </View>
                <View style={styles.inputbox}>
                    <TextInput
                        onChangeText={setDescription}
                        style={styles.TextIP}
                        placeholder="Ghi chú"
                        value={description}
                    />
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
                    <TouchableOpacity style={styles.btnadd} onPress={UpdateIncome}>
                        <Text style={styles.buttonText}>Chỉnh sửa khoản chi</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
};
export default EditExpenseScreen

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
    headerback: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        width: '100%',
    },
    headertext: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
        marginLeft: 80,
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
    dateContainer: {
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 5,
        marginRight: 20,
    },
    selectedDateText: {
        fontSize: 18,
        color: 'black',
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
        marginTop: 20,
        padding: 10,
        borderRadius: 10,
        flexDirection: 'row',
    },
    Reveue: {
        marginRight: 20,
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
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
        color: 'black',
    },
    categoryItem: {
        flex: 1,
        margin: 5,
        padding: 10,
        backgroundColor: '#F5F5F5',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#333333',
        maxWidth: '30%',
    },
    categoryTextInput: {
        fontSize: 16,
        backgroundColor: '#FFF',
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
})