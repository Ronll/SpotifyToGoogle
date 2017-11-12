const CONFIG = require('./config/config.js');
const SpotifyWebApi = require('spotify-web-api-node');
const spotifyApi =  new SpotifyWebApi();
const MAX_LIMIT_GET_TRACKS = 50;
const fs = require('fs')

spotifyApi.setAccessToken(CONFIG.spotifyAPIKey);

let allSongsMetaData = [];
let songOffset = 0;
let numberOfSongs = 999999;

let getAllSongsMetaData = new Promise((resolve, reject) => {
  let songsMetaData = [];

  collectAllSongsMetadata( songOffset, MAX_LIMIT_GET_TRACKS);

  function collectAllSongsMetadata( songOffset, MAX_LIMIT_GET_TRACKS){
    getNextSavedTracksBatch(MAX_LIMIT_GET_TRACKS, songOffset).then((data) => {
      numberOfSongs = data.body.total;
      offset = data.body.offset + MAX_LIMIT_GET_TRACKS;
      songsMetaData.push(data.body.items);

      if(songOffset + MAX_LIMIT_GET_TRACKS < numberOfSongs)
        collectAllSongsMetadata(offset, MAX_LIMIT_GET_TRACKS)
      else
        resolve(songsMetaData);
    }).catch((err) => reject(err)) 
  }

  function getNextSavedTracksBatch(MAX_LIMIT_GET_TRACKS, songOffset){
    return spotifyApi.getMySavedTracks({
      limit : MAX_LIMIT_GET_TRACKS,
      offset: songOffset 
    })
  }

});

let assembleSongsHTTPRequests = function(responses) {
  let allSongs = [];
  responses.reduce( (a, b) => { 
    for(let song of b){
      let result = {}
      result.name = song.track.name
      console.log(song.track.artists)
      result.artists = []
      for(let artist of song.track.artists){
        result.artists.push(artist.name) 
        allSongs.push(result)
      }
    }
  }, allSongs);

  fs.writeFile( "result.json", JSON.stringify(allSongs), ()=> {console.log('BIG SUCCESS')})
}

return getAllSongsMetaData.then(assembleSongsHTTPRequests);
