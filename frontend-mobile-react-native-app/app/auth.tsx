import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../services/authService';

export default function AuthScreen() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(false); // Start with sign up
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      if (!name) {
        newErrors.name = 'Name is required';
      }
      if (!confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuth = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isLogin) {
        // Login
        await authService.login({ email, password });
        Alert.alert('Success', 'Login successful!', [
          { text: 'OK', onPress: () => router.replace('/(tabs)') }
        ]);
      } else {
        // Sign up
        await authService.signup({ name, email, password });
        Alert.alert('Success', 'Account created successfully!', [
          { text: 'OK', onPress: () => {
            setIsLogin(true);
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setName('');
            setErrors({});
          }}
        ]);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1A1A2E', '#16213E', '#0F3460']}
        style={styles.backgroundGradient}
      >
        <KeyboardAvoidingView 
          style={styles.keyboardView} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <ArrowLeft size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <View style={styles.titleSection}>
                <Text style={styles.welcomeText}>
                  {isLogin ? 'Welcome Back!' : 'Join EczemaCare'}
                </Text>
                <Text style={styles.subtitle}>
                  {isLogin ? 'Sign in to continue your skin care journey' : 'Start your journey to healthier skin'}
                </Text>
              </View>

              <View style={styles.form}>
                {!isLogin && (
                  <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                      <User size={20} color="#6A9FB5" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Full Name"
                        value={name}
                        onChangeText={setName}
                        placeholderTextColor="#666"
                      />
                    </View>
                    {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                  </View>
                )}

                <View style={styles.inputContainer}>
                  <View style={styles.inputWrapper}>
                    <Mail size={20} color="#6A9FB5" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Email"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      placeholderTextColor="#666"
                    />
                  </View>
                  {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                </View>

                <View style={styles.inputContainer}>
                  <View style={styles.inputWrapper}>
                    <Lock size={20} color="#6A9FB5" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      placeholderTextColor="#666"
                    />
                    <TouchableOpacity 
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                    >
                      {showPassword ? (
                        <EyeOff size={20} color="#6A9FB5" />
                      ) : (
                        <Eye size={20} color="#6A9FB5" />
                      )}
                    </TouchableOpacity>
                  </View>
                  {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                </View>

                {!isLogin && (
                  <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                      <Lock size={20} color="#6A9FB5" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showPassword}
                        placeholderTextColor="#666"
                      />
                    </View>
                    {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                  </View>
                )}

                <LinearGradient
                  colors={['#6A9FB5', '#C5B4E3']}
                  style={styles.authButton}
                >
                  <TouchableOpacity 
                    onPress={handleAuth} 
                    style={styles.buttonTouchable}
                    disabled={isLoading}
                  >
                    <Text style={styles.authButtonText}>
                      {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>

                {isLogin && (
                  <TouchableOpacity style={styles.forgotButton}>
                    <Text style={styles.forgotText}>Forgot Password?</Text>
                  </TouchableOpacity>
                )}

                <View style={styles.switchContainer}>
                  <Text style={styles.switchText}>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                  </Text>
                  <TouchableOpacity onPress={() => {
                    setIsLogin(!isLogin);
                    setErrors({});
                    setEmail('');
                    setPassword('');
                    setConfirmPassword('');
                    setName('');
                  }}>
                    <Text style={styles.switchLink}>
                      {isLogin ? 'Sign Up' : 'Sign In'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: '100%',
  },
  header: {
    padding: 24,
    paddingBottom: 0,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 32,
    fontFamily: 'OpenSans-Bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: '#B0B0B0',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: '#FFFFFF',
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    color: '#DC3545',
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    marginTop: 4,
    marginLeft: 4,
  },
  authButton: {
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#6A9FB5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonTouchable: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'OpenSans-SemiBold',
  },
  forgotButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotText: {
    color: '#6A9FB5',
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  switchText: {
    color: '#B0B0B0',
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
  },
  switchLink: {
    color: '#6A9FB5',
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
  },
});