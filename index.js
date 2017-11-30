const 
  aquireSpotifySongs = require('./Spotify/aquireSpotifySavedSongs')
  addSongsToGoogle = require('./Google Music/addSongsToGoogle')

main()

async function main() {
  console.log('Lets move your songs!')
  console.log('Start with getting all your saved songs from Spotify')

  let songs = await aquireSpotifySongs()

  console.log(`Great! we found ${songs.length} songs!`)
  console.log('lets save them to Google Music')
  console.log('This might take a while... :)')

  let results = await addSongsToGoogle(songs)

  console.log('Failed to save:')
  for(song of results.failed)
    console.log(` ${song.name}`)
  console.log(results.failed.length + ' songs we\'re not saved...')
  
  console.log('Saved songs:')
  for(song of results.added)
    console.log(` ${song.name}`)
  console.log(results.added.length + ' songs added!')

  console.log('Done!')
}