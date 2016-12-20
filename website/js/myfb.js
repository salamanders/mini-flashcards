/* global firebase, Promise */
/*jshint esversion: 6 */
/*jshint unused:true */
/*jshint -W097 */
/*exported firebaseLoginPromise */

function firebaseLoginPromise() {
  return new Promise(function (resolve) {
    console.group('firebase init');

    firebase.initializeApp({
      apiKey: "AIzaSyC3B9kWSnfZcJdhS9LfftQ2yxbzKguWUVI",
      authDomain: "mini-flashcards.firebaseapp.com",
      databaseURL: "https://mini-flashcards.firebaseio.com",
      storageBucket: "mini-flashcards.appspot.com",
      messagingSenderId: "472443518750"
    });

    // Using this to make sure not in intermediate state
    firebase.auth().onAuthStateChanged(function () {
      console.log('User state stablilized.');
      resolve();
    });
    
  }).then(function () {
    // All the various login states
    return new Promise(function (resolve, reject) {
      if (firebase.auth().currentUser) {
        console.log('You were already logged in - great!');
        resolve(firebase.auth().currentUser);
        return;
      }

      firebase.auth().getRedirectResult().then(function (result) {
        if (result.user) {
          console.log('Welcome back and congratulations on your successful login!', result.user);
          resolve(result.user);
          return;
        }
        console.log('Not logged in, not returning - time to send you on your way.');
        var provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/plus.login');
        firebase.auth().signInWithRedirect(provider);
        return;
      }).catch(function (error) {
        console.error('Returning from redirect login error:', error);
        reject(error);
      });
    });
  });
}