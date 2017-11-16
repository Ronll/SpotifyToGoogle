const puppeteer = require('puppeteer')

const 
  BASE_URL = 'https://developer.spotify.com/web-api/console/get-current-user-saved-tracks/',
  GET_TOKEN_BTN_SELECTOR = 'input[data-target="getOAuthToken"]',
  USR_LIB_CHECKBOX_SELECTOR = '#scope-user-library-read',
  REQ_TOKEN_BTN_SELECTOR = '#oauthRequestToken',
  LOGIN_BUTTON_SELECTOR = 'a.btn',
  TOKEN_FIELD_SELECTOR = '#oauth',
  USERNAME_FIELD_SELECTOR = '#login-username',
  FIVE_MINUTES_IN_MILLISECOUNDS = 1000 * 60 * 5

async function getSpotifyToken() {
  const browser = await puppeteer.launch({headless: false})
  const page = await browser.newPage()
  
  await page.goto(BASE_URL)
  await page.click(GET_TOKEN_BTN_SELECTOR)
  await page.waitForSelector(USR_LIB_CHECKBOX_SELECTOR, {visible: true})
  await page.waitForSelector(REQ_TOKEN_BTN_SELECTOR, {visible: true})
  await page.waitFor(1000)
  await page.click(USR_LIB_CHECKBOX_SELECTOR)
  await page.click(REQ_TOKEN_BTN_SELECTOR)
  await page.waitForSelector(LOGIN_BUTTON_SELECTOR)
  await page.click(LOGIN_BUTTON_SELECTOR)
  await page.focus(USERNAME_FIELD_SELECTOR)

  //USER LOGS IN

  await page.waitForSelector(TOKEN_FIELD_SELECTOR,
    {timeout: FIVE_MINUTES_IN_MILLISECOUNDS})
  const token_field_el = await page.$(TOKEN_FIELD_SELECTOR)
  const token_field_property = await token_field_el.getProperty('value')
  const token = await token_field_property.jsonValue()
  await browser.close()
  return token
}

module.exports = getSpotifyToken