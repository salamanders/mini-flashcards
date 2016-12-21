/* global firebase, Promise, Listener, Speaker, firebaseLoginPromise */
/*jshint esversion: 6 */
/*jshint unused:true */
/*jshint -W097 */
var myWordListRef, myListener, mySpeaker, allWords = [];

var randomValue = function (obj) {
  var keys = Object.keys(obj);
  return obj[keys[ Math.floor(keys.length * Math.random())]];
};

// Main app
firebaseLoginPromise().then(function() {
  console.log('Signed in user', firebase.auth().currentUser.email);

  myWordListRef = firebase.database().ref().child('/words/' + firebase.auth().currentUser.uid);
  myWordListRef.limitToLast(1000);

  myListener = new Listener('#mic');
  mySpeaker = new Speaker();
  
}).then(function() {

  document.querySelectorAll('#new-word-dialog button, #add-word-button').forEach(button => button.addEventListener('click', function() {
    switch (this.textContent.trim()) {
      case 'add_to_queue':
        console.info('#add-word-button: add_to_queue');
        document.querySelector('#new-word-dialog').showModal();
        break;
      case 'cancel':
        console.info('new word dialog: cancel');
        document.querySelector('#new-word-dialog').close();
        break;
      case 'add':
        console.info('new word dialog: add');
        var newWord = document.querySelector('#new-word').value.trim();
        document.querySelector('#new-word').value = '';
        addWord(newWord);
        break;
      default:
        console.error('Unknown new-word-dialog action: "' + this.textContent + '"');
    }
  }));

  document.querySelectorAll('#word-card button').forEach(button => button.addEventListener('click', function() {
    switch (this.textContent.trim()) {
      case 'help':
        console.info('#word-card: help');
        finishWord(true);
        break;
      default:
        console.error('Unknown word-card action: "' + this.textContent + '"');
    }
  }));


}).then(function() {
  // continues to sync new words
  myWordListRef.on('child_added', function(dataSnapshot) {
    allWords.push(dataSnapshot);
  });

  // Doesn't load twice because of supposed smart caching, easy way to confirm caught up.
  // returns a promise
  return myWordListRef.once('value');    
}).then(function() {

  if(allWords.length==0) {
    // Seed with up to third grade words
    ["a", "about", "above", "add", "after", "again", "air", "all", "almost", "along", "also", "always", "am", "an", "and", "animals", "another", "answer", "any", "apple", "are", "around", "as", "ask", "at", "ate", "away", "baby", "back", "ball", "be", "bear", "because", "bed", "been", "before", "began", "beginning", "being", "bell", "below", "best", "better", "between", "big", "bird", "birthday", "black", "blue", "boat", "book", "both", "box", "boy", "bread", "bring", "brother", "brown", "but", "buy", "by", "cake", "call", "called", "came", "can", "car", "carry", "cat", "chair", "change", "chicken", "children", "city", "clean", "close", "coat", "cold", "come", "corn", "could", "country", "cow", "cut", "day", "did", "different", "do", "does", "dog", "doll", "don't", "done", "don’t", "door", "down", "draw", "drink", "duck", "each", "earth", "eat", "egg", "eight", "elephant", "end", "enough", "even", "every", "example", "eye", "face", "fall", "family", "far", "farm", "farmer", "fast", "father", "feet", "few", "find", "fire", "first", "fish", "five", "floor", "flower", "fly", "following", "food", "for", "found", "four", "from", "full", "funny", "game", "garden", "gave", "get", "giraffe", "girl", "give", "go", "goes", "going", "good", "good-bye", "got", "grass", "great", "green", "ground", "group", "grow", "had", "hand", "hard", "has", "have", "he", "head", "hear", "help", "her", "here", "high", "hill", "him", "his", "hold", "home", "horse", "hot", "house", "how", "hurt", "I", "idea", "if", "important", "in", "into", "is", "it", "it's", "its", "jump", "just", "keep", "kind", "kitty", "know", "land", "large", "last", "later", "laugh", "learn", "leave", "left", "leg", "let", "letter", "life", "light", "like", "line", "lion", "list", "little", "live", "long", "look", "made", "make", "man", "many", "may", "me", "means", "men", "might", "miles", "milk", "miss", "money", "more", "morning", "most", "most,", "mother", "mountains", "move", "much", "must", "my", "myself", "name", "near", "need", "nest", "never", "new", "next", "night", "no", "not", "noun", "now", "number", "of", "off", "often", "old", "on", "once", "one", "only", "open", "or", "other", "our", "out", "over", "own", "page", "paper", "part", "party", "penguin", "people", "pick", "picture", "pig", "place", "plants", "play", "please", "point", "pretty", "pull", "put", "rabbit", "rain", "ran", "read", "really", "red", "ride", "right", "ring", "river", "robin", "round", "run", "said", "same", "saw", "say", "school", "sea", "second", "see", "seed", "seemed", "sentence", "set", "seven", "shall", "she", "sheep", "shoe", "should", "show", "side", "sing", "sister", "sit", "six", "sleep", "small", "snow", "so", "some", "something", "sometimes", "song", "soon", "sound", "spell", "squirrel", "start", "state", "stick", "still", "stop", "story", "street", "study", "such", "sun", "table", "take", "talk", "tell", "ten", "than", "thank", "that", "the", "their", "them", "then", "there", "these", "they", "thing", "think", "this", "those", "thought", "three", "through", "tiger", "time", "to", "today", "together", "too", "took", "top", "toy", "tree", "try", "turned", "two", "under", "until", "up", "upon", "us", "use", "very", "walk", "want", "warm", "was", "wash", "watch", "water", "way", "we", "well", "went", "were", "what", "when", "where", "which", "while", "white", "who", "why", "will", "wind", "window", "wish", "with", "without", "wood", "word", "words", "work", "world", "would", "write", "years", "yellow", "yes", "you", "young", "your", "zebra"]
    .forEach(function(word){
      addWord(word);
    });
  }
  console.log('init finished');
  console.groupEnd();
  setTimeout(mainLoop, 1);
}).catch(function(error) {
  console.error('General app error', error);
  throw (error);
});


function addWord(newWord) {
  var existing = allWords.find(function(wordSnapshot){
    return wordSnapshot.val().word == newWord;
  });
  if(existing) {
    console.log('Skipping duplicate word', newWord);
  } else {
    var newPostRef = myWordListRef.push();
    newPostRef.set({
      word: newWord,
      views: 0,
      success: 0
    });
    console.log('Wrote new word', newWord);    
  }
}

function finishWord(needsHelp=false) {
  myListener.abort();
  if(needsHelp) {
    mySpeaker.speakPromise(document.querySelector('#theword').innerHTML).then(function(){
      setTimeout(mainLoop, 1);
    });    
  } else {
    setTimeout(mainLoop, 1);
  }
}

function mainLoop() {
  var wordSnapshot = randomValue(allWords),
  wordKey = wordSnapshot.key,
  wordRef = myWordListRef.child(wordKey),
  word = wordSnapshot.val().word;

  console.log('Flashcard showing word:', word);
  document.querySelector('#theword').innerHTML = word;
  wordRef.update({ views: wordSnapshot.val().views + 1 });

  myListener.start();
  myListener.listenForWord(word).then(function(heardWords) {
    console.log('SUCCESS We heard what we were looking for:' + heardWords);
    document.querySelector('#success').style.display = 'block';
    setTimeout(function(){
      document.querySelector('#success').style.display = 'none';
    }, 1000);
    wordRef.update({ success: wordSnapshot.val().success + 1 });
    finishWord();
  });
}