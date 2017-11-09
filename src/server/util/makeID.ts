



import {ApiError} from "../../common/interfaces/codes";

export function makeId(len:number){
    let text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < len; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

export function makeReject(rej: ApiError){
    return Promise.reject(rej);
}