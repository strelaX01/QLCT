import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text, View, Image, KeyboardAvoidingView, TextInput, TouchableOpacity, Platform, StyleSheet, Alert } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    const userId = await AsyncStorage.getItem('userId');
    if (userId) {
      navigation.navigate('BottomTabs', { screen: 'Home' });
    }
  };

  const handleLogin = async () => {
    try {
      const user = {
        email: email,
        password: password
      };

      const response = await axios.post('http://10.0.2.2:3000/login', user);
      console.log(response.data); 
      const { token, userId } = response.data;

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('userId', String(userId));

      navigation.navigate('BottomTabs', { screen: 'Home' });

    } catch (err) {
      if (err.response) {
        Alert.alert('Đăng nhập thất bại', err.response.data.message);
      } else if (err.request) {
        Alert.alert('Đăng nhập thất bại', 'Không có phản hồi từ máy chủ');
      } else {
        Alert.alert('Đăng nhập thất bại', 'Đã xảy ra lỗi');
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleGoToSignup = () => {
    navigation.navigate('Register');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.innerContainer}>
          <View style={styles.logoContainer}>
            <Image source={require('../assets/Images/logo.png')} style={styles.logo} resizeMode="cover" />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Đăng nhập</Text>
          </View>
          <View style={styles.inputContainer}>
            <TextInput onChangeText={(text) => setEmail(text)} style={styles.input} value={email} placeholder='Email' />
          </View>
          <View style={styles.inputContainer}>
            <TextInput onChangeText={(text) => setPassword(text)} style={styles.input} value={password} placeholder='Mật khẩu' secureTextEntry={!showPassword} />
            <TouchableOpacity onPress={togglePasswordVisibility}>
              <Entypo name={showPassword ? "eye-with-line" : "eye"} size={24} color="black" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handleLogin} style={styles.button}>
            <Text style={styles.buttonText}>Đăng nhập</Text>
          </TouchableOpacity>
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Bạn chưa có tài khoản? </Text>
            <TouchableOpacity onPress={handleGoToSignup}>
              <Text style={[styles.signupText, { color: '#90CDF4' }]}>Đăng ký</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginTop: 50
  },
  logo: {
    width: 200,
    height: 200,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 30,
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
    fontSize: 30,
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

export default LoginScreen;
