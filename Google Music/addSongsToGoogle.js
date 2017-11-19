const puppeteer = require('puppeteer')
const aquireGoogleSession = require('./aquireGoogleSession')
const qs = require('querystring')

const 
  BASE_URL = 'https://play.google.com/music/listen#/sr/',
  IGNORE_FLASH_BTN_SELECTOR = '#waves',
  SEATCH_BAR_SELECTOR = '#input',
  FIRST_RESULT_SELECTOR = 'table.song-table tbody tr:nth-child(2)'
  FIRST_RESULT_MENU_SELECTOR = 
    'table.song-table tbody tr:nth-child(2) td div:nth-child(2) paper-icon-button'
  ADD_BTN_SELECTOR = 
    'body > div.goog-menu.goog-menu-vertical.song-menu div:nth-child(8)'
  LABEL_SELECTOR = '#label'
  ADD_TO_LIBRARY = 'Add to library'
  ENTER_KEY = 'Enter'

;(async () => {
    await addSongsToGoogle([{name: 'One', artists: ['Metalica']}, {name: 'Nothing else matters', artists: ['metalica']}])
})()

async function addSongsToGoogle(songs) {
  const googleCookies = await aquireGoogleSession()
    
  const browser = await puppeteer.launch({headless: false})
  const page = await browser.newPage()
  await page.setCookie(...googleCookies)
  
  await page.goto(BASE_URL)
  await ignoreNoFlashWarning()

  for(song of songs){
    await addSong(song)
  }

  async function addSong(song){
    await searchSong(song)
    await addFirstResult()
  }

  async function ignoreNoFlashWarning(){
    await page.waitForSelector(IGNORE_FLASH_BTN_SELECTOR, {visible: true})
    await page.click(IGNORE_FLASH_BTN_SELECTOR)
  }

  async function searchSong(song){
    let searchTerm = `${song.name} by ${song.artists.join(' ')}`
    let searchURL = `${BASE_URL}${qs.escape(searchTerm)}`
    await page.goto('about:blank')
    await page.goto(searchURL)
    await ignoreNoFlashWarning()
  }

  async function addFirstResult(){
    await page.waitForSelector(FIRST_RESULT_SELECTOR)
    await page.hover(FIRST_RESULT_SELECTOR)
    await page.click(FIRST_RESULT_MENU_SELECTOR)
    
    let addBtnEl = await page.$(ADD_BTN_SELECTOR)
    if(await isDisplayed(addBtnEl)){
      await addBtnEl.click()
      await page.waitForSelector(LABEL_SELECTOR, {visible: true})
    }else
      console.log("already in saved")
  }

  async function isDisplayed(el){
    if(await el.boundingBox() === null)
      return false
    else
      return true
  }
}

module.exports = addSongsToGoogle