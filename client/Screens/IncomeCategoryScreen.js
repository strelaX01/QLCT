import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, RefreshControl, Modal, FlatList } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const IncomeCategoryScreen = () => {
    const navigation = useNavigation();
    const [categories, setCategories] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [userId, setUserId] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalCategory, setModalCategory] = useState(null);

    useEffect(() => {
        fetchUserId();
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchCategories();
        }, [userId])
    );

    const fetchUserId = async () => {
        try {
            const userIdFromStorage = await AsyncStorage.getItem('userId');
            console.log('userIdFromStorage:', userIdFromStorage);
            if (userIdFromStorage !== null) {
                setUserId(parseInt(userIdFromStorage, 10));
            } else {
                console.warn('AsyncStorage không có userId');
            }
        } catch (error) {
            console.error('Lỗi khi lấy userId từ AsyncStorage:', error);
        }
    };

    const fetchCategories = useCallback(async () => {
        try {
            const isConnected = await isNetworkConnected();

            if (isConnected) {
                const response = await axios.post('http://10.0.2.2:3000/GetIncomeCategories', { userId });
                setCategories(response.data);
                await AsyncStorage.setItem('IncomeOfflineCategories', JSON.stringify(response.data));
            } else {
                const storedCategories = await AsyncStorage.getItem('IncomeOfflineCategories');
                if (storedCategories !== null) {
                    setCategories(JSON.parse(storedCategories));
                }else{
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

    const handleAddCategory = () => {
        navigation.navigate('AddIncomeCategory');
    };

    const handleDeleteCategory = async (categoryId) => {
        try {
            if (!categoryId) {
                Alert.alert('Thông báo', 'ID danh mục không hợp lệ');
                return;
            }
            await axios.post('http://10.0.2.2:3000/DeleteIncomeCategory', { categoryId });
            Alert.alert('Thông báo', 'Đã xóa danh mục thành công');
            fetchCategories();
        } catch (error) {
            console.error('Lỗi khi xóa danh mục:', error);
            Alert.alert('Thông báo', 'Lỗi khi xóa danh mục');
        }
    };

    const openModal = (category) => {
        setModalCategory(category);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setModalCategory(null);
    };


    const handleEditCategory = () => {
        if (modalCategory) {
            navigation.navigate('EditIncomeCategory', { categoryId: modalCategory.id, categoryName: modalCategory.category_name, categoryIcon: modalCategory.icon, categoryColor: modalCategory.color , categoryIcon: modalCategory.icon});
            closeModal();
        }
    };

    const handleConfirmDeleteCategory = () => {
        if (modalCategory && modalCategory.id) {
            handleDeleteCategory(modalCategory.id);
            closeModal();
        } else {
            console.warn('modalCategory hoặc Id không hợp lệ:', modalCategory);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.categoryItem}
            onPress={() => openModal(item)}
        >
            <View style={styles.NameCategory}>
                <AntDesign name={item.icon} size={30} color={item.color} style={styles.categoryIcon} />
                <Text style={styles.categoryName}>{item.category_name}</Text>
            </View>
        </TouchableOpacity>
    );
    
    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.addButton} onPress={handleAddCategory}>
                <Text style={styles.addButtonText}>Thêm danh mục</Text>
                <AntDesign name="right" size={16} color="white" style={styles.icon} />
            </TouchableOpacity>

            {categories.length > 0 ? (
                <FlatList
                    data={categories}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    }
                />
            ) : (
                <Text style={styles.emptyMessage}>Không có danh mục nào.</Text>
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity style={styles.modalOption} onPress={handleEditCategory}>
                            <Text style={styles.modalOptionText}>Sửa danh mục</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalOption, styles.deleteOption]} onPress={handleConfirmDeleteCategory}>
                            <Text style={styles.modalOptionText}>Xóa danh mục</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalOption} onPress={closeModal}>
                            <Text style={[styles.modalOptionText, styles.cancelText]}>Hủy bỏ</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default IncomeCategoryScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    addButton: {
        flexDirection: 'row',
        backgroundColor: '#00CCCC',
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 10,
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '80%',
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    icon: {
        marginLeft: 10,
    },
    listContainer: {
        marginTop: 20,
        paddingHorizontal: 20,
        width: '100%',
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#999999',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginBottom: 10,
        width: '100%',
    },
    NameCategory: {
        flexDirection: 'row',
        backgroundColor: '#999999',
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
        width: '80%',
    },
    categoryIcon: {
        marginRight: 15,
    },
    categoryName: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    emptyMessage: {
        color: 'white',
        marginTop: 20,
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#2A2A2A',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    modalOption: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#3A3A3A',
    },
    deleteOption: {
        borderBottomWidth: 0,
    },
    modalOptionText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
    },
    cancelText: {
        fontWeight: 'bold',
    },
});
