
export enum Stage {
    build,
    live,
    concluded
}

export enum Model {
    experiment,
    subject,
    question,
    user,
    answer
}

export enum DataOrder {
    subject,
    question,
    partier
}

export interface Subject {
    id: number,
    text: string,
    alias: string
}

export interface Question {
    id: number,
    text: string,
    perSubject: boolean,
    required: boolean
}

export interface Answer {
    id: number,
    participant_id: number,
    question_id: number,
    subject_id: number,
    timestamp
}

export interface Experiment {
    plural: string;
    moniker: string;
    conclusion: string;
    description: string;
    id: number,
    name: string,
    stage: Stage,
    subjects: Subject[],
    questions: Question[],
    preQuestions: Question[],
    lock_responses: boolean
    show_results: boolean;
    setup_steps: string;
}

export interface SaveBundle {
    type: Model,
    data: object
}

export interface DeleteBundle {
    type: Model,
    id: number
}