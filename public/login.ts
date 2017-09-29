document.addEventListener('load', function() {
    let scale = 1 / (window.devicePixelRatio || 1);
    let content = 'width=device-width, initial-scale=' + scale;

    document.querySelector('meta[name="viewport"]').setAttribute('content', content)
}, false);

$( document ).ready(function() {
    let usernameField = $('#username');
    let passwordField = $('#password');
    let confirmPasswordField = $('#confirm-password');

    $.getScript("Bundle.js");

    let login = ()=>{
        let username = usernameField.val();
        let password = passwordField.val();
        resetValidations();
        if(!username){
            invalid('username', 'Please supply your username.');
        }
        else if(!password){
            invalid('password', 'Please supply your password.');
        }
        else {
            $.post("/auth/login", {username: username, password: password, destination: "/"}).done((data, status, res) => {
                //  TODO: if successful, the server will return the requested resource. If not, do something.
                console.log(res);
                if(res.status === 200) {
                    console.log('winner');
                    console.log(data);
                    window.location.replace("localhost:3000" + data);
                } else {
                    switch (data) {
                        case "user fail":
                            invalid('username', 'That username does not exist.');
                            break;
                        case "password fail":
                            invalid('password', 'Incorrect password.');
                            break;
                    }
                }
            })
        }
    };

    let signup = ()=> {
        let username = usernameField.val();
        let password = passwordField.val();
        let confirmPassword = confirmPasswordField.val();

        resetValidations();

        if(!username){
            invalid('username', 'Please supply a username.');
        }
        else if(!password){
            invalid('password', 'Please supply a password.');
        }
        else if(!confirmPassword){
            invalid('confirm-password', 'Please confirm your password.');
        }
        else if(password !== confirmPassword){
            invalid('confirm-password', 'Passwords do not match.');
        }
        else {
            $.post("/auth/signup", {username: username, password: password}).done((data) => {
                switch(data){
                    case "user fail":
                        invalid('username', 'That username is not available.');
                        break;
                }
            })
        }
    };

    let invalid = (e : string, msg : string)=>{
        $('#' + e + '-feedback-parent').addClass("has-danger");
        $('#' + e + '-feedback').text(msg).show();
    };

    let resetValidations = ()=>{
        ['username', 'password', 'confirm-password'].map((e)=>{
            $('#' + e + '-feedback-parent').removeClass("has-danger");
            $('#' + e + '-feedback').text('').hide();
        });
    };

    passwordField.keyup(function(event){
        if(event.keyCode == 13){
            login();
        }
    });

    confirmPasswordField.keyup(function(event){
        if(event.keyCode == 13){
            signup();
        }
    });

    // Login Button
    $('#btn-login').click(login);

    // Signup Button
    $('#btn-signup').click(signup);

});