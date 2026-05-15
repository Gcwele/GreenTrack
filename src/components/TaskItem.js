import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import colors from '../constants/colors';
import { PROOF_TYPES } from '../constants/projectConstants';

const PROOF_ICONS = { Camera: 'camera', GPS: 'map-pin', 'Camera + GPS': 'layers' };

export default function TaskItem({ task, index, onChange, onRemove, isOnly }) {
  const [showDate, setShowDate] = useState(false);

  const update = (field, value) => onChange(index, { ...task, [field]: value });

  const pickGuideline = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.8,
    });

    if (!result.canceled) update('guidelineUri', result.assets[0].uri);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{index + 1}</Text>
        </View>
        <Text style={styles.headerLabel}>Task {index + 1}</Text>
        {!isOnly ? (
          <Pressable onPress={() => onRemove(index)} hitSlop={8}>
            <Feather name="trash-2" size={16} color="#ef4444" />
          </Pressable>
        ) : null}
      </View>

      <TextInput
        value={task.title}
        onChangeText={(value) => update('title', value)}
        placeholder="Task title *"
        placeholderTextColor={colors.mutedForeground}
        style={styles.input}
      />

      <TextInput
        value={task.description}
        onChangeText={(value) => update('description', value)}
        placeholder="Task description"
        placeholderTextColor={colors.mutedForeground}
        style={[styles.input, styles.multiline]}
        multiline
        numberOfLines={2}
      />

      <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDate(true)}>
        <Feather name="calendar" size={15} color={colors.primary} />
        <Text style={[styles.dateBtnText, !task.deadline && { color: colors.mutedForeground }]}>
          {task.deadline
            ? new Date(task.deadline).toLocaleDateString('en-ZA', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : 'Set task deadline'}
        </Text>
      </TouchableOpacity>

      {showDate ? (
        <DateTimePicker
          value={task.deadline ? new Date(task.deadline) : new Date()}
          mode="date"
          minimumDate={new Date()}
          onChange={(_, date) => {
            setShowDate(Platform.OS === 'ios');
            if (date) update('deadline', date.toISOString());
          }}
        />
      ) : null}

      <Text style={styles.label}>Proof Type</Text>
      <View style={styles.proofRow}>
        {PROOF_TYPES.map((proofType) => (
          <Pressable
            key={proofType}
            onPress={() => update('proofRequired', proofType)}
            style={[styles.proofChip, task.proofRequired === proofType && styles.proofChipActive]}
          >
            <Feather
              name={PROOF_ICONS[proofType]}
              size={13}
              color={task.proofRequired === proofType ? '#fff' : colors.foreground}
            />
            <Text style={[styles.proofChipText, task.proofRequired === proofType && styles.proofChipTextActive]}>
              {proofType}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Guideline Media</Text>
      {task.guidelineUri ? (
        <View style={styles.guidelineWrap}>
          <Image source={{ uri: task.guidelineUri }} style={styles.guidelineImg} />
          <Pressable onPress={() => update('guidelineUri', null)} style={styles.guidelineRemove}>
            <Feather name="x" size={14} color="#fff" />
          </Pressable>
        </View>
      ) : (
        <Pressable onPress={pickGuideline} style={styles.uploadBtn}>
          <Feather name="upload" size={16} color={colors.primary} />
          <Text style={styles.uploadText}>Upload image / video</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 14,
    marginBottom: 12,
    gap: 10,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  headerLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.foreground },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.foreground,
    backgroundColor: colors.background,
  },
  multiline: { minHeight: 60, textAlignVertical: 'top' },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.background,
  },
  dateBtnText: { fontSize: 14, color: colors.foreground },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  proofRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  proofChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.secondary,
  },
  proofChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  proofChipText: { fontSize: 13, fontWeight: '500', color: colors.foreground },
  proofChipTextActive: { color: '#fff' },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 14,
    backgroundColor: colors.secondary,
  },
  uploadText: { fontSize: 14, fontWeight: '500', color: colors.primary },
  guidelineWrap: { position: 'relative', alignSelf: 'flex-start' },
  guidelineImg: { width: 100, height: 70, borderRadius: 8 },
  guidelineRemove: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#333',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
