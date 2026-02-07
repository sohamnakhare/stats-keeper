import { describe, it, expect } from 'vitest'
import { formatNumber, formatDate, calculatePercentage } from './utils'

describe('formatNumber', () => {
  it('should format numbers with thousand separators', () => {
    expect(formatNumber(1000)).toBe('1,000')
    expect(formatNumber(1000000)).toBe('1,000,000')
  })

  it('should handle small numbers without separators', () => {
    expect(formatNumber(999)).toBe('999')
    expect(formatNumber(0)).toBe('0')
  })

  it('should handle negative numbers', () => {
    expect(formatNumber(-1000)).toBe('-1,000')
  })
})

describe('formatDate', () => {
  it('should format date to readable string', () => {
    const date = new Date('2024-03-15')
    expect(formatDate(date)).toBe('Mar 15, 2024')
  })

  it('should handle different months correctly', () => {
    const january = new Date('2024-01-01')
    const december = new Date('2024-12-31')
    
    expect(formatDate(january)).toBe('Jan 1, 2024')
    expect(formatDate(december)).toBe('Dec 31, 2024')
  })
})

describe('calculatePercentage', () => {
  it('should calculate percentage correctly', () => {
    expect(calculatePercentage(25, 100)).toBe(25)
    expect(calculatePercentage(1, 4)).toBe(25)
  })

  it('should round to nearest integer', () => {
    expect(calculatePercentage(1, 3)).toBe(33)
    expect(calculatePercentage(2, 3)).toBe(67)
  })

  it('should return 0 when total is 0', () => {
    expect(calculatePercentage(10, 0)).toBe(0)
  })

  it('should handle 100% correctly', () => {
    expect(calculatePercentage(100, 100)).toBe(100)
  })
})
