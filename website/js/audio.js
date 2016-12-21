/* global Promise, SpeechSynthesisUtterance, webkitSpeechRecognition */
/*jshint esversion: 6 */
/*jshint unused:true */
/*exported Speaker, Listener, round */


function round(number, precision=3) {
  var factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}

/** 
 * Fully encapsulated word-talking function.  
 * Will resolve when word done.
 */
class Speaker {
  constructor() {
    var that = this;
    // Immediately try to pre-load
    this.getVoicePromise().then(function () {
      console.log('Pre-got a best voice:', that.bestVoice);
    });
  }

  speakPromise(words) {
    return this.getVoicePromise()
      .then(function (bestVoice) {
        // bestVoice might be null, meh.
        return new Promise(function (resolve) {
          var u = new SpeechSynthesisUtterance(words);
          u.voice = bestVoice;
          u.lang = 'en-US'; // input text lang
          u.rate = 0.9;
          u.onend = resolve;
          window.speechSynthesis.speak(u);
        });
      });
  }

  // private
  getBestVoice() {
    var voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      return voices.find(function (voice) {
        // Only Chrome
        return voice.name == 'Google US English';
      });
    }
  }

  getVoicePromise() {
    var that = this;
    return Promise.race([
      new Promise(function (resolve) {
        if (that.bestVoice) {
          resolve(that.bestVoice);
        }
      }),
      new Promise(function (resolve) {
        // Maybe voices are already loaded?
        var voice = that.getBestVoice();
        if(voice) {
          that.bestVoice = voice;
          resolve(that.bestVoice);
        }
      }),
      new Promise(function (resolve) {
        // Also try waiting for the event
        window.speechSynthesis.onvoiceschanged = function() {
          var voice = that.getBestVoice();
          if(voice) {
            that.bestVoice = voice;
            resolve(that.bestVoice);
          }
        };
      })
    ]);
  }

}

/** 
 * Generic listener that fires off all heard words.
 */
class Listener {
  constructor() {
    var that = this;
    that.micElt = document.querySelector('#listener-mic');
    that.heardWordsElt = document.querySelector('#listener-heard-words');
    that.recognition = new webkitSpeechRecognition();
    that.recognition.continuous = true; // Rolling, may not be the best way to do single words
    that.recognition.interimResults = true; // Start with fuzzy, maybe will improve?
    that.errorCount = 0;
    // already default: recognition.lang = 'en-US';
    // already default: recognition.maxAlternatives = 1;
    // TODO: grammars?

    that.recognition.onend = function () {
      console.log('recognition.onend');
      if(that.micElt) {
        that.micElt.classList.toggle('mic-on', false);
      }
    };

    that.recognition.onerror = function (e) {
      switch(e.error) {
        case 'aborted':
          // ignore
          break;
        default:
          console.error('recognition.onerror:' + e.error + ' ' + e.message, e);
          // TODO: restart with a limit?        
      }
      if(that.micElt) {
        that.micElt.classList.toggle('mic-on', false);
      }
    };

    that.recognition.onnomatch = function () {
      console.error('recognition.onnomatch');
      //that.indicationElt.classList.toggle('mic-on', false);
      // TODO: restart with a limit?
    };

    that.recognition.onresult = function (e) {
      // SpeechRecognitionResultList - SpeechRecognitionResult
      // Skip ahead to the end of anything final
      for (var i = e.resultIndex; i < e.results.length; ++i) {
        that.onheard(e.results[i][0].transcript);
      }
    };
  }

  /* Start listening,  */
  start() {
    console.info('Listener.start');
    this.recognition.start();
    if(this.micElt) {
      this.micElt.classList.toggle('mic-on', true);
    }
  }

  /* Stop listening, ignore results */
  abort() {
    console.info('Listener.abort');
    this.recognition.abort();
    if(this.micElt) {
      this.micElt.classList.toggle('mic-on', false);
    }
  }

  /** return a Promise listens for a specific word.  Requires a "start" call to begin. */
  listenForWord(word) {
    var that = this;
    return new Promise(function (resolve) {
      console.info('Listener.listenForWord:', word);
      var wordMatch = new RegExp('.*\\b' + word + '\\b.*', 'i');
      that.onheard = function(heardWords) {
        that.heardWordsElt.innerHTML = heardWords;
        if(wordMatch.test(heardWords)) {
          that.abort();
          resolve(heardWords);
        } else {
          console.info('Ignoring non-matching words:"' + heardWords + '"');
        }
      };
    });
  }

}