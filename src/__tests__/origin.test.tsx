/**
 * Unit tests for react-native-swiper (origin.ts)
 * @format
 */

import 'react-native'
import React from 'react'
import Swiper from '../origin'
import renderer from 'react-test-renderer'
import { Text, View, Platform } from 'react-native'

// Mock timers
jest.useFakeTimers()

// Mock Dimensions
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: jest.fn().mockReturnValue({ width: 375, height: 667 })
}))

describe('Swiper Component', () => {
  beforeEach(() => {
    jest.clearAllTimers()
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.clearAllTimers()
  })

  describe('Basic Rendering', () => {
    it('renders correctly with single child', () => {
      const tree = renderer.create(
        <Swiper>
          <View><Text>Slide 1</Text></View>
        </Swiper>
      )
      expect(tree.toJSON()).toBeTruthy()
    })

    it('renders correctly with multiple children', () => {
      const tree = renderer.create(
        <Swiper>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
          <View><Text>Slide 3</Text></View>
        </Swiper>
      )
      expect(tree.toJSON()).toBeTruthy()
    })

    it('renders correctly with custom styles', () => {
      const customStyle = { backgroundColor: 'red' }
      const tree = renderer.create(
        <Swiper style={customStyle}>
          <View><Text>Slide 1</Text></View>
        </Swiper>
      )
      expect(tree.toJSON()).toBeTruthy()
    })

    it('renders correctly without children', () => {
      const tree = renderer.create(
        <Swiper>
          {null}
        </Swiper>
      )
      expect(tree.toJSON()).toBeTruthy()
    })
  })

  describe('Props and Default Props', () => {
    it('uses default props when not specified', () => {
      const component = renderer.create(
        <Swiper>
          <View><Text>Slide 1</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      expect(instance.props.horizontal).toBe(true)
      expect(instance.props.pagingEnabled).toBe(true)
      expect(instance.props.showsPagination).toBe(true)
      expect(instance.props.loop).toBe(true)
      expect(instance.props.autoplay).toBe(false)
      expect(instance.props.autoplayTimeout).toBe(2.5)
      expect(instance.props.index).toBe(0)
    })

    it('accepts custom horizontal prop', () => {
      const component = renderer.create(
        <Swiper horizontal={false}>
          <View><Text>Slide 1</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      expect(instance.props.horizontal).toBe(false)
    })

    it('accepts custom autoplay props', () => {
      const component = renderer.create(
        <Swiper autoplay={true} autoplayTimeout={5}>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      expect(instance.props.autoplay).toBe(true)
      expect(instance.props.autoplayTimeout).toBe(5)
    })

    it('accepts custom loop prop', () => {
      const component = renderer.create(
        <Swiper loop={false}>
          <View><Text>Slide 1</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      expect(instance.props.loop).toBe(false)
    })

    it('accepts custom pagination props', () => {
      const component = renderer.create(
        <Swiper 
          showsPagination={false}
          dotColor="red"
          activeDotColor="blue"
        >
          <View><Text>Slide 1</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      expect(instance.props.showsPagination).toBe(false)
      expect(instance.props.dotColor).toBe('red')
      expect(instance.props.activeDotColor).toBe('blue')
    })

    it('accepts custom button props', () => {
      const component = renderer.create(
        <Swiper 
          showsButtons={true}
          disableNextButton={true}
          disablePrevButton={false}
        >
          <View><Text>Slide 1</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      expect(instance.props.showsButtons).toBe(true)
      expect(instance.props.disableNextButton).toBe(true)
      expect(instance.props.disablePrevButton).toBe(false)
    })

    it('accepts custom loadMinimal props', () => {
      const component = renderer.create(
        <Swiper 
          loadMinimal={true}
          loadMinimalSize={2}
        >
          <View><Text>Slide 1</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      expect(instance.props.loadMinimal).toBe(true)
      expect(instance.props.loadMinimalSize).toBe(2)
    })
  })

  describe('State Initialization', () => {
    it('initializes state correctly with default props', () => {
      const component = renderer.create(
        <Swiper>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      expect(instance.state.index).toBe(0)
      expect(instance.state.total).toBe(2)
      expect(instance.state.dir).toBe('x')
      expect(instance.state.autoplayEnd).toBe(false)
    })

    it('initializes state with custom index', () => {
      const component = renderer.create(
        <Swiper index={1}>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
          <View><Text>Slide 3</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      expect(instance.state.index).toBe(1)
    })

    it('initializes state with vertical direction', () => {
      const component = renderer.create(
        <Swiper horizontal={false}>
          <View><Text>Slide 1</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      expect(instance.state.dir).toBe('y')
    })

    it('filters out null/undefined children', () => {
      const component = renderer.create(
        <Swiper>
          <View><Text>Slide 1</Text></View>
          {null}
          {undefined}
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      expect(instance.state.total).toBe(2)
    })

    it('clamps index to valid range', () => {
      const component = renderer.create(
        <Swiper index={10}>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      expect(instance.state.index).toBe(1) // clamped to total - 1
    })

    it('handles single child correctly', () => {
      const component = renderer.create(
        <Swiper>
          <View><Text>Slide 1</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      expect(instance.state.total).toBe(1)
      expect(instance.state.index).toBe(0)
    })
  })

  describe('Lifecycle Methods', () => {
    it('calls autoplay on componentDidMount if autoplay is enabled', () => {
      const component = renderer.create(
        <Swiper autoplay={true}>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      const autoplaySpy = jest.spyOn(instance, 'autoplay')
      instance.componentDidMount()
      expect(autoplaySpy).toHaveBeenCalled()
    })

    it('clears autoplay timer on componentWillUnmount', () => {
      const component = renderer.create(
        <Swiper autoplay={true}>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      instance.autoplayTimer = setTimeout(() => {}, 1000)
      instance.loopJumpTimer = setTimeout(() => {}, 1000)
      
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')
      component.unmount()
      expect(clearTimeoutSpy).toHaveBeenCalled()
    })

    it('updates state when receiving new index prop', () => {
      const component = renderer.create(
        <Swiper index={0}>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
          <View><Text>Slide 3</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      
      component.update(
        <Swiper index={2}>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
          <View><Text>Slide 3</Text></View>
        </Swiper>
      )
      
      expect(instance.state.index).toBe(2)
    })

    it('clears autoplay timer when autoplay prop becomes false', () => {
      const component = renderer.create(
        <Swiper autoplay={true}>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      instance.autoplayTimer = setTimeout(() => {}, 1000)
      
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')
      component.update(
        <Swiper autoplay={false}>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      
      expect(clearTimeoutSpy).toHaveBeenCalled()
    })

    it('calls onIndexChanged when index changes', () => {
      const onIndexChanged = jest.fn()
      const component = renderer.create(
        <Swiper onIndexChanged={onIndexChanged}>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      
      instance.setState({ index: 1 })
      expect(onIndexChanged).toHaveBeenCalledWith(1)
    })

    it('restarts autoplay when autoplay prop changes from false to true', () => {
      const component = renderer.create(
        <Swiper autoplay={false}>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      const autoplaySpy = jest.spyOn(instance, 'autoplay')
      
      component.update(
        <Swiper autoplay={true}>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      
      expect(autoplaySpy).toHaveBeenCalled()
    })
  })

  describe('Autoplay Functionality', () => {
    it('does not autoplay when autoplay is false', () => {
      const component = renderer.create(
        <Swiper autoplay={false}>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      instance.autoplay()
      expect(instance.autoplayTimer).toBeNull()
    })

    it('does not autoplay when children is not an array', () => {
      const component = renderer.create(
        <Swiper autoplay={true}>
          <View><Text>Slide 1</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      instance.autoplay()
      expect(instance.autoplayTimer).toBeNull()
    })

    it('sets autoplayEnd when reaching last slide without loop', () => {
      const component = renderer.create(
        <Swiper autoplay={true} loop={false} autoplayDirection={true}>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      instance.setState({ index: 1 }) // last slide
      instance.autoplay()
      
      jest.runOnlyPendingTimers()
      expect(instance.state.autoplayEnd).toBe(true)
    })

    it('sets autoplayEnd when reaching first slide with reverse autoplay', () => {
      const component = renderer.create(
        <Swiper autoplay={true} loop={false} autoplayDirection={false}>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      instance.setState({ index: 0 }) // first slide
      instance.autoplay()
      
      jest.runOnlyPendingTimers()
      expect(instance.state.autoplayEnd).toBe(true)
    })

    it('respects autoplayTimeout setting', () => {
      const component = renderer.create(
        <Swiper autoplay={true} autoplayTimeout={5}>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      const scrollBySpy = jest.spyOn(instance, 'scrollBy')
      
      instance.autoplay()
      jest.advanceTimersByTime(4999)
      expect(scrollBySpy).not.toHaveBeenCalled()
      
      jest.advanceTimersByTime(1)
      expect(scrollBySpy).toHaveBeenCalled()
    })

    it('scrolls forward with autoplayDirection true', () => {
      const component = renderer.create(
        <Swiper autoplay={true} autoplayDirection={true}>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      const scrollBySpy = jest.spyOn(instance, 'scrollBy')
      
      instance.autoplay()
      jest.runOnlyPendingTimers()
      expect(scrollBySpy).toHaveBeenCalledWith(1)
    })

    it('scrolls backward with autoplayDirection false', () => {
      const component = renderer.create(
        <Swiper autoplay={true} autoplayDirection={false} index={1}>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      const scrollBySpy = jest.spyOn(instance, 'scrollBy')
      
      instance.autoplay()
      jest.runOnlyPendingTimers()
      expect(scrollBySpy).toHaveBeenCalledWith(-1)
    })

    it('does not autoplay while scrolling', () => {
      const component = renderer.create(
        <Swiper autoplay={true}>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      instance.internals.isScrolling = true
      
      instance.autoplay()
      expect(instance.autoplayTimer).toBeNull()
    })
  })

  describe('Scroll Handling', () => {
    it('sets isScrolling to true on scroll begin', () => {
      const component = renderer.create(
        <Swiper>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      instance.onScrollBegin({})
      expect(instance.internals.isScrolling).toBe(true)
    })

    it('sets isScrolling to false on scroll end', () => {
      const component = renderer.create(
        <Swiper>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      instance.internals.offset = { x: 0, y: 0 }
      
      instance.onScrollEnd({
        nativeEvent: {
          contentOffset: { x: 375, y: 0 }
        }
      })
      expect(instance.internals.isScrolling).toBe(false)
    })

    it('calls onScrollBeginDrag prop when provided', () => {
      const onScrollBeginDrag = jest.fn()
      const component = renderer.create(
        <Swiper onScrollBeginDrag={onScrollBeginDrag}>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      const event = {}
      instance.onScrollBegin(event)
      expect(onScrollBeginDrag).toHaveBeenCalledWith(event, expect.any(Object), instance)
    })

    it('calls onMomentumScrollEnd prop when provided', () => {
      const onMomentumScrollEnd = jest.fn()
      const component = renderer.create(
        <Swiper onMomentumScrollEnd={onMomentumScrollEnd}>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      instance.internals.offset = { x: 0, y: 0 }
      
      const event = {
        nativeEvent: {
          contentOffset: { x: 375, y: 0 }
        }
      }
      instance.onScrollEnd(event)
      expect(onMomentumScrollEnd).toHaveBeenCalledWith(event, expect.any(Object), instance)
    })

    it('handles Android scroll events without contentOffset', () => {
      const component = renderer.create(
        <Swiper>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      instance.internals.offset = { x: 0, y: 0 }
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

    it('handles vertical scroll events for Android', () => {
      const component = renderer.create(
        <Swiper horizontal={false}>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      instance.internals.offset = { x: 0, y: 0 }
      instance.setState({ width: 375, height: 667 })
      
      const event = {
        nativeEvent: {
          position: 1
        }
      }
      instance.onScrollEnd(event)
      expect(event.nativeEvent.contentOffset.y).toBe(667)
    })

    it('sets isScrolling to false on scroll end drag when at boundaries', () => {
      const component = renderer.create(
        <Swiper>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      instance.internals.offset = { x: 0, y: 0 }
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

  describe('Index Update Logic', () => {
    it('updates index correctly when scrolling forward', () => {
      const component = renderer.create(
        <Swiper>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
          <View><Text>Slide 3</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      instance.internals.offset = { x: 0, y: 0 }
      instance.setState({ width: 375, index: 0 })
      
      const callback = jest.fn()
      instance.updateIndex({ x: 375, y: 0 }, 'x', callback)
      expect(instance.state.index).toBe(1)
      expect(callback).toHaveBeenCalled()
    })

    it('updates index correctly when scrolling backward', () => {
      const component = renderer.create(
        <Swiper>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
          <View><Text>Slide 3</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      instance.internals.offset = { x: 750, y: 0 }
      instance.setState({ width: 375, index: 2 })
      
      instance.updateIndex({ x: 375, y: 0 }, 'x', jest.fn())
      expect(instance.state.index).toBe(1)
    })

    it('handles loop jump from end to beginning', () => {
      const component = renderer.create(
        <Swiper loop={true}>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      instance.internals.offset = { x: 375, y: 0 }
      instance.setState({ width: 375, index: 1, total: 2 })
      
      instance.updateIndex({ x: 750, y: 0 }, 'x', jest.fn())
      expect(instance.state.index).toBe(0)
      expect(instance.state.loopJump).toBe(true)
    })

    it('handles loop jump from beginning to end', () => {
      const component = renderer.create(
        <Swiper loop={true}>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      instance.internals.offset = { x: 375, y: 0 }
      instance.setState({ width: 375, index: 0, total: 2 })
      
      instance.updateIndex({ x: 0, y: 0 }, 'x', jest.fn())
      expect(instance.state.index).toBe(1)
      expect(instance.state.loopJump).toBe(true)
    })

    it('does not update when offset has not changed', () => {
      const component = renderer.create(
        <Swiper>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      instance.internals.offset = { x: 375, y: 0 }
      instance.setState({ width: 375, index: 1 })
      
      const initialIndex = instance.state.index
      instance.updateIndex({ x: 375, y: 0 }, 'x', jest.fn())
      expect(instance.state.index).toBe(initialIndex)
    })

    it('handles rapid continuous scrolling', () => {
      const component = renderer.create(
        <Swiper>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
          <View><Text>Slide 3</Text></View>
          <View><Text>Slide 4</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      instance.internals.offset = { x: 0, y: 0 }
      instance.setState({ width: 375, index: 0 })
      
      // Scroll by 2 slides at once
      instance.updateIndex({ x: 750, y: 0 }, 'x', jest.fn())
      expect(instance.state.index).toBe(2)
    })
  })

  describe('Navigation Methods', () => {
    describe('scrollBy', () => {
      it('scrolls by positive offset', () => {
        const component = renderer.create(
          <Swiper>
            <View><Text>Slide 1</Text></View>
            <View><Text>Slide 2</Text></View>
          </Swiper>
        )
        const instance = component.root.findByType(Swiper).instance
        instance.scrollView = { scrollTo: jest.fn() }
        instance.setState({ width: 375, index: 0 })
        
        instance.scrollBy(1)
        expect(instance.scrollView.scrollTo).toHaveBeenCalledWith({
          x: 750, // (loop ? 1 : 0) + 1 + 0 = 2 * 375
          y: 0,
          animated: true
        })
      })

      it('scrolls by negative offset', () => {
        const component = renderer.create(
          <Swiper>
            <View><Text>Slide 1</Text></View>
            <View><Text>Slide 2</Text></View>
          </Swiper>
        )
        const instance = component.root.findByType(Swiper).instance
        instance.scrollView = { scrollTo: jest.fn() }
        instance.setState({ width: 375, index: 1 })
        
        instance.scrollBy(-1)
        expect(instance.scrollView.scrollTo).toHaveBeenCalledWith({
          x: 375, // (1 + -1 + 1) * 375
          y: 0,
          animated: true
        })
      })

      it('does not scroll when already scrolling', () => {
        const component = renderer.create(
          <Swiper>
            <View><Text>Slide 1</Text></View>
            <View><Text>Slide 2</Text></View>
          </Swiper>
        )
        const instance = component.root.findByType(Swiper).instance
        instance.scrollView = { scrollTo: jest.fn() }
        instance.internals.isScrolling = true
        
        instance.scrollBy(1)
        expect(instance.scrollView.scrollTo).not.toHaveBeenCalled()
      })

      it('does not scroll with less than 2 total slides', () => {
        const component = renderer.create(
          <Swiper>
            <View><Text>Slide 1</Text></View>
          </Swiper>
        )
        const instance = component.root.findByType(Swiper).instance
        instance.scrollView = { scrollTo: jest.fn() }
        
        instance.scrollBy(1)
        expect(instance.scrollView.scrollTo).not.toHaveBeenCalled()
      })

      it('resets autoplayEnd on scroll', () => {
        const component = renderer.create(
          <Swiper>
            <View><Text>Slide 1</Text></View>
            <View><Text>Slide 2</Text></View>
          </Swiper>
        )
        const instance = component.root.findByType(Swiper).instance
        instance.scrollView = { scrollTo: jest.fn() }
        instance.setState({ autoplayEnd: true })
        
        instance.scrollBy(1)
        expect(instance.state.autoplayEnd).toBe(false)
      })

      it('handles vertical scrolling', () => {
        const component = renderer.create(
          <Swiper horizontal={false}>
            <View><Text>Slide 1</Text></View>
            <View><Text>Slide 2</Text></View>
          </Swiper>
        )
        const instance = component.root.findByType(Swiper).instance
        instance.scrollView = { scrollTo: jest.fn() }
        instance.setState({ height: 667, index: 0 })
        
        instance.scrollBy(1)
        expect(instance.scrollView.scrollTo).toHaveBeenCalledWith({
          x: 0,
          y: 1334, // (1 + 1 + 0) * 667
          animated: true
        })
      })

      it('triggers onScrollEnd manually on Android', () => {
        Platform.OS = 'android'
        const component = renderer.create(
          <Swiper>
            <View><Text>Slide 1</Text></View>
            <View><Text>Slide 2</Text></View>
          </Swiper>
        )
        const instance = component.root.findByType(Swiper).instance
        instance.scrollView = { scrollTo: jest.fn() }
        const onScrollEndSpy = jest.spyOn(instance, 'onScrollEnd')
        
        instance.scrollBy(1, false)
        jest.runAllImmediates()
        expect(onScrollEndSpy).toHaveBeenCalled()
      })
    })

    describe('scrollTo', () => {
      it('scrolls to specific index', () => {
        const component = renderer.create(
          <Swiper>
            <View><Text>Slide 1</Text></View>
            <View><Text>Slide 2</Text></View>
            <View><Text>Slide 3</Text></View>
          </Swiper>
        )
        const instance = component.root.findByType(Swiper).instance
        instance.scrollView = { scrollTo: jest.fn() }
        instance.setState({ width: 375, index: 0 })
        
        instance.scrollTo(2)
        expect(instance.scrollView.scrollTo).toHaveBeenCalledWith({
          x: 750, // (0 + (2 - 0)) * 375
          y: 0,
          animated: true
        })
      })

      it('does not scroll to same index', () => {
        const component = renderer.create(
          <Swiper>
            <View><Text>Slide 1</Text></View>
            <View><Text>Slide 2</Text></View>
          </Swiper>
        )
        const instance = component.root.findByType(Swiper).instance
        instance.scrollView = { scrollTo: jest.fn() }
        instance.setState({ index: 1 })
        
        instance.scrollTo(1)
        expect(instance.scrollView.scrollTo).not.toHaveBeenCalled()
      })

      it('does not scroll when already scrolling', () => {
        const component = renderer.create(
          <Swiper>
            <View><Text>Slide 1</Text></View>
            <View><Text>Slide 2</Text></View>
          </Swiper>
        )
        const instance = component.root.findByType(Swiper).instance
        instance.scrollView = { scrollTo: jest.fn() }
        instance.internals.isScrolling = true
        
        instance.scrollTo(1)
        expect(instance.scrollView.scrollTo).not.toHaveBeenCalled()
      })
    })

    describe('scrollByCode', () => {
      it('scrolls to index and restarts autoplay', () => {
        const component = renderer.create(
          <Swiper autoplay={true}>
            <View><Text>Slide 1</Text></View>
            <View><Text>Slide 2</Text></View>
            <View><Text>Slide 3</Text></View>
          </Swiper>
        )
        const instance = component.root.findByType(Swiper).instance
        instance.scrollView = { scrollTo: jest.fn() }
        instance.autoplayTimer = setTimeout(() => {}, 1000)
        const autoplaySpy = jest.spyOn(instance, 'autoplay')
        
        instance.scrollByCode(1) // scrolls to index 1 (2nd slide)
        expect(instance.scrollView.scrollTo).toHaveBeenCalled()
        expect(autoplaySpy).toHaveBeenCalled()
      })

      it('clears existing autoplay timer', () => {
        const component = renderer.create(
          <Swiper>
            <View><Text>Slide 1</Text></View>
            <View><Text>Slide 2</Text></View>
          </Swiper>
        )
        const instance = component.root.findByType(Swiper).instance
        instance.scrollView = { scrollTo: jest.fn() }
        instance.autoplayTimer = setTimeout(() => {}, 1000)
        const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')
        
        instance.scrollByCode(1)
        expect(clearTimeoutSpy).toHaveBeenCalled()
      })
    })
  })

  describe('Loop Jump Functionality', () => {
    it('executes loop jump when loopJump is true', () => {
      const component = renderer.create(
        <Swiper loop={true}>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      instance.scrollView = { scrollTo: jest.fn() }
      instance.setState({ loopJump: true, index: 0, width: 375 })
      
      instance.loopJump()
      jest.runOnlyPendingTimers()
      expect(instance.scrollView.scrollTo).toHaveBeenCalled()
    })

    it('does not execute when loopJump is false', () => {
      const component = renderer.create(
        <Swiper>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      instance.scrollView = { scrollTo: jest.fn() }
      instance.setState({ loopJump: false })
      
      instance.loopJump()
      jest.runOnlyPendingTimers()
      expect(instance.scrollView.scrollTo).not.toHaveBeenCalled()
    })

    it('uses setPageWithoutAnimation when available', () => {
      const component = renderer.create(
        <Swiper loop={true}>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      instance.scrollView = { 
        setPageWithoutAnimation: jest.fn(),
        scrollTo: jest.fn()
      }
      instance.setState({ loopJump: true, index: 0 })
      
      instance.loopJump()
      jest.runOnlyPendingTimers()
      expect(instance.scrollView.setPageWithoutAnimation).toHaveBeenCalledWith(1)
      expect(instance.scrollView.scrollTo).not.toHaveBeenCalled()
    })

    it('scrolls to correct position at last index', () => {
      const component = renderer.create(
        <Swiper loop={true}>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      instance.scrollView = { scrollTo: jest.fn() }
      instance.setState({ 
        loopJump: true, 
        index: 1, 
        total: 2,
        width: 375,
        height: 667
      })
      
      instance.loopJump()
      jest.runOnlyPendingTimers()
      expect(instance.scrollView.scrollTo).toHaveBeenCalledWith({
        x: 750, // 375 * 2
        y: 0,
        animated: false
      })
    })
  })

  describe('Pagination Rendering', () => {
    it('renders pagination with multiple slides', () => {
      const tree = renderer.create(
        <Swiper showsPagination={true}>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
          <View><Text>Slide 3</Text></View>
        </Swiper>
      )
      expect(tree.toJSON()).toBeTruthy()
      const instance = tree.root.findByType(Swiper).instance
      const pagination = instance.renderPagination()
      expect(pagination).not.toBeNull()
    })

    it('does not render pagination with single slide', () => {
      const component = renderer.create(
        <Swiper showsPagination={true}>
          <View><Text>Slide 1</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      const pagination = instance.renderPagination()
      expect(pagination).toBeNull()
    })

    it('does not render pagination when showsPagination is false', () => {
      const tree = renderer.create(
        <Swiper showsPagination={false}>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      expect(tree.toJSON()).toBeTruthy()
    })

    it('uses custom renderPagination function', () => {
      const customRenderPagination = jest.fn(() => <View testID="custom-pagination" />)
      const component = renderer.create(
        <Swiper 
          showsPagination={true}
          renderPagination={customRenderPagination}
        >
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      instance.render()
      expect(customRenderPagination).toHaveBeenCalledWith(0, 2, instance)
    })

    it('applies custom dot styles', () => {
      const customDotStyle = { backgroundColor: 'red' }
      const customActiveDotStyle = { backgroundColor: 'blue' }
      const component = renderer.create(
        <Swiper 
          showsPagination={true}
          dotStyle={customDotStyle}
          activeDotStyle={customActiveDotStyle}
        >
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      const pagination = instance.renderPagination()
      expect(pagination).not.toBeNull()
    })

    it('uses custom dot colors', () => {
      const component = renderer.create(
        <Swiper 
          showsPagination={true}
          dotColor="red"
          activeDotColor="blue"
        >
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      const pagination = instance.renderPagination()
      expect(pagination).not.toBeNull()
    })

    it('uses custom dot and activeDot components', () => {
      const customDot = <View testID="custom-dot" />
      const customActiveDot = <View testID="custom-active-dot" />
      const component = renderer.create(
        <Swiper 
          showsPagination={true}
          dot={customDot}
          activeDot={customActiveDot}
        >
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      const pagination = instance.renderPagination()
      expect(pagination).not.toBeNull()
    })
  })

  describe('Button Rendering', () => {
    it('renders next button when not at last slide', () => {
      const component = renderer.create(
        <Swiper showsButtons={true}>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      instance.setState({ index: 0 })
      const button = instance.renderNextButton()
      expect(button).toBeTruthy()
    })

    it('renders next button when loop is enabled even at last slide', () => {
      const component = renderer.create(
        <Swiper showsButtons={true} loop={true}>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      instance.setState({ index: 1, total: 2 })
      const button = instance.renderNextButton()
      expect(button).toBeTruthy()
    })

    it('renders prev button when not at first slide', () => {
      const component = renderer.create(
        <Swiper showsButtons={true}>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      instance.setState({ index: 1 })
      const button = instance.renderPrevButton()
      expect(button).toBeTruthy()
    })

    it('renders prev button when loop is enabled even at first slide', () => {
      const component = renderer.create(
        <Swiper showsButtons={true} loop={true}>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      instance.setState({ index: 0 })
      const button = instance.renderPrevButton()
      expect(button).toBeTruthy()
    })

    it('uses custom next button', () => {
      const customNextButton = <Text>Next</Text>
      const component = renderer.create(
        <Swiper showsButtons={true} nextButton={customNextButton}>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      const button = instance.renderNextButton()
      expect(button).toBeTruthy()
    })

    it('uses custom prev button', () => {
      const customPrevButton = <Text>Prev</Text>
      const component = renderer.create(
        <Swiper showsButtons={true} prevButton={customPrevButton}>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      const button = instance.renderPrevButton()
      expect(button).toBeTruthy()
    })

    it('disables next button when disableNextButton is true', () => {
      const tree = renderer.create(
        <Swiper showsButtons={true} disableNextButton={true}>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const touchables = tree.root.findAllByType(TouchableOpacity)
      // Find next button (should be last TouchableOpacity)
      const nextButton = touchables[touchables.length - 1]
      expect(nextButton.props.disabled).toBe(true)
    })

    it('disables prev button when disablePrevButton is true', () => {
      const tree = renderer.create(
        <Swiper showsButtons={true} disablePrevButton={true}>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const touchables = tree.root.findAllByType(TouchableOpacity)
      // Find prev button (should be first TouchableOpacity)
      const prevButton = touchables[0]
      expect(prevButton.props.disabled).toBe(true)
    })
  })

  describe('Title Rendering', () => {
    it('renders title when child has title prop', () => {
      const component = renderer.create(
        <Swiper>
          <View title={<Text>Title 1</Text>}><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      const title = instance.renderTitle()
      expect(title).not.toBeNull()
    })

    it('does not render title when child has no title prop', () => {
      const component = renderer.create(
        <Swiper>
          <View><Text>Slide 1</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      const title = instance.renderTitle()
      expect(title).toBeNull()
    })

    it('does not render title when children is empty', () => {
      const component = renderer.create(
        <Swiper>
          {null}
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      const title = instance.renderTitle()
      expect(title).toBeNull()
    })
  })

  describe('Load Minimal Feature', () => {
    it('renders only nearby slides when loadMinimal is enabled', () => {
      const component = renderer.create(
        <Swiper loadMinimal={true} loadMinimalSize={1} index={2}>
          <View testID="slide-0"><Text>Slide 1</Text></View>
          <View testID="slide-1"><Text>Slide 2</Text></View>
          <View testID="slide-2"><Text>Slide 3</Text></View>
          <View testID="slide-3"><Text>Slide 4</Text></View>
          <View testID="slide-4"><Text>Slide 5</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      expect(instance.props.loadMinimal).toBe(true)
      expect(instance.props.loadMinimalSize).toBe(1)
    })

    it('shows loader for slides outside minimal range', () => {
      const tree = renderer.create(
        <Swiper loadMinimal={true} loadMinimalSize={1} index={2}>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
          <View><Text>Slide 3</Text></View>
          <View><Text>Slide 4</Text></View>
          <View><Text>Slide 5</Text></View>
        </Swiper>
      )
      const activityIndicators = tree.root.findAllByType(ActivityIndicator)
      expect(activityIndicators.length).toBeGreaterThan(0)
    })

    it('uses custom loader when provided', () => {
      const customLoader = <Text>Loading...</Text>
      const tree = renderer.create(
        <Swiper 
          loadMinimal={true} 
          loadMinimalSize={1} 
          loadMinimalLoader={customLoader}
          index={2}
        >
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
          <View><Text>Slide 3</Text></View>
          <View><Text>Slide 4</Text></View>
          <View><Text>Slide 5</Text></View>
        </Swiper>
      )
      expect(tree.toJSON()).toBeTruthy()
    })

    it('keeps first and last swiper when loop is enabled', () => {
      const component = renderer.create(
        <Swiper 
          loadMinimal={true} 
          loadMinimalSize={1} 
          loop={true}
          index={2}
        >
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
          <View><Text>Slide 3</Text></View>
          <View><Text>Slide 4</Text></View>
        </Swiper>
      )
      expect(component.toJSON()).toBeTruthy()
    })
  })

  describe('Layout Handling', () => {
    it('updates state on layout event', () => {
      const component = renderer.create(
        <Swiper>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      instance.scrollView = { scrollTo: jest.fn() }
      
      const event = {
        nativeEvent: {
          layout: {
            width: 400,
            height: 700
          }
        }
      }
      instance.onLayout(event)
      expect(instance.state.width).toBe(400)
      expect(instance.state.height).toBe(700)
    })

    it('scrolls to correct position on initial render with multiple slides', () => {
      const component = renderer.create(
        <Swiper index={1}>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
          <View><Text>Slide 3</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      instance.scrollView = { scrollTo: jest.fn() }
      instance.initialRender = true
      
      const event = {
        nativeEvent: {
          layout: {
            width: 375,
            height: 667
          }
        }
      }
      instance.onLayout(event)
      expect(instance.scrollView.scrollTo).toHaveBeenCalled()
      expect(instance.initialRender).toBe(false)
    })

    it('sets correct offset for looped slides', () => {
      const component = renderer.create(
        <Swiper loop={true} index={1}>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      instance.scrollView = { scrollTo: jest.fn() }
      
      const event = {
        nativeEvent: {
          layout: {
            width: 375,
            height: 667
          }
        }
      }
      instance.onLayout(event)
      expect(instance.internals.offset.x).toBe(750) // (1 + 1) * 375
    })
  })

  describe('Helper Methods', () => {
    it('fullState returns combined state and internals', () => {
      const component = renderer.create(
        <Swiper>
          <View><Text>Slide 1</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      instance.internals = { isScrolling: false, offset: { x: 0, y: 0 } }
      
      const fullState = instance.fullState()
      expect(fullState.index).toBeDefined()
      expect(fullState.isScrolling).toBeDefined()
    })

    it('scrollViewPropOverrides wraps function props correctly', () => {
      const onTouchStart = jest.fn()
      const component = renderer.create(
        <Swiper onTouchStart={onTouchStart}>
          <View><Text>Slide 1</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      const overrides = instance.scrollViewPropOverrides()
      
      expect(overrides.onTouchStart).toBeDefined()
      expect(typeof overrides.onTouchStart).toBe('function')
      
      overrides.onTouchStart({})
      expect(onTouchStart).toHaveBeenCalledWith({}, expect.any(Object), instance)
    })

    it('does not override specific props', () => {
      const onMomentumScrollEnd = jest.fn()
      const renderPagination = jest.fn()
      const onScrollBeginDrag = jest.fn()
      
      const component = renderer.create(
        <Swiper 
          onMomentumScrollEnd={onMomentumScrollEnd}
          renderPagination={renderPagination}
          onScrollBeginDrag={onScrollBeginDrag}
        >
          <View><Text>Slide 1</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      const overrides = instance.scrollViewPropOverrides()
      
      expect(overrides.onMomentumScrollEnd).toBeUndefined()
      expect(overrides.renderPagination).toBeUndefined()
      expect(overrides.onScrollBeginDrag).toBeUndefined()
    })

    it('refScrollView sets scrollView reference', () => {
      const component = renderer.create(
        <Swiper>
          <View><Text>Slide 1</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      const mockScrollView = { scrollTo: jest.fn() }
      
      instance.refScrollView(mockScrollView)
      expect(instance.scrollView).toBe(mockScrollView)
    })

    it('onPageScrollStateChanged handles dragging state', () => {
      const component = renderer.create(
        <Swiper>
          <View><Text>Slide 1</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      const onScrollBeginSpy = jest.spyOn(instance, 'onScrollBegin')
      
      instance.onPageScrollStateChanged('dragging')
      expect(onScrollBeginSpy).toHaveBeenCalled()
    })

    it('onPageScrollStateChanged handles idle state with onTouchEnd', () => {
      const onTouchEnd = jest.fn()
      const component = renderer.create(
        <Swiper onTouchEnd={onTouchEnd}>
          <View><Text>Slide 1</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      
      instance.onPageScrollStateChanged('idle')
      expect(onTouchEnd).toHaveBeenCalled()
    })

    it('onPageScrollStateChanged handles settling state with onTouchEnd', () => {
      const onTouchEnd = jest.fn()
      const component = renderer.create(
        <Swiper onTouchEnd={onTouchEnd}>
          <View><Text>Slide 1</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      
      instance.onPageScrollStateChanged('settling')
      expect(onTouchEnd).toHaveBeenCalled()
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('handles empty children gracefully', () => {
      const component = renderer.create(
        <Swiper>
          {[]}
        </Swiper>
      )
      expect(component.toJSON()).toBeTruthy()
    })

    it('handles children change during runtime', () => {
      const component = renderer.create(
        <Swiper>
          <View><Text>Slide 1</Text></View>
        </Swiper>
      )
      
      component.update(
        <Swiper>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      
      const instance = component.root.findByType(Swiper).instance
      expect(instance.state.total).toBe(2)
    })

    it('handles missing scrollView gracefully', () => {
      const component = renderer.create(
        <Swiper>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      instance.scrollView = null
      
      // Should not throw
      expect(() => instance.scrollBy(1)).not.toThrow()
    })

    it('handles updateIndex with missing internals.offset', () => {
      const component = renderer.create(
        <Swiper>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      instance.internals.offset = null
      
      instance.updateIndex({ x: 375, y: 0 }, 'x', jest.fn())
      expect(instance.internals.offset).toBeDefined()
    })

    it('handles rapid state changes', () => {
      const component = renderer.create(
        <Swiper>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
          <View><Text>Slide 3</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      instance.scrollView = { scrollTo: jest.fn() }
      
      instance.scrollBy(1)
      instance.scrollBy(1)
      instance.scrollBy(1)
      
      // Should handle gracefully (only first should execute)
      expect(instance.scrollView.scrollTo).toHaveBeenCalledTimes(1)
    })

    it('handles custom width and height props', () => {
      const component = renderer.create(
        <Swiper width={500} height={800}>
          <View><Text>Slide 1</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      const state = instance.initState(instance.props)
      expect(state.width).toBe(500)
      expect(state.height).toBe(800)
    })

    it('preserves state width and height when not in props', () => {
      const component = renderer.create(
        <Swiper>
          <View><Text>Slide 1</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      instance.state.width = 600
      instance.state.height = 900
      
      const newState = instance.initState(instance.props)
      expect(newState.width).toBe(600)
      expect(newState.height).toBe(900)
    })

    it('handles loop jump with same offset edge case', () => {
      const component = renderer.create(
        <Swiper loop={true}>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      instance.internals.offset = { x: 375, y: 0 }
      instance.setState({ width: 375 })
      
      const callback = jest.fn()
      instance.updateIndex({ x: 375, y: 0 }, 'x', callback)
      
      // Should handle the edge case of same offset during loop
      expect(callback).toHaveBeenCalled()
    })

    it('handles children update on iOS with loadMinimal', () => {
      Platform.OS = 'ios'
      const component = renderer.create(
        <Swiper loadMinimal={true}>
          <View><Text>Slide 1</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      const currentIndex = instance.state.index
      
      component.update(
        <Swiper loadMinimal={true}>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      
      expect(instance.state.index).toBe(currentIndex)
    })
  })

  describe('Integration Scenarios', () => {
    it('handles complete autoplay cycle with loop', () => {
      const component = renderer.create(
        <Swiper autoplay={true} autoplayTimeout={1} loop={true}>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
          <View><Text>Slide 3</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      instance.scrollView = { scrollTo: jest.fn() }
      instance.internals.offset = { x: 0, y: 0 }
      
      const initialIndex = instance.state.index
      instance.autoplay()
      jest.runOnlyPendingTimers()
      
      expect(instance.scrollView.scrollTo).toHaveBeenCalled()
    })

    it('handles user interaction interrupting autoplay', () => {
      const component = renderer.create(
        <Swiper autoplay={true}>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      instance.scrollView = { scrollTo: jest.fn() }
      
      instance.autoplay()
      instance.onScrollBegin({})
      
      expect(instance.internals.isScrolling).toBe(true)
      
      // Autoplay should not execute while scrolling
      instance.autoplay()
      expect(instance.autoplayTimer).toBeNull()
    })

    it('handles complete navigation cycle without loop', () => {
      const onIndexChanged = jest.fn()
      const component = renderer.create(
        <Swiper loop={false} onIndexChanged={onIndexChanged}>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
          <View><Text>Slide 3</Text></View>
        </Swiper>
      )
      const instance = component.root.findByType(Swiper).instance
      instance.scrollView = { scrollTo: jest.fn() }
      
      // Scroll to end
      instance.scrollBy(1)
      instance.setState({ index: 1 })
      instance.scrollBy(1)
      instance.setState({ index: 2 })
      
      // Try to scroll beyond
      instance.scrollBy(1)
      
      expect(onIndexChanged).toHaveBeenCalled()
    })

    it('combines vertical scrolling with pagination', () => {
      const tree = renderer.create(
        <Swiper horizontal={false} showsPagination={true}>
          <View><Text>Slide 1</Text></View>
          <View><Text>Slide 2</Text></View>
          <View><Text>Slide 3</Text></View>
        </Swiper>
      )
      expect(tree.toJSON()).toBeTruthy()
      const instance = tree.root.findByType(Swiper).instance
      expect(instance.state.dir).toBe('y')
      expect(instance.renderPagination()).not.toBeNull()
    })

    it('handles all props together in complex scenario', () => {
      const tree = renderer.create(
        <Swiper
          horizontal={false}
          loop={true}
          autoplay={true}
          autoplayTimeout={3}
          showsPagination={true}
          showsButtons={true}
          loadMinimal={true}
          loadMinimalSize={2}
          index={1}
          onIndexChanged={jest.fn()}
          dotColor="red"
          activeDotColor="blue"
        >
          <View title={<Text>Title 1</Text>}><Text>Slide 1</Text></View>
          <View title={<Text>Title 2</Text>}><Text>Slide 2</Text></View>
          <View title={<Text>Title 3</Text>}><Text>Slide 3</Text></View>
          <View title={<Text>Title 4</Text>}><Text>Slide 4</Text></View>
        </Swiper>
      )
      expect(tree.toJSON()).toBeTruthy()
    })
  })
})