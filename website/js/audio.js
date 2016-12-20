/* global Promise, SpeechSynthesisUtterance, webkitSpeechRecognition */
/*jshint esversion: 6 */
/*jshint unused:true */
/*exported Speaker, Listener */


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
      console.log('Pre-got a best voice:' + that.bestVoice);
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

  getVoicePromise() {
    var that = this;
    return new Promise(function (resolve) {
      if (that.bestVoice) {
        resolve(that.bestVoice);
      }
      // Voices aren't loaded immediately, so have to get fancy.
      var voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        that.bestVoice = voices.find(function (voice) {
          // only Chrome
          return voice.name == 'Google US English';
        });
        resolve(that.bestVoice);
      } else {
        window.speechSynthesis.onvoiceschanged = function () {
          that.bestVoice = window.speechSynthesis.getVoices().find(function (voice) {
            // Only Chrome
            return voice.name == 'Google US English';
          });
          resolve(that.bestVoice);
        };
      }
    });
  }
}

/** 
 * Generic listener that fires off all heard words.
 * indicationEltSelector should be a material design i icon
 * Element IDs: mic
 */
class Listener {
  constructor() {
    var that = this;
    that.indicationElt = document.querySelector('#mic');
    that.recognition = new webkitSpeechRecognition();
    that.recognition.continuous = true; // Rolling, may not be the best way to do single words
    that.recognition.interimResults = true; // Start with fuzzy, maybe will improve?
    that.errorCount = 0;
    // already default: recognition.lang = 'en-US';
    // already default: recognition.maxAlternatives = 1;
    // TODO: grammars?

    that.recognition.onend = function () {
      that.indicationElt.classList.toggle('mic-on', false);
      console.log('recognition.onend');
      // times out after x seconds, good place to auto-restart
      that.errorCount++;
      if(that.errorCount<10) {
        that.start();
      } else {
        console.error('TOO MANY ERRORS');
      }
    };

    that.recognition.onerror = function (e) {
      that.indicationElt.classList.toggle('mic-on', false);
      console.error('recognition error:' + e.error + ' ' + e.message, e);
      // TODO: restart with a limit?
    };

    that.recognition.onnomatch = function () {
      that.indicationElt.classList.toggle('mic-on', false);
      console.error('recognition nomatch');
      // TODO: restart with a limit?
    };

    that.recognition.onresult = function (e) {
      // SpeechRecognitionResultList - SpeechRecognitionResult
      // Skip ahead to the end of anything final
      for (var i = e.resultIndex; i < e.results.length; ++i) {
        var thinkKnow = e.results[i].isFinal ? 'know' : 'think';
        //console.info('I ' + thinkKnow + ' I heard: "' + e.results[i][0].transcript + '" ' + round(e.results[i][0].confidence));
        that.onheard(e.results[i][0].transcript);
      }
    };
    // Starts running
    that.start();
  }

  start() {
    this.recognition.start();
    this.indicationElt.classList.toggle('mic-on', true);
  }

  stop() {
    this.recognition.abort();
  }

  /** Starts set to the default.  I should learn how to do events. */
  onheard(heardWords) {
    this._onheard(heardWords);
  }

  /** Default callback */
  _onheard(heardWords) {
    console.info('I passively heard: "' + heardWords + '"');
  }

  /** Instead of listening for anything, return a Promise listens for a specific word */
  listenForWord(word) {
    var that = this;
    return new Promise(function (resolve, reject) {
      console.log('Listening for a word:', word);
      var wordMatch = new RegExp('.*\\b' + word + '\\b.*', 'i');
      that.onheard = function(heardWords) {
        if(wordMatch.test(heardWords)) {
          that.onheard = that._onheard;
          resolve(heardWords);
        } else {
          console.info('I heard non-matching audio:"' + heardWords + '"');
        }
      };
    });
  }

}