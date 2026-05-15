import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { localStorageService } from '../services/localStorageService';

export default function ProgressTracker({ projectId, milestones = [], onUpdate }) {
  const [newMilestone, setNewMilestone] = useState('');
  const [adding, setAdding] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [updateText, setUpdateText] = useState('');

  // Calculate progress percentage
  const calculateProgress = () => {
    if (!milestones || milestones.length === 0) return 0;
    const completed = milestones.filter(m => m.completed).length;
    return (completed / milestones.length) * 100;
  };

  // Helper: Get current project and update it
  const updateProjectMilestones = async (updatedMilestones) => {
    try {
      // Get current project
      const project = await localStorageService.getProjectById(projectId);
      if (!project) throw new Error('Project not found');
      
      // Get all projects
      const allProjects = await localStorageService.getProjects();
      
      // Update the specific project
      const updatedProjects = allProjects.map(p => 
        p.id === projectId 
          ? { ...p, milestones: updatedMilestones }
          : p
      );
      
      // Save back to storage
      await AsyncStorage.setItem('@greentrack_projects', JSON.stringify(updatedProjects));
      
      // Refresh the parent component
      if (onUpdate) onUpdate();
      
      return true;
    } catch (error) {
      console.error('Error updating project milestones:', error);
      throw error;
    }
  };

  // Helper: Update project with new update
  const addProjectUpdate = async (update) => {
    try {
      const project = await localStorageService.getProjectById(projectId);
      if (!project) throw new Error('Project not found');
      
      const allProjects = await localStorageService.getProjects();
      const currentUpdates = project.updates || [];
      
      const updatedProjects = allProjects.map(p => 
        p.id === projectId 
          ? { ...p, updates: [...currentUpdates, update] }
          : p
      );
      
      await AsyncStorage.setItem('@greentrack_projects', JSON.stringify(updatedProjects));
      
      return true;
    } catch (error) {
      console.error('Error adding update:', error);
      throw error;
    }
  };

  // Add new milestone
  const addMilestone = async () => {
    if (!newMilestone.trim()) {
      Alert.alert('Error', 'Please enter a milestone');
      return;
    }

    try {
      const milestone = {
        id: Date.now().toString(),
        title: newMilestone,
        completed: false,
        createdAt: new Date().toISOString(),
      };

      const updatedMilestones = [...milestones, milestone];
      await updateProjectMilestones(updatedMilestones);

      setNewMilestone('');
      setAdding(false);
      Alert.alert('Success', 'Milestone added successfully');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to add milestone');
    }
  };

  // Toggle milestone completion
  const toggleMilestone = async (milestone) => {
    try {
      const updatedMilestones = milestones.map(m =>
        m.id === milestone.id ? { ...m, completed: !m.completed } : m
      );
      
      await updateProjectMilestones(updatedMilestones);
    } catch (error) {
      Alert.alert('Error', 'Failed to update milestone');
    }
  };

  // Delete milestone
  const deleteMilestone = async (milestone) => {
    Alert.alert(
      'Delete Milestone',
      `Are you sure you want to delete "${milestone.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedMilestones = milestones.filter(m => m.id !== milestone.id);
              await updateProjectMilestones(updatedMilestones);
              Alert.alert('Success', 'Milestone deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete milestone');
            }
          },
        },
      ]
    );
  };

  // Submit project update
  const submitUpdate = async () => {
    if (!updateText.trim()) {
      Alert.alert('Error', 'Please enter an update');
      return;
    }

    try {
      const update = {
        id: Date.now().toString(),
        message: updateText,
        createdAt: new Date().toISOString(),
        progress: calculateProgress(),
      };

      await addProjectUpdate(update);

      setUpdateText('');
      setModalVisible(false);
      if (onUpdate) onUpdate();
      Alert.alert('Success', 'Update posted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to post update');
    }
  };

  const progress = calculateProgress();
  const completedCount = milestones?.filter(m => m.completed).length || 0;
  const totalCount = milestones?.length || 0;

  return (
    <View style={styles.container}>
      {/* Progress Header */}
      <Text style={styles.title}>📊 Project Progress</Text>
      
      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.progressText}>
            {progress.toFixed(0)}% Complete
          </Text>
          <Text style={styles.statsText}>
            {completedCount}/{totalCount} Tasks
          </Text>
        </View>
      </View>

      {/* Milestones Section */}
      <View style={styles.milestoneHeader}>
        <Text style={styles.subtitle}>✅ Milestones & Tasks</Text>
        <TouchableOpacity onPress={() => setAdding(true)} style={styles.addIcon}>
          <Text style={styles.addIconText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Add Milestone Input */}
      {adding && (
        <View style={styles.addContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter milestone (e.g., 'Plant 100 trees')"
            value={newMilestone}
            onChangeText={setNewMilestone}
            multiline
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setAdding(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addBtn} onPress={addMilestone}>
              <Text style={styles.addBtnText}>Add Milestone</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Milestones List */}
      {milestones && milestones.length > 0 ? (
        <FlatList
          data={milestones}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.milestoneItem}>
              <TouchableOpacity
                style={styles.milestoneContent}
                onPress={() => toggleMilestone(item)}
              >
                <Text style={styles.milestoneCheck}>
                  {item.completed ? '✅' : '◻️'}
                </Text>
                <Text style={[
                  styles.milestoneTitle,
                  item.completed && styles.completedText
                ]}>
                  {item.title}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => deleteMilestone(item)}
                style={styles.deleteBtn}
              >
                <Text style={styles.deleteText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <Text style={styles.emptyText}>No milestones added yet. Add your first milestone above.</Text>
      )}

      {/* Post Update Button */}
      <TouchableOpacity
        style={styles.updateBtn}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.updateBtnText}>📝 Post Project Update</Text>
      </TouchableOpacity>

      {/* Update Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Post Project Update</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="What progress has been made?"
              value={updateText}
              onChangeText={setUpdateText}
              multiline
              numberOfLines={4}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelModalBtn]}
                onPress={() => setModalVisible(false)}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.submitModalBtn]}
                onPress={submitUpdate}
              >
                <Text style={styles.submitModalText}>Post Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  progressSection: {
    marginBottom: 20,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 6,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statsText: {
    fontSize: 12,
    color: '#666',
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  addIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIconText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  addContainer: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addBtn: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  addBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cancelBtnText: {
    color: '#666',
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  milestoneContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  milestoneCheck: {
    fontSize: 18,
    marginRight: 10,
  },
  milestoneTitle: {
    fontSize: 14,
    flex: 1,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  deleteBtn: {
    padding: 5,
  },
  deleteText: {
    fontSize: 16,
  },
  emptyText: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  updateBtn: {
    marginTop: 15,
    backgroundColor: '#2196F3',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  updateBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '90%',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelModalBtn: {
    backgroundColor: '#f0f0f0',
  },
  submitModalBtn: {
    backgroundColor: '#4CAF50',
  },
  submitModalText: {
    color: 'white',
    fontWeight: 'bold',
  },
});