var firebase = require('firebase');

var firebaseConfig = {
  apiKey: "AIzaSyDfyqcZMMIxEm6OtXtu_H-FUNXBu2AaaXk",
  authDomain: "mcr-menu-2390d.firebaseapp.com",
  databaseURL: "https://mcr-menu-2390d.firebaseio.com",
  projectId: "mcr-menu-2390d",
  storageBucket: "mcr-menu-2390d.appspot.com",
  messagingSenderId: "255090423287",
  appId: "1:255090423287:web:6be1a34deb03f535db6af2",
  measurementId: "G-CZMZ3YV9X4"
};
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  module.exports = firebase.database();