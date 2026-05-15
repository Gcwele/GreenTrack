import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { localStorageService } from "../../services/localStorageService";
import { colors, spacing } from "../../constants/theme";

export default function AdminDashboard({ navigation }) {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const [projectsData, usersData, statsData, pending] = await Promise.all([
      localStorageService.getProjects(),
      localStorageService.getUsers(),
      localStorageService.getStats(),
      localStorageService.getPendingRequestsCount(),
    ]);
    setProjects(projectsData);
    setUsers(usersData);
    setStats(statsData);
    setPendingCount(pending);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await localStorageService.logout();
    // Navigation will automatically go to login screen via AuthGate
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Create Project Button */}
<TouchableOpacity
  style={styles.createProjectBtn}
  onPress={() => navigation.navigate("CreateProject")}
>
  <Ionicons name="add-circle-outline" size={24} color={colors.surface} />
  <Text style={styles.createProjectBtnText}>Create New Project</Text>
</TouchableOpacity>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Admin</Text>
            <Text style={styles.subtitle}>Project overview</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Sign out</Text>
          </TouchableOpacity>
        </View>

        {/* Pending Requests Button */}
        <TouchableOpacity
          style={styles.requestsBtn}
          onPress={() => navigation.navigate("PendingRequests")}
        >
          <Ionicons name="people-outline" size={24} color={colors.surface} />
          <Text style={styles.requestsBtnText}>Pending Join Requests</Text>
          {pendingCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pendingCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.totalProjects || 0}</Text>
            <Text style={styles.statLabel}>Total projects</Text>
          </View>
          <View style={[styles.statCard, styles.statCardActive]}>
            <Text style={[styles.statValue, styles.statValueActive]}>{stats?.activeProjects || 0}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.totalUsers || 0}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Recent projects</Text>
        {projects.slice(0, 5).map((project) => (
          <TouchableOpacity
            key={project.id}
            style={styles.projectItem}
            onPress={() => navigation.navigate("ProjectDetailAdmin", { projectId: project.id })}
          >
            <View>
              <Text style={styles.projectName}>{project.name}</Text>
              <Text style={styles.projectMeta}>{project.category} · {project.campus}</Text>
            </View>
            <View style={[styles.projectStatus, project.status === "active" ? styles.statusActive : styles.statusStopped]}>
              <Text style={styles.projectStatusText}>{project.status || "active"}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>Recent members</Text>
        {users.slice(0, 5).map((user) => (
          <View key={user.id} style={styles.userItem}>
            <View style={styles.userAvatar}>
              <Text style={styles.userInitial}>{user.fullName?.charAt(0) || "U"}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.fullName || "User"}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
            <Text style={styles.userRole}>{user.role || "student"}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  logoutBtn: {
    padding: spacing.sm,
  },
  logoutText: {
    color: colors.textSecondary,
  },
  requestsBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  requestsBtnText: {
    flex: 1,
    color: colors.surface,
    fontSize: 16,
    fontWeight: "600",
  },
  badge: {
    backgroundColor: colors.accent || "#FFC107",
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    color: colors.surface,
    fontWeight: "bold",
    fontSize: 12,
  },
  statsGrid: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  statCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
  },
  statValueActive: {
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  projectItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  projectName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  projectMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  projectStatus: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: colors.primaryLight,
  },
  statusStopped: {
    backgroundColor: colors.divider,
  },
  projectStatusText: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.primary,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  userInitial: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.text,
  },
  userEmail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  userRole: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: "capitalize",
  },

  createProjectBtn: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.success,
  padding: spacing.md,
  borderRadius: 12,
  marginBottom: spacing.lg,
  gap: spacing.sm,
},
createProjectBtnText: {
  color: colors.surface,
  fontSize: 16,
  fontWeight: "600",
},

});