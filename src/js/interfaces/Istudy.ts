
export enum Stage {
    build,
    firstMap,
    secondMap,
    live,
    concluded
}

export interface Study {
    id: number,
    name: string,
    fresh: boolean,
    stage: Stage,
    subjects: any[],
    subjectFields: any[]
}