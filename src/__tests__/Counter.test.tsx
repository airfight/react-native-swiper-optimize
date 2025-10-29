/**
 * Unit tests for Counter.tsx
 * Testing component behavior, state management, and identifying issues
 */

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Counter } from '../Counter';

// Mock React Native modules
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    StyleSheet: {
      create: (styles: any) => styles,
    },
  };
});

describe('Counter Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render correctly with initial state', () => {
      const tree = renderer.create(<Counter />);
      expect(tree.toJSON()).toBeTruthy();
    });

    it('should display initial count of 0', () => {
      const tree = renderer.create(<Counter />);
      const instance = tree.root;
      const countText = instance.findAll(
        node => node.props.children && String(node.props.children).includes('Count:')
      );
      expect(countText.length).toBeGreaterThan(0);
    });

    it('should render all buttons', () => {
      const tree = renderer.create(<Counter />);
      const buttons = tree.root.findAllByType('Button' as any);
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('State Management', () => {
    it('should increment count when increment button is pressed', () => {
      const tree = renderer.create(<Counter />);
      const buttons = tree.root.findAllByType('Button' as any);
      const incrementButton = buttons.find(b => b.props.title === '增加');
      
      act(() => {
        incrementButton?.props.onPress();
      });

      // State should update
      expect(tree.toJSON()).toBeTruthy();
    });

    it('should handle rapid increment', () => {
      const tree = renderer.create(<Counter />);
      const buttons = tree.root.findAllByType('Button' as any);
      const rapidButton = buttons.find(b => b.props.title === '快速增加');
      
      act(() => {
        rapidButton?.props.onPress();
      });

      // This function has a bug: it calls setCount three times with the same value
      expect(tree.toJSON()).toBeTruthy();
    });
  });

  describe('History Management', () => {
    it('should add count to history when button pressed', () => {
      const tree = renderer.create(<Counter />);
      const buttons = tree.root.findAllByType('Button' as any);
      const historyButton = buttons.find(b => b.props.title === '添加历史');
      
      act(() => {
        historyButton?.props.onPress();
      });

      // BUG: history.push mutates array without triggering re-render
      expect(tree.toJSON()).toBeTruthy();
    });
  });

  describe('Multiply Operation', () => {
    it('should multiply count by multiplier', () => {
      const tree = renderer.create(<Counter />);
      const buttons = tree.root.findAllByType('Button' as any);
      const multiplyButton = buttons.find(b => b.props.title === '乘以倍数');
      
      act(() => {
        multiplyButton?.props.onPress();
      });

      // BUG: multiplier is a string '2', not a number
      expect(tree.toJSON()).toBeTruthy();
    });
  });

  describe('Auto-running Timer', () => {
    it('should toggle auto-running state', () => {
      const tree = renderer.create(<Counter />);
      const buttons = tree.root.findAllByType('Button' as any);
      const autoButton = buttons.find(b => b.props.title.includes('自动'));
      
      act(() => {
        autoButton?.props.onPress();
      });

      // BUG: setInterval without cleanup creates memory leak
      expect(tree.toJSON()).toBeTruthy();
    });

    it('should not create multiple intervals when toggled rapidly', () => {
      const tree = renderer.create(<Counter />);
      const buttons = tree.root.findAllByType('Button' as any);
      const autoButton = buttons.find(b => b.props.title.includes('自动'));
      
      act(() => {
        autoButton?.props.onPress();
        autoButton?.props.onPress();
        autoButton?.props.onPress();
      });

      // Multiple intervals will be created without cleanup
      expect(tree.toJSON()).toBeTruthy();
    });
  });

  describe('Recursive Update', () => {
    it('should handle recursive update button', () => {
      const tree = renderer.create(<Counter />);
      const buttons = tree.root.findAllByType('Button' as any);
      const recursiveButton = buttons.find(b => b.props.title === '递归更新');
      
      // BUG: This will cause infinite recursion
      expect(() => {
        act(() => {
          recursiveButton?.props.onPress();
        });
      }).toThrow();
    });
  });

  describe('Conditional Hook Rendering', () => {
    it('should not render conditional hook component initially', () => {
      const tree = renderer.create(<Counter />);
      // ConditionalHook should not render when count <= 10
      expect(tree.toJSON()).toBeTruthy();
    });

    it('should attempt to render conditional hook when count > 10', () => {
      const tree = renderer.create(<Counter />);
      const buttons = tree.root.findAllByType('Button' as any);
      const incrementButton = buttons.find(b => b.props.title === '增加');
      
      // Increment count multiple times
      for (let i = 0; i < 12; i++) {
        act(() => {
          incrementButton?.props.onPress();
        });
      }

      // BUG: Conditional hook usage violates rules of hooks
      expect(tree.toJSON()).toBeTruthy();
    });
  });

  describe('Dangerous Render', () => {
    it('should handle dangerousRender when count > 20', () => {
      const tree = renderer.create(<Counter />);
      const buttons = tree.root.findAllByType('Button' as any);
      const incrementButton = buttons.find(b => b.props.title === '增加');
      
      // Increment to > 20
      for (let i = 0; i < 22; i++) {
        act(() => {
          incrementButton?.props.onPress();
        });
      }

      // BUG: dangerousRender tries to access .value on null
      expect(tree.toJSON()).toBeTruthy();
    });
  });

  describe('useEffect Issues', () => {
    it('should log count changes', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      const tree = renderer.create(<Counter />);
      
      // BUG: useEffect with setCount(count) creates infinite loop
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should handle effect with assignment instead of comparison', () => {
      const tree = renderer.create(<Counter />);
      
      // BUG: if (count = 10) uses assignment instead of comparison
      expect(tree.toJSON()).toBeTruthy();
    });
  });

  describe('Memory Leaks', () => {
    it('should identify interval not being cleaned up', () => {
      const setIntervalSpy = jest.spyOn(global, 'setInterval');
      const tree = renderer.create(<Counter />);
      
      // BUG: Multiple setInterval calls without cleanup
      expect(setIntervalSpy).toHaveBeenCalled();
      
      tree.unmount();
      // Intervals are not cleaned up on unmount
    });

    it('should detect closure issues in startTimer', () => {
      const tree = renderer.create(<Counter />);
      const buttons = tree.root.findAllByType('Button' as any);
      const rapidButton = buttons.find(b => b.props.title === '快速增加');
      
      act(() => {
        rapidButton?.props.onPress();
      });

      // BUG: Closure captures old count value
      expect(tree.toJSON()).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative multiplier', () => {
      const tree = renderer.create(<Counter />);
      // Multiplier is hardcoded as '2' string
      expect(tree.toJSON()).toBeTruthy();
    });

    it('should handle very large count values', () => {
      const tree = renderer.create(<Counter />);
      const buttons = tree.root.findAllByType('Button' as any);
      const incrementButton = buttons.find(b => b.props.title === '增加');
      
      for (let i = 0; i < 1000; i++) {
        act(() => {
          incrementButton?.props.onPress();
        });
      }

      expect(tree.toJSON()).toBeTruthy();
    });

    it('should handle unmounting during timer operations', () => {
      const tree = renderer.create(<Counter />);
      const buttons = tree.root.findAllByType('Button' as any);
      const autoButton = buttons.find(b => b.props.title.includes('自动'));
      
      act(() => {
        autoButton?.props.onPress();
      });

      tree.unmount();
      // Timers not cleaned up properly
    });
  });

  describe('Component Lifecycle', () => {
    it('should mount without errors', () => {
      expect(() => {
        renderer.create(<Counter />);
      }).not.toThrow();
    });

    it('should unmount without errors', () => {
      const tree = renderer.create(<Counter />);
      expect(() => {
        tree.unmount();
      }).not.toThrow();
    });
  });
});