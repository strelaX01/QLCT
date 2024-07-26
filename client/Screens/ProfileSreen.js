import { StyleSheet, Text, View, Image, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigation,useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';

const ProfileSreen = () => {

    const navigation = useNavigation();
    const [username, setUsername] = useState('');
    const [userId, setUserId] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [newUsername, setNewUsername] = useState('');

    useFocusEffect(
        useCallback(() => {
            fetchUserId();
        }, [])
    );

    useFocusEffect(
        useCallback(() => {
            fetchUsernameData();
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
    console.log(userId);

    const fetchUsernameData = async () => {
        try {
            if (userId) {
                const response = await axios.get(`http://10.0.2.2:3000/getusername/${userId}`);
                setUsername(response.data.username);
            }
        } catch (error) {
            console.error('Error during profile data fetch:', error);
        }
    };

    const handleLogout = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            await axios.post('http://10.0.2.2:3000/logout', {}, {
                headers: {
                    'Authorization': token,
                },
            });
    
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('userId');
            Alert.alert('Đăng xuất thành công');
            navigation.navigate('Login');
        } catch (error) {
            console.error('Error during logout:', error);
            Alert.alert('Đăng xuất thất bại');
        }
    };
    
    const handleEditUsername = async () => {
        try {
            const response = await axios.post('http://10.0.2.2:3000/updateusername', {
                userId: userId,
                username: newUsername
            });
            if (response.status === 200) {
                setUsername(newUsername);
                setModalVisible(false);
                setNewUsername('');
                Alert.alert('Sửa thành công');
            } else {
                console.error('Failed to update username');
            }
        } catch (error) {
            console.error('Error updating username:', error);
        }
    };

    const HandleShowModal = () => {
        setModalVisible(true);
    };

    return (
        <View style={styles.container}>
            <View style={styles.profilebox}>
                <View style={styles.logobox}>
                    <Image style={styles.img} source={require('../assets/Images/profile.png')} />
                </View>
                <View style={styles.namebox}>
                    <Text style={styles.profiletext}>{username}</Text>
                    <TouchableOpacity onPress={HandleShowModal}>
                        <FontAwesome style={styles.icon} name="pencil" size={24} color="black" />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.logoutcontainer}>
                <TouchableOpacity style={styles.logoutbox} onPress={handleLogout}>
                    <Text style={styles.logouttext}>Đăng xuất</Text>
                </TouchableOpacity>
            </View>
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Chỉnh sửa tên người dùng</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={newUsername}
                            onChangeText={setNewUsername}
                            placeholder="Nhập tên người dùng"
                        />
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={handleEditUsername}
                        >
                            <Text style={styles.modalButtonText}>Lưu</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.modalButtonText}>Hủy</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </View>
    )
}

export default ProfileSreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    profilebox: {
        backgroundColor: '#C0C0C0',
        height: 200,
        width: "100%",
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logobox: {
        backgroundColor: '#C0C0C0',
        height: 100,
        width: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    img: {
        height: 100,
        width: 100,
        borderRadius: 50,
    },
    profiletext: {
        fontSize: 20,
        color: 'black',
        fontWeight: 'bold',
    },
    namebox: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    icon: {
        marginLeft: 10,
    },
    logoutcontainer: {
        marginTop: 50,
        alignSelf: 'center',
    },
    logoutbox: {
        backgroundColor: '#FF9966',
        height: 50,
        width: 200,
        borderRadius: 20,
        justifyContent: 'center',
    },
    logouttext: {
        fontSize: 20,
        color: '#F8F8FF',
        alignSelf: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        width: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
    },
    modalButton: {
        backgroundColor: '#C0C0C0',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    modalButtonText: {
        fontSize: 18,
        color: '#000',
        textAlign: 'center',
    },
});
