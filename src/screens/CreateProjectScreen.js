import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { localStorageService } from "../services/localStorageService";

export default function CreateProjectScreen({ navigation }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [campus, setCampus] = useState("");
  const [createdBy, setCreatedBy] = useState("");

  const [tasks, setTasks] = useState([{ title: "", description: "" }]);

  const addTask = () => {
    setTasks([...tasks, { title: "", description: "" }]);
  };

  const updateTask = (index, field, value) => {
    const updated = [...tasks];
    updated[index][field] = value;
    setTasks(updated);
  };

  const handleSubmit = async () => {
    if (!name || !category || !campus || !createdBy) {
      Alert.alert("Error", "Fill all required fields");
      return;
    }

    try {
      await localStorageService.createProject(
        { name, description, category, campus, createdBy },
        tasks,
        null
      );

      Alert.alert("Success", "Project created!");
      navigation.goBack();
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Failed to create project");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>

        <Text style={styles.title}>Create Project</Text>

        <TextInput placeholder="Project Name" value={name} onChangeText={setName} style={styles.input} />
        <TextInput placeholder="Description" value={description} onChangeText={setDescription} style={styles.input} />
        <TextInput placeholder="Category" value={category} onChangeText={setCategory} style={styles.input} />
        <TextInput placeholder="Campus" value={campus} onChangeText={setCampus} style={styles.input} />
        <TextInput placeholder="Your Name" value={createdBy} onChangeText={setCreatedBy} style={styles.input} />

        <Text style={styles.section}>Tasks</Text>

        {tasks.map((task, index) => (
          <View key={index} style={styles.taskBox}>
            <TextInput
              placeholder="Task Title"
              value={task.title}
              onChangeText={(v) => updateTask(index, "title", v)}
              style={styles.input}
            />

            <TextInput
              placeholder="Task Description"
              value={task.description}
              onChangeText={(v) => updateTask(index, "description", v)}
              style={styles.input}
            />
          </View>
        ))}

        <TouchableOpacity onPress={addTask} style={styles.addBtn}>
          <Text style={{ color: "white" }}>+ Add Task</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSubmit} style={styles.submitBtn}>
          <Text style={{ color: "white", fontWeight: "bold" }}>
            Create Project
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },

  container: {
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },

  section: {
    fontSize: 18,
    marginVertical: 10,
    fontWeight: "bold",
  },

  taskBox: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },

  addBtn: {
    backgroundColor: "blue",
    padding: 12,
    alignItems: "center",
    marginVertical: 10,
    borderRadius: 8,
  },

  submitBtn: {
    backgroundColor: "green",
    padding: 15,
    alignItems: "center",
    borderRadius: 8,
  },
});
