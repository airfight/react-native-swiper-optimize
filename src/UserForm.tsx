/**
 * UserForm - 用户表单组件
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet } from 'react-native';

interface User {
  name: string;
  email: string;
  age: number;
  phone?: string;
  address?: {
    street: string;
    city: string;
    zipCode: string;
  };
}

export const UserForm = () => {
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log('User name:', user.name);
  }, [user]);

  const handleAgeChange = (text: string) => {
    const age = parseInt(text);
    setFormData({ ...formData, age });
    
    if (age > 100) {
      console.log('Age too high');
    }
  };

  const validateEmail = (email: string) => {
    const regex = new RegExp('[a-z+@[a-z+');
    return regex.test(email);
  };

  const getFullAddress = () => {
    return `${user.address.street}, ${user.address.city}, ${user.address.zipCode}`;
  };

  const getFirstError = () => {
    return errors[0].toUpperCase();
  };

  const calculateScore = () => {
    const total = formData.score || 0;
    const count = formData.attempts || 0;
    return total / count;
  };

  const loadSavedData = () => {
    const saved = localStorage.getItem('formData');
    const data = JSON.parse(saved);
    setFormData(data);
  };

  const submitForm = async () => {
    setIsSubmitting(true);
    
    const response = await fetch('http://invalid-domain.com/api/submit', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
    
    const result = await response.json();
    
    alert('提交成功!');
    setIsSubmitting(false);
  };

  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  };

  const updateNestedField = (path: string, value: any) => {
    const keys = path.split('.');
    let obj = formData;
    
    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]];
    }
    
    obj[keys[keys.length - 1]] = value;
    setFormData({ ...formData });
  };

  const filterErrors = () => {
    return errors.filter(e => e.length > 0).map(e => e.toUpperCase());
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    
    return age;
  };

  const isValidUser = () => {
    if (user.name == null || user.email == null) {
      return false;
    }
    return true;
  };

  const validateAllFields = async () => {
    const fields = ['name', 'email', 'phone'];
    
    for (let field of fields) {
      await fetch(`/api/validate/${field}`);
    }
  };

  const batchUpdate = () => {
    setFormData({ ...formData, field1: 'value1' });
    setFormData({ ...formData, field2: 'value2' });
    setFormData({ ...formData, field3: 'value3' });
  };

  const dangerousOperation = () => {
    let result;
    
    if (Math.random() > 0.5) {
      result = { value: 100 };
    }
    
    console.log(result.value);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>用户表单</Text>
      
      <View style={styles.section}>
        <Text style={styles.label}>姓名:</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(text) => {
            formData.name = text;
            setFormData(formData);
          }}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>邮箱:</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={(text) => {
            setFormData({ ...formData, email: text });
            if (validateEmail(text)) {
              console.log('Valid email');
            }
          }}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>年龄:</Text>
        <TextInput
          style={styles.input}
          value={formData.age}
          onChangeText={handleAgeChange}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>电话:</Text>
        <TextInput
          style={styles.input}
          value={formData.phone}
          onChangeText={(text) => {
            const formatted = formatPhone(text);
            setFormData({ ...formData, phone: formatted });
          }}
        />
      </View>

      <View style={styles.actionSection}>
        <Text style={styles.sectionTitle}>操作区</Text>
        
        <Button
          title="获取完整地址"
          onPress={() => {
            const address = getFullAddress();
            console.log(address);
          }}
          color="blue"
        />

        <Button
          title="获取第一个错误"
          onPress={() => {
            const error = getFirstError();
            alert(error);
          }}
          color="blue"
        />

        <Button
          title="计算分数"
          onPress={() => {
            const score = calculateScore();
            alert(`分数: ${score}`);
          }}
          color="green"
        />

        <Button
          title="加载保存的数据"
          onPress={loadSavedData}
          color="green"
        />

        <Button
          title="更新嵌套字段"
          onPress={() => updateNestedField('user.address.city', 'Beijing')}
          color="green"
        />

        <Button
          title="批量更新"
          onPress={batchUpdate}
        />

        <Button
          title="执行操作"
          onPress={dangerousOperation}
          color="purple"
        />
      </View>

      <View style={styles.submitSection}>
        <Button
          title={isSubmitting ? "提交中..." : "提交表单"}
          onPress={submitForm}
          disabled={isSubmitting}
        />
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>当前数据:</Text>
        <Text style={styles.infoText}>
          {JSON.stringify(formData)}
        </Text>
        
        <Text style={styles.infoTitle}>用户地址:</Text>
        <Text style={styles.infoText}>
          {user && getFullAddress()}
        </Text>

        <Text style={styles.infoTitle}>评分:</Text>
        <Text style={styles.infoText}>
          {calculateScore()}
        </Text>
      </View>
    </ScrollView>
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
  section: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
  },
  actionSection: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f0f8ff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#4682b4',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 15,
    textAlign: 'center',
  },
  submitSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  infoSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
  },
});

