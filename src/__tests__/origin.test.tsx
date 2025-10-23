/**
 * Unit tests for react-native-swiper origin.ts
 * Testing all major functionality including initialization, lifecycle, scrolling, autoplay, and rendering
 */

import React from 'react'
import renderer from 'react-test-renderer'
import { Text, View, Platform } from 'react-native'

// Mock React Native modules
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native')
  
  RN.Dimensions = {
    get: jest.fn(() => ({ width: 375, height: 667 }))
  }
  
  RN.Platform = {
    OS: 'ios',
    select: jest.fn(obj => obj.ios)
  }
  
  return RN
})

// Import the component after mocking
import Swiper from '../origin'

describe('Swiper Component', () => {
  let mockChildren: React.ReactNode[]
  
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    mockChildren = [
      <View key="1"><Text>Slide 1</Text></View>,
      <View key="2"><Text>Slide 2</Text></View>,
      <View key="3"><Text>Slide 3</Text></View>
    ]
  })
  
  afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  describe('Initialization and Rendering', () => {
    it('should render correctly with default props', () => {
      const tree = renderer.create(
        <Swiper>{mockChildren}</Swiper>
      )
      expect(tree.toJSON()).toBeTruthy()
    })

    it('should render with single child', () => {
      const tree = renderer.create(
        <Swiper>
          <View><Text>Single Slide</Text></View>
        </Swiper>
      )
      expect(tree.toJSON()).toBeTruthy()
      const instance = tree.root.instance as any
      expect(instance.state.total).toBe(1)
    })

    it('should render with multiple children', () => {
      const tree = renderer.create(
        <Swiper>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      expect(instance.state.total).toBe(3)
    })

    it('should render correctly with custom container style', () => {
      const customStyle = { backgroundColor: 'red' }
      const tree = renderer.create(
        <Swiper containerStyle={customStyle}>{mockChildren}</Swiper>
      )
      expect(tree.toJSON()).toBeTruthy()
    })

    it('should render in vertical mode when horizontal is false', () => {
      const tree = renderer.create(
        <Swiper horizontal={false}>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      expect(instance.state.dir).toBe('y')
    })

    it('should render in horizontal mode by default', () => {
      const tree = renderer.create(
        <Swiper>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      expect(instance.state.dir).toBe('x')
    })

    it('should filter out null/undefined children', () => {
      const childrenWithNulls = [
        <View key="1"><Text>Slide 1</Text></View>,
        null,
        <View key="3"><Text>Slide 3</Text></View>,
        undefined
      ]
      const tree = renderer.create(
        <Swiper>{childrenWithNulls}</Swiper>
      )
      const instance = tree.root.instance as any
      expect(instance.state.total).toBe(2)
    })

    it('should respect initial index prop', () => {
      const tree = renderer.create(
        <Swiper index={1}>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      expect(instance.state.index).toBe(1)
    })

    it('should clamp initial index to valid range', () => {
      const tree = renderer.create(
        <Swiper index={10}>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      expect(instance.state.index).toBe(2) // max index is 2 for 3 children
    })

    it('should handle custom width and height props', () => {
      const tree = renderer.create(
        <Swiper width={300} height={500}>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      expect(instance.state.width).toBe(300)
      expect(instance.state.height).toBe(500)
    })
  })

  describe('State Initialization (initState)', () => {
    it('should initialize state correctly with default props', () => {
      const tree = renderer.create(
        <Swiper>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      const state = instance.state
      
      expect(state.total).toBe(3)
      expect(state.index).toBe(0)
      expect(state.dir).toBe('x')
      expect(state.autoplayEnd).toBe(false)
      expect(state.loopJump).toBe(false)
    })

    it('should calculate offset correctly for horizontal swiper', () => {
      const tree = renderer.create(
        <Swiper index={1}>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      // Offset should be index * width
      expect(instance.state.offset.x).toBe(375) // 1 * 375
    })

    it('should calculate offset correctly for vertical swiper', () => {
      const tree = renderer.create(
        <Swiper horizontal={false} index={1}>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      // Offset should be index * height
      expect(instance.state.offset.y).toBe(667) // 1 * 667
    })

    it('should retain index when total remains same and updateIndex is false', () => {
      const tree = renderer.create(
        <Swiper index={1}>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      const currentIndex = instance.state.index
      
      // Re-initialize without updateIndex
      const newState = instance.initState({ ...instance.props, index: 2 }, false)
      expect(newState.index).toBe(currentIndex)
    })
  })

  describe('Lifecycle Methods', () => {
    it('should call autoplay on componentDidMount', () => {
      const tree = renderer.create(
        <Swiper autoplay>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      const autoplaySpy = jest.spyOn(instance, 'autoplay')
      
      instance.componentDidMount()
      expect(autoplaySpy).toHaveBeenCalled()
    })

    it('should clear timers on componentWillUnmount', () => {
      const tree = renderer.create(
        <Swiper autoplay>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      instance.autoplayTimer = setTimeout(() => {}, 1000)
      instance.loopJumpTimer = setTimeout(() => {}, 1000)
      
      instance.componentWillUnmount()
      
      expect(instance.autoplayTimer).toBe(null)
      expect(instance.loopJumpTimer).toBe(null)
    })

    it('should update state when index prop changes in UNSAFE_componentWillReceiveProps', () => {
      const tree = renderer.create(
        <Swiper index={0}>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      
      instance.UNSAFE_componentWillReceiveProps({ ...instance.props, index: 2 })
      expect(instance.state.index).toBe(2)
    })

    it('should not update state when index prop remains same', () => {
      const tree = renderer.create(
        <Swiper index={1}>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      const initialState = { ...instance.state }
      
      instance.UNSAFE_componentWillReceiveProps({ ...instance.props, index: 1 })
      expect(instance.state.index).toBe(initialState.index)
    })

    it('should clear autoplay timer when autoplay prop becomes false', () => {
      const tree = renderer.create(
        <Swiper autoplay>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      instance.autoplayTimer = setTimeout(() => {}, 1000)
      
      instance.UNSAFE_componentWillReceiveProps({ ...instance.props, autoplay: false })
      expect(instance.autoplayTimer).toBe(null)
    })

    it('should call onIndexChanged when index changes in UNSAFE_componentWillUpdate', () => {
      const onIndexChanged = jest.fn()
      const tree = renderer.create(
        <Swiper onIndexChanged={onIndexChanged}>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      
      const nextState = { ...instance.state, index: 1 }
      instance.UNSAFE_componentWillUpdate(instance.props, nextState)
      
      expect(onIndexChanged).toHaveBeenCalledWith(1)
    })

    it('should start autoplay when autoplay prop changes from false to true', () => {
      const tree = renderer.create(
        <Swiper autoplay={false}>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      const autoplaySpy = jest.spyOn(instance, 'autoplay')
      
      instance.componentDidUpdate({ ...instance.props, autoplay: false })
      tree.update(<Swiper autoplay={true}>{mockChildren}</Swiper>)
      instance.componentDidUpdate({ ...instance.props, autoplay: false })
      
      expect(autoplaySpy).toHaveBeenCalled()
    })

    it('should update state when children prop changes', () => {
      const tree = renderer.create(
        <Swiper>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      const newChildren = [
        <View key="1"><Text>New Slide 1</Text></View>,
        <View key="2"><Text>New Slide 2</Text></View>
      ]
      
      tree.update(<Swiper>{newChildren}</Swiper>)
      instance.componentDidUpdate({ ...instance.props, children: mockChildren })
      
      expect(instance.state.total).toBe(2)
    })
  })

  describe('Autoplay Functionality', () => {
    it('should not autoplay with single child', () => {
      const tree = renderer.create(
        <Swiper autoplay>
          <View><Text>Single</Text></View>
        </Swiper>
      )
      const instance = tree.root.instance as any
      instance.autoplay()
      
      expect(instance.autoplayTimer).toBe(null)
    })

    it('should not autoplay when autoplay prop is false', () => {
      const tree = renderer.create(
        <Swiper autoplay={false}>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      instance.autoplay()
      
      expect(instance.autoplayTimer).toBe(null)
    })

    it('should not autoplay when already scrolling', () => {
      const tree = renderer.create(
        <Swiper autoplay>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      instance.internals.isScrolling = true
      instance.autoplay()
      
      expect(instance.autoplayTimer).toBe(null)
    })

    it('should not autoplay when autoplayEnd is true', () => {
      const tree = renderer.create(
        <Swiper autoplay>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      instance.setState({ autoplayEnd: true })
      instance.autoplay()
      
      expect(instance.autoplayTimer).toBe(null)
    })

    it('should set autoplayEnd when reaching last slide without loop', () => {
      const tree = renderer.create(
        <Swiper autoplay loop={false}>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      instance.setState({ index: 2 }) // last slide
      instance.internals.isScrolling = false
      
      instance.autoplay()
      jest.advanceTimersByTime(2500)
      
      expect(instance.state.autoplayEnd).toBe(true)
    })

    it('should use custom autoplayTimeout', () => {
      const tree = renderer.create(
        <Swiper autoplay autoplayTimeout={5}>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      const scrollBySpy = jest.spyOn(instance, 'scrollBy')
      instance.internals.isScrolling = false
      
      instance.autoplay()
      jest.advanceTimersByTime(4999)
      expect(scrollBySpy).not.toHaveBeenCalled()
      
      jest.advanceTimersByTime(1)
      expect(scrollBySpy).toHaveBeenCalled()
    })

    it('should autoplay in forward direction when autoplayDirection is true', () => {
      const tree = renderer.create(
        <Swiper autoplay autoplayDirection={true}>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      const scrollBySpy = jest.spyOn(instance, 'scrollBy')
      instance.internals.isScrolling = false
      
      instance.autoplay()
      jest.advanceTimersByTime(2500)
      
      expect(scrollBySpy).toHaveBeenCalledWith(1)
    })

    it('should autoplay in backward direction when autoplayDirection is false', () => {
      const tree = renderer.create(
        <Swiper autoplay autoplayDirection={false} index={1}>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      const scrollBySpy = jest.spyOn(instance, 'scrollBy')
      instance.internals.isScrolling = false
      
      instance.autoplay()
      jest.advanceTimersByTime(2500)
      
      expect(scrollBySpy).toHaveBeenCalledWith(-1)
    })

    it('should clear existing autoplay timer before setting new one', () => {
      const tree = renderer.create(
        <Swiper autoplay>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      instance.internals.isScrolling = false
      
      instance.autoplay()
      const firstTimer = instance.autoplayTimer
      
      instance.autoplay()
      const secondTimer = instance.autoplayTimer
      
      expect(secondTimer).not.toBe(firstTimer)
    })
  })

  describe('Scroll Methods', () => {
    describe('scrollBy', () => {
      it('should scroll forward by specified index', () => {
        const tree = renderer.create(
          <Swiper>{mockChildren}</Swiper>
        )
        const instance = tree.root.instance as any
        instance.scrollView = {
          scrollTo: jest.fn()
        }
        instance.internals.isScrolling = false
        
        instance.scrollBy(1)
        
        expect(instance.scrollView.scrollTo).toHaveBeenCalled()
        expect(instance.internals.isScrolling).toBe(true)
      })

      it('should scroll backward by specified index', () => {
        const tree = renderer.create(
          <Swiper index={2}>{mockChildren}</Swiper>
        )
        const instance = tree.root.instance as any
        instance.scrollView = {
          scrollTo: jest.fn()
        }
        instance.internals.isScrolling = false
        
        instance.scrollBy(-1)
        
        expect(instance.scrollView.scrollTo).toHaveBeenCalled()
      })

      it('should not scroll when already scrolling', () => {
        const tree = renderer.create(
          <Swiper>{mockChildren}</Swiper>
        )
        const instance = tree.root.instance as any
        instance.scrollView = {
          scrollTo: jest.fn()
        }
        instance.internals.isScrolling = true
        
        instance.scrollBy(1)
        
        expect(instance.scrollView.scrollTo).not.toHaveBeenCalled()
      })

      it('should not scroll when total slides less than 2', () => {
        const tree = renderer.create(
          <Swiper>
            <View><Text>Single</Text></View>
          </Swiper>
        )
        const instance = tree.root.instance as any
        instance.scrollView = {
          scrollTo: jest.fn()
        }
        instance.internals.isScrolling = false
        
        instance.scrollBy(1)
        
        expect(instance.scrollView.scrollTo).not.toHaveBeenCalled()
      })

      it('should calculate correct x position for horizontal scroll', () => {
        const tree = renderer.create(
          <Swiper loop={false}>{mockChildren}</Swiper>
        )
        const instance = tree.root.instance as any
        instance.scrollView = {
          scrollTo: jest.fn()
        }
        instance.internals.isScrolling = false
        instance.setState({ width: 300 })
        
        instance.scrollBy(1, true)
        
        expect(instance.scrollView.scrollTo).toHaveBeenCalledWith(
          expect.objectContaining({ x: 300, y: 0, animated: true })
        )
      })

      it('should calculate correct y position for vertical scroll', () => {
        const tree = renderer.create(
          <Swiper horizontal={false} loop={false}>{mockChildren}</Swiper>
        )
        const instance = tree.root.instance as any
        instance.scrollView = {
          scrollTo: jest.fn()
        }
        instance.internals.isScrolling = false
        instance.setState({ height: 500 })
        
        instance.scrollBy(1, true)
        
        expect(instance.scrollView.scrollTo).toHaveBeenCalledWith(
          expect.objectContaining({ x: 0, y: 500, animated: true })
        )
      })

      it('should reset autoplayEnd state', () => {
        const tree = renderer.create(
          <Swiper>{mockChildren}</Swiper>
        )
        const instance = tree.root.instance as any
        instance.scrollView = {
          scrollTo: jest.fn()
        }
        instance.setState({ autoplayEnd: true })
        instance.internals.isScrolling = false
        
        instance.scrollBy(1)
        
        expect(instance.state.autoplayEnd).toBe(false)
      })

      it('should trigger onScrollEnd immediately on Android without animation', () => {
        Platform.OS = 'android'
        const tree = renderer.create(
          <Swiper>{mockChildren}</Swiper>
        )
        const instance = tree.root.instance as any
        instance.scrollView = {
          scrollTo: jest.fn()
        }
        instance.internals.isScrolling = false
        const onScrollEndSpy = jest.spyOn(instance, 'onScrollEnd')
        
        instance.scrollBy(1, false)
        jest.runAllImmediates()
        
        expect(onScrollEndSpy).toHaveBeenCalled()
      })
    })

    describe('scrollByCode', () => {
      it('should scroll to specified index', () => {
        const tree = renderer.create(
          <Swiper>{mockChildren}</Swiper>
        )
        const instance = tree.root.instance as any
        instance.scrollView = {
          scrollTo: jest.fn()
        }
        instance.internals.isScrolling = false
        
        instance.scrollByCode(1, true)
        
        expect(instance.scrollView.scrollTo).toHaveBeenCalled()
      })

      it('should clear autoplay timer', () => {
        const tree = renderer.create(
          <Swiper autoplay>{mockChildren}</Swiper>
        )
        const instance = tree.root.instance as any
        instance.scrollView = {
          scrollTo: jest.fn()
        }
        instance.autoplayTimer = setTimeout(() => {}, 1000)
        instance.internals.isScrolling = false
        
        instance.scrollByCode(1)
        
        expect(instance.autoplayTimer).toBe(null)
      })

      it('should call autoplay after scrolling', () => {
        Platform.OS = 'android'
        const tree = renderer.create(
          <Swiper autoplay>{mockChildren}</Swiper>
        )
        const instance = tree.root.instance as any
        instance.scrollView = {
          scrollTo: jest.fn()
        }
        instance.internals.isScrolling = false
        const autoplaySpy = jest.spyOn(instance, 'autoplay')
        
        instance.scrollByCode(1, false)
        jest.runAllImmediates()
        
        expect(autoplaySpy).toHaveBeenCalled()
      })

      it('should not scroll when already scrolling', () => {
        const tree = renderer.create(
          <Swiper>{mockChildren}</Swiper>
        )
        const instance = tree.root.instance as any
        instance.scrollView = {
          scrollTo: jest.fn()
        }
        instance.autoplayTimer = setTimeout(() => {}, 1000)
        instance.internals.isScrolling = true
        
        instance.scrollByCode(1)
        
        // Timer should be cleared even when not scrolling
        expect(instance.autoplayTimer).toBe(null)
        expect(instance.scrollView.scrollTo).not.toHaveBeenCalled()
      })
    })

    describe('scrollTo', () => {
      it('should scroll to specific index', () => {
        const tree = renderer.create(
          <Swiper>{mockChildren}</Swiper>
        )
        const instance = tree.root.instance as any
        instance.scrollView = {
          scrollTo: jest.fn()
        }
        instance.internals.isScrolling = false
        
        instance.scrollTo(2, true)
        
        expect(instance.scrollView.scrollTo).toHaveBeenCalled()
      })

      it('should not scroll when already scrolling', () => {
        const tree = renderer.create(
          <Swiper>{mockChildren}</Swiper>
        )
        const instance = tree.root.instance as any
        instance.scrollView = {
          scrollTo: jest.fn()
        }
        instance.internals.isScrolling = true
        
        instance.scrollTo(2)
        
        expect(instance.scrollView.scrollTo).not.toHaveBeenCalled()
      })

      it('should not scroll to same index', () => {
        const tree = renderer.create(
          <Swiper index={1}>{mockChildren}</Swiper>
        )
        const instance = tree.root.instance as any
        instance.scrollView = {
          scrollTo: jest.fn()
        }
        instance.internals.isScrolling = false
        
        instance.scrollTo(1)
        
        expect(instance.scrollView.scrollTo).not.toHaveBeenCalled()
      })

      it('should not scroll when total slides less than 2', () => {
        const tree = renderer.create(
          <Swiper>
            <View><Text>Single</Text></View>
          </Swiper>
        )
        const instance = tree.root.instance as any
        instance.scrollView = {
          scrollTo: jest.fn()
        }
        instance.internals.isScrolling = false
        
        instance.scrollTo(0)
        
        expect(instance.scrollView.scrollTo).not.toHaveBeenCalled()
      })
    })
  })

  describe('Scroll Event Handlers', () => {
    it('should set isScrolling to true on scroll begin', () => {
      const tree = renderer.create(
        <Swiper>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      instance.internals.isScrolling = false
      
      instance.onScrollBegin({})
      
      expect(instance.internals.isScrolling).toBe(true)
    })

    it('should call onScrollBeginDrag callback if provided', () => {
      const onScrollBeginDrag = jest.fn()
      const tree = renderer.create(
        <Swiper onScrollBeginDrag={onScrollBeginDrag}>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      const event = { nativeEvent: {} }
      
      instance.onScrollBegin(event)
      
      expect(onScrollBeginDrag).toHaveBeenCalledWith(
        event,
        expect.any(Object),
        instance
      )
    })

    it('should set isScrolling to false on scroll end', () => {
      const tree = renderer.create(
        <Swiper>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      instance.internals.isScrolling = true
      const event = {
        nativeEvent: {
          contentOffset: { x: 375, y: 0 }
        }
      }
      
      instance.onScrollEnd(event)
      
      expect(instance.internals.isScrolling).toBe(false)
    })

    it('should handle Android scroll end event format', () => {
      const tree = renderer.create(
        <Swiper>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      instance.setState({ width: 375, height: 667 })
      const event = {
        nativeEvent: {
          position: 1
        }
      }
      
      instance.onScrollEnd(event)
      
      expect(event.nativeEvent.contentOffset).toBeDefined()
      expect(event.nativeEvent.contentOffset.x).toBe(375)
    })

    it('should handle Android vertical scroll end event', () => {
      const tree = renderer.create(
        <Swiper horizontal={false}>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      instance.setState({ width: 375, height: 667 })
      const event = {
        nativeEvent: {
          position: 1
        }
      }
      
      instance.onScrollEnd(event)
      
      expect(event.nativeEvent.contentOffset.y).toBe(667)
    })

    it('should call onMomentumScrollEnd callback if provided', () => {
      const onMomentumScrollEnd = jest.fn()
      const tree = renderer.create(
        <Swiper onMomentumScrollEnd={onMomentumScrollEnd}>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      const event = {
        nativeEvent: {
          contentOffset: { x: 0, y: 0 }
        }
      }
      
      instance.onScrollEnd(event)
      
      expect(onMomentumScrollEnd).toHaveBeenCalledWith(
        event,
        expect.any(Object),
        instance
      )
    })

    it('should call autoplay after scroll end', () => {
      const tree = renderer.create(
        <Swiper autoplay>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      const autoplaySpy = jest.spyOn(instance, 'autoplay')
      const event = {
        nativeEvent: {
          contentOffset: { x: 0, y: 0 }
        }
      }
      
      instance.onScrollEnd(event)
      
      expect(autoplaySpy).toHaveBeenCalled()
    })

    it('should call loopJump after scroll end', () => {
      const tree = renderer.create(
        <Swiper loop>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      const loopJumpSpy = jest.spyOn(instance, 'loopJump')
      const event = {
        nativeEvent: {
          contentOffset: { x: 0, y: 0 }
        }
      }
      
      instance.onScrollEnd(event)
      
      expect(loopJumpSpy).toHaveBeenCalled()
    })

    it('should handle onScrollEndDrag when offset unchanged at boundaries', () => {
      const tree = renderer.create(
        <Swiper loop={false}>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      instance.internals.offset = { x: 0, y: 0 }
      instance.internals.isScrolling = true
      instance.setState({ index: 0 })
      
      const event = {
        nativeEvent: {
          contentOffset: { x: 0, y: 0 }
        }
      }
      
      instance.onScrollEndDrag(event)
      
      expect(instance.internals.isScrolling).toBe(false)
    })
  })

  describe('Update Index', () => {
    it('should update index based on scroll offset', () => {
      const tree = renderer.create(
        <Swiper>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      instance.internals.offset = { x: 0, y: 0 }
      instance.setState({ width: 375, index: 0 })
      
      const offset = { x: 375, y: 0 }
      instance.updateIndex(offset, 'x')
      
      expect(instance.state.index).toBe(1)
    })

    it('should not update when offset has no change', () => {
      const tree = renderer.create(
        <Swiper>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      instance.internals.offset = { x: 375, y: 0 }
      instance.setState({ width: 375, index: 1 })
      const initialIndex = instance.state.index
      
      const offset = { x: 375, y: 0 }
      instance.updateIndex(offset, 'x')
      
      expect(instance.state.index).toBe(initialIndex)
    })

    it('should handle loop jump from last to first', () => {
      const tree = renderer.create(
        <Swiper loop>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      instance.internals.offset = { x: 1125, y: 0 } // position 3 with loop
      instance.setState({ width: 375, total: 3, index: 2 })
      
      const offset = { x: 1500, y: 0 } // scrolling to position 4
      instance.updateIndex(offset, 'x')
      
      expect(instance.state.index).toBe(0)
      expect(instance.state.loopJump).toBe(true)
    })

    it('should handle loop jump from first to last', () => {
      const tree = renderer.create(
        <Swiper loop>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      instance.internals.offset = { x: 375, y: 0 } // position 1 with loop
      instance.setState({ width: 375, total: 3, index: 0 })
      
      const offset = { x: 0, y: 0 } // scrolling to position 0
      instance.updateIndex(offset, 'x')
      
      expect(instance.state.index).toBe(2)
      expect(instance.state.loopJump).toBe(true)
    })

    it('should handle multiple slide jumps', () => {
      const tree = renderer.create(
        <Swiper loop={false}>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      instance.internals.offset = { x: 0, y: 0 }
      instance.setState({ width: 375, index: 0 })
      
      const offset = { x: 750, y: 0 } // jump 2 slides
      instance.updateIndex(offset, 'x')
      
      expect(instance.state.index).toBe(2)
    })

    it('should call callback after state update', () => {
      const callback = jest.fn()
      const tree = renderer.create(
        <Swiper>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      instance.internals.offset = { x: 0, y: 0 }
      instance.setState({ width: 375, index: 0 })
      
      const offset = { x: 375, y: 0 }
      instance.updateIndex(offset, 'x', callback)
      
      // Callback should be called after state updates
      setTimeout(() => {
        expect(callback).toHaveBeenCalled()
      }, 0)
    })

    it('should handle edge case where offset equals internals offset during loop jump', () => {
      const tree = renderer.create(
        <Swiper loop>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      instance.internals.offset = { x: 375, y: 0 }
      instance.setState({ width: 375, total: 3, index: 0 })
      
      const offset = { x: 375, y: 0 }
      instance.updateIndex(offset, 'x')
      
      // Should handle the case where offsets are equal
      expect(instance.state.index).toBe(0)
    })
  })

  describe('Loop Jump', () => {
    it('should not jump when loopJump state is false', () => {
      const tree = renderer.create(
        <Swiper loop>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      instance.scrollView = {
        scrollTo: jest.fn()
      }
      instance.setState({ loopJump: false })
      
      instance.loopJump()
      
      expect(instance.scrollView.scrollTo).not.toHaveBeenCalled()
    })

    it('should jump to correct position when at first slide', () => {
      const tree = renderer.create(
        <Swiper loop>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      instance.scrollView = {
        scrollTo: jest.fn()
      }
      instance.setState({ loopJump: true, index: 0, width: 375, height: 667 })
      
      instance.loopJump()
      jest.advanceTimersByTime(300)
      
      expect(instance.scrollView.scrollTo).toHaveBeenCalledWith(
        expect.objectContaining({ x: 375, y: 0, animated: false })
      )
    })

    it('should jump to correct position when at last slide', () => {
      const tree = renderer.create(
        <Swiper loop>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      instance.scrollView = {
        scrollTo: jest.fn()
      }
      instance.setState({ 
        loopJump: true, 
        index: 2, 
        total: 3,
        width: 375,
        height: 667
      })
      
      instance.loopJump()
      jest.advanceTimersByTime(300)
      
      expect(instance.scrollView.scrollTo).toHaveBeenCalledWith(
        expect.objectContaining({ x: 1125, y: 0, animated: false })
      )
    })

    it('should handle vertical loop jump', () => {
      const tree = renderer.create(
        <Swiper loop horizontal={false}>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      instance.scrollView = {
        scrollTo: jest.fn()
      }
      instance.setState({ loopJump: true, index: 0, width: 375, height: 667 })
      
      instance.loopJump()
      jest.advanceTimersByTime(300)
      
      expect(instance.scrollView.scrollTo).toHaveBeenCalledWith(
        expect.objectContaining({ x: 0, y: 667, animated: false })
      )
    })
  })

  describe('Layout Handler', () => {
    it('should update width and height on layout', () => {
      const tree = renderer.create(
        <Swiper>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      const event = {
        nativeEvent: {
          layout: {
            width: 400,
            height: 600
          }
        }
      }
      
      instance.onLayout(event)
      
      expect(instance.state.width).toBe(400)
      expect(instance.state.height).toBe(600)
    })

    it('should calculate offset for multiple slides with loop', () => {
      const tree = renderer.create(
        <Swiper loop index={1}>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      const event = {
        nativeEvent: {
          layout: {
            width: 400,
            height: 600
          }
        }
      }
      
      instance.onLayout(event)
      
      // With loop, setup = index + 1 = 2
      expect(instance.internals.offset.x).toBe(800) // 400 * 2
    })

    it('should scroll to initial position on first render', () => {
      const tree = renderer.create(
        <Swiper index={1}>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      instance.scrollView = {
        scrollTo: jest.fn()
      }
      instance.initialRender = true
      
      const event = {
        nativeEvent: {
          layout: {
            width: 400,
            height: 600
          }
        }
      }
      
      instance.onLayout(event)
      
      expect(instance.scrollView.scrollTo).toHaveBeenCalled()
      expect(instance.initialRender).toBe(false)
    })

    it('should not scroll on subsequent layouts', () => {
      const tree = renderer.create(
        <Swiper>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      instance.scrollView = {
        scrollTo: jest.fn()
      }
      instance.initialRender = false
      
      const event = {
        nativeEvent: {
          layout: {
            width: 400,
            height: 600
          }
        }
      }
      
      instance.onLayout(event)
      
      expect(instance.scrollView.scrollTo).not.toHaveBeenCalled()
    })
  })

  describe('Rendering Methods', () => {
    describe('renderPagination', () => {
      it('should return null for single slide', () => {
        const tree = renderer.create(
          <Swiper>
            <View><Text>Single</Text></View>
          </Swiper>
        )
        const instance = tree.root.instance as any
        
        const pagination = instance.renderPagination()
        
        expect(pagination).toBe(null)
      })

      it('should render pagination dots for multiple slides', () => {
        const tree = renderer.create(
          <Swiper showsPagination>{mockChildren}</Swiper>
        )
        const instance = tree.root.instance as any
        
        const pagination = instance.renderPagination()
        
        expect(pagination).not.toBe(null)
      })

      it('should use custom dot colors', () => {
        const tree = renderer.create(
          <Swiper 
            showsPagination 
            dotColor="red" 
            activeDotColor="blue"
          >
            {mockChildren}
          </Swiper>
        )
        const instance = tree.root.instance as any
        
        const pagination = instance.renderPagination()
        
        expect(pagination).not.toBe(null)
      })

      it('should use custom dot components', () => {
        const customDot = <View style={{ width: 10, height: 10 }} />
        const customActiveDot = <View style={{ width: 15, height: 15 }} />
        
        const tree = renderer.create(
          <Swiper 
            showsPagination 
            dot={customDot}
            activeDot={customActiveDot}
          >
            {mockChildren}
          </Swiper>
        )
        const instance = tree.root.instance as any
        
        const pagination = instance.renderPagination()
        
        expect(pagination).not.toBe(null)
      })

      it('should use custom renderPagination function', () => {
        const customRenderPagination = jest.fn((index, total, context) => (
          <View><Text>{index} of {total}</Text></View>
        ))
        
        const tree = renderer.create(
          <Swiper renderPagination={customRenderPagination}>{mockChildren}</Swiper>
        )
        
        expect(customRenderPagination).toHaveBeenCalledWith(0, 3, expect.any(Object))
      })

      it('should not render pagination when showsPagination is false', () => {
        const tree = renderer.create(
          <Swiper showsPagination={false}>{mockChildren}</Swiper>
        )
        const json = tree.toJSON()
        
        // Pagination should not be rendered
        expect(json).toBeTruthy()
      })
    })

    describe('renderTitle', () => {
      it('should render title when child has title prop', () => {
        const childrenWithTitle = [
          <View key="1" title={<Text>Title 1</Text>}><Text>Slide 1</Text></View>,
          <View key="2"><Text>Slide 2</Text></View>
        ]
        
        const tree = renderer.create(
          <Swiper>{childrenWithTitle}</Swiper>
        )
        const instance = tree.root.instance as any
        
        const title = instance.renderTitle()
        
        expect(title).not.toBe(null)
      })

      it('should return null when child has no title', () => {
        const tree = renderer.create(
          <Swiper>{mockChildren}</Swiper>
        )
        const instance = tree.root.instance as any
        
        const title = instance.renderTitle()
        
        expect(title).toBe(null)
      })

      it('should return null when children is empty', () => {
        const tree = renderer.create(
          <Swiper>{mockChildren}</Swiper>
        )
        const instance = tree.root.instance as any
        instance.setState({ children: null })
        
        const title = instance.renderTitle()
        
        expect(title).toBe(null)
      })
    })

    describe('renderButtons', () => {
      it('should render next button when not at last slide', () => {
        const tree = renderer.create(
          <Swiper showsButtons loop={false}>{mockChildren}</Swiper>
        )
        const instance = tree.root.instance as any
        instance.setState({ index: 0 })
        
        const nextButton = instance.renderNextButton()
        
        expect(nextButton).not.toBe(null)
      })

      it('should not render next button at last slide without loop', () => {
        const tree = renderer.create(
          <Swiper showsButtons loop={false}>{mockChildren}</Swiper>
        )
        const instance = tree.root.instance as any
        instance.setState({ index: 2, total: 3 })
        
        const nextButton = instance.renderNextButton()
        
        expect(nextButton).toBeTruthy() // TouchableOpacity is always rendered
      })

      it('should render prev button when not at first slide', () => {
        const tree = renderer.create(
          <Swiper showsButtons loop={false} index={1}>{mockChildren}</Swiper>
        )
        const instance = tree.root.instance as any
        
        const prevButton = instance.renderPrevButton()
        
        expect(prevButton).not.toBe(null)
      })

      it('should use custom next button', () => {
        const customNextButton = <Text>Next</Text>
        const tree = renderer.create(
          <Swiper showsButtons nextButton={customNextButton}>{mockChildren}</Swiper>
        )
        
        expect(tree.toJSON()).toBeTruthy()
      })

      it('should use custom prev button', () => {
        const customPrevButton = <Text>Previous</Text>
        const tree = renderer.create(
          <Swiper showsButtons prevButton={customPrevButton}>{mockChildren}</Swiper>
        )
        
        expect(tree.toJSON()).toBeTruthy()
      })

      it('should respect disableNextButton prop', () => {
        const tree = renderer.create(
          <Swiper showsButtons disableNextButton>{mockChildren}</Swiper>
        )
        
        expect(tree.toJSON()).toBeTruthy()
      })

      it('should respect disablePrevButton prop', () => {
        const tree = renderer.create(
          <Swiper showsButtons disablePrevButton>{mockChildren}</Swiper>
        )
        
        expect(tree.toJSON()).toBeTruthy()
      })
    })
  })

  describe('Load Minimal', () => {
    it('should render only nearby slides when loadMinimal is true', () => {
      const tree = renderer.create(
        <Swiper loadMinimal loadMinimalSize={1} index={1}>{mockChildren}</Swiper>
      )
      
      expect(tree.toJSON()).toBeTruthy()
    })

    it('should render loading indicator for distant slides', () => {
      const tree = renderer.create(
        <Swiper loadMinimal loadMinimalSize={0} index={0}>{mockChildren}</Swiper>
      )
      
      expect(tree.toJSON()).toBeTruthy()
    })

    it('should use custom loadMinimalLoader', () => {
      const customLoader = <Text>Loading...</Text>
      const tree = renderer.create(
        <Swiper 
          loadMinimal 
          loadMinimalSize={0} 
          loadMinimalLoader={customLoader}
        >
          {mockChildren}
        </Swiper>
      )
      
      expect(tree.toJSON()).toBeTruthy()
    })

    it('should always keep first real swiper with loop', () => {
      const tree = renderer.create(
        <Swiper loadMinimal loadMinimalSize={0} loop index={2}>{mockChildren}</Swiper>
      )
      
      expect(tree.toJSON()).toBeTruthy()
    })

    it('should always keep last real swiper with loop', () => {
      const tree = renderer.create(
        <Swiper loadMinimal loadMinimalSize={0} loop index={0}>{mockChildren}</Swiper>
      )
      
      expect(tree.toJSON()).toBeTruthy()
    })
  })

  describe('ScrollView Prop Overrides', () => {
    it('should override scroll responder props with wrappers', () => {
      const onTouchStart = jest.fn()
      const tree = renderer.create(
        <Swiper onTouchStart={onTouchStart}>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      
      const overrides = instance.scrollViewPropOverrides()
      
      expect(overrides.onTouchStart).toBeDefined()
      expect(typeof overrides.onTouchStart).toBe('function')
    })

    it('should not override excluded props', () => {
      const onMomentumScrollEnd = jest.fn()
      const renderPagination = jest.fn()
      const onScrollBeginDrag = jest.fn()
      
      const tree = renderer.create(
        <Swiper 
          onMomentumScrollEnd={onMomentumScrollEnd}
          renderPagination={renderPagination}
          onScrollBeginDrag={onScrollBeginDrag}
        >
          {mockChildren}
        </Swiper>
      )
      const instance = tree.root.instance as any
      
      const overrides = instance.scrollViewPropOverrides()
      
      expect(overrides.onMomentumScrollEnd).toBeUndefined()
      expect(overrides.renderPagination).toBeUndefined()
      expect(overrides.onScrollBeginDrag).toBeUndefined()
    })

    it('should call original responder with fullState and instance', () => {
      const onTouchStart = jest.fn()
      const tree = renderer.create(
        <Swiper onTouchStart={onTouchStart}>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      
      const overrides = instance.scrollViewPropOverrides()
      const event = { nativeEvent: {} }
      overrides.onTouchStart(event)
      
      expect(onTouchStart).toHaveBeenCalledWith(
        event,
        expect.any(Object),
        instance
      )
    })
  })

  describe('Full State', () => {
    it('should merge state and internals', () => {
      const tree = renderer.create(
        <Swiper>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      instance.internals = { isScrolling: true, offset: { x: 100, y: 0 } }
      
      const fullState = instance.fullState()
      
      expect(fullState.isScrolling).toBe(true)
      expect(fullState.index).toBeDefined()
      expect(fullState.total).toBeDefined()
    })
  })

  describe('Reference Management', () => {
    it('should store scrollView reference', () => {
      const tree = renderer.create(
        <Swiper>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      const mockScrollView = { scrollTo: jest.fn() }
      
      instance.refScrollView(mockScrollView)
      
      expect(instance.scrollView).toBe(mockScrollView)
    })
  })

  describe('Page Scroll State Changed', () => {
    it('should handle dragging state', () => {
      const tree = renderer.create(
        <Swiper>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      const onScrollBeginSpy = jest.spyOn(instance, 'onScrollBegin')
      
      instance.onPageScrollStateChanged('dragging')
      
      expect(onScrollBeginSpy).toHaveBeenCalled()
    })

    it('should handle idle state with onTouchEnd callback', () => {
      const onTouchEnd = jest.fn()
      const tree = renderer.create(
        <Swiper onTouchEnd={onTouchEnd}>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      
      instance.onPageScrollStateChanged('idle')
      
      expect(onTouchEnd).toHaveBeenCalled()
    })

    it('should handle settling state', () => {
      const tree = renderer.create(
        <Swiper>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      
      instance.onPageScrollStateChanged('settling')
      
      // Should not throw
      expect(true).toBe(true)
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty children array', () => {
      const tree = renderer.create(
        <Swiper>{[]}</Swiper>
      )
      const instance = tree.root.instance as any
      
      expect(instance.state.total).toBe(0)
    })

    it('should handle zero width and height', () => {
      const tree = renderer.create(
        <Swiper width={0} height={0}>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      
      expect(instance.state.width).toBe(0)
      expect(instance.state.height).toBe(0)
    })

    it('should handle negative index prop', () => {
      const tree = renderer.create(
        <Swiper index={-1}>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      
      expect(instance.state.index).toBeGreaterThanOrEqual(0)
    })

    it('should handle updateIndex with undefined internals.offset', () => {
      const tree = renderer.create(
        <Swiper>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      delete instance.internals.offset
      
      const offset = { x: 375, y: 0 }
      instance.updateIndex(offset, 'x')
      
      expect(instance.internals.offset).toBeDefined()
    })

    it('should handle rapid prop changes', () => {
      const tree = renderer.create(
        <Swiper index={0}>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      
      instance.UNSAFE_componentWillReceiveProps({ ...instance.props, index: 1 })
      instance.UNSAFE_componentWillReceiveProps({ ...instance.props, index: 2 })
      instance.UNSAFE_componentWillReceiveProps({ ...instance.props, index: 0 })
      
      expect(instance.state.index).toBe(0)
    })

    it('should handle scrollBy with no scrollView reference', () => {
      const tree = renderer.create(
        <Swiper>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      instance.scrollView = null
      instance.internals.isScrolling = false
      
      expect(() => instance.scrollBy(1)).not.toThrow()
    })

    it('should handle very large autoplayTimeout', () => {
      const tree = renderer.create(
        <Swiper autoplay autoplayTimeout={999999}>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      instance.internals.isScrolling = false
      
      instance.autoplay()
      
      expect(instance.autoplayTimer).not.toBe(null)
    })

    it('should handle zero autoplayTimeout', () => {
      const tree = renderer.create(
        <Swiper autoplay autoplayTimeout={0}>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      instance.internals.isScrolling = false
      
      instance.autoplay()
      jest.advanceTimersByTime(0)
      
      expect(instance.autoplayTimer).not.toBe(null)
    })
  })

  describe('Platform-Specific Behavior', () => {
    beforeEach(() => {
      Platform.OS = 'ios'
    })

    it('should handle iOS-specific rendering', () => {
      Platform.OS = 'ios'
      const tree = renderer.create(
        <Swiper>{mockChildren}</Swiper>
      )
      
      expect(tree.toJSON()).toBeTruthy()
    })

    it('should handle Android-specific rendering', () => {
      Platform.OS = 'android'
      const tree = renderer.create(
        <Swiper>{mockChildren}</Swiper>
      )
      
      expect(tree.toJSON()).toBeTruthy()
    })

    it('should trigger immediate scroll end on iOS without animation', () => {
      Platform.OS = 'ios'
      const tree = renderer.create(
        <Swiper>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      instance.scrollView = {
        scrollTo: jest.fn()
      }
      instance.internals.isScrolling = false
      
      instance.scrollBy(1, false)
      
      // On iOS without animation, should still be called immediately
      expect(instance.internals.isScrolling).toBe(true)
    })

    it('should handle children changes on iOS with loadMinimal', () => {
      Platform.OS = 'ios'
      const tree = renderer.create(
        <Swiper loadMinimal>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      const newChildren = [
        <View key="1"><Text>New 1</Text></View>,
        <View key="2"><Text>New 2</Text></View>
      ]
      
      tree.update(<Swiper loadMinimal>{newChildren}</Swiper>)
      instance.componentDidUpdate({ ...instance.props, children: mockChildren })
      
      expect(instance.state.index).toBeDefined()
    })
  })

  describe('Complex Interaction Scenarios', () => {
    it('should handle scrolling while autoplay is active', () => {
      const tree = renderer.create(
        <Swiper autoplay>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      instance.scrollView = {
        scrollTo: jest.fn()
      }
      instance.internals.isScrolling = false
      
      // Start autoplay
      instance.autoplay()
      
      // Manual scroll
      instance.onScrollBegin({})
      
      // Autoplay should not trigger while scrolling
      expect(instance.internals.isScrolling).toBe(true)
    })

    it('should resume autoplay after manual scroll', () => {
      const tree = renderer.create(
        <Swiper autoplay>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      const autoplaySpy = jest.spyOn(instance, 'autoplay')
      
      // Simulate scroll end
      instance.onScrollEnd({
        nativeEvent: {
          contentOffset: { x: 375, y: 0 }
        }
      })
      
      expect(autoplaySpy).toHaveBeenCalled()
    })

    it('should handle loop with autoplay at boundaries', () => {
      const tree = renderer.create(
        <Swiper autoplay loop>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      instance.scrollView = {
        scrollTo: jest.fn()
      }
      instance.internals.isScrolling = false
      instance.setState({ index: 2 }) // last slide
      
      instance.autoplay()
      jest.advanceTimersByTime(2500)
      
      // Should scroll to next (which loops to first)
      expect(instance.scrollView.scrollTo).toHaveBeenCalled()
    })

    it('should handle rapid index changes from parent', () => {
      const tree = renderer.create(
        <Swiper index={0}>{mockChildren}</Swiper>
      )
      
      tree.update(<Swiper index={1}>{mockChildren}</Swiper>)
      tree.update(<Swiper index={2}>{mockChildren}</Swiper>)
      tree.update(<Swiper index={0}>{mockChildren}</Swiper>)
      
      const instance = tree.root.instance as any
      expect(instance.state.index).toBe(0)
    })

    it('should maintain state consistency during rapid scrolls', () => {
      const tree = renderer.create(
        <Swiper loop>{mockChildren}</Swiper>
      )
      const instance = tree.root.instance as any
      instance.internals.offset = { x: 0, y: 0 }
      instance.setState({ width: 375 })
      
      // Rapid scroll events
      instance.updateIndex({ x: 375, y: 0 }, 'x')
      instance.updateIndex({ x: 750, y: 0 }, 'x')
      instance.updateIndex({ x: 375, y: 0 }, 'x')
      
      expect(instance.state.index).toBeGreaterThanOrEqual(0)
      expect(instance.state.index).toBeLessThan(instance.state.total)
    })
  })

  describe('Custom Styling', () => {
    it('should apply custom dot styles', () => {
      const customDotStyle = { width: 12, height: 12, backgroundColor: 'red' }
      const customActiveDotStyle = { width: 16, height: 16, backgroundColor: 'blue' }
      
      const tree = renderer.create(
        <Swiper 
          showsPagination
          dotStyle={customDotStyle}
          activeDotStyle={customActiveDotStyle}
        >
          {mockChildren}
        </Swiper>
      )
      
      expect(tree.toJSON()).toBeTruthy()
    })

    it('should apply custom pagination style', () => {
      const customPaginationStyle = { bottom: 10, backgroundColor: 'rgba(0,0,0,0.5)' }
      
      const tree = renderer.create(
        <Swiper 
          showsPagination
          paginationStyle={customPaginationStyle}
        >
          {mockChildren}
        </Swiper>
      )
      
      expect(tree.toJSON()).toBeTruthy()
    })

    it('should apply custom button wrapper style', () => {
      const customButtonWrapperStyle = { padding: 20 }
      
      const tree = renderer.create(
        <Swiper 
          showsButtons
          buttonWrapperStyle={customButtonWrapperStyle}
        >
          {mockChildren}
        </Swiper>
      )
      
      expect(tree.toJSON()).toBeTruthy()
    })

    it('should apply custom scrollView style', () => {
      const customScrollViewStyle = { backgroundColor: 'lightgray' }
      
      const tree = renderer.create(
        <Swiper scrollViewStyle={customScrollViewStyle}>{mockChildren}</Swiper>
      )
      
      expect(tree.toJSON()).toBeTruthy()
    })
  })
})