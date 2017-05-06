var casper = require('casper').create();
var system = require('system');
const CONFIG = require('./config.js');
const USER_PASSWORD = CONFIG.username;
const USER_EMAIL = CONFIG.password;

casper.start('https://play.google.com/music/listen?authuser')
.then(function(){
  this.capture('goog.png');
  this.click("#gb_70");
})

.then(function() {
  this.fillSelectors('form', {
    'input[type=email]' : USER_EMAIL
  });
  this.click('#identifierNext');
  this.capture('goog2.png');
});

casper.waitForSelector('input[type="password"]',function(){
  
  this.fillSelectors('form', {
    'input[type="password"]': USER_PASSWORD
  }); 
  this.click('#identifierNext');
  this.capture('goog3.png');
});
casper.then(function(){ 
    this.fillSelectors('form', {
      'input[type="password"]': USER_PASSWORD
    }); 
  this.click('#identifierNext');
});

casper.wait(5000);
casper.then(function(){
  //wait for div.gb_gb,gb_Wc,gb_9f,gb_R
  this.capture('goog3.png');
});
casper.waitForSelector('#input',function(){
  
  this.capture('goog3.png');
});

//casper.wait(5000);

casper.then(function(){
  //wait for div.gb_gb,gb_Wc,gb_9f,gb_R
  this.capture('goog3.png');
});

//TODO: handle 2factor auth with google, use this code:
/*casper.then(function(){ 
  this.waitForSelector('#idvPreregisteredPhonePin', function(){
    var line;
    system.stdout.writeLine('insert pin code: ');
    var line = system.stdin.readLine();
    this.capture('google.png');

    this.fillSelectors('#challenge', {
      'input[name="Pin"]':  line
    }); 

    this.click('#submit');
  });
});
*/
casper.run();
