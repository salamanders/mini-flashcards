# Flashcard App
Learn how to say words!

# TODO

[ ] Select words at better than random
[ ] start with small words
[ ] start to skip "learned" words
[ ] retry a failed word in a few clicks
[ ] keep score to level up or make it to point thresholds

## Developer

* Project Console: https://console.firebase.google.com/project/mini-flashcards/overview
* Hosting URL: https://mini-flashcards.firebaseapp.com
* Docs: https://firebase.google.com/docs/hosting/full-config

### One-Time
npm install -g firebase-tools
firebase login
firebase init
firebase deploy # lots of times

# github
git init
git add *
git commit -m "first commit"
git remote add origin https://github.com/salamanders/mini-flashcards.git
git push -u origin master


# Junk

```
.then(function() {
  return new Promise(function(resolve) {
    console.log('Setting up mdl');
    if (document.querySelector('#progress').MaterialProgress) {
      console.log('Progress bar already ready.');
      resolve();
    } else {
      document.querySelector('#progress').addEventListener('mdl-componentupgraded', function() {
        console.log('Progress bar finally ready.');
        resolve();
      });
    }
  });
})
.then(function() {

  document.querySelector('#progress').MaterialProgress.setProgress(10);
  document.querySelector('#progress').MaterialProgress.setBuffer(80);

})

document.querySelectorAll('#word-card button').forEach(button => button.addEventListener('click', function() {
  switch (this.textContent) {
    case 'sentiment_very_satisfied':
      console.info('WC: sentiment_very_satisfied');
      break;
    case 'help':
      console.info('WC: help');
      var word = document.querySelector('#word-card .mdl-card__title h4').textContent;
      console.log('playing audio:' + word);
      Promise.resolve().then(function() { 
        return mySpeaker.speakPromise(word);
      });
      break;
    default:
      console.error('Unknown action: ' + this.textContent);
  }
}));

  
<button class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--colored">
  <i class="material-icons">sentiment_very_satisfied</i>
</button>
      // times out after x seconds, good place to auto-restart?
      that.errorCount++;
      if(that.errorCount<10) {
        that.start();
      } else {
        console.error('TOO MANY ERRORS');
      }