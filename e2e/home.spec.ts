import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should load the home page successfully', async ({ page }) => {
    await page.goto('/')
    
    // Verify the page loads
    await expect(page).toHaveTitle(/Stats Keeper|Next/)
  })

  test('should display main content', async ({ page }) => {
    await page.goto('/')
    
    // Check that main content area exists
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should be accessible via keyboard navigation', async ({ page }) => {
    await page.goto('/')
    
    // Tab through interactive elements
    await page.keyboard.press('Tab')
    
    // Verify focus is visible on an element
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })
})
