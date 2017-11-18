const puppeteer = require('puppeteer')
const aquireGoogleSession = require('./aquireGoogleSession')

const 
  BASE_URL = 'https://play.google.com/music/listen#/sr/',
  IGNORE_FLASH_BTN_SELECTOR = '#waves',
  SEATCH_BAR_SELECTOR = '#input',
  FIRST_RESULT_SELECTOR = 'table.song-table tbody tr:nth-child(2)'
  FIRST_RESULT_MENU_SELECTOR = 'table.song-table tbody tr:nth-child(2) td div:nth-child(2) paper-icon-button'
  ADD_REMOVE_BTN_SELECTOR = 'body > div.goog-menu.goog-menu-vertical.song-menu div:nth-child(9)'
  ENTER_KEY = 'Enter',
  REQ_TOKEN_BTN_SELECTOR = '#oauthRequestToken',
  LOGIN_BUTTON_SELECTOR = 'a.btn',
  TOKEN_FIELD_SELECTOR = '#oauth',
  USERNAME_FIELD_SELECTOR = '#login-username',
  FIVE_MINUTES_IN_MILLISECOUNDS = 1000 * 60 * 5

;(async () => {
    await addSongsToGoogle([{name: 'One', artists: ['Metalica']}, {name: 'Nothing else matters', artists: ['metalica']}])
})()

async function addSongsToGoogle(songs) {
  const googleCookies = await aquireGoogleSession()
    
  const browser = await puppeteer.launch({headless: false})
  const page = await browser.newPage()
  await page.setCookie(...googleCookies)
  
  await page.goto(BASE_URL)
  await page.waitForSelector(IGNORE_FLASH_BTN_SELECTOR)
  await page.click(IGNORE_FLASH_BTN_SELECTOR)

  failedSongs = []
  for(let song of songs){
    try{
      await addSong(song)
    }catch{
      failedSongs.push(song)
    }
  }

  async function addSong(song){
    await searchSong(song)
    await addFirstResult()
    
  }

  async function addFirstResult(){
    await page.click(FIRST_RESULT_MENU_SELECTOR)
    
  }

  async function searchSong(song){
    let searchTerm = `${song.name} by ${song.artists.join(' ')}`
    await page.waitForSelector(SEATCH_BAR_SELECTOR)
    let el = await page.$(SEATCH_BAR_SELECTOR)
    await el.type(searchTerm)
    await page.keyboard.press(ENTER_KEY)
  }
}

module.exports = addSongsToGoogle