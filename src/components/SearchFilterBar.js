import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import colors from '../constants/colors';
import { CAMPUSES, CATEGORIES } from '../constants/projectConstants';

function FilterModal({ visible, onClose, title, options, value, onSelect }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{title}</Text>
            <Pressable onPress={onClose}>
              <Feather name="x" size={20} color={colors.mutedForeground} />
            </Pressable>
          </View>
          <FlatList
            data={['All', ...options]}
            keyExtractor={(item) => item}
            renderItem={({ item }) => {
              const isAll = item === 'All';
              const selected = isAll ? !value : value === item;
              return (
                <TouchableOpacity
                  style={[styles.option, selected && styles.optionActive]}
                  onPress={() => {
                    onSelect(isAll ? null : item);
                    onClose();
                  }}
                >
                  <Text style={[styles.optionText, selected && styles.optionTextActive]} numberOfLines={2}>
                    {item}
                  </Text>
                  {selected ? <Feather name="check" size={16} color={colors.primary} /> : null}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Pressable>
    </Modal>
  );
}

function FilterChip({ label, value, onPress }) {
  const active = !!value;
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
        {value || label}
      </Text>
      <Feather name="chevron-down" size={13} color={active ? '#fff' : colors.mutedForeground} />
    </Pressable>
  );
}

export default function SearchFilterBar({
  searchText,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedCampus,
  onCampusChange,
}) {
  const [showCategory, setShowCategory] = useState(false);
  const [showCampus, setShowCampus] = useState(false);
  const hasFilters = !!(selectedCategory || selectedCampus);

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <Feather name="search" size={16} color={colors.mutedForeground} />
        <TextInput
          value={searchText}
          onChangeText={onSearchChange}
          placeholder="Search by name or description..."
          placeholderTextColor={colors.mutedForeground}
          style={styles.searchInput}
          returnKeyType="search"
        />
        {searchText.length > 0 ? (
          <Pressable onPress={() => onSearchChange('')}>
            <Feather name="x-circle" size={16} color={colors.mutedForeground} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <FilterChip label="Category" value={selectedCategory} onPress={() => setShowCategory(true)} />
        <FilterChip label="Campus" value={selectedCampus} onPress={() => setShowCampus(true)} />
        {hasFilters ? (
          <Pressable
            style={styles.clearChip}
            onPress={() => {
              onCategoryChange(null);
              onCampusChange(null);
            }}
          >
            <Feather name="x" size={12} color={colors.mutedForeground} />
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        ) : null}
      </ScrollView>

      <FilterModal
        visible={showCategory}
        onClose={() => setShowCategory(false)}
        title="Select Category"
        options={CATEGORIES}
        value={selectedCategory}
        onSelect={onCategoryChange}
      />
      <FilterModal
        visible={showCampus}
        onClose={() => setShowCampus(false)}
        title="Select Campus"
        options={CAMPUSES}
        value={selectedCampus}
        onSelect={onCampusChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingBottom: 10, gap: 10 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.foreground, padding: 0 },
  chips: { gap: 8, paddingRight: 4 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    maxWidth: 160,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '500', color: colors.foreground, flexShrink: 1 },
  chipTextActive: { color: '#fff' },
  clearChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  clearText: { fontSize: 12, color: colors.mutedForeground },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: colors.foreground },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  optionActive: { backgroundColor: colors.primaryLight },
  optionText: { fontSize: 15, color: colors.foreground, flex: 1, marginRight: 8 },
  optionTextActive: { color: colors.primary, fontWeight: '600' },
});
