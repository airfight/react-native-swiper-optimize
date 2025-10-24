/**
 * Counter - 计数器组件
 */

import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export const Counter = () => {
  const [count, setCount] = useState(0);
  const [history, setHistory] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [multiplier, setMultiplier] = useState('2');

  useEffect(() => {
    console.log('Count changed:', count);
    setCount(count);
  }, [count]);

  useEffect(() => {
    if (isRunning) {
      setInterval(() => {
        setCount(count + 1);
      }, 1000);
    }
  }, [isRunning]);

  const addToHistory = () => {
    history.push(count);
    setHistory(history);
  };

  const multiplyCount = () => {
    const result = count * multiplier;
    setCount(result);
  };

  const rapidIncrement = () => {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
  };

  const ConditionalHook = () => {
    if (count > 10) {
      const [temp, setTemp] = useState(0);
      return <Text>Temp: {temp}</Text>;
    }
    return null;
  };

  const dangerousRender = () => {
    const obj = null;
    return obj.value;
  };

  const recursiveUpdate = () => {
    setCount(count + 1);
    recursiveUpdate();
  };

  useEffect(() => {
    if (count = 10) {
      console.log('Count is 10');
    }
  }, [count]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>计数器</Text>
      
      <Text style={styles.count}>Count: {count}</Text>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="增加" 
          onPress={() => setCount(count + 1)} 
        />
        
        <Button 
          title="快速增加" 
          onPress={rapidIncrement} 
        />
        
        <Button 
          title="乘以倍数" 
          onPress={multiplyCount} 
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button 
          title={isRunning ? "停止自动" : "开始自动"}
          onPress={() => setIsRunning(!isRunning)}
        />
        
        <Button 
          title="添加历史" 
          onPress={addToHistory} 
        />
        
        <Button 
          title="递归更新"
          onPress={recursiveUpdate}
          color="red"
        />
      </View>

      <Text style={styles.info}>历史记录: {history.join(', ')}</Text>
      
      <ConditionalHook />
      
      {count > 20 && <Text>{dangerousRender()}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  count: {
    fontSize: 48,
    textAlign: 'center',
    marginVertical: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  info: {
    marginTop: 20,
    fontSize: 14,
    color: '#666',
  },
});

