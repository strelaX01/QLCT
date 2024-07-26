import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, Alert, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import icons from '../assets/Icons/Icons';
import colors from '../assets/Colors/Colors';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';

const AddIncomeCategoryScreen = () => {
    const navigation = useNavigation();
    const [selectedIcon, setSelectedIcon] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [categoryName, setCategoryName] = useState('');
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const userIdFromStorage = await AsyncStorage.getItem('userId');
                if (userIdFromStorage !== null) {
                    setUserId(parseInt(userIdFromStorage, 10));
                }
            } catch (error) {
                console.error('Error fetching userId from AsyncStorage:', error);
            }
        };

        fetchUserId();
    }, []);


    useEffect(() => {
        const syncTemporaryCategories = async () => {
            const isConnected = await isNetworkConnected();
            if (isConnected) {
                try {
                    let temporaryCategories = await AsyncStorage.getItem('IncomeCategories');
                    if (temporaryCategories) {
                        temporaryCategories = JSON.parse(temporaryCategories);
                        await Promise.all(temporaryCategories.map(async (category) => {
                            await axios.post('http://10.0.2.2:3000/AddIncomeCategory', {
                                name: category.name.trim(),
                                icon: category.icon,
                                color: category.color,
                                userId: category.userId,
                            });
                        }));
                        await AsyncStorage.removeItem('temporaryCategories');
                    }
                } catch (error) {
                    console.error('Error syncing temporary categories:', error);
                }
            }
        };

        syncTemporaryCategories();
    }, []);


    const saveCategory = async () => {
        try {
            const categoryNameToSend = categoryName.trim();

            const isConnected = await isNetworkConnected();
            if (!isConnected) {
                await saveTemporaryCategory({
                    name: categoryNameToSend,
                    icon: selectedIcon,
                    color: selectedColor,
                    userId: userId,
                });

                Alert.alert('Thông báo', 'Danh mục sẽ được lưu tạm thời và sẽ được đồng bộ khi có kết nối mạng.');
                setCategoryName('');
                setSelectedIcon(null);
                setSelectedColor(null);
                navigation.goBack();
            } else {
                const response = await axios.post('http://10.0.2.2:3000/AddIncomeCategory', {
                    name: categoryNameToSend,
                    icon: selectedIcon,
                    color: selectedColor,
                    userId: userId,
                });
                Alert.alert('Thông báo', 'Đã lưu đề mục thành công');
                setCategoryName('');
                setSelectedIcon(null);
                setSelectedColor(null);
                navigation.goBack();
            }
        } catch (error) {
            if (error.response) {
                const status = error.response.status;
                switch (status) {
                    case 401:
                        Alert.alert('Lỗi khi lưu danh mục', 'Vui lòng nhập tên mục');
                        break;
                    case 402:
                        Alert.alert('Lỗi khi lưu danh mục', 'Vui lòng chọn màu sắc');
                        break;
                    case 403:
                        Alert.alert('Lỗi khi lưu danh mục', 'Vui lòng chọn biểu tượng');
                        break;
                }
            }
        }
    };

    const renderIconItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.iconContainer,
                selectedIcon === item && styles.selectedIconContainer,
            ]}
            onPress={() => setSelectedIcon(item)}
        >
            <AntDesign name={item} size={24} color={selectedIcon === item ? selectedColor || 'black' : 'black'} />
        </TouchableOpacity>
    );

    const renderColorItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.colorContainer,
                { backgroundColor: item },
                selectedColor === item && styles.selectedColorContainer,
            ]}
            onPress={() => setSelectedColor(item)}
        />
    );

    const isNetworkConnected = async () => {
        const state = await NetInfo.fetch();
        return state.isConnected;
    };

    const saveTemporaryCategory = async (category) => {
        try {
            let temporaryCategories = await AsyncStorage.getItem('IncomeOfflineCategories');
            temporaryCategories = temporaryCategories ? JSON.parse(temporaryCategories) : [];

            temporaryCategories.push(category);

            await AsyncStorage.setItem('IncomeOfflineCategories', JSON.stringify(temporaryCategories));
        } catch (error) {
            console.error('Error saving  category:', error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('CategoryTabView', {initialIndex: 0})}>
                <AntDesign name="arrowleft" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.labelAdd}>Tạo mới</Text>
            </View>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                enabled
            >
                <View>
                    <Text style={styles.label}>Tên đề mục</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Vui lòng nhập vào tên đề mục"
                        value={categoryName}
                        placeholderTextColor={'#fff'}
                        onChangeText={setCategoryName}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    <Text style={styles.label}>Biểu tượng</Text>
                    <FlatList
                        data={icons}
                        numColumns={4}
                        keyExtractor={(item) => item}
                        renderItem={renderIconItem}
                        contentContainerStyle={styles.listContainer}
                    />

                    <Text style={styles.label}>Màu sắc</Text>
                    <FlatList
                        data={colors}
                        numColumns={4}
                        keyExtractor={(item) => item}
                        renderItem={renderColorItem}
                        contentContainerStyle={styles.listContainer}
                    />

                    <TouchableOpacity onPress={saveCategory} style={styles.saveButton}>
                        <Text style={styles.saveButtonText}>Sửa</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

export default AddIncomeCategoryScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    listContainer: {
        flexGrow: 1,
    },
    label: {
        fontSize: 20,
        color: 'black',
        marginBottom: 10,
    },
    labelAdd: {
        fontSize: 20,
        color: 'black',
        marginBottom: 10,
        textAlign: 'center',
        flex: 1,
        fontWeight: 'bold',
    },
    input: {
        backgroundColor: '#999999',
        color: 'black',
        padding: 10,
        borderRadius: 5,
        marginBottom: 20,
    },
    iconContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        borderRadius: 5,
        margin: 5,
        borderWidth: 1,
        borderColor: '#2A2A2A',
    },
    selectedIconContainer: {
        borderColor: 'green',
    },
    colorContainer: {
        flex: 1,
        height: 50,
        margin: 5,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#2A2A2A',
    },
    selectedColorContainer: {
        borderWidth: 3,
        borderColor: 'white',
    },
    saveButton: {
        backgroundColor: '#33CCCC',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 15,

    },
    saveButtonText: {
        color: 'white',
        fontSize: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
