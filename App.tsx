import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Keyboard,
  Platform,
  ActivityIndicator,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { Todo } from './src/types';
import { loadTodos, saveTodos } from './src/storage';
import { TaskDetails } from './src/components/TaskDetails';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = -80;

interface TodoItemProps {
  item: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  showDetails: (todo: Todo) => void;
}

const TodoItem = ({ item, onToggle, onDelete, showDetails }: TodoItemProps) => {
  const pan = useRef(new Animated.Value(0)).current;
  
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dx < 0) {  // Only allow left swipe
        pan.setValue(gestureState.dx);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx < SWIPE_THRESHOLD) {
        Animated.spring(pan, {
          toValue: SWIPE_THRESHOLD,
          useNativeDriver: false,
        }).start();
      } else {
        Animated.spring(pan, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      }
    },
  });

  const reset = () => {
    Animated.spring(pan, {
      toValue: 0,
      useNativeDriver: false,
    }).start();
  };

  const handleDelete = () => {
    Animated.timing(pan, {
      toValue: -SCREEN_WIDTH,
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      onDelete(item.id);
    });
  };

  return (
    <View style={styles.todoItemContainer}>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDelete}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.todoItemContent,
          { transform: [{ translateX: pan }] }
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={styles.todoItem}
          onPress={() => showDetails(item)}
        >
          <TouchableOpacity
            style={[styles.checkbox, item.completed && styles.checked]}
            onPress={() => onToggle(item.id)}
          >
            {item.completed && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
          <Text style={[
            styles.todoText,
            item.completed && styles.completedText
          ]}>
            {item.text}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  useEffect(() => {
    loadStoredTodos();
  }, []);

  const loadStoredTodos = async () => {
    const storedTodos = await loadTodos();
    setTodos(storedTodos);
    setLoading(false);
  };

  const addTodo = async () => {
    if (newTodo.trim()) {
      const todo: Todo = {
        id: Date.now().toString(),
        text: newTodo.trim(),
        completed: false,
        createdAt: Date.now(),
      };
      const updatedTodos = [...todos, todo];
      setTodos(updatedTodos);
      await saveTodos(updatedTodos);
      setNewTodo('');
      Keyboard.dismiss();
    }
  };

  const toggleTodo = async (id: string) => {
    const updatedTodos = todos.map(todo => {
      if (todo.id === id) {
        const now = Date.now();
        const duration = todo.completed ? undefined : now - todo.createdAt;
        return {
          ...todo,
          completed: !todo.completed,
          completedAt: todo.completed ? undefined : now,
          duration,
        };
      }
      return todo;
    });
    setTodos(updatedTodos);
    await saveTodos(updatedTodos);
  };

  const deleteTodo = async (id: string) => {
    const updatedTodos = todos.filter(todo => todo.id !== id);
    setTodos(updatedTodos);
    await saveTodos(updatedTodos);
  };

  const closeDetails = () => {
    setSelectedTodo(null);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Text style={styles.title}>Tasks</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newTodo}
          onChangeText={setNewTodo}
          placeholder="Add a task"
          placeholderTextColor="#999999"
          onSubmitEditing={addTodo}
          returnKeyType="done"
        />
        <TouchableOpacity 
          style={[styles.addButton, newTodo.trim() ? styles.addButtonActive : null]} 
          onPress={addTodo}
          disabled={!newTodo.trim()}
        >
          <Text style={[
            styles.addButtonText,
            newTodo.trim() ? styles.addButtonTextActive : null
          ]}>
            Add
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        style={styles.list}
        data={todos.sort((a, b) => b.createdAt - a.createdAt)}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TodoItem
            item={item}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            showDetails={() => setSelectedTodo(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
      />

      {selectedTodo && (
        <TaskDetails
          todo={selectedTodo}
          visible={true}
          onClose={closeDetails}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#000000',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 32,
    gap: 12,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 17,
    color: '#000000',
    borderBottomWidth: 2,
    borderBottomColor: '#EEEEEE',
    padding: 0,
  },
  addButton: {
    paddingHorizontal: 16,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  addButtonActive: {
    backgroundColor: '#000000',
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#999999',
  },
  addButtonTextActive: {
    color: '#FFFFFF',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  todoItemContainer: {
    position: 'relative',
  },
  todoItemContent: {
    backgroundColor: '#FFFFFF',
  },
  deleteButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: Math.abs(SWIPE_THRESHOLD),
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    backgroundColor: '#FFFFFF',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#EEEEEE',
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checked: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  todoText: {
    fontSize: 17,
    color: '#000000',
    flex: 1,
    fontWeight: '400',
  },
  completedText: {
    color: '#999999',
  },
});
