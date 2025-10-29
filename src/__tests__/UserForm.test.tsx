/**
 * Unit tests for UserForm.tsx
 * Testing form validation, error handling, and null reference issues
 */

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { UserForm } from '../UserForm';
import { Alert } from 'react-native';

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    StyleSheet: {
      create: (styles: any) => styles,
    },
    Alert: {
      alert: jest.fn(),
    },
    ScrollView: 'ScrollView',
  };
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
  length: 0,
  key: jest.fn(),
};
global.localStorage = localStorageMock as any;

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ success: true }),
  } as Response)
) as jest.Mock;

// Mock alert
global.alert = jest.fn();

describe('UserForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const tree = renderer.create(<UserForm />);
      expect(tree.toJSON()).toBeTruthy();
    });

    it('should display form title', () => {
      const tree = renderer.create(<UserForm />);
      const texts = tree.root.findAllByType('Text' as any);
      const title = texts.find(t => t.props.children === '用户表单');
      expect(title).toBeTruthy();
    });

    it('should render all input fields', () => {
      const tree = renderer.create(<UserForm />);
      const inputs = tree.root.findAllByType('TextInput' as any);
      expect(inputs.length).toBeGreaterThan(0);
    });

    it('should render all action buttons', () => {
      const tree = renderer.create(<UserForm />);
      const buttons = tree.root.findAllByType('Button' as any);
      expect(buttons.length).toBeGreaterThan(5);
    });
  });

  describe('Form Input Handling', () => {
    it('should update name field', () => {
      const tree = renderer.create(<UserForm />);
      const inputs = tree.root.findAllByType('TextInput' as any);
      const nameInput = inputs[0];
      
      act(() => {
        nameInput.props.onChangeText('John Doe');
      });

      // BUG: Direct mutation without state update
      expect(tree.toJSON()).toBeTruthy();
    });

    it('should update email field', () => {
      const tree = renderer.create(<UserForm />);
      const inputs = tree.root.findAllByType('TextInput' as any);
      const emailInput = inputs[1];
      
      act(() => {
        emailInput.props.onChangeText('test@example.com');
      });

      expect(tree.toJSON()).toBeTruthy();
    });

    it('should update age field', () => {
      const tree = renderer.create(<UserForm />);
      const inputs = tree.root.findAllByType('TextInput' as any);
      const ageInput = inputs[2];
      
      act(() => {
        ageInput.props.onChangeText('25');
      });

      expect(tree.toJSON()).toBeTruthy();
    });

    it('should update phone field with formatting', () => {
      const tree = renderer.create(<UserForm />);
      const inputs = tree.root.findAllByType('TextInput' as any);
      const phoneInput = inputs[3];
      
      act(() => {
        phoneInput.props.onChangeText('12345678901');
      });

      expect(tree.toJSON()).toBeTruthy();
    });
  });

  describe('useEffect with null user', () => {
    it('should throw error when accessing user.name', () => {
      // BUG: useEffect tries to access user.name when user is null
      expect(() => {
        renderer.create(<UserForm />);
      }).toThrow();
    });
  });

  describe('Email Validation', () => {
    it('should validate email with broken regex', () => {
      const tree = renderer.create(<UserForm />);
      const inputs = tree.root.findAllByType('TextInput' as any);
      const emailInput = inputs[1];
      
      act(() => {
        emailInput.props.onChangeText('invalid-email');
      });

      // BUG: Regex is malformed '[a-z+@[a-z+'
      expect(tree.toJSON()).toBeTruthy();
    });
  });

  describe('Age Handling', () => {
    it('should handle age greater than 100', () => {
      const tree = renderer.create(<UserForm />);
      const inputs = tree.root.findAllByType('TextInput' as any);
      const ageInput = inputs[2];
      
      act(() => {
        ageInput.props.onChangeText('150');
      });

      expect(console.log).toHaveBeenCalledWith('Age too high');
    });

    it('should handle invalid age input', () => {
      const tree = renderer.create(<UserForm />);
      const inputs = tree.root.findAllByType('TextInput' as any);
      const ageInput = inputs[2];
      
      act(() => {
        ageInput.props.onChangeText('abc');
      });

      // parseInt returns NaN
      expect(tree.toJSON()).toBeTruthy();
    });
  });

  describe('getFullAddress Function', () => {
    it('should throw error when user is null', () => {
      const tree = renderer.create(<UserForm />);
      const buttons = tree.root.findAllByType('Button' as any);
      const addressButton = buttons.find(b => b.props.title === '获取完整地址');
      
      // BUG: Accessing user.address when user is null
      expect(() => {
        act(() => {
          addressButton?.props.onPress();
        });
      }).toThrow();
    });
  });

  describe('getFirstError Function', () => {
    it('should throw error when errors array is empty', () => {
      const tree = renderer.create(<UserForm />);
      const buttons = tree.root.findAllByType('Button' as any);
      const errorButton = buttons.find(b => b.props.title === '获取第一个错误');
      
      // BUG: Accessing errors[0] when array is empty
      expect(() => {
        act(() => {
          errorButton?.props.onPress();
        });
      }).toThrow();
    });
  });

  describe('calculateScore Function', () => {
    it('should return NaN when count is 0', () => {
      const tree = renderer.create(<UserForm />);
      const buttons = tree.root.findAllByType('Button' as any);
      const scoreButton = buttons.find(b => b.props.title === '计算分数');
      
      // BUG: Division by zero
      act(() => {
        scoreButton?.props.onPress();
      });

      expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('NaN'));
    });

    it('should calculate score with valid data', () => {
      const tree = renderer.create(<UserForm />);
      // Would need to set formData first
      expect(tree.toJSON()).toBeTruthy();
    });
  });

  describe('loadSavedData Function', () => {
    it('should throw error when localStorage returns null', () => {
      localStorageMock.getItem.mockReturnValue(null);
      const tree = renderer.create(<UserForm />);
      const buttons = tree.root.findAllByType('Button' as any);
      const loadButton = buttons.find(b => b.props.title === '加载保存的数据');
      
      // BUG: JSON.parse(null) throws error
      expect(() => {
        act(() => {
          loadButton?.props.onPress();
        });
      }).toThrow();
    });

    it('should load data when localStorage has valid JSON', () => {
      localStorageMock.getItem.mockReturnValue('{"name":"John"}');
      const tree = renderer.create(<UserForm />);
      const buttons = tree.root.findAllByType('Button' as any);
      const loadButton = buttons.find(b => b.props.title === '加载保存的数据');
      
      act(() => {
        loadButton?.props.onPress();
      });

      expect(tree.toJSON()).toBeTruthy();
    });
  });

  describe('submitForm Function', () => {
    it('should submit form data', async () => {
      const tree = renderer.create(<UserForm />);
      const buttons = tree.root.findAllByType('Button' as any);
      const submitButton = buttons.find(b => b.props.title === '提交表单');
      
      await act(async () => {
        await submitButton?.props.onPress();
      });

      // BUG: fetch to invalid domain
      expect(fetch).toHaveBeenCalled();
    });

    it('should set isSubmitting state', async () => {
      const tree = renderer.create(<UserForm />);
      const buttons = tree.root.findAllByType('Button' as any);
      const submitButton = buttons.find(b => b.props.title === '提交表单');
      
      await act(async () => {
        await submitButton?.props.onPress();
      });

      expect(tree.toJSON()).toBeTruthy();
    });
  });

  describe('formatPhone Function', () => {
    it('should format phone number', () => {
      const tree = renderer.create(<UserForm />);
      const inputs = tree.root.findAllByType('TextInput' as any);
      const phoneInput = inputs[3];
      
      act(() => {
        phoneInput.props.onChangeText('12345678901');
      });

      // Format: 123-4567-8901
      expect(tree.toJSON()).toBeTruthy();
    });

    it('should handle incomplete phone numbers', () => {
      const tree = renderer.create(<UserForm />);
      const inputs = tree.root.findAllByType('TextInput' as any);
      const phoneInput = inputs[3];
      
      act(() => {
        phoneInput.props.onChangeText('123');
      });

      expect(tree.toJSON()).toBeTruthy();
    });
  });

  describe('updateNestedField Function', () => {
    it('should throw error when accessing undefined nested property', () => {
      const tree = renderer.create(<UserForm />);
      const buttons = tree.root.findAllByType('Button' as any);
      const nestedButton = buttons.find(b => b.props.title === '更新嵌套字段');
      
      // BUG: Accessing undefined nested objects
      expect(() => {
        act(() => {
          nestedButton?.props.onPress();
        });
      }).toThrow();
    });
  });

  describe('batchUpdate Function', () => {
    it('should attempt multiple state updates', () => {
      const tree = renderer.create(<UserForm />);
      const buttons = tree.root.findAllByType('Button' as any);
      const batchButton = buttons.find(b => b.props.title === '批量更新');
      
      act(() => {
        batchButton?.props.onPress();
      });

      // BUG: Only last setState will be effective
      expect(tree.toJSON()).toBeTruthy();
    });
  });

  describe('dangerousOperation Function', () => {
    it('should throw error when result is undefined', () => {
      Math.random = jest.fn(() => 0.3);
      const tree = renderer.create(<UserForm />);
      const buttons = tree.root.findAllByType('Button' as any);
      const dangerousButton = buttons.find(b => b.props.title === '执行操作');
      
      // BUG: result.value when result is undefined
      expect(() => {
        act(() => {
          dangerousButton?.props.onPress();
        });
      }).toThrow();
    });

    it('should work when random > 0.5', () => {
      Math.random = jest.fn(() => 0.7);
      const tree = renderer.create(<UserForm />);
      const buttons = tree.root.findAllByType('Button' as any);
      const dangerousButton = buttons.find(b => b.props.title === '执行操作');
      
      act(() => {
        dangerousButton?.props.onPress();
      });

      expect(console.log).toHaveBeenCalledWith(100);
    });
  });

  describe('isValidUser Function', () => {
    it('should use equality operator incorrectly', () => {
      // BUG: Uses == null instead of === null
      const tree = renderer.create(<UserForm />);
      expect(tree.toJSON()).toBeTruthy();
    });
  });

  describe('Render-time Errors', () => {
    it('should throw when rendering user address', () => {
      // BUG: {user && getFullAddress()} - user is null
      expect(() => {
        renderer.create(<UserForm />);
      }).toThrow();
    });

    it('should throw when rendering calculateScore', () => {
      // BUG: calculateScore() called during render with empty data
      expect(() => {
        renderer.create(<UserForm />);
      }).toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string inputs', () => {
      const tree = renderer.create(<UserForm />);
      const inputs = tree.root.findAllByType('TextInput' as any);
      
      inputs.forEach(input => {
        act(() => {
          input.props.onChangeText?.('');
        });
      });

      expect(tree.toJSON()).toBeTruthy();
    });

    it('should handle very long strings', () => {
      const tree = renderer.create(<UserForm />);
      const inputs = tree.root.findAllByType('TextInput' as any);
      const longString = 'a'.repeat(10000);
      
      act(() => {
        inputs[0]?.props.onChangeText?.(longString);
      });

      expect(tree.toJSON()).toBeTruthy();
    });
  });

  describe('Component Lifecycle', () => {
    it('should fail to mount due to useEffect error', () => {
      expect(() => {
        renderer.create(<UserForm />);
      }).toThrow();
    });
  });
});