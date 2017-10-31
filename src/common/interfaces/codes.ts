
export enum LoginCode {
    noUser,
    badPassword,
    userExist,
    ok
}

export enum ApiCode {
    notAuth,
    serverErr,
    badRequest,
    ok
}

export interface ApiError {
    message:string,
    code:ApiCode
}