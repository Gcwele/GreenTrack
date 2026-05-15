import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { localStorageService } from "../services/localStorageService";
import { colors, spacing } from "../constants/theme";

export default function CreateProjectScreen({ navigation }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [campus, setCampus] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [tasks, setTasks] = useState([{ title: "", description: "" }]);
  const [submitting, setSubmitting] = useState(false);

  const categories = ["Recycling", "Energy", "Water", "Greening", "Education", "Other"];

  const addTask = () => {
    setTasks([...tasks, { title: "", description: "" }]);
  };

  const removeTask = (index) => {
    if (tasks.length === 1) {
      Alert.alert("Cannot remove", "At least one task is required");
      return;
    }
    const updated = [...tasks];
    updated.splice(index, 1);
    setTasks(updated);
  };

  const updateTask = (index, field, value) => {
    const updated = [...tasks];
    updated[index][field] = value;
    setTasks(updated);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Missing info", "Please enter a project name");
      return;
    }
    if (!category) {
      Alert.alert("Missing info", "Please select a category");
      return;
    }
    if (!campus.trim()) {
      Alert.alert("Missing info", "Please enter a campus location");
      return;
    }
    if (!createdBy.trim()) {
      Alert.alert("Missing info", "Please enter your name");
      return;
    }

    setSubmitting(true);
    try {
      await localStorageService.createProject(
        { 
          name: name.trim(), 
          description: description.trim(), 
          category, 
          campus: campus.trim(), 
          createdBy: createdBy.trim(),
          status: "active",
          members: [],
          milestones: [],
          updates: [],
          createdAt: new Date().toISOString(),
        },
        tasks.filter(t => t.title.trim()),
        null
      );

      Alert.alert("Success", "Your project has been created!", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>New project</Text>
            <Text style={styles.subtitle}>Create a sustainability initiative</Text>
          </View>

          {/* Basic Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic information</Text>
            
            <TextInput
              placeholder="Project name"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
            
            <TextInput
              placeholder="Description"
              placeholderTextColor={colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              style={[styles.input, styles.textArea]}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Category Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category</Text>
            <View style={styles.categoryGrid}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Location Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <TextInput
              placeholder="Campus name"
              placeholderTextColor={colors.textSecondary}
              value={campus}
              onChangeText={setCampus}
              style={styles.input}
            />
            <TextInput
              placeholder="Your name (as project lead)"
              placeholderTextColor={colors.textSecondary}
              value={createdBy}
              onChangeText={setCreatedBy}
              style={styles.input}
            />
          </View>

          {/* Tasks Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Initial tasks</Text>
              <TouchableOpacity onPress={addTask} style={styles.addTaskBtn}>
                <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                <Text style={styles.addTaskText}>Add task</Text>
              </TouchableOpacity>
            </View>

            {tasks.map((task, index) => (
              <View key={index} style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskNumber}>Task {index + 1}</Text>
                  <TouchableOpacity onPress={() => removeTask(index)} style={styles.removeTaskBtn}>
                    <Ionicons name="trash-outline" size={16} color={colors.error} />
                  </TouchableOpacity>
                </View>
                <TextInput
                  placeholder="Task title"
                  placeholderTextColor={colors.textSecondary}
                  value={task.title}
                  onChangeText={(v) => updateTask(index, "title", v)}
                  style={styles.taskInput}
                />
                <TextInput
                  placeholder="Task description (optional)"
                  placeholderTextColor={colors.textSecondary}
                  value={task.description}
                  onChangeText={(v) => updateTask(index, "description", v)}
                  style={[styles.taskInput, styles.taskTextArea]}
                  multiline
                />
              </View>
            ))}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            disabled={submitting}
          >
            <Text style={styles.submitBtnText}>
              {submitting ? "Creating project..." : "Create project"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
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
    marginTop: 2,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.md,
    fontSize: 15,
    color: colors.text,
    marginBottom: spacing.md,
    backgroundColor: colors.background,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  categoryTextActive: {
    color: colors.surface,
    fontWeight: "500",
  },
  addTaskBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addTaskText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "500",
  },
  taskCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  taskNumber: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.primary,
  },
  removeTaskBtn: {
    padding: 4,
  },
  taskInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  taskTextArea: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  submitBtn: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.surface,
  },
});