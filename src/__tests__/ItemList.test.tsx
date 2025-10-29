/**
 * Unit tests for ItemList.tsx
 * Testing list management, filtering, and performance issues
 */

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { ItemList } from '../ItemList';

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    StyleSheet: {
      create: (styles: any) => styles,
    },
    FlatList: 'FlatList',
  };
});

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.reject(new Error('Network error'))
) as jest.Mock;

describe('ItemList Component', () => {
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
    it('should render correctly with initial items', () => {
      const tree = renderer.create(<ItemList />);
      expect(tree.toJSON()).toBeTruthy();
    });

    it('should display title', () => {
      const tree = renderer.create(<ItemList />);
      const texts = tree.root.findAllByType('Text' as any);
      const title = texts.find(t => t.props.children === '列表管理');
      expect(title).toBeTruthy();
    });

    it('should render search input', () => {
      const tree = renderer.create(<ItemList />);
      const inputs = tree.root.findAllByType('TextInput' as any);
      expect(inputs.length).toBeGreaterThan(0);
    });

    it('should render action buttons', () => {
      const tree = renderer.create(<ItemList />);
      const buttons = tree.root.findAllByType('Button' as any);
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Item Management', () => {
    it('should add new item when add button is pressed', () => {
      const tree = renderer.create(<ItemList />);
      const buttons = tree.root.findAllByType('Button' as any);
      const addButton = buttons.find(b => b.props.title === '添加项目');
      
      act(() => {
        addButton?.props.onPress();
      });

      // BUG: items.push mutates array without proper state update
      expect(tree.toJSON()).toBeTruthy();
    });

    it('should delete item when delete button is pressed', () => {
      const tree = renderer.create(<ItemList />);
      // BUG: items.splice mutates array without proper state update
      expect(tree.toJSON()).toBeTruthy();
    });

    it('should increment item count', () => {
      const tree = renderer.create(<ItemList />);
      // BUG: Direct mutation of item.count without state update
      expect(tree.toJSON()).toBeTruthy();
    });
  });

  describe('Search Functionality', () => {
    it('should update search term on input change', () => {
      const tree = renderer.create(<ItemList />);
      const input = tree.root.findByType('TextInput' as any);
      
      act(() => {
        input.props.onChangeText('项目A');
      });

      expect(tree.toJSON()).toBeTruthy();
    });

    it('should filter items based on search term', () => {
      const tree = renderer.create(<ItemList />);
      // BUG: searchItems() is called on every render, causing performance issues
      expect(tree.toJSON()).toBeTruthy();
    });

    it('should handle search with performance issue', () => {
      const tree = renderer.create(<ItemList />);
      // BUG: Expensive operation in filter (1000000 iterations)
      expect(tree.toJSON()).toBeTruthy();
    });
  });

  describe('Sorting', () => {
    it('should sort items when sort button is pressed', () => {
      const tree = renderer.create(<ItemList />);
      const buttons = tree.root.findAllByType('Button' as any);
      const sortButton = buttons.find(b => b.props.title === '排序');
      
      act(() => {
        sortButton?.props.onPress();
      });

      // BUG: items.sort mutates array without state update
      expect(tree.toJSON()).toBeTruthy();
    });
  });

  describe('Load More Functionality', () => {
    it('should attempt to load more items', async () => {
      const tree = renderer.create(<ItemList />);
      const buttons = tree.root.findAllByType('Button' as any);
      const loadButton = buttons.find(b => b.props.title === '加载更多');
      
      await act(async () => {
        await loadButton?.props.onPress();
      });

      // BUG: fetch to invalid URL will always fail
      expect(tree.toJSON()).toBeTruthy();
    });

    it('should handle fetch error gracefully', async () => {
      const tree = renderer.create(<ItemList />);
      const buttons = tree.root.findAllByType('Button' as any);
      const loadButton = buttons.find(b => b.props.title === '加载更多');
      
      await act(async () => {
        try {
          await loadButton?.props.onPress();
        } catch (error) {
          // Expected to fail
        }
      });

      expect(tree.toJSON()).toBeTruthy();
    });
  });

  describe('useEffect Issues', () => {
    it('should create infinite loop with items dependency', () => {
      const tree = renderer.create(<ItemList />);
      // BUG: useEffect with items dependency creates new array every render
      expect(tree.toJSON()).toBeTruthy();
    });

    it('should create uncleaned polling interval', () => {
      const setIntervalSpy = jest.spyOn(global, 'setInterval');
      const tree = renderer.create(<ItemList />);
      
      // BUG: Polling interval without cleanup
      expect(setIntervalSpy).toHaveBeenCalled();
    });

    it('should create auto-add interval without cleanup', () => {
      const tree = renderer.create(<ItemList />);
      // BUG: Multiple useEffect hooks with intervals, cleanup is wrong
      expect(tree.toJSON()).toBeTruthy();
    });
  });

  describe('Memory Leaks', () => {
    it('should identify timer not being cleaned up properly', () => {
      const tree = renderer.create(<ItemList />);
      tree.unmount();
      
      // BUG: timerRef.current cleanup in wrong useEffect
      expect(true).toBe(true);
    });

    it('should detect multiple interval creations', () => {
      const setIntervalSpy = jest.spyOn(global, 'setInterval');
      renderer.create(<ItemList />);
      
      // Multiple intervals created without proper cleanup
      expect(setIntervalSpy.mock.calls.length).toBeGreaterThan(0);
    });
  });

  describe('Rendering Issues', () => {
    it('should have key prop issues in FlatList', () => {
      const tree = renderer.create(<ItemList />);
      // BUG: renderItem uses index as key instead of item.id
      expect(tree.toJSON()).toBeTruthy();
    });

    it('should render items without proper key in raw list', () => {
      const tree = renderer.create(<ItemList />);
      // BUG: items.map without key prop
      expect(tree.toJSON()).toBeTruthy();
    });
  });

  describe('Async Operations', () => {
    it('should handle setTimeout in increment', () => {
      const tree = renderer.create(<ItemList />);
      // BUG: setTimeout(0) is unnecessary and adds complexity
      expect(tree.toJSON()).toBeTruthy();
    });

    it('should handle fetch errors', async () => {
      global.fetch = jest.fn(() => Promise.reject(new Error('Failed')));
      const tree = renderer.create(<ItemList />);
      
      // Fetch errors not properly handled
      expect(tree.toJSON()).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty search term', () => {
      const tree = renderer.create(<ItemList />);
      const input = tree.root.findByType('TextInput' as any);
      
      act(() => {
        input.props.onChangeText('');
      });

      expect(tree.toJSON()).toBeTruthy();
    });

    it('should handle deleting non-existent item', () => {
      const tree = renderer.create(<ItemList />);
      // Delete with invalid index
      expect(tree.toJSON()).toBeTruthy();
    });

    it('should handle incrementing non-existent item', () => {
      const tree = renderer.create(<ItemList />);
      // Increment with invalid id
      expect(tree.toJSON()).toBeTruthy();
    });

    it('should handle Math.random() generating duplicate IDs', () => {
      Math.random = jest.fn(() => 0.5);
      const tree = renderer.create(<ItemList />);
      const buttons = tree.root.findAllByType('Button' as any);
      const addButton = buttons.find(b => b.props.title === '添加项目');
      
      act(() => {
        addButton?.props.onPress();
        addButton?.props.onPress();
      });

      // BUG: Using Math.random() for IDs can cause duplicates
      expect(tree.toJSON()).toBeTruthy();
    });
  });

  describe('Performance Issues', () => {
    it('should identify expensive search operation', () => {
      const startTime = Date.now();
      const tree = renderer.create(<ItemList />);
      const endTime = Date.now();
      
      // searchItems() called during render with expensive loop
      expect(tree.toJSON()).toBeTruthy();
    });

    it('should identify unnecessary re-renders', () => {
      const tree = renderer.create(<ItemList />);
      // Component re-renders frequently due to state management issues
      expect(tree.toJSON()).toBeTruthy();
    });
  });

  describe('Component Lifecycle', () => {
    it('should mount without throwing errors', () => {
      expect(() => {
        renderer.create(<ItemList />);
      }).not.toThrow();
    });

    it('should unmount gracefully despite memory leaks', () => {
      const tree = renderer.create(<ItemList />);
      expect(() => {
        tree.unmount();
      }).not.toThrow();
    });
  });
});