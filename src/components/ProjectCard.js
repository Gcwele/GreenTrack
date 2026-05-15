import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import colors from '../constants/colors';

function StatusBadge({ status }) {
  const normalized = status === 'active' ? 'Active' : status === 'completed' ? 'Completed' : status || 'Active';
  const map = {
    Active: { bg: '#E8F5E9', text: '#2E7D32' },
    Completed: { bg: '#E3F2FD', text: '#1565C0' },
    Archived: { bg: '#F5F5F5', text: '#757575' },
    stopped: { bg: '#FFEBEE', text: '#C62828' },
  };
  const statusColor = map[normalized] || map.Active;

  return (
    <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
      <Text style={[styles.statusText, { color: statusColor.text }]}>{normalized}</Text>
    </View>
  );
}

export default function ProjectCard({ project, onPress }) {
  const tasks = project.tasks || [];
  const completed = tasks.filter((task) => task.status === 'approved' || task.status === 'completed').length;
  const total = tasks.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const deadline = project.deadline
    ? new Date(project.deadline).toLocaleDateString('en-ZA', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'No deadline';

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      {project.coverImageUrl ? (
        <Image source={{ uri: project.coverImageUrl }} style={styles.coverImage} />
      ) : (
        <View style={styles.coverPlaceholder}>
          <Feather name="folder" size={30} color={colors.primary} />
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>
            {project.name || 'Untitled Project'}
          </Text>
          <StatusBadge status={project.status} />
        </View>

        <View style={styles.metaRow}>
          <Feather name="tag" size={11} color={colors.mutedForeground} />
          <Text style={styles.metaText} numberOfLines={1}>
            {project.category || 'Not assigned'}
          </Text>
          <View style={styles.dot} />
          <Feather name="map-pin" size={11} color={colors.mutedForeground} />
          <Text style={styles.metaText}>{project.campus || 'No campus'}</Text>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressPct}>{progress}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          {total > 0 ? <Text style={styles.taskCount}>{completed}/{total} tasks</Text> : null}
        </View>

        <View style={styles.footer}>
          <View style={styles.footerItem}>
            <Feather name="clock" size={11} color={colors.mutedForeground} />
            <Text style={styles.metaText}>{deadline}</Text>
          </View>
          {project.createdBy ? (
            <View style={styles.footerItem}>
              <Feather name="user" size={11} color={colors.mutedForeground} />
              <Text style={styles.metaText} numberOfLines={1}>
                {project.createdBy}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  pressed: { opacity: 0.92 },
  coverImage: { width: '100%', height: 140, resizeMode: 'cover' },
  coverPlaceholder: {
    width: '100%',
    height: 90,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: 14 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  name: { fontSize: 16, fontWeight: '600', color: colors.foreground, flex: 1, marginRight: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '600' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 4 },
  metaText: { fontSize: 12, color: colors.mutedForeground, flexShrink: 1 },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#ccc', marginHorizontal: 2 },
  progressSection: { marginBottom: 10 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  progressLabel: { fontSize: 12, color: colors.mutedForeground },
  progressPct: { fontSize: 12, fontWeight: '600', color: colors.primary },
  progressTrack: { height: 6, backgroundColor: '#E8F5E9', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: colors.primary },
  taskCount: { fontSize: 11, color: colors.mutedForeground, marginTop: 3 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 8,
    marginTop: 4,
  },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
});
