import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { habitData } from '../../utils/mockData';

export default function HabitsScreen() {
  const [habits, setHabits] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#4A90E2');
  const [targetTime, setTargetTime] = useState(30); // 默认目标30分钟

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = () => {
    setHabits(habitData.getAllHabits());
  };

  const addHabit = () => {
    if (newHabitName.trim()) {
      habitData.addHabit(
        newHabitName.trim(), 
        selectedColor,
        targetTime * 60 * 1000 // 转换为毫秒
      );
      setNewHabitName('');
      setSelectedColor('#4A90E2');
      setTargetTime(30);
      setModalVisible(false);
      loadHabits();
    }
  };

  const deleteHabit = (id) => {
    Alert.alert(
      '删除习惯',
      '确定要删除这个习惯吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => {
            habitData.deleteHabit(id);
            loadHabits();
          },
        },
      ]
    );
  };

  const colorOptions = [
    '#4A90E2', '#67C23A', '#E6A23C', '#F56C6C',
    '#909399', '#9B59B6', '#1ABC9C', '#E95F3C',
  ];

  const timeOptions = [15, 30, 45, 60, 90, 120]; // 分钟

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>我的习惯</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <FontAwesome name="plus" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView>
        <FlatList
          data={habits}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={[styles.habitItem, { borderLeftColor: item.color }]}>
              <View style={styles.habitInfo}>
                <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                <View style={styles.habitDetails}>
                  <Text style={styles.habitName}>{item.name}</Text>
                  <View style={styles.targetInfo}>
                    <Text style={styles.targetText}>
                      目标: {Math.floor(item.targetTime / 60000)}分钟
                    </Text>
                    <Text style={styles.statsText}>
                      总计: {Math.floor((item.totalTime || 0) / 60000)}分钟
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteHabit(item.id)}
              >
                <FontAwesome name="trash" size={20} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <FontAwesome name="clock-o" size={60} color="#DDD" />
              <Text style={styles.emptyText}>还没有任何习惯</Text>
              <Text style={styles.emptyHint}>点击右上角+添加第一个习惯</Text>
            </View>
          }
        />
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>添加新习惯</Text>
            
            <TextInput
              style={styles.input}
              placeholder="习惯名称（如：专注学习）"
              value={newHabitName}
              onChangeText={setNewHabitName}
              autoFocus
            />
            
            <Text style={styles.label}>每日目标时间：</Text>
            <View style={styles.timeGrid}>
              {timeOptions.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeOption,
                    targetTime === time && styles.timeSelected,
                  ]}
                  onPress={() => setTargetTime(time)}
                >
                  <Text style={[
                    styles.timeText,
                    targetTime === time && styles.timeTextSelected
                  ]}>
                    {time}分钟
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.label}>选择颜色：</Text>
            <View style={styles.colorGrid}>
              {colorOptions.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorSelected,
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={addHabit}
                disabled={!newHabitName.trim()}
              >
                <Text style={styles.saveButtonText}>添加</Text>
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
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#4A90E2',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 10,
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  habitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
  },
  habitDetails: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  targetInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  targetText: {
    fontSize: 12,
    color: '#4A90E2',
  },
  statsText: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    padding: 5,
    marginLeft: 10,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyHint: {
    fontSize: 14,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    color: '#333',
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  timeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    margin: 4,
    minWidth: 70,
  },
  timeSelected: {
    backgroundColor: '#4A90E2',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  timeTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    margin: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSelected: {
    borderColor: '#333',
    transform: [{ scale: 1.1 }],
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#4A90E2',
    marginLeft: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});