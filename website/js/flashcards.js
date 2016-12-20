/* global firebase, Promise, Listener, Speaker, firebaseLoginPromise */
/*jshint esversion: 6 */
/*jshint unused:true */
/*jshint -W097 */
var myWordList, myListener, mySpeaker;

// Main app
firebaseLoginPromise().then(function() {
  console.log('Signed in user', firebase.auth().currentUser.email);

  myWordList = firebase.database().ref().child('/words/' + firebase.auth().currentUser.uid);
  myWordList.limitToLast(1000);

  myWordList.once('value', function(snapshot) {
    console.log('Got the one time snapshot of the existing word list.');
    snapshot.forEach(function(childSnapshot) {
      var childKey = childSnapshot.key;
      var childData = childSnapshot.val();
      console.log('Existing word list TODO', childKey, childData);
    });
  });
  myListener = new Listener('#mic');
  mySpeaker = new Speaker();
  
}).then(function() {
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

  document.querySelectorAll('#new-word-dialog button').forEach(button => button.addEventListener('click', function() {
    switch (this.textContent.trim()) {
      case 'cancel':
        console.info('New Word: cancel');
        document.querySelector('#new-word-dialog').close();
        break;
      case 'add':
        console.info('New Word: add');
        var newWord = document.querySelector('#new-word').value;
        document.querySelector('#new-word').value = '';
        var newPostRef = myWordList.push();
        newPostRef.set({
          word: newWord,
          views: 0,
          smiles: 0,
          listens: 0
        });
        console.log('Wrote new word', newWord);
        break;
      default:
        console.error('Unknown action: "' + this.textContent + '"');
    }
  }));

  document.querySelector('#add-word-button').addEventListener('click', function() {
    document.querySelector('#new-word-dialog').showModal();
  });

}).then(function() {
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
}).then(function() {

  document.querySelector('#progress').MaterialProgress.setProgress(10);
  document.querySelector('#progress').MaterialProgress.setBuffer(80);

}).then(function() {

  console.log('init finished');
  console.groupEnd();

  myListener.listenForWord('schedule')
    .then(function(heardWords) {
      console.log('SUCCESS We heard what we were looking for:' + heardWords);
    }).catch(function(error) {
      console.error('General app error', error);
      throw (error);
    });

}).catch(function(error) {
  console.error('General app error', error);
  throw (error);
});