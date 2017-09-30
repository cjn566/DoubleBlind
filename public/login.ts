declare var $: any;

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

    let tryLogin = ()=>{
        let username = usernameField.val();
        let password = passwordField.val();
        resetValidations();
        if(!password || !username) {
            if (!username) {
                invalid('username', 'Please supply your username.');
            }
            if (!password) {
                invalid('password', 'Please supply your password.');
            }
        }
        else {
            login(username, password);
        }
    };

    let trySignup = ()=> {
        let username = usernameField.val();
        let password = passwordField.val();
        let confirmPassword = confirmPasswordField.val();

        resetValidations();

        if(!username){
            invalid('username', 'Please supply a username.');
        }
        if(!password || !confirmPassword) {
            if (!password) {
                invalid('password', 'Please supply a password.');
            }
            if (!confirmPassword) {
                invalid('confirm-password', 'Please confirm your password.');
            }
        }
        else if(password !== confirmPassword){
            invalid('confirm-password', 'Passwords do not match.');
        }
        else {
            signup(username, password);
        }
    };

    let invalid = (e : string, msg : string)=>{
        let element = $('#' + e + '-feedback-parent')
        if(!element.hasClass("has-danger")){
            element.addClass("has-danger");
        }
        $('#' + e + '-feedback').text(msg).show();
    };

    let resetValidations = ()=>{
        ['username', 'password', 'confirm-password'].map((e)=>{
            $('#' + e + '-feedback-parent').removeClass("has-danger");
            $('#' + e + '-feedback').text('').hide();
        });
    };

    let login = (username, password)=>{
        $.post("/auth/login", {username: username, password: password, destination: "/"}, (res) => {
            if(res.err === null) {
                window.location.href = res.destination;
            } else {
                switch (res.err) {
                    case "user fail":
                        invalid('username', 'That username does not exist.');
                        break;
                    case "password fail":
                        invalid('password', 'Incorrect password.');
                        break;
                }
            }
        }, "json")
    };

    let signup = (username, password)=> {
        $.post("/auth/signup", {username: username, password: password}, (res) => {
            if(res.err === null) {
                window.location.href = res.destination;
            } else {
                switch (res.err) {
                    case "user fail":
                        invalid('username', 'That username is not available.');
                        break;
                }
            }
        }, "json");
    };

    passwordField.keyup(function(event){
        if(event.keyCode == 13){
            tryLogin();
        }
    });

    confirmPasswordField.keyup(function(event){
        if(event.keyCode == 13){
            trySignup();
        }
    });

    // Login Button
    $('#btn-login').click(tryLogin);

    // Signup Button
    $('#btn-signup').click(trySignup);

});