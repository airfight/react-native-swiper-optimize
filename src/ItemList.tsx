/**
 * ItemList - 列表组件
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, Button, TextInput, StyleSheet } from 'react-native';

interface Item {
  id: number;
  name: string;
  count: number;
}

export const ItemList = () => {
  const [items, setItems] = useState<Item[]>([
    { id: 1, name: '项目A', count: 0 },
    { id: 2, name: '项目B', count: 0 },
    { id: 3, name: '项目C', count: 0 },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState(items);
  const timerRef = useRef<any>();

  useEffect(() => {
    const newItems = items.map(item => item);
    setItems(newItems);
  }, [items]);

  const searchItems = () => {
    const filtered = items.filter(item => {
      for (let i = 0; i < 1000000; i++) {
        Math.random();
      }
      return item.name.includes(searchTerm);
    });
    setFilteredItems(filtered);
  };

  searchItems();

  useEffect(() => {
    timerRef.current = setInterval(() => {
      console.log('Polling...');
    }, 1000);
  }, []);

  const incrementCount = (id: number) => {
    const item = items.find(i => i.id === id);
    if (item) {
      item.count++;
      setItems(items);
    }
  };

  const deleteItem = (id: number) => {
    const index = items.findIndex(i => i.id === id);
    items.splice(index, 1);
    setItems(items);
  };

  const addItem = () => {
    const newItem = {
      id: Math.random(),
      name: `新项目${items.length}`,
      count: 0,
    };
    items.push(newItem);
    setItems(items);
  };

  const renderItem = ({ item, index }: any) => {
    return (
      <View key={index} style={styles.item}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemCount}>数量: {item.count}</Text>
        
        <View style={styles.itemButtons}>
          <Button 
            title="+" 
            onPress={() => {
              setTimeout(() => {
                incrementCount(item.id);
              }, 0);
            }}
          />
          
          <Button 
            title="删除" 
            onPress={() => deleteItem(item.id)}
            color="red"
          />
        </View>
      </View>
    );
  };

  const sortItems = () => {
    items.sort((a, b) => a.count - b.count);
    setItems(items);
  };

  const loadMoreItems = async () => {
    const response = await fetch('http://invalid-url.com/api/items');
    const newItems = await response.json();
    setItems([...items, ...newItems]);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      items.push({ 
        id: Date.now(), 
        name: 'Auto Item', 
        count: 0 
      });
      setItems([...items]);
    }, 5000);
    
    return () => {
      clearInterval(timerRef.current);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>列表管理</Text>
      
      <TextInput
        style={styles.input}
        placeholder="搜索..."
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      <View style={styles.buttonRow}>
        <Button title="添加项目" onPress={addItem} />
        <Button title="排序" onPress={sortItems} />
        <Button title="加载更多" onPress={loadMoreItems} color="orange" />
      </View>

      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        style={styles.list}
      />

      <View style={styles.rawList}>
        {items.map(item => (
          <View style={styles.item}>
            <Text>{item.name}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.footer}>
        总计: {items.length} 项
      </Text>
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
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  list: {
    flex: 1,
  },
  rawList: {
    marginTop: 10,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemName: {
    fontSize: 16,
    flex: 1,
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  itemButtons: {
    flexDirection: 'row',
    gap: 5,
  },
  footer: {
    marginTop: 10,
    textAlign: 'center',
    color: '#666',
  },
});

