// utils/mockData.js
class HabitData {
  constructor() {
    this.habits = [
      {
        id: '1',
        name: '专注学习',
        color: '#4A90E2',
        targetTime: 60 * 60 * 1000, // 60分钟
        totalTime: 125 * 60 * 1000, // 125分钟
        todayTime: 45 * 60 * 1000, // 45分钟
        isRunning: false,
        startTime: null,
        createdAt: new Date(),
        history: [],
      },
      {
        id: '2',
        name: '阅读',
        color: '#67C23A',
        targetTime: 30 * 60 * 1000, // 30分钟
        totalTime: 90 * 60 * 1000, // 90分钟
        todayTime: 15 * 60 * 1000, // 15分钟
        isRunning: false,
        startTime: null,
        createdAt: new Date(),
        history: [],
      },
    ];
  }

  getAllHabits() {
    return this.habits.map(habit => ({ ...habit }));
  }

  getTodayHabits() {
    return this.habits.map(habit => ({
      ...habit,
      // 重置每日计时
      todayTime: this.getTodayTime(habit.id),
    }));
  }

  getTodayTime(habitId) {
    const habit = this.habits.find(h => h.id === habitId);
    if (!habit) return 0;
    
    const today = new Date().toDateString();
    const todayLogs = habit.history.filter(log => 
      new Date(log.date).toDateString() === today
    );
    
    return todayLogs.reduce((sum, log) => sum + log.duration, 0);
  }

  addHabit(name, color, targetTime) {
    const newHabit = {
      id: Date.now().toString(),
      name,
      color,
      targetTime,
      totalTime: 0,
      todayTime: 0,
      isRunning: false,
      startTime: null,
      createdAt: new Date(),
      history: [],
    };
    
    this.habits.push(newHabit);
    return newHabit;
  }

  deleteHabit(id) {
    this.habits = this.habits.filter(habit => habit.id !== id);
  }

  startHabit(id) {
    const habit = this.habits.find(h => h.id === id);
    if (habit) {
      habit.isRunning = true;
      habit.startTime = Date.now();
    }
  }

  stopHabit(id, duration) {
    const habit = this.habits.find(h => h.id === id);
    if (habit) {
      habit.isRunning = false;
      habit.totalTime += duration;
      
      // 记录到历史
      const today = new Date().toISOString().split('T')[0];
      const existingLog = habit.history.find(log => log.date === today);
      
      if (existingLog) {
        existingLog.duration += duration;
      } else {
        habit.history.push({
          date: today,
          duration: duration,
        });
      }
      
      habit.startTime = null;
    }
  }

  toggleCheckIn(id) {
    const habit = this.habits.find(h => h.id === id);
    if (habit) {
      habit.isRunning = !habit.isRunning;
      if (habit.isRunning) {
        habit.startTime = Date.now();
      } else {
        const duration = Date.now() - habit.startTime;
        habit.totalTime += duration;
        habit.startTime = null;
      }
    }
  }

  getStats() {
    const totalTime = this.habits.reduce((sum, habit) => sum + habit.totalTime, 0);
    const todayTime = this.habits.reduce((sum, habit) => sum + this.getTodayTime(habit.id), 0);
    const targetTime = this.habits.reduce((sum, habit) => sum + habit.targetTime, 0);
    
    // 计算活跃天数
    const allDates = new Set();
    this.habits.forEach(habit => {
      habit.history.forEach(log => {
        allDates.add(log.date);
      });
    });
    const activeDays = allDates.size;
    
    // 计算连续打卡
    const dates = Array.from(allDates).sort();
    let currentStreak = 0;
    if (dates.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      if (dates.includes(today)) {
        currentStreak = 1;
        let checkDate = yesterday;
        while (dates.includes(checkDate)) {
          currentStreak++;
          checkDate = new Date(new Date(checkDate).getTime() - 86400000).toISOString().split('T')[0];
        }
      }
    }
    
    // 计算本周数据（最近7天）
    const weeklyTime = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
      let dayTotal = 0;
      
      this.habits.forEach(habit => {
        const dayLog = habit.history.find(log => log.date === date);
        if (dayLog) {
          dayTotal += dayLog.duration;
        }
      });
      
      weeklyTime.push(dayTotal);
    }
    
    // 习惯排行
    const habitRanking = [...this.habits]
      .sort((a, b) => b.totalTime - a.totalTime)
      .map(habit => ({
        id: habit.id,
        name: habit.name,
        color: habit.color,
        totalTime: habit.totalTime,
        targetTime: habit.targetTime,
      }));
    
    return {
      totalTime,
      todayTime,
      targetTime,
      activeDays,
      currentStreak,
      weeklyTime,
      habitRanking,
    };
  }
}

export const habitData = new HabitData();