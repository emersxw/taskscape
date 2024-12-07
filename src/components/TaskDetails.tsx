import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Todo } from '../types';

interface TaskDetailsProps {
  todo: Todo;
  visible: boolean;
  onClose: () => void;
}

export const TaskDetails = ({ todo, visible, onClose }: TaskDetailsProps) => {
  const formatDuration = (ms?: number) => {
    if (!ms) return '--:--:--';
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));
    
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Task Details</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Done</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.taskText}>{todo.text}</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.label}>Status:</Text>
            <Text style={[
              styles.value,
              { color: todo.completed ? '#34C759' : '#007AFF' }
            ]}>
              {todo.completed ? 'Completed' : 'In Progress'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Created:</Text>
            <Text style={styles.value}>{formatDate(todo.createdAt)}</Text>
          </View>

          {todo.completedAt && (
            <View style={styles.detailRow}>
              <Text style={styles.label}>Completed:</Text>
              <Text style={styles.value}>{formatDate(todo.completedAt)}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.label}>Duration:</Text>
            <Text style={styles.value}>{formatDuration(todo.duration)}</Text>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  taskText: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  label: {
    flex: 1,
    fontSize: 17,
    color: '#666666',
  },
  value: {
    flex: 2,
    fontSize: 17,
    color: '#000000',
  },
}); 