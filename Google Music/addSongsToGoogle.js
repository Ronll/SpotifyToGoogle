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
  SONGS_RESULT_SELECTOR = 'table.song-table'

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

  for(song of songs){
    await addSong(song)
  }

  await browser.close()
}

async function addSong(song){
  await searchSong(song)
  try{
    await page.waitForSelector(SONGS_RESULT_SELECTOR, {visible: true})  
  }catch(e){
    console.log(song.name + ' not found')
  }
  try{
    await addFirstResult()
  }catch(e){
    console.log("could not add " + song.name)
    console.log(e)
  }
}

async function waitForSongResult(){
  try{
    await page.waitForSelector(SONGS_RESULT_SELECTOR, {visible: true})  
  }catch(e){
    console.log('song not found')
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
  await page.goto(searchURL)
  await ignoreNoFlashWarning()
  
}

async function addFirstResult(){
  console.log('add first')
  await page.waitForSelector(FIRST_RESULT_SELECTOR, {visible: true})
  await page.hover(FIRST_RESULT_SELECTOR)
  await page.click(FIRST_RESULT_MENU_SELECTOR)
  
  console.log('looking for button')
  
  if(await isDisplayed(ADD_BTN_SELECTOR)){
    console.log('displayed')
    await addBtnEl.click()
    await page.waitForSelector(LABEL_SELECTOR, {visible: true})
  }else
    console.log("already in saved")
}

async function isDisplayed(selector){
  await page.waitForSelector(selector, {visible: true})
  await page.waitFor(1000)
  let addBtnEl = await page.$(selector)
  if(await el.boundingBox() === null)
    return false
  else
    return true
}
module.exports = addSongsToGoogle