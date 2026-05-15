import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { localStorageService } from "../../services/localStorageService";
import { colors, spacing } from "../../constants/theme";

export default function PendingRequestsScreen({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState({});

  const loadRequests = async () => {
    const groupedRequests = await localStorageService.getAllPendingRequests();
    setRequests(groupedRequests);
    setLoading(false);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  const handleApprove = async (requestId, projectId, user) => {
    setProcessing(prev => ({ ...prev, [requestId]: true }));
    try {
      await localStorageService.approveJoinRequest(requestId, projectId, {
        id: user.userId,
        fullName: user.userFullName,
        email: user.userEmail,
      });
      Alert.alert("Success", "Request approved");
      loadRequests();
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setProcessing(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const handleReject = async (requestId) => {
    Alert.alert(
      "Reject Request",
      "Are you sure you want to reject this request?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            setProcessing(prev => ({ ...prev, [requestId]: true }));
            try {
              await localStorageService.rejectJoinRequest(requestId, "Rejected by admin");
              Alert.alert("Success", "Request rejected");
              loadRequests();
            } catch (error) {
              Alert.alert("Error", error.message);
            } finally {
              setProcessing(prev => ({ ...prev, [requestId]: false }));
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (requests.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pending Requests</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={48} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>No pending requests</Text>
          <Text style={styles.emptyText}>Students will appear here when they request to join</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pending Requests</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <FlatList
        data={requests}
        keyExtractor={(item) => item.projectId}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <View style={styles.projectSection}>
            <View style={styles.projectHeader}>
              <Text style={styles.projectName}>{item.projectName}</Text>
              <Text style={styles.requestCount}>{item.requests.length} request(s)</Text>
            </View>
            {item.requests.map((request) => (
              <View key={request.id} style={styles.requestCard}>
                <View style={styles.requestInfo}>
                  <Text style={styles.userName}>{request.userFullName}</Text>
                  <Text style={styles.userEmail}>{request.userEmail}</Text>
                  <Text style={styles.requestDate}>
                    Requested: {new Date(request.requestedAt).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.approveBtn]}
                    onPress={() => handleApprove(request.id, request.projectId, request)}
                    disabled={processing[request.id]}
                  >
                    <Ionicons name="checkmark" size={18} color={colors.success} />
                    <Text style={styles.approveText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.rejectBtn]}
                    onPress={() => handleReject(request.id)}
                    disabled={processing[request.id]}
                  >
                    <Ionicons name="close" size={18} color={colors.error} />
                    <Text style={styles.rejectText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  backBtn: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  listContent: {
    padding: spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
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
    textAlign: "center",
    marginTop: spacing.xs,
  },
  projectSection: {
    marginBottom: spacing.lg,
  },
  projectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  projectName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  requestCount: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "500",
  },
  requestCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  requestInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.text,
  },
  userEmail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  requestDate: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
  },
  requestActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  approveBtn: {
    backgroundColor: colors.primaryLight,
  },
  rejectBtn: {
    backgroundColor: "#FFEBEE",
  },
  approveText: {
    fontSize: 13,
    color: colors.success,
    fontWeight: "500",
  },
  rejectText: {
    fontSize: 13,
    color: colors.error,
    fontWeight: "500",
  },
});