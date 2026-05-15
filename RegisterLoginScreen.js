import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
} from "react-native";

import { colors, spacing } from "./src/constants/theme";
import { localStorageService } from "./src/services/localStorageService";

export default function RegisterLoginScreen({ navigation }) {
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ADMIN CREDENTIALS
  const ADMIN_EMAIL = "admin@greentrack.com";
  const ADMIN_PASSWORD = "admin123";

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing info", "Please enter your email and password");
      return;
    }

    setLoading(true);
    try {
      let loggedInUser = null;
      
      // Check if it's the admin login
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        console.log("Admin login detected");
        
        try {
          // Try to login as admin first
          loggedInUser = await localStorageService.login(ADMIN_EMAIL, ADMIN_PASSWORD);
          console.log("Admin login successful, role:", loggedInUser.role);
        } catch (error) {
          // If admin doesn't exist, create it
          if (error.message === "Invalid email or password") {
            console.log("Creating admin account...");
            await localStorageService.register("System Admin", ADMIN_EMAIL, ADMIN_PASSWORD);
            await localStorageService.makeAdmin(ADMIN_EMAIL);
            // Login again after making admin
            loggedInUser = await localStorageService.login(ADMIN_EMAIL, ADMIN_PASSWORD);
            console.log("Admin account created and logged in, role:", loggedInUser.role);
          } else {
            throw error;
          }
        }
      } else {
        // Normal student login
        loggedInUser = await localStorageService.login(email, password);
        console.log("Student login successful, role:", loggedInUser.role);
      }
      
      // Verify the user's role before navigation
      console.log("Final user object:", loggedInUser);
      console.log("Final user role:", loggedInUser?.role);
      
    } catch (error) {
      Alert.alert("Login failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert("Missing info", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password mismatch", "Passwords do not match");
      return;
    }

    if (password.length < 4) {
      Alert.alert("Password too short", "Password must be at least 4 characters");
      return;
    }

    // Prevent registering with admin email
    if (email === ADMIN_EMAIL) {
      Alert.alert("Invalid", "This email is reserved for admin");
      return;
    }

    setLoading(true);
    try {
      await localStorageService.register(fullName, email, password);
      Alert.alert("Welcome!", "Your account has been created successfully. Please log in.");
      // Clear form and switch to login
      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setIsLogin(true);
    } catch (error) {
      Alert.alert("Registration failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to clear storage (for web debugging)
  const handleClearStorage = async () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Clear all app data? This will reset the app.')) {
        await localStorageService.clearAll();
        window.location.reload();
      }
    } else {
      Alert.alert(
        'Reset App',
        'This will clear all data and log you out',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Reset', 
            style: 'destructive',
            onPress: async () => {
              await localStorageService.clearAll();
              navigation.replace('Login');
            }
          }
        ]
      );
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <View style={styles.headerSection}>
          <Text style={styles.logo}>🌱</Text>
          <Text style={styles.appName}>GreenTrack</Text>
          <Text style={styles.tagline}>Track campus sustainability projects</Text>
          
          {/* Clear storage button for web debugging */}
          <TouchableOpacity 
            onPress={handleClearStorage}
            style={styles.clearButton}
          >
            <Text style={styles.clearButtonText}>Reset App Data</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.formTitle}>{isLogin ? "Welcome back" : "Create account"}</Text>

          {!isLogin && (
            <TextInput
              placeholder="Full name"
              placeholderTextColor={colors.textSecondary}
              value={fullName}
              onChangeText={setFullName}
              style={styles.input}
            />
          )}

          <TextInput
            placeholder="Email address"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            placeholder="Password"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />

          {!isLogin && (
            <TextInput
              placeholder="Confirm password"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
            />
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={isLogin ? handleLogin : handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Please wait..." : isLogin ? "Sign in" : "Create account"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchContainer}>
            <Text style={styles.switchText}>
              {isLogin ? "Need an account? " : "Already have an account? "}
              <Text style={styles.switchLink}>{isLogin ? "Sign up" : "Sign in"}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  headerSection: {
    flex: 0.4,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: spacing.xl,
    position: 'relative',
  },
  logo: {
    fontSize: 64,
    marginBottom: spacing.sm,
  },
  appName: {
    fontSize: 34,
    fontWeight: "700",
    color: colors.surface,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: spacing.xs,
  },
  clearButton: {
    position: 'absolute',
    bottom: 10,
    right: 20,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  clearButtonText: {
    color: colors.surface,
    fontSize: 12,
  },
  formSection: {
    flex: 0.6,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    fontSize: 16,
    backgroundColor: colors.surface,
  },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "600",
  },
  switchContainer: {
    marginTop: spacing.lg,
    alignItems: "center",
  },
  switchText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  switchLink: {
    color: colors.primary,
    fontWeight: "600",
  },
  adminHint: {
    marginTop: spacing.md,
    textAlign: "center",
    fontSize: 12,
    color: colors.textSecondary,
  },
};