import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { localStorageService } from "../../services/localStorageService";
import { colors, spacing } from "../../constants/theme";

export default function UserDashboard({ navigation }) {
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const loadProjects = async () => {
    const user = await localStorageService.getCurrentUser();
    setCurrentUser(user);
    
    const allProjects = await localStorageService.getProjects();
    const joined = allProjects.filter((p) =>
      (p.members || []).some((m) => m.id === user?.id)
    );
    setMyProjects(joined);
    setLoading(false);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await localStorageService.logout();
    // Navigation will automatically go to login screen via AuthGate
  };

  const ProjectCard = ({ project }) => (
    <TouchableOpacity
      style={styles.projectCard}
      onPress={() => navigation.navigate("ProjectDetail", { projectId: project.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.projectName}>{project.name}</Text>
        <View style={[styles.statusBadge, project.status === "active" ? styles.activeBadge : styles.stoppedBadge]}>
          <Text style={styles.statusText}>{project.status || "active"}</Text>
        </View>
      </View>
      <Text style={styles.projectCategory}>{project.category}</Text>
      <Text style={styles.projectDesc} numberOfLines={2}>
        {project.description || "No description provided"}
      </Text>
    </TouchableOpacity>
  );

  // Get first name for greeting
  const getFirstName = (fullName) => {
    if (!fullName) return "Student";
    return fullName.split(" ")[0];
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.userName}>{getFirstName(currentUser?.fullName)} 👋</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={20} color={colors.textSecondary} />
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate("ProjectsList")}>
        <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
        <Text style={styles.browseBtnText}>Browse available projects</Text>
      </TouchableOpacity>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My projects</Text>
        <Text style={styles.projectCount}>{myProjects.length} joined</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      ) : myProjects.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🌱</Text>
          <Text style={styles.emptyTitle}>No projects yet</Text>
          <Text style={styles.emptyText}>Join a project to see it here</Text>
        </View>
      ) : (
        <FlatList
          data={myProjects}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => <ProjectCard project={item} />}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  greeting: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: spacing.sm,
  },
  logoutText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  browseBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: "dashed",
  },
  browseBtnText: {
    color: colors.primary,
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  projectCount: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  projectCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  projectName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: colors.primaryLight,
  },
  stoppedBadge: {
    backgroundColor: colors.divider,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.primary,
  },
  projectCategory: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  projectDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  loader: {
    marginTop: spacing.xl,
  },
  emptyState: {
    alignItems: "center",
    marginTop: spacing.xl * 2,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});