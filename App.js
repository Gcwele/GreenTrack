import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { localStorageService } from "./src/services/localStorageService";
import AuthGate from "./src/navigation/AuthGate";

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("App: Initializing storage...");
        await localStorageService.initialize();
        console.log("App: Storage initialized successfully");
        setIsInitialized(true);
      } catch (err) {
        console.error("App: Initialization error:", err);
        setError(err.message);
      }
    };
    
    initializeApp();
  }, []);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Text style={{ color: "red", fontSize: 18, marginBottom: 10 }}>Initialization Error</Text>
        <Text style={{ textAlign: "center", marginBottom: 20 }}>{error}</Text>
        <Text 
          onPress={() => {
            setError(null);
            setIsInitialized(false);
            localStorageService.clearAll().then(() => {
              window.location?.reload();
            });
          }}
          style={{ color: "blue", fontSize: 16 }}
        >
          Reset App & Retry
        </Text>
      </View>
    );
  }

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={{ marginTop: 10 }}>Initializing app...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthGate />
    </SafeAreaProvider>
  );
}