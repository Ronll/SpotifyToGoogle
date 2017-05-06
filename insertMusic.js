var casper = require('casper').create();
const BASE_SEARCH_URL = 'https://play.google.com/music/listen#/home';
const FIRST_SONG_CSS_ADDRESS = 'table.song-table tbody:nth-child(2)';
const SONG_OPTIONS_BUTTON_CSS_ADDRESS = 'div.songlist-container tbody:nth-child(2) div.title-right-items';

var songs = [{name : "hello baby" ,artist:"baby girl"}, {name : "bye honey" ,artist:"ft cya"}, {name : "suprise mf", artist:"bitch ass boss"}];

casper.start(BASE_SEARCH_URL);

casper.then(function(){
  //TODO: handle a case where nothing was found in the search;
  this.capture('debug.png');
  this.click(FIRST_SONG_CSS_ADDRESS);
  //this.click('div.goog-menu:nth-child(8)');
});

casper.run();
