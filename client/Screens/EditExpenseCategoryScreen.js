import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, Alert, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import icons from '../assets/Icons/Icons';
import colors from '../assets/Colors/Colors';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
const EditExpenseCategoryScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { categoryId, categoryName, categoryIcon, categoryColor } = route.params;
    const [selectedIcon, setSelectedIcon] = useState(categoryIcon);
    const [selectedColor, setSelectedColor] = useState(categoryColor);
    const [categoryNameInput, setCategoryNameInput] = useState(categoryName);
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

    const saveCategory = async () => {
        try {
            const categoryNameToSend = categoryNameInput.trim();
            const isConnected = await isNetworkConnected();
            if (!isConnected) {
                Alert.alert('Thông báo', 'Không có kết nối mạng. Vui lòng thử lại sau.');
                return;
            }
            console.log('data:', categoryId, categoryNameToSend, selectedIcon, selectedColor, userId);
            const response = await axios.post('http://10.0.2.2:3000/UpdateExpenseCategory', {
                id: categoryId,
                name: categoryNameToSend,
                icon: selectedIcon,
                color: selectedColor,
                userId: userId,
            });

            Alert.alert('Thông báo', 'Đã cập nhật danh mục thành công');
            navigation.goBack();
        } catch (error) {
            if (error.response) {
                const status = error.response.status;
                switch (status) {
                    case 401:
                        Alert.alert('Lỗi khi cập nhật danh mục', 'Vui lòng nhập tên mục');
                        break;
                    case 402:
                        Alert.alert('Lỗi khi cập nhật danh mục', 'Vui lòng chọn màu sắc');
                        break;
                    case 403:
                        Alert.alert('Lỗi khi cập nhật danh mục', 'Vui lòng chọn biểu tượng');
                        break;
                    default:
                        Alert.alert('Lỗi khi cập nhật danh mục', 'Có lỗi xảy ra. Vui lòng thử lại.');
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

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('CategoryTabView', { initialIndex: 0 })}>
                    <AntDesign name="arrowleft" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.labelAdd}>Sửa danh mục</Text>
            </View>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'android' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'android' ? 0 : 20}
                enabled
            >
                <View>
                    <Text style={styles.label}>Tên đề mục</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Vui lòng nhập vào tên đề mục"
                        value={categoryNameInput}
                        placeholderTextColor={'black'}
                        onChangeText={setCategoryNameInput}
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
};

export default EditExpenseCategoryScreen

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
    },
    input: {
        backgroundColor: '#F5F5F5',
        color: 'black',
        padding: 10,
        borderRadius: 5,
        marginBottom: 20,
        fontSize: 18,
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
        borderWidth: 3,
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
        borderColor: 'green',
    },
    saveButton: {
        backgroundColor: '#33CCCC',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 18,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
})