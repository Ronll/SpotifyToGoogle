const https = require('https')
const getSpotifyAPIToken = require('./aquireSpotifyToken')

const BASE_URL = 'api.spotify.com'
const MAX_LIMIT = 50
const SAVED_SONGS_PATH = `/v1/me/tracks?limit=${MAX_LIMIT}`
const TRACK = 'track'
const ARTISTS = 'artists'
const NAME = 'name'
const TOTAL = 'total'
const ITEMS = 'items'

async function getSavedSongs(){
  const spotifyAPIToken = await getSpotifyAPIToken()
  let songs = []
  let totalNumberOfSongs = await getTotalNumberOfSongs()
  
  let savedSongsRequests = []
  for(let offset = 0;totalNumberOfSongs > offset; offset += MAX_LIMIT){
    let savedSongRequest = GetSavedSongsChunk(offset)
      .then((chunk) => { return chunk[ITEMS] })
      .then((songsChunk) => { 
        songs = songs.concat(songsChunk) })

    savedSongsRequests.push(savedSongRequest)
  }
  
  await Promise.all(savedSongsRequests)

  songs = extractMeta(songs)

  return songs
}

function extractMeta(songsData){
  let songs = []

  for(let songData of songsData){
    let name = songData[TRACK][NAME]
    let artists = extractArtists(songData)

    songs.push({name: name, artists: artists})
  }

  return songs
}

function extractArtists(songData) {
  
  let artistsData = songData[TRACK][ARTISTS]
  let artists = []        
  
  for (artistData of artistsData) {
    let artistName = artistData[NAME]
    artists.push(artistName)
  }

  return artists
}

async function getTotalNumberOfSongs(){
  let songsData = await GetSavedSongsChunk()
  return songsData[TOTAL]
}

function GetSavedSongsChunk(offset = 0){
  return new Promise((resolve, reject) => {
    https.get({
      host: BASE_URL,
      path: SAVED_SONGS_PATH + `&offset=${offset}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, (res) => {
      let body = ''
      res.on('data', (data) => { body += data})
      res.on('end', () => { resolve(JSON.parse(body)) })
    }).on('error', (e) => {
      console.log('request to spotify failed: ', e.message)
      reject(e)
    })
  })
}

module.exports = getSavedSongs
