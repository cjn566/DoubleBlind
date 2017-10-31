
export enum Stage {
    build,
    live,
    concluded
}

export enum Model {
    study,
    subject,
    question,
    participant,
    answer
}

export interface Subject {
    id: number,
    name: string,
    map1: any,
    map2: any
}

export interface Question {
    id: number,
    text: string,
    perSubject: boolean,
    require: boolean
}

export interface Study {
    id: number,
    name: string,
    stage: Stage,
    subjects: Subject[],
    questions: Question[],
    preQuestions: Question[],
    aliases: number,
    anon_participants: boolean,
    lock_responses: boolean
}

export interface SaveBundle {
    type: Model,
    data: object
}

export interface DeleteBundle {
    type: Model,
    id: number
}