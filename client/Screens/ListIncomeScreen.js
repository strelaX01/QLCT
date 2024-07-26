import { StyleSheet, Text, View, FlatList, TouchableOpacity, Modal, Alert } from 'react-native';
import React, { useState, useCallback } from 'react';
import axios from 'axios';
import moment from 'moment'; // Import thư viện moment
import { useRoute, useFocusEffect } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import NumberFormat from 'react-number-format';
import { useNavigation } from '@react-navigation/native';


const ListIncomeScreen = () => {
    const route = useRoute();
    const { userId, date } = route.params || {};
    const navigation = useNavigation();
    const [incomeData, setIncomeData] = useState({});
    const [modalVisible, setModalVisible] = useState(false);
    const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
    const [income, setIncome] = useState({}); 

    const fetchIncomeData = useCallback(async (userId, date) => {
        try {
            const response = await axios.get(`http://10.0.2.2:3000/getincomeday/${userId}?date=${date}`);
            const incomeByDate = response.data.reduce((acc, item) => {
                const dateKey = moment(item.date).format('YYYY-MM-DD');
                acc[dateKey] = acc[dateKey] || [];
                acc[dateKey].push(item);
                return acc;
            }, {});
            setIncomeData(incomeByDate);
        } catch (error) {
            console.log('Lỗi khi lấy dữ liệu thu nhập', error);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            if (userId) {
                fetchIncomeData(userId, date);
            }
        }, [userId, date, fetchIncomeData])
    );


    const handleIncomeSelection = (selectedIncome) => {
        setIncome(selectedIncome);
        setModalVisible(true); 
    };

    const handleEditModalOption = () => {
        navigation.navigate('EditIncome', {
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
            const response = await axios.delete(`http://10.0.2.2:3000/deleteincome/${income.id}`);
            if (response.status === 200) {
                Alert.alert('Thông báo', 'Xóa thu nhập thành công.');
                fetchIncomeData(userId, moment(date).format('YYYY-MM-DD')); 
                setModalVisible(false); 
            } else {
                Alert.alert('Thông báo', 'Xóa thu nhập không thành công.');
            }
        } catch (error) {
            Alert.alert('Lỗi xóa thu nhập', 'Đã xảy ra lỗi khi xóa thu nhập.');
        } finally {
            setConfirmDeleteVisible(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.titlecontainer}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <AntDesign name="arrowleft" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.title}>Danh sách thu nhập</Text>
                <View style={{ width: 24 }} />
            </View>
            {Object.keys(incomeData).length === 0 ? (
                <Text style={styles.noDataText}>Không có nguồn thu nhập nào để hiển thị.</Text>
            ) : (
                <FlatList
                    data={Object.keys(incomeData)}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <View style={styles.dateContainer}>
                            <View style={styles.datebox}>
                                <Text style={styles.date}>{item}</Text>
                            </View>
                            <FlatList
                                data={incomeData[item]}
                                keyExtractor={(income) => income.id.toString()}
                                renderItem={({ item: income }) => (
                                    <TouchableOpacity style={styles.incomeItem} onPress={() => handleIncomeSelection(income)}>
                                        <View>
                                            <AntDesign name={income.category_icon} size={30} color={income.category_color} style={styles.categoryIcon} />
                                            <Text>{income.category_name}</Text>
                                        </View>
                                        <Text style={styles.amounttext}>{income.amount}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    )}
                />
            )}

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

                        <TouchableOpacity style={styles.modalButtonEdit} onPress={handleEditModalOption}>
                            <Text style={styles.modalButtonText}>Sửa</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalButtonDelete} onPress={handleDeleteConfirmation}>
                            <Text style={styles.modalButtonText}>Xóa</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

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
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    titlecontainer: {
        alignItems: 'center',
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 25,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    dateContainer: {
        marginBottom: 10,
    },
    datebox: {
        backgroundColor: '#BBBBBB',
        padding: 5,
        borderRadius: 5,
        marginBottom: 5,
    },
    date: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    incomeItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
        marginBottom: 5,
    },
    amounttext: {
        fontWeight: 'bold',
        fontSize: 16,
        color: 'red',
    },
    noDataText: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20,
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
});

export default ListIncomeScreen;
