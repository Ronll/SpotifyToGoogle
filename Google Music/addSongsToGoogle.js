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
  DISPLAY = 'display',
  MINUTE_IN_MILLISECOUNDS = 1000 * 60

let
  browser,
  page,
  googleCookies

async function addSongsToGoogle(songs) {
  googleCookies = await aquireGoogleSession()
  browser = await puppeteer.launch()
  page = await browser.newPage() 
  
  await page.setCookie(...googleCookies)
  await page.goto(BASE_URL)

  let results = { failed: [], added: []  }
  for(song of songs){
    let songAdded = await addSong(song)
    songAdded ? results.added.push(song) : results.failed.push(song)
  }

  await browser.close()

  return results
}

async function addSong(song){
  try{
    var wasFound = await searchSong(song)
  }catch(e){
    console.log(e)
    var wasFound = false
  }

  if (!wasFound)
    return false
  
  try{
    var wasAdded = await addFirstResult()
  }catch(e){
    console.log(e)
    var wasAdded = false
  }
  
  if(!wasAdded)
    return false

  return true
}

async function ignoreNoFlashWarning(){
  await page.waitForSelector(IGNORE_FLASH_BTN_SELECTOR, {visible: true})
  await page.click(IGNORE_FLASH_BTN_SELECTOR)
}

async function searchSong(song){
  let searchTerm = `${song.name} by ${song.artists.join(' ')}`
  let searchURL = `${BASE_URL}${qs.escape(searchTerm)}`
  await page.goto('about:blank')
  await page.goto(searchURL, {waitUntil: ['load', 'domcontentloaded', 'networkidle0'], timeout: MINUTE_IN_MILLISECOUNDS})
  await ignoreNoFlashWarning()

  let el = await page.$(SONGS_RESULT_SELECTOR)
  if(el === null){
    return false
  }else
    return true
}

async function addFirstResult(){
  await page.waitForSelector(FIRST_RESULT_SELECTOR, {visible: true})
  await page.hover(FIRST_RESULT_SELECTOR)
  await page.waitForSelector(FIRST_RESULT_MENU_SELECTOR, {visible: true})
  await page.click(FIRST_RESULT_MENU_SELECTOR)
  
  let displayProperty = await page.evaluate((ADD_BTN_SELECTOR,STYLE, DISPLAY) => {
    let el = document.querySelector(ADD_BTN_SELECTOR)
    let displayProperty = el[STYLE][DISPLAY]
    return Promise.resolve(displayProperty)
  }, ADD_BTN_SELECTOR, STYLE, DISPLAY)
  
  if(displayProperty !== "none"){
    await page.click(ADD_BTN_SELECTOR)
    await page.waitForSelector(LABEL_SELECTOR, {visible: true})
    return true
  }else{
    return false
  }
}

module.exports = addSongsToGoogle