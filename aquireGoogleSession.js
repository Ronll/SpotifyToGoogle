const puppeteer = require('puppeteer')

const 
  BASE_URL = 'https://play.google.com/music',
  EMAIL_FIELD_SELECTOR = 'input[type="email"]',
  LOGIN_BUTTON_SELECTOR = '#gb_70',
  GOOGLE_MUSIC_LOGO_SELECTOR = 'div.music-logo',
  FIVE_MINUTES_IN_MILLISECOUNDS = 1000 * 60 * 5

async function getGoogleSession() {
  const browser = await puppeteer.launch({headless: false})
  const page = await browser.newPage()
  
  await page.goto(BASE_URL)
  await page.click(LOGIN_BUTTON_SELECTOR)
  await page.waitForSelector(EMAIL_FIELD_SELECTOR)

  //USER LOGS IN

  await page.waitForSelector(GOOGLE_MUSIC_LOGO_SELECTOR,
    {timeout: FIVE_MINUTES_IN_MILLISECOUNDS})
  const cookies = await page.cookies(BASE_URL)
  
  await browser.close()
  return cookies
}

module.exports = getGoogleSession