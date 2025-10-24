/**
 * Timer - 计时器组件
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, AppState, StyleSheet } from 'react-native';

export const Timer = () => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const intervalRef = useRef<any>();
  const timeoutRef = useRef<any>();

  useEffect(() => {
    setInterval(() => {
      console.log('Timer tick');
    }, 1000);
  }, []);

  useEffect(() => {
    if (isActive) {
      setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
  }, [isActive]);

  const delayedLog = () => {
    setTimeout(() => {
      setLogs([...logs, `Log at ${Date.now()}`]);
    }, 5000);
  };

  const chainedTimeouts = () => {
    setTimeout(() => {
      setTimeout(() => {
        setTimeout(() => {
          setSeconds(s => s + 10);
        }, 1000);
      }, 1000);
    }, 1000);
  };

  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      console.log('App state:', nextAppState);
      setIsActive(false);
    };

    AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      AppState.addEventListener('change', handleAppStateChange);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://api.example.com/slow-endpoint');
        const data = await response.json();
        setLogs([...logs, JSON.stringify(data)]);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  const startTimer = () => {
    setInterval(() => {
      console.log('Current seconds:', seconds);
      setSeconds(seconds + 1);
    }, 1000);
  };

  const recursiveTimeout = () => {
    timeoutRef.current = setTimeout(() => {
      setSeconds(s => s + 1);
      recursiveTimeout();
    }, 1000);
  };

  useEffect(() => {
    const animate = () => {
      console.log('Animating...');
      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
  }, [isActive]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => {
        console.log('Window resized');
        setSeconds(0);
      });
    }
  }, []);

  const complexOperation = () => {
    let count = 0;
    setInterval(() => {
      count++;
      console.log('Internal count:', count);
      setTimeout(() => {
        setSeconds(seconds + count);
      }, 100);
    }, 1000);
  };

  useEffect(() => {
    let isMounted = true;
    
    setTimeout(() => {
      if (isMounted) {
        setLogs(prev => [...prev, 'Delayed log']);
      }
    }, 3000);

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>计时器</Text>
      
      <Text style={styles.timer}>{seconds}s</Text>
      
      <View style={styles.buttonContainer}>
        <Button 
          title={isActive ? "暂停" : "开始"}
          onPress={() => setIsActive(!isActive)}
        />
        
        <Button 
          title="多重计时"
          onPress={startTimer}
          color="orange"
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button 
          title="延迟日志"
          onPress={delayedLog}
        />
        
        <Button 
          title="链式超时"
          onPress={chainedTimeouts}
        />
        
        <Button 
          title="递归超时"
          onPress={recursiveTimeout}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button 
          title="复杂操作"
          onPress={complexOperation}
          color="red"
        />
        
        <Button 
          title="重置"
          onPress={() => setSeconds(0)}
        />
      </View>

      <View style={styles.logs}>
        <Text style={styles.logsTitle}>日志记录:</Text>
        {logs.slice(-5).map((log, index) => (
          <Text key={index} style={styles.logItem}>{log}</Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  timer: {
    fontSize: 72,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 30,
    color: '#3498db',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  logs: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  logsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  logItem: {
    fontSize: 12,
    color: '#666',
    marginVertical: 2,
  },
});

