import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Vibration,
  Alert,
  Platform,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

// 提醒函数
const playAlarm = () => {
  // 尝试震动（手机端）
  try {
    Vibration.vibrate([500, 200, 500, 200, 500]);
  } catch (e) {
    console.log('Vibration not supported');
  }
  
  // Web 端使用音频提醒
  if (Platform.OS === 'web') {
    try {
      // 创建音频提示音
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const playBeep = (frequency, duration, time) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + time);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + time + duration);
        oscillator.start(audioContext.currentTime + time);
        oscillator.stop(audioContext.currentTime + time + duration);
      };
      // 播放 3 声提示音
      playBeep(800, 0.3, 0);
      playBeep(800, 0.3, 0.5);
      playBeep(1000, 0.5, 1);
    } catch (e) {
      console.log('Audio not supported');
    }
  }
};

export default function TimerScreen() {
  // 计时器状态
  const [isStopwatch, setIsStopwatch] = useState(true); // true: 计时, false: 倒计时
  const [time, setTime] = useState(0); // 毫秒
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  // 倒计时设置
  const [countdownMinutes, setCountdownMinutes] = useState('5');
  const [countdownSeconds, setCountdownSeconds] = useState('0');
  const [initialCountdown, setInitialCountdown] = useState(0);

  // 计时记录
  const [laps, setLaps] = useState([]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startTimer = () => {
    if (isStopwatch) {
      // 计时模式
      setIsRunning(true);
      const startTime = Date.now() - time;
      intervalRef.current = setInterval(() => {
        setTime(Date.now() - startTime);
      }, 10);
    } else {
      // 倒计时模式
      let countdownTime = time;
      
      if (countdownTime === 0) {
        const totalMs = (parseInt(countdownMinutes) || 0) * 60 * 1000 + 
                       (parseInt(countdownSeconds) || 0) * 1000;
        if (totalMs <= 0) {
          Alert.alert('提示', '请设置倒计时时间');
          return;
        }
        countdownTime = totalMs;
        setTime(totalMs);
        setInitialCountdown(totalMs);
      }
      
      setIsRunning(true);
      const endTime = Date.now() + countdownTime;
      intervalRef.current = setInterval(() => {
        const remaining = endTime - Date.now();
        if (remaining <= 0) {
          clearInterval(intervalRef.current);
          setTime(0);
          setIsRunning(false);
          playAlarm();
          Alert.alert('时间到！', '倒计时已结束');
        } else {
          setTime(remaining);
        }
      }, 10);
    }
  };

  const pauseTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  };

  const resetTimer = () => {
    pauseTimer();
    setTime(0);
    setLaps([]);
    setInitialCountdown(0);
  };

  const addLap = () => {
    if (isStopwatch && isRunning) {
      setLaps(prev => [time, ...prev]);
    }
  };

  const formatTime = (ms, showMs = true) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);

    if (hours > 0) {
      return showMs
        ? `${hours}:${pad(minutes)}:${pad(seconds)}.${pad(milliseconds)}`
        : `${hours}:${pad(minutes)}:${pad(seconds)}`;
    }
    return showMs
      ? `${pad(minutes)}:${pad(seconds)}.${pad(milliseconds)}`
      : `${pad(minutes)}:${pad(seconds)}`;
  };

  const pad = (num) => num.toString().padStart(2, '0');

  const presetTimes = [
    { label: '1分钟', minutes: 1, seconds: 0 },
    { label: '5分钟', minutes: 5, seconds: 0 },
    { label: '10分钟', minutes: 10, seconds: 0 },
    { label: '15分钟', minutes: 15, seconds: 0 },
    { label: '25分钟', minutes: 25, seconds: 0 },
    { label: '30分钟', minutes: 30, seconds: 0 },
  ];

  const selectPreset = (minutes, seconds) => {
    if (!isRunning) {
      setCountdownMinutes(minutes.toString());
      setCountdownSeconds(seconds.toString());
      setTime(0);
    }
  };

  // 计算倒计时进度
  const progress = initialCountdown > 0 ? (time / initialCountdown) * 100 : 0;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>计时器</Text>
      </View>

      {/* 模式切换 */}
      <View style={styles.modeSwitch}>
        <TouchableOpacity
          style={[styles.modeButton, isStopwatch && styles.modeButtonActive]}
          onPress={() => {
            if (!isRunning) {
              setIsStopwatch(true);
              resetTimer();
            }
          }}
        >
          <FontAwesome 
            name="play" 
            size={16} 
            color={isStopwatch ? 'white' : '#666'} 
          />
          <Text style={[styles.modeText, isStopwatch && styles.modeTextActive]}>
            计时
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, !isStopwatch && styles.modeButtonActive]}
          onPress={() => {
            if (!isRunning) {
              setIsStopwatch(false);
              resetTimer();
            }
          }}
        >
          <FontAwesome 
            name="hourglass-half" 
            size={16} 
            color={!isStopwatch ? 'white' : '#666'} 
          />
          <Text style={[styles.modeText, !isStopwatch && styles.modeTextActive]}>
            倒计时
          </Text>
        </TouchableOpacity>
      </View>

      {/* 时间显示 */}
      <View style={styles.timerDisplay}>
        {!isStopwatch && initialCountdown > 0 && (
          <View style={styles.progressRing}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${progress}%`,
                  backgroundColor: progress > 20 ? '#4A90E2' : '#FF6B6B'
                }
              ]} 
            />
          </View>
        )}
        <Text style={styles.timeText}>{formatTime(time)}</Text>
        {!isStopwatch && time === 0 && !isRunning && (
          <Text style={styles.setTimeHint}>设置倒计时时间</Text>
        )}
      </View>

      {/* 倒计时设置 */}
      {!isStopwatch && !isRunning && time === 0 && (
        <View style={styles.countdownSettings}>
          <View style={styles.timeInputContainer}>
            <View style={styles.timeInputGroup}>
              <TextInput
                style={styles.timeInput}
                value={countdownMinutes}
                onChangeText={setCountdownMinutes}
                keyboardType="number-pad"
                maxLength={3}
                placeholder="0"
              />
              <Text style={styles.timeInputLabel}>分</Text>
            </View>
            <Text style={styles.timeSeparator}>:</Text>
            <View style={styles.timeInputGroup}>
              <TextInput
                style={styles.timeInput}
                value={countdownSeconds}
                onChangeText={setCountdownSeconds}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="0"
              />
              <Text style={styles.timeInputLabel}>秒</Text>
            </View>
          </View>

          <Text style={styles.presetTitle}>快速选择</Text>
          <View style={styles.presetGrid}>
            {presetTimes.map((preset) => (
              <TouchableOpacity
                key={preset.label}
                style={styles.presetButton}
                onPress={() => selectPreset(preset.minutes, preset.seconds)}
              >
                <Text style={styles.presetText}>{preset.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* 控制按钮 */}
      <View style={styles.controls}>
        {!isRunning ? (
          <>
            <TouchableOpacity
              style={[styles.controlButton, styles.resetButton]}
              onPress={resetTimer}
            >
              <FontAwesome name="refresh" size={24} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.controlButton, styles.startButton]}
              onPress={startTimer}
            >
              <FontAwesome name="play" size={28} color="white" />
            </TouchableOpacity>
            {isStopwatch && laps.length > 0 && (
              <View style={styles.controlButton} />
            )}
          </>
        ) : (
          <>
            {isStopwatch && (
              <TouchableOpacity
                style={[styles.controlButton, styles.lapButton]}
                onPress={addLap}
              >
                <FontAwesome name="flag" size={24} color="#4A90E2" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.controlButton, styles.pauseButton]}
              onPress={pauseTimer}
            >
              <FontAwesome name="pause" size={28} color="white" />
            </TouchableOpacity>
            {isStopwatch && (
              <TouchableOpacity
                style={[styles.controlButton, styles.resetButton]}
                onPress={resetTimer}
              >
                <FontAwesome name="stop" size={24} color="#FF6B6B" />
              </TouchableOpacity>
            )}
            {!isStopwatch && (
              <TouchableOpacity
                style={[styles.controlButton, styles.resetButton]}
                onPress={resetTimer}
              >
                <FontAwesome name="stop" size={24} color="#FF6B6B" />
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      {/* 计次记录 */}
      {isStopwatch && laps.length > 0 && (
        <View style={styles.lapsContainer}>
          <Text style={styles.lapsTitle}>计次记录</Text>
          {laps.map((lap, index) => {
            const lapNumber = laps.length - index;
            const lapTime = index === laps.length - 1 
              ? lap 
              : lap - laps[index + 1];
            return (
              <View key={index} style={styles.lapItem}>
                <Text style={styles.lapNumber}>计次 {lapNumber}</Text>
                <Text style={styles.lapDiff}>+{formatTime(lapTime, false)}</Text>
                <Text style={styles.lapTotal}>{formatTime(lap, false)}</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* 使用提示 */}
      <View style={styles.tips}>
        <Text style={styles.tipsTitle}>使用提示</Text>
        <Text style={styles.tipsText}>
          {isStopwatch 
            ? '• 点击旗子按钮可以记录计次\n• 计次会显示单次时间和总时间'
            : '• 可以手动输入时间或选择预设\n• 倒计时结束会震动提醒'}
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
  modeSwitch: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 12,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  modeButtonActive: {
    backgroundColor: '#4A90E2',
  },
  modeText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  modeTextActive: {
    color: 'white',
  },
  timerDisplay: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 15,
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  progressRing: {
    width: '100%',
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  timeText: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'monospace',
  },
  setTimeHint: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
  },
  countdownSettings: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 15,
    padding: 20,
    borderRadius: 12,
  },
  timeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  timeInputGroup: {
    alignItems: 'center',
  },
  timeInput: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    width: 80,
    borderBottomWidth: 2,
    borderBottomColor: '#4A90E2',
    paddingVertical: 5,
  },
  timeInputLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  timeSeparator: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 15,
  },
  presetTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  presetButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
  },
  presetText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    gap: 20,
  },
  controlButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButton: {
    backgroundColor: '#67C23A',
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  pauseButton: {
    backgroundColor: '#E6A23C',
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  resetButton: {
    backgroundColor: '#F0F0F0',
  },
  lapButton: {
    backgroundColor: '#E3F2FD',
  },
  lapsContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 15,
    borderRadius: 12,
  },
  lapsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  lapItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  lapNumber: {
    fontSize: 14,
    color: '#666',
    width: 70,
  },
  lapDiff: {
    fontSize: 14,
    color: '#67C23A',
    flex: 1,
    textAlign: 'center',
  },
  lapTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    width: 100,
    textAlign: 'right',
  },
  tips: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
    padding: 15,
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 13,
    color: '#999',
    lineHeight: 20,
  },
});
