$( document ).ready(function() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            window.location.replace("index.html");
        } else {
        }
    });

    function toggleResetPswd(e){
        e.preventDefault();
        $('#logreg-forms .form-signin').toggle() // display:block or none
        $('#logreg-forms .form-reset').toggle() // display:block or none
    }

    function toggleSignUp(e){
        e.preventDefault();
        $('#logreg-forms .form-signin').toggle(); // display:block or none
        $('#logreg-forms .form-signup').toggle(); // display:block or none
    }

    // Login Register Form
    $('#logreg-forms #forgot_pswd').click(function(e) {
        toggleResetPswd(e);
    });
    $('#logreg-forms #cancel_reset').click(function(e) {
        toggleResetPswd(e);
    });
    $('#logreg-forms #btn-signup').click(function(e){
        toggleSignUp(e);
    });
    $('#logreg-forms #cancel_signup').click(function(e){
        toggleSignUp(e);
    });

    $('#btn_connect').click(function(e) {
        e.preventDefault();
        var email = $('#inputEmail').val();
        var pwd = $('#inputPassword').val();
        if (email.length > 0 && pwd.length > 0) {
            console.log("entering in sign in");
            firebase.auth().signInWithEmailAndPassword(email, pwd).catch(function(error) {
                var errorCode = error.code;
                var errorMessage = error.message;
                console.log(errorCode+": "+errorMessage);
            });
        }
    });

    $('#submit_signup').click(function(e){
        e.preventDefault();
        var email = $('#user-email').val();
        var pwd = $('#user-pass').val();
        var confirmPwd = $('#user-repeatpass').val();
        if (email.length > 0 && pwd.length > 0 && pwd == confirmPwd) {
            console.log("entering in sign up");
            firebase.auth().createUserWithEmailAndPassword(email, pwd).catch(function(error) {
                var errorCode = error.code;
                var errorMessage = error.message;
                console.log(errorCode+": "+errorMessage);
            });
        }
        else {
            console.log("Error while trying to create account.");
        }
    });

    $('#submit_reset_pwd').click(function(e) {
        e.preventDefault();
        var email = $('#resetEmail').val();
        if (email.length > 0) {
            firebase.auth().sendPasswordResetEmail(email).then(function() {
                alert("Mail de réinitialisation envoyé à l'adresse "+email);
            }).catch(function(error) {
                alert("Error can't send mail");
            });
        }
    });
});