import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Calendar as RNCalendar, DateData } from 'react-native-calendars';
import { Todo } from '../types';
import { Feather } from '@expo/vector-icons';

interface CalendarProps {
  todos: Todo[];
  visible: boolean;
  onClose: () => void;
  onShowDetails: (todo: Todo) => void;
}

type MarkedDates = {
  [date: string]: {
    marked?: boolean;
    dotColor?: string;
    selected?: boolean;
    selectedColor?: string;
  };
};

export const Calendar = ({ todos, visible, onClose, onShowDetails }: CalendarProps) => {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (visible) {
      setSelectedDate(today);
      setIsClosing(false);
    }
  }, [visible]);

  const markedDates: MarkedDates = useMemo(() => {
    const dates: MarkedDates = {};
    
    todos.forEach(todo => {
      if (todo.completedAt) {
        const date = new Date(todo.completedAt).toISOString().split('T')[0];
        dates[date] = {
          marked: true,
          dotColor: '#000000',
        };
      }
    });

    if (selectedDate) {
      dates[selectedDate] = {
        ...(dates[selectedDate] || {}),
        selected: true,
        selectedColor: '#000000',
      };
    }

    return dates;
  }, [todos, selectedDate]);

  const todosForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return todos.filter(todo => {
      if (!todo.completedAt) return false;
      const todoDate = new Date(todo.completedAt).toISOString().split('T')[0];
      return todoDate === selectedDate;
    }).sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
  }, [selectedDate, todos]);

  const handleShowDetails = (todo: Todo) => {
    setIsClosing(true);
    onShowDetails(todo);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[
        styles.container,
        isClosing && styles.closing
      ]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Calendar</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={22} color="#000000" />
          </TouchableOpacity>
        </View>

        <RNCalendar
          style={styles.calendar}
          theme={{
            todayTextColor: '#000000',
            arrowColor: '#000000',
            monthTextColor: '#000000',
            textDayFontSize: 16,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 13,
            selectedDayBackgroundColor: '#000000',
            selectedDayTextColor: '#FFFFFF',
          }}
          markedDates={markedDates}
          onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
          enableSwipeMonths={true}
        />

        {selectedDate && (
          <ScrollView style={styles.details}>
            <Text style={styles.detailsTitle}>
              {new Date(selectedDate).toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            {todosForSelectedDate.length > 0 ? (
              todosForSelectedDate.map(todo => (
                <TouchableOpacity
                  key={todo.id}
                  style={styles.todoItem}
                  onPress={() => handleShowDetails(todo)}
                  activeOpacity={0.7}
                >
                  <View style={styles.todoContent}>
                    <Text style={styles.todoText}>{todo.text}</Text>
                    <Text style={styles.todoTime}>
                      {new Date(todo.completedAt!).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={20} color="#999999" />
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noActivity}>No activity</Text>
            )}
          </ScrollView>
        )}
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
  calendar: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  details: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  detailsTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
  },
  todoItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  todoContent: {
    flex: 1,
    marginRight: 8,
  },
  todoText: {
    fontSize: 17,
    marginBottom: 4,
  },
  todoTime: {
    fontSize: 13,
    color: '#666666',
  },
  noActivity: {
    fontSize: 17,
    color: '#666666',
    textAlign: 'center',
    marginTop: 16,
  },
  closing: {
    opacity: 1,
  },
}); 