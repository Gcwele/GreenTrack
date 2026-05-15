import React, { useEffect, useState, useRef } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { localStorageService } from "../services/localStorageService";

// Screens
import RegisterLoginScreen from "../../RegisterLoginScreen";
import AdminDashboard from "../screens/admin/AdminDashboard";
import ProjectDetailAdmin from "../screens/admin/ProjectDetailAdmin";
import PendingRequestsScreen from "../screens/admin/PendingRequestsScreen";
import UserDashboard from "../screens/user/UserDashboard";
import ProjectsListScreen from "../screens/ProjectsListScreen";
import ProjectDetailScreen from "../screens/ProjectDetailScreen";
import CreateProjectScreen from "../screens/CreateProjectScreen";

const Stack = createNativeStackNavigator();

// Auth Stack (for non-logged in users)
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={RegisterLoginScreen} />
    </Stack.Navigator>
  );
}

// Admin Stack
function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminHome" component={AdminDashboard} />
      <Stack.Screen name="ProjectDetailAdmin" component={ProjectDetailAdmin} />
      <Stack.Screen name="PendingRequests" component={PendingRequestsScreen} />
      <Stack.Screen name="CreateProject" component={CreateProjectScreen} />
      <Stack.Screen name="ProjectsList" component={ProjectsListScreen} />
      <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
    </Stack.Navigator>
  );
}

// User Stack
function UserStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UserHome" component={UserDashboard} />
      <Stack.Screen name="ProjectsList" component={ProjectsListScreen} />
      <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
    </Stack.Navigator>
  );
}

export default function AuthGate() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        console.log("AuthGate: Checking for logged in user...");
        const currentUser = await localStorageService.getCurrentUser();
        console.log("AuthGate: Current user:", JSON.stringify(currentUser, null, 2));
        console.log("AuthGate: User role:", currentUser?.role);
        console.log("AuthGate: Is admin check:", currentUser?.role === "admin");
        setUser(currentUser);
      } catch (error) {
        console.error("AuthGate error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
  }, []);

  const userRef = useRef(user);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const currentUser = await localStorageService.getCurrentUser();
      const prev = userRef.current;
      // Compare both ID AND role
      if (currentUser?.id !== prev?.id || currentUser?.role !== prev?.role) {
        console.log("AuthGate: User changed detected - new role:", currentUser?.role);
        setUser(currentUser);
      }
    }, 500);
    return () => clearInterval(interval);
  }, []); // runs once only

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  console.log("AuthGate: Rendering - user:", user?.email, "role:", user?.role);
  console.log("AuthGate: Is admin?", user?.role === "admin");
  console.log("AuthGate: Stack selected:", !user ? "AuthStack" : (user?.role === "admin" ? "AdminStack" : "UserStack"));

  return (
    <NavigationContainer>
      {!user ? (
        <AuthStack />
      ) : user?.role === "admin" ? (
        <AdminStack />
      ) : (
        <UserStack />
      )}
    </NavigationContainer>
  );
}