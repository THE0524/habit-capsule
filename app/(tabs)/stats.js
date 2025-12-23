import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { habitData } from '../../utils/mockData';

const { width } = Dimensions.get('window');

export default function StatsScreen() {
  const [stats, setStats] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    const statsData = habitData.getStats();
    setStats(statsData);
    setWeeklyData(generateWeeklyData(statsData.weeklyTime));
  };

  const generateWeeklyData = (weeklyTime) => {
    const days = ['一', '二', '三', '四', '五', '六', '日'];
    const today = new Date().getDay();
    const data = [];
    
    for (let i = 0; i < 7; i++) {
      const dayIndex = (today - i + 7) % 7;
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.unshift({
        day: days[dayIndex],
        time: weeklyTime[i] || 0,
        date: date.getDate(),
      });
    }
    return data;
  };

  const formatTime = (ms) => {
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return `${hours}小时${minutes}分钟`;
    }
    return `${minutes}分钟`;
  };

  if (!stats) {
    return (
      <View style={styles.container}>
        <Text>加载中...</Text>
      </View>
    );
  }

  const maxWeeklyTime = Math.max(...weeklyData.map(d => d.time));
  const todayTime = stats.todayTime || 0;
  const targetCompletion = stats.targetTime > 0 
    ? Math.min((todayTime / stats.targetTime) * 100, 100) 
    : 0;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>数据统计</Text>
        <Text style={styles.subtitle}>
          {new Date().toLocaleDateString('zh-CN', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
          })}
        </Text>
      </View>

      <View style={styles.todayCard}>
        <Text style={styles.todayTitle}>今日专注</Text>
        <Text style={styles.todayTime}>{formatTime(todayTime)}</Text>
        
        {stats.targetTime > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${targetCompletion}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {targetCompletion.toFixed(0)}% 完成今日目标
            </Text>
          </View>
        )}
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{formatTime(stats.totalTime)}</Text>
          <Text style={styles.statLabel}>总专注时长</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.activeDays}</Text>
          <Text style={styles.statLabel}>坚持天数</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.currentStreak}</Text>
          <Text style={styles.statLabel}>连续打卡</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>本周趋势</Text>
        <View style={styles.weekChart}>
          {weeklyData.map((day, index) => (
            <View key={index} style={styles.weekColumn}>
              <View style={styles.weekBarContainer}>
                <View
                  style={[
                    styles.weekBar,
                    { 
                      height: maxWeeklyTime > 0 
                        ? (day.time / maxWeeklyTime) * 100 
                        : 0 
                    },
                  ]}
                />
              </View>
              <Text style={styles.weekDay}>{day.day}</Text>
              <Text style={styles.weekDate}>{day.date}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>习惯排行</Text>
        {stats.habitRanking.map((habit, index) => {
          const completionRate = habit.targetTime > 0 
            ? Math.min((habit.totalTime / habit.targetTime) * 100, 100)
            : 0;
            
          return (
            <View key={habit.id} style={styles.rankItem}>
              <View style={styles.rankHeader}>
                <View style={styles.rankLeft}>
                  <View style={[styles.rankDot, { backgroundColor: habit.color }]} />
                  <Text style={styles.rankNumber}>#{index + 1}</Text>
                  <Text style={styles.rankName}>{habit.name}</Text>
                </View>
                <Text style={styles.rankTime}>
                  {formatTime(habit.totalTime)}
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { 
                      width: `${completionRate}%`,
                      backgroundColor: habit.color,
                    },
                  ]}
                />
              </View>
              <Text style={styles.rankTarget}>
                目标: {formatTime(habit.targetTime)} • 完成度: {completionRate.toFixed(0)}%
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.motivation}>
        <Text style={styles.motivationTitle}>🎯 成就与鼓励</Text>
        <Text style={styles.motivationText}>
          {stats.currentStreak > 7
            ? `你已连续打卡${stats.currentStreak}天！继续保持这股动力！`
            : stats.activeDays > 15
            ? `本月已专注${stats.activeDays}天，每一次坚持都在塑造更好的自己！`
            : '好的开始是成功的一半，每天进步一点点！'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  todayCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  todayTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  todayTime: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4A90E2',
    fontFamily: 'monospace',
    marginBottom: 15,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'white',
    marginTop: 10,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    marginTop: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  weekChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  weekColumn: {
    alignItems: 'center',
    flex: 1,
  },
  weekBarContainer: {
    height: 80,
    justifyContent: 'flex-end',
    width: 20,
    marginBottom: 8,
  },
  weekBar: {
    width: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 10,
  },
  weekDay: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  weekDate: {
    fontSize: 10,
    color: '#999',
  },
  rankItem: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  rankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    width: 30,
  },
  rankName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  rankTime: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  rankTarget: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  motivation: {
    backgroundColor: 'white',
    marginTop: 10,
    marginBottom: 20,
    padding: 20,
  },
  motivationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  motivationText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});