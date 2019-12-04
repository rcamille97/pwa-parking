$( document ).ready(function() {
    firebase.auth().createUserWithEmailAndPassword("bru@gmail.com", "azerty").catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
      });
});