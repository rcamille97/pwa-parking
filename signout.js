function signout(){
    console.log("DECONNEXTION");
    window.location.replace("authLogin.html");
}

$( document ).ready(function() {
    $('#signout').click(function(e) {
        firebase.auth().signOut().then(function() {
            signout();
          }).catch(function(error) {
            console.log(error);
          });
        
    });
});
