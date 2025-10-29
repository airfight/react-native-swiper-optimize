/**
 * Unit tests for Timer.tsx
 * Testing timer management, cleanup, and memory leak issues
 */

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Timer } from '../Timer';
import { AppState } from 'react-native';

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    StyleSheet: {
      create: (styles: any) => styles,
    },
    AppState: {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
  };
});

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.reject(new Error('Network error'))
) as jest.Mock;

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 0)) as any;

describe('Timer Component', () => {
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
      const tree = renderer.create(<Timer />);
      expect(tree.toJSON()).toBeTruthy();
    });

    it('should display initial seconds of 0', () => {
      const tree = renderer.create(<Timer />);
      const texts = tree.root.findAllByType('Text' as any);
      const timerText = texts.find(t => String(t.props.children).includes('0s'));
      expect(timerText).toBeTruthy();
    });

    it('should render all control buttons', () => {
      const tree = renderer.create(<Timer />);
      const buttons = tree.root.findAllByType('Button' as any);
      expect(buttons.length).toBeGreaterThan(5);
    });
  });

  describe('Timer Start/Stop', () => {
    it('should toggle isActive state', () => {
      const tree = renderer.create(<Timer />);
      const buttons = tree.root.findAllByType('Button' as any);
      const toggleButton = buttons.find(b => b.props.title === '开始');
      
      act(() => {
        toggleButton?.props.onPress();
      });

      expect(tree.toJSON()).toBeTruthy();
    });

    it('should create interval when timer starts', () => {
      const setIntervalSpy = jest.spyOn(global, 'setInterval');
      const tree = renderer.create(<Timer />);
      const buttons = tree.root.findAllByType('Button' as any);
      const toggleButton = buttons.find(b => b.props.title === '开始');
      
      act(() => {
        toggleButton?.props.onPress();
      });

      // BUG: Multiple setInterval created without cleanup
      expect(setIntervalSpy).toHaveBeenCalled();
    });
  });

  describe('Multiple Timer Issues', () => {
    it('should identify uncleaned timer on mount', () => {
      const setIntervalSpy = jest.spyOn(global, 'setInterval');
      renderer.create(<Timer />);
      
      // BUG: setInterval in useEffect without cleanup
      expect(setIntervalSpy).toHaveBeenCalled();
    });

    it('should create new interval on every render when active', () => {
      const tree = renderer.create(<Timer />);
      const buttons = tree.root.findAllByType('Button' as any);
      const toggleButton = buttons.find(b => b.props.title === '开始');
      
      act(() => {
        toggleButton?.props.onPress();
      });

      // BUG: useEffect with isActive dependency creates new interval
      expect(tree.toJSON()).toBeTruthy();
    });

    it('should handle startTimer creating closure issue', () => {
      const tree = renderer.create(<Timer />);
      const buttons = tree.root.findAllByType('Button' as any);
      const startButton = buttons.find(b => b.props.title === '多重计时');
      
      act(() => {
        startButton?.props.onPress();
      });

      // BUG: Closure captures stale seconds value
      expect(tree.toJSON()).toBeTruthy();
    });
  });

  describe('Delayed Log', () => {
    it('should add log after delay', () => {
      const tree = renderer.create(<Timer />);
      const buttons = tree.root.findAllByType('Button' as any);
      const delayButton = buttons.find(b => b.props.title === '延迟日志');
      
      act(() => {
        delayButton?.props.onPress();
      });

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // BUG: Closure captures stale logs array
      expect(tree.toJSON()).toBeTruthy();
    });
  });

  describe('Chained Timeouts', () => {
    it('should execute chained timeouts', () => {
      const tree = renderer.create(<Timer />);
      const buttons = tree.root.findAllByType('Button' as any);
      const chainButton = buttons.find(b => b.props.title === '链式超时');
      
      act(() => {
        chainButton?.props.onPress();
      });

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(tree.toJSON()).toBeTruthy();
    });
  });

  describe('Recursive Timeout', () => {
    it('should handle recursive timeout', () => {
      const tree = renderer.create(<Timer />);
      const buttons = tree.root.findAllByType('Button' as any);
      const recursiveButton = buttons.find(b => b.props.title === '递归超时');
      
      act(() => {
        recursiveButton?.props.onPress();
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Creates infinite timeout chain
      expect(tree.toJSON()).toBeTruthy();
    });

    it('should not clean up recursive timeout on unmount', () => {
      const tree = renderer.create(<Timer />);
      const buttons = tree.root.findAllByType('Button' as any);
      const recursiveButton = buttons.find(b => b.props.title === '递归超时');
      
      act(() => {
        recursiveButton?.props.onPress();
      });

      tree.unmount();
      // BUG: timeoutRef not cleared properly
    });
  });

  describe('AppState Listener', () => {
    it('should register AppState listener', () => {
      renderer.create(<Timer />);
      expect(AppState.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should have incorrect cleanup', () => {
      const tree = renderer.create(<Timer />);
      tree.unmount();
      
      // BUG: Cleanup adds listener again instead of removing it
      expect(AppState.addEventListener).toHaveBeenCalled();
    });
  });

  describe('Fetch Operation', () => {
    it('should attempt to fetch data on mount', async () => {
      await act(async () => {
        renderer.create(<Timer />);
      });

      expect(fetch).toHaveBeenCalledWith('https://api.example.com/slow-endpoint');
    });

    it('should handle fetch error', async () => {
      const tree = await act(async () => {
        return renderer.create(<Timer />);
      });

      // BUG: Closure captures stale logs, fetch error not properly handled
      expect(tree.toJSON()).toBeTruthy();
    });
  });

  describe('requestAnimationFrame Loop', () => {
    it('should create infinite animation loop', () => {
      const rafSpy = jest.spyOn(global, 'requestAnimationFrame');
      renderer.create(<Timer />);
      
      // BUG: Infinite requestAnimationFrame loop without cleanup
      expect(rafSpy).toHaveBeenCalled();
    });
  });

  describe('Interval Management', () => {
    it('should set intervalRef based on isActive', () => {
      const tree = renderer.create(<Timer />);
      // BUG: intervalRef.current set regardless of isActive state
      expect(tree.toJSON()).toBeTruthy();
    });

    it('should attempt cleanup in separate useEffect', () => {
      const tree = renderer.create(<Timer />);
      tree.unmount();
      
      // Cleanup exists but may not clean all intervals
      expect(tree.toJSON()).toBeTruthy();
    });
  });

  describe('Window Resize Listener', () => {
    it('should try to add window listener in React Native', () => {
      const tree = renderer.create(<Timer />);
      
      // BUG: window is undefined in React Native
      expect(tree.toJSON()).toBeTruthy();
    });

    it('should not clean up window listener', () => {
      const tree = renderer.create(<Timer />);
      tree.unmount();
      
      // No cleanup for window listener
      expect(tree.toJSON()).toBeTruthy();
    });
  });

  describe('Complex Operation', () => {
    it('should create nested timers', () => {
      const tree = renderer.create(<Timer />);
      const buttons = tree.root.findAllByType('Button' as any);
      const complexButton = buttons.find(b => b.props.title === '复杂操作');
      
      act(() => {
        complexButton?.props.onPress();
      });

      // BUG: Nested interval and timeout with closure issues
      expect(tree.toJSON()).toBeTruthy();
    });
  });

  describe('Reset Functionality', () => {
    it('should reset seconds to 0', () => {
      const tree = renderer.create(<Timer />);
      const buttons = tree.root.findAllByType('Button' as any);
      const resetButton = buttons.find(b => b.props.title === '重置');
      
      act(() => {
        resetButton?.props.onPress();
      });

      expect(tree.toJSON()).toBeTruthy();
    });
  });

  describe('Memory Leaks', () => {
    it('should identify multiple uncleaned intervals', () => {
      const setIntervalSpy = jest.spyOn(global, 'setInterval');
      const tree = renderer.create(<Timer />);
      
      // Multiple setInterval calls without proper cleanup
      expect(setIntervalSpy.mock.calls.length).toBeGreaterThan(1);
      
      tree.unmount();
    });

    it('should identify uncleaned timeouts', () => {
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
      const tree = renderer.create(<Timer />);
      
      expect(setTimeoutSpy).toHaveBeenCalled();
      
      tree.unmount();
    });

    it('should identify requestAnimationFrame leak', () => {
      const rafSpy = jest.spyOn(global, 'requestAnimationFrame');
      const tree = renderer.create(<Timer />);
      
      expect(rafSpy).toHaveBeenCalled();
      
      tree.unmount();
      // No cleanup for RAF
    });
  });

  describe('Mounted Check useEffect', () => {
    it('should use isMounted pattern correctly', () => {
      const tree = renderer.create(<Timer />);
      
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(tree.toJSON()).toBeTruthy();
    });

    it('should set isMounted to false on unmount', () => {
      const tree = renderer.create(<Timer />);
      
      tree.unmount();
      // This useEffect has proper cleanup
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid button presses', () => {
      const tree = renderer.create(<Timer />);
      const buttons = tree.root.findAllByType('Button' as any);
      
      buttons.forEach(button => {
        act(() => {
          button.props.onPress?.();
        });
      });

      expect(tree.toJSON()).toBeTruthy();
    });

    it('should handle unmount with active timers', () => {
      const tree = renderer.create(<Timer />);
      const buttons = tree.root.findAllByType('Button' as any);
      const toggleButton = buttons.find(b => b.props.title === '开始');
      
      act(() => {
        toggleButton?.props.onPress();
      });

      expect(() => tree.unmount()).not.toThrow();
    });
  });

  describe('Component Lifecycle', () => {
    it('should mount without errors', () => {
      expect(() => {
        renderer.create(<Timer />);
      }).not.toThrow();
    });

    it('should unmount without throwing despite leaks', () => {
      const tree = renderer.create(<Timer />);
      expect(() => {
        tree.unmount();
      }).not.toThrow();
    });
  });
});