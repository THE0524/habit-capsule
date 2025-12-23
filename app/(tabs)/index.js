import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { habitData } from '../../utils/mockData';

export default function TodayScreen() {
  const [habits, setHabits] = useState([]);
  const [activeHabit, setActiveHabit] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    loadHabits();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const loadHabits = () => {
    const todayHabits = habitData.getTodayHabits();
    setHabits(todayHabits);
    
    // 检查是否有正在进行的计时
    const runningHabit = todayHabits.find(h => h.isRunning);
    if (runningHabit) {
      startTimer(runningHabit);
    }
  };

  const startTimer = (habit) => {
    setActiveHabit(habit);
    const startTime = habit.startTime || Date.now();
    const alreadyElapsed = habit.elapsedTime || 0;
    
    intervalRef.current = setInterval(() => {
      const currentElapsed = Date.now() - startTime;
      setElapsedTime(alreadyElapsed + currentElapsed);
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startHabit = (habitId) => {
    // 停止当前计时
    if (activeHabit) {
      stopHabit(activeHabit.id);
    }
    
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
      habitData.startHabit(habitId);
      startTimer(habit);
      loadHabits();
    }
  };

  const stopHabit = (habitId) => {
    const habit = habits.find(h => h.id === habitId);
    if (habit && activeHabit?.id === habitId) {
      const totalTime = elapsedTime;
      habitData.stopHabit(habitId, totalTime);
      
      stopTimer();
      setActiveHabit(null);
      setElapsedTime(0);
      loadHabits();
    }
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>今日计时</Text>
        <Text style={styles.date}>
          {new Date().toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
          })}
        </Text>
      </View>

      {/* 当前计时器 */}
      {activeHabit && (
        <View style={[styles.activeTimer, { backgroundColor: activeHabit.color + '20' }]}>
          <Text style={styles.activeHabitName}>{activeHabit.name}</Text>
          <Text style={styles.timerDisplay}>{formatTime(elapsedTime)}</Text>
          <TouchableOpacity
            style={[styles.timerButton, { backgroundColor: '#FF6B6B' }]}
            onPress={() => stopHabit(activeHabit.id)}
          >
            <Text style={styles.timerButtonText}>停止</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 习惯列表 */}
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.habitCard, { borderLeftColor: item.color }]}>
            <View style={styles.habitInfo}>
              <View style={[styles.colorDot, { backgroundColor: item.color }]} />
              <View style={styles.habitDetails}>
                <Text style={styles.habitName}>{item.name}</Text>
                <Text style={styles.timeText}>
                  今日: {formatTime(item.todayTime || 0)} | 总计: {formatTime(item.totalTime || 0)}
                </Text>
              </View>
            </View>
            
            {item.isRunning ? (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#FF6B6B' }]}
                onPress={() => stopHabit(item.id)}
              >
                <Text style={styles.actionButtonText}>停止</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: item.color }]}
                onPress={() => startHabit(item.id)}
              >
                <Text style={styles.actionButtonText}>开始</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>还没有添加习惯</Text>
            <Text style={styles.emptyHint}>去习惯页面添加第一个习惯</Text>
          </View>
        }
      />

      {/* 今日统计 */}
      {habits.length > 0 && (
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>今日总计</Text>
          <Text style={styles.summaryTime}>
            {formatTime(habits.reduce((sum, habit) => sum + (habit.todayTime || 0), 0))}
          </Text>
          <Text style={styles.summaryText}>
            {habits.filter(h => h.isRunning).length > 0 
              ? `正在追踪 ${habits.filter(h => h.isRunning).length} 个习惯`
              : '点击"开始"按钮开始计时'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  activeTimer: {
    backgroundColor: '#E3F2FD',
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeHabitName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  timerDisplay: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'monospace',
    marginBottom: 15,
  },
  timerButton: {
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 25,
    minWidth: 100,
  },
  timerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  habitCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 6,
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  habitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
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
  timeText: {
    fontSize: 12,
    color: '#666',
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 70,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  emptyHint: {
    fontSize: 14,
    color: '#999',
  },
  summary: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  summaryTime: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4A90E2',
    fontFamily: 'monospace',
    marginBottom: 5,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
  },
});