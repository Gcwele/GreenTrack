import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { localStorageService } from "../services/localStorageService";
import ProgressTracker from "../components/ProgressTracker";
import { colors, spacing } from "../constants/theme";

export default function ProjectDetailScreen({ route, navigation }) {
  const { projectId } = route.params;
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);
  const [requestStatus, setRequestStatus] = useState(null);
  const [requestLoading, setRequestLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadCurrentUserAndProject();
  }, [projectId]);

  const loadCurrentUserAndProject = async () => {
    const user = await localStorageService.getCurrentUser();
    setCurrentUser(user);
    
    const projectData = await localStorageService.getProjectById(projectId);
    setProject(projectData);
    
    if (projectData && user) {
      const members = projectData.members || [];
      const userJoined = members.some(m => m.id === user.id);
      setJoined(userJoined);
      
      if (!userJoined) {
        const status = await localStorageService.getMyRequestStatus(projectId, user.id);
        setRequestStatus(status);
      }
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCurrentUserAndProject();
    setRefreshing(false);
  };

  const handleRequestToJoin = async () => {
    if (!currentUser) {
      Alert.alert("Not logged in", "Please log in to join projects");
      return;
    }
    
    setRequestLoading(true);
    try {
      await localStorageService.requestToJoin(projectId, currentUser.id, {
        fullName: currentUser.fullName,
        email: currentUser.email,
      });
      
      setRequestStatus({ status: "pending" });
      Alert.alert("Request sent", "The admin will review your request shortly");
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setRequestLoading(false);
    }
  };

  const getStatusColor = () => {
    if (project?.status === "active") return colors.success;
    return colors.textSecondary;
  };

  const getStatusText = () => {
    if (project?.status === "active") return "Active";
    return "Completed";
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.center}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonAbsolute}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Ionicons name="folder-open-outline" size={48} color={colors.textSecondary} />
        <Text style={styles.emptyTitle}>Project not found</Text>
        <Text style={styles.emptyText}>This project may have been removed</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section with Back Button */}
        <View style={styles.headerSection}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{project.category || "General"}</Text>
          </View>
          <Text style={styles.projectName}>{project.name}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.statText}>{project.campus || "Main Campus"}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.statText}>{(project.members || []).length} participants</Text>
            </View>
            <View style={[styles.statItem, styles.statusItem]}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
              <Text style={[styles.statText, { color: getStatusColor() }]}>{getStatusText()}</Text>
            </View>
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About this project</Text>
          <Text style={styles.description}>
            {project.description || "No description provided yet."}
          </Text>
        </View>

        {/* Progress Tracker (only if joined) */}
        {joined && project.status === "active" && (
          <ProgressTracker
            projectId={projectId}
            milestones={project.milestones || []}
            onUpdate={onRefresh}
          />
        )}

        {/* Updates Section */}
        {project.updates && project.updates.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Activity feed</Text>
            {project.updates.slice(-5).reverse().map((update) => (
              <View key={update.id} style={styles.updateCard}>
                <View style={styles.updateHeader}>
                  <Ionicons name="chatbubble-outline" size={14} color={colors.primary} />
                  <Text style={styles.updateDate}>
                    {new Date(update.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.updateMessage}>{update.message}</Text>
                {update.progress !== undefined && (
                  <View style={styles.updateProgress}>
                    <Text style={styles.updateProgressText}>Progress {update.progress.toFixed(0)}%</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Join Button / Request Status */}
        {project.status === "active" && !joined && !requestStatus && (
          <TouchableOpacity style={styles.joinButton} onPress={handleRequestToJoin} disabled={requestLoading}>
            <Ionicons name="person-add-outline" size={20} color={colors.surface} />
            <Text style={styles.joinButtonText}>
              {requestLoading ? "Sending request..." : "Request to join"}
            </Text>
          </TouchableOpacity>
        )}

        {requestStatus?.status === "pending" && (
          <View style={styles.pendingBanner}>
            <Ionicons name="time-outline" size={20} color={colors.warning} />
            <Text style={styles.pendingText}>Request pending admin approval</Text>
          </View>
        )}

        {requestStatus?.status === "rejected" && (
          <View style={styles.rejectedBanner}>
            <Ionicons name="close-circle-outline" size={20} color={colors.error} />
            <View>
              <Text style={styles.rejectedText}>Request was not approved</Text>
              {requestStatus.rejectReason && (
                <Text style={styles.rejectReason}>Reason: {requestStatus.rejectReason}</Text>
              )}
            </View>
          </View>
        )}

        {joined && project.status === "active" && (
          <View style={styles.joinedBanner}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.joinedText}>You're participating in this project</Text>
          </View>
        )}

        {project.status !== "active" && (
          <View style={styles.completedBanner}>
            <Ionicons name="flag-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.completedText}>This project has been completed</Text>
          </View>
        )}
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
    paddingBottom: spacing.xl,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  headerSection: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: spacing.md,
  },
  backButton: {
    marginBottom: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonAbsolute: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 10,
  },
  categoryBadge: {
    backgroundColor: colors.primaryLight,
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
  projectName: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.md,
    lineHeight: 34,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  statusItem: {
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  section: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  updateCard: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  updateHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  updateDate: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  updateMessage: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  updateProgress: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  updateProgressText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: "500",
  },
  joinButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    padding: spacing.md,
    borderRadius: 12,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.surface,
  },
  pendingBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: "#FFF8E1",
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    padding: spacing.md,
    borderRadius: 12,
  },
  pendingText: {
    fontSize: 14,
    color: colors.warning,
    fontWeight: "500",
  },
  rejectedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "#FFEBEE",
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    padding: spacing.md,
    borderRadius: 12,
  },
  rejectedText: {
    fontSize: 14,
    color: colors.error,
    fontWeight: "500",
  },
  rejectReason: {
    fontSize: 12,
    color: colors.error,
    marginTop: 2,
  },
  joinedBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    padding: spacing.md,
    borderRadius: 12,
  },
  joinedText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "500",
  },
  completedBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.divider,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    padding: spacing.md,
    borderRadius: 12,
  },
  completedText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});