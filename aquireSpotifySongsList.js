const CONFIG = require('./config.js');
const SpotifyWebApi = require('spotify-web-api-node');
const spotifyApi =  new SpotifyWebApi();
const MAX_LIMIT_GET_TRACKS = 50;

spotifyApi.setAccessToken(CONFIG.spotifyAPIToken);

let allSongsMetaData = [];
let songOffset = 0;
let numberOfSongs = 999999;

let getAllSongsMetaData = new Promise( (resolve, reject) => {
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
      allSongs.push(song);
    } 
  }, allSongs);

  return allSongs;
}

return getAllSongsMetaData.then(assembleSongsHTTPRequests);
