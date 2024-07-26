import React, { useState } from 'react';
import { SafeAreaView, Text, View, Image, KeyboardAvoidingView, TextInput, TouchableOpacity, Alert, Platform, StyleSheet } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const RegisterScreen = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [repassword, setRepassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showRepassword, setShowRepassword] = useState(false);

    const HandleGoToLogin = () => {
        navigation.navigate('Login');
    }

    const handlesignup = () => {
        const user = {
            email: email,
            name: name,
            password: password,
            repassword: repassword
        };
    
        axios.post('http://10.0.2.2:3000/register', user)
            .then((response) => {
                console.log(response);
                setName('');
                setPassword('');
                setRepassword('');
                Alert.alert('Đăng ký thành công', 'Bạn đã đăng ký thành công!');
                navigation.navigate('Login');
            })
            .catch((err) => {
                console.log(err);
                if (err.response) {
                    const status = err.response.status;
                    switch (status) {
                        case 400:
                            Alert.alert('Lỗi đăng ký', err.response.data.message);
                            break;
                        case 401:
                            Alert.alert('Lỗi đăng ký', err.response.data.message);
                            break;
                        case 402:
                            Alert.alert('Lỗi đăng ký', err.response.data.message);
                            break;
                        case 403:
                            Alert.alert('Lỗi đăng ký', err.response.data.message);
                            break;
                        case 406:
                            Alert.alert('Lỗi đăng ký', err.response.data.message);
                            break;
                        case 407:
                            Alert.alert('Lỗi đăng ký', err.response.data.message);
                            break;
                        case 408:
                            Alert.alert('Lỗi đăng ký', err.response.data.message);
                            break;
                        case 409:
                            Alert.alert('Lỗi đăng ký', err.response.data.message);
                            break;
                        case 410:
                            Alert.alert('Lỗi đăng ký', err.response.data.message);
                    }
                } else {
                    Alert.alert('Lỗi đăng ký', 'Đăng ký không thành công. Vui lòng thử lại sau.');
                }
            });
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleRePasswordVisibility = () => {
        setShowRepassword(!showRepassword);
    };
    
    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}>
                <View style={styles.innerContainer}>
                    <View style={styles.logoContainer}>
                        <Image source={require('../assets/Images/logo.png')} style={styles.logo} resizeMode="cover" />
                    </View>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>Đăng Ký</Text>
                    </View>
                    <View style={styles.inputContainer}>
                        <TextInput onChangeText={(text) => setEmail(text)} style={styles.input} placeholder='Email' value={email} />
                    </View>
                    <View style={styles.inputContainer}>
                        <TextInput onChangeText={(text) => setName(text)} style={styles.input} placeholder='Tên đăng nhập' value={name} />
                    </View>
                    <View style={styles.inputContainer}>
                        <TextInput onChangeText={(text) => setPassword(text)} style={styles.input} placeholder='Mật khẩu' value={password} secureTextEntry={!showPassword} />
                        <TouchableOpacity onPress={togglePasswordVisibility}>
                            <Entypo name={showPassword ? "eye-with-line" : "eye"} size={24} color="black" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.inputContainer}>
                        <TextInput onChangeText={(text) => setRepassword(text)} style={styles.input} placeholder='Nhập lại mật khẩu' value={repassword} secureTextEntry={!showRepassword} />
                        <TouchableOpacity onPress={toggleRePasswordVisibility}>
                            <Entypo name={showRepassword ? "eye-with-line" : "eye"} size={24} color="black" />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={handlesignup} style={styles.button}>
                        <Text style={styles.buttonText}>Đăng ký</Text>
                    </TouchableOpacity>
                    <View style={styles.signupContainer}>
                        <Text style={styles.signupText}>Bạn đã có tài khoản? </Text>
                        <TouchableOpacity onPress={HandleGoToLogin}>
                            <Text style={[styles.signupText, { color: '#90CDF4' }]}>Đăng nhập</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
    },
    safeArea: {
        flex: 1,
        backgroundColor: 'white',
    },
    innerContainer: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 50,
        marginTop: 30,
    },
    logo: {
        width: 200,
        height: 200,
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: 10,

    },
    title: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#000',
    },
    inputContainer: {
        backgroundColor: '#D0D0D0',
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        paddingHorizontal: 20,
        marginHorizontal: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 10,
    },
    button: {
        backgroundColor: '#90CDF4',
        marginTop: 20,
        width: '80%',
        paddingVertical: 15,
        borderRadius: 20,
    },
    buttonText: {
        textAlign: 'center',
        fontSize: 20,
        color: '#FFF',
        fontWeight: 'bold',
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    signupText: {
        fontSize: 16,
    },
});

export default RegisterScreen;
