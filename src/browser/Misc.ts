import * as $ from 'jquery'

export function isArray (value):boolean {
    return value && typeof value === 'object' && value.constructor === Array;
}

export function shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex--);

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}




export function invalid(e : string, msg : string){
    let element = $('#' + e + '-feedback-parent')
    if(!element.hasClass("has-danger")){
        element.addClass("has-danger");
    }
    let fb = $('#' + e + '-feedback');
    fb.text(msg).show();
}

export function resetValidations(elementNames){
    elementNames.map((e)=>{
        let parent = $('#' + e + '-feedback-parent');
        parent.removeClass("has-danger");
        let message = $('#' + e + '-feedback');
        message.text('').hide();
    });
}