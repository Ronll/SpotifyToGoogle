const
  puppeteer = require('puppeteer')
  aquireGoogleSession = require('./aquireGoogleSession')
  qs = require('querystring')

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
  SONGS_RESULT_SELECTOR = 'table.song-table',
  STYLE = 'style',
  DISPLAY = 'display'

let
  browser,
  page,
  googleCookies

async function addSongsToGoogle(songs) {
  googleCookies = await aquireGoogleSession()
  browser = await puppeteer.launch({headless: false})
  page = await browser.newPage()
  
  await page.setCookie(...googleCookies)
  await page.goto(BASE_URL)
  await ignoreNoFlashWarning()

  let results = { failed: [], added: []  }
  for(song of songs){
    let songAdded = await addSong(song)
    songAdded ? results.added.push(song) : results.failed.push(song)
  }

  await browser.close()

  return results
}

async function addSong(song){
  await searchSong(song)

  let el = await page.$(SONGS_RESULT_SELECTOR)
  if(el === null ){
    console.log(song.name + ' not found')
    return false
  }
  
  try{
    let songAdded = await addFirstResult()
    return songAdded
  }catch(e){
    console.log("could not add " + song.name)
    console.log(e)
    return false
  }
}

async function ignoreNoFlashWarning(){
  await page.waitForSelector(IGNORE_FLASH_BTN_SELECTOR, {visible: true})
  await page.click(IGNORE_FLASH_BTN_SELECTOR)
}

async function searchSong(song){
  let searchTerm = `${song.name} by ${song.artists.join(' ')}`
  let searchURL = `${BASE_URL}${qs.escape(searchTerm)}`
  await page.goto('about:blank')
  await page.goto(searchURL, {waitUntil: ['load', 'domcontentloaded', 'networkidle0']})
  await ignoreNoFlashWarning()
}

async function addFirstResult(){
  await page.waitForSelector(FIRST_RESULT_SELECTOR, {visible: true, timeout: 50000})
  await page.hover(FIRST_RESULT_SELECTOR)
  await page.waitForSelector(FIRST_RESULT_MENU_SELECTOR, {visible: true, timeout: 50000})
  await page.click(FIRST_RESULT_MENU_SELECTOR)
  
  console.log('looking for button')
  
  let displayProperty = await page.evaluate((ADD_BTN_SELECTOR,STYLE, DISPLAY) => {
    let el = document.querySelector(ADD_BTN_SELECTOR)
    let displayProperty = el[STYLE][DISPLAY]
    return Promise.resolve(displayProperty)
  }, ADD_BTN_SELECTOR, STYLE, DISPLAY)
  
  if(displayProperty !== "none"){
    console.log('displayed')
    await page.click(ADD_BTN_SELECTOR)
    await page.waitForSelector(LABEL_SELECTOR, {visible: true})
    return true
  }else{
    console.log("already in saved")
    return false
  }
}

module.exports = addSongsToGoogle