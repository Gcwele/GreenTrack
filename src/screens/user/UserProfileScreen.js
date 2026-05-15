import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signOut } from "firebase/auth";

import { auth } from "../../../firebaseConfig";
import colors from "../../constants/colors";

export default function UserProfileScreen() {
  const currentUser = auth.currentUser;

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Profile</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Feather name="user" size={30} color={colors.primary} />
          </View>
          <View style={styles.profileText}>
            <Text style={styles.name}>{currentUser?.displayName || "GreenTrack User"}</Text>
            <Text style={styles.email}>{currentUser?.email || "No email available"}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Feather name="log-out" size={18} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: 16 },
  title: { fontSize: 28, fontWeight: "800", color: colors.foreground, marginBottom: 18 },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 16,
    marginBottom: 18,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
  profileText: { flex: 1 },
  name: { fontSize: 18, fontWeight: "800", color: colors.foreground },
  email: { marginTop: 3, fontSize: 14, color: colors.mutedForeground },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 14,
    backgroundColor: colors.error,
  },
  logoutText: { color: "#fff", fontSize: 15, fontWeight: "800" },
});
