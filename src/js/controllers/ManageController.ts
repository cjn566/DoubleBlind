
enum Steps{
    One,
    Two,
    Three
}

enum Page{
    SelectStudy,
    BuildStudy,
    FirstMap,
    SecondMap,
    Live
}

interface Study {
    id: number,
    name: string,
    stage: Steps,
    fresh: boolean,
    subjects: any[],
    subjectFields: any[]
}

class ManageController {
    logger;
    manageService;
    loading: boolean = false;
    indexer: number = -1;

    constructor(log, manageService){
        this.manageService = manageService;
        this.logger = log;
        this.loadStudies();

        //this.selectStudy(1);
    }

    page: Page;
    studies: Study[];
    study: Study;
    save = {
        study: null,
        subjects: [],
        fields: [],
        values: [],
        deletes: [],
        studyId: 0
    };

    loadStudies = () => {
        this.doLoad(
            this.manageService.getStudies().then((data)=>{
                this.studies = data;
                this.page = Page.SelectStudy;
            })
        );
    };

    newStudy = () => {
        this.study = {
            id: this.indexer--,
            name: "newstudy",
            stage: Steps.One,
            fresh: false,
            subjects: [],
            subjectFields: [],
        };
        this.page = Page.BuildStudy;
    };

    selectStudy = (id:number) =>{
        this.doLoad(
            this.manageService.getStudy(id).then((data)=> {
                this.study = data;
                this.page = Page.BuildStudy;
            })
        );
    };

    addSubjectField = ()=>{
        let newIdx = this.indexer--;
        this.study.subjectFields.push({
            deleted: false,
            fresh : false,
            id: newIdx,
            name: "newfield",
            study_id: this.study.id
        });
        this.study.subjects.map((subject)=>{
            subject.entries.push({
                fresh: false,
                fieldId: newIdx,
                id: this.indexer--,
                subjectId: subject.id,
                value: "empty"
            })
        });
        this.logger.log(this.study.subjectFields)
    };

    addSubject = ()=>{
        let newSubjectIdx = this.indexer--;
        this.study.subjects.push({
            entries: this.study.subjectFields.map((field)=>{
                return {
                    fresh: false,
                    fieldId: field.id,
                    id: this.indexer--,
                    subjectId: newSubjectIdx,
                    value: "empty"
                }
            }),
            deleted: false,
            fresh: false,
            id:newSubjectIdx,
            name: "newsubject",
            study_id: this.study.id
        });
        this.logger.log(this.study.subjectFields)
    };

    updateSubject = (idx) => {
        this.logger.log("update subject: " + idx);
        this.study.subjects[this.study.subjects.findIndex(s => s.id == idx)].fresh = false;
    };

    updateSubjectField = (idx) => {
        this.logger.log("update subject field: " + idx);
        this.study.subjectFields[this.study.subjectFields.findIndex(s => s.id == idx)].fresh = false;
    };

    updateSubjectValue = (sid, eid) => {
        this.logger.log("update subject value: " + sid + " : " + eid);

        let subject = this.study.subjects[this.study.subjects.findIndex(s => s.id == sid)];
        subject.entries[subject.entries.findIndex(s => s.id == eid)].fresh = false;
    };

    deleteSubject = (idx) => {
        this.study.subjects[this.study.subjects.findIndex(s => s.id == idx)].deleted ^= 1;
    };

    deleteSubjectField = (idx) => {
        this.study.subjectFields[this.study.subjectFields.findIndex(s => s.id == idx)].deleted ^= 1;
    };

    isColDeleted = (idx) =>{
        return this.study.subjectFields[this.study.subjectFields.findIndex(s => s.id == idx)].deleted;
    };

    saveStudy = ()=>{

        this.save.studyId = this.study.id;

        // Save Study
        if(!this.study.fresh){
            this.save.study = {
                name: this.study.name,
                stage: this.study.stage,
            }
        }

        // Save Subjects
        this.save.subjects = this.study.subjects.filter(x => !x.fresh).map(y => {
            return {
                id: y.id,
                name: y.name
            }
        });

        // Save Fields
        this.save.fields = this.study.subjectFields.filter(x => !x.fresh).map(y => {
            return {
                id: y.id,
                name: y.name
            }
        });

        // Save Values
        this.save.values = [].concat(...this.study.subjects.map(x=>x.entries)).filter(x => !x.fresh).map(y => {
            return {
                id: y.id,
                subjectId: y.subjectId,
                fieldId: y.fieldId,
                value: y.value
            }
        });

        // Delete Subjects, Fields, and Values
        let deletedRows = [];
        this.save.deletes = [].concat(...this.study.subjects.filter(x => x.deleted).map(y => {
                deletedRows.push(y.id);
                return [{
                    type: "subject",
                    id: y.id
                }, ...y.entries.map( (z) => {return{
                    type: "subjectFieldValue",
                    id: z.id
                }})]
            }),
            ...this.study.subjectFields.filter(x => x.deleted).map(y => {
                return [{
                    type: "subjectField",
                    id: y.id
                }, ...this.study.subjects.map( (z) => {
                    let entry = z.entries[z.entries.findIndex(e => e.fieldId == y.id)];
                    if( !deletedRows.some(h => h == entry.subjectId) ) {
                        return {
                            type: "subjectFieldValue",
                            id:entry.id
                        }
                    }
                })]
            }));

        this.logger.log(this.save);

        this.doLoad(
            this.manageService.saveStudy(this.save).then((data)=>{
                this.study = data;
            })
        )
    };

    buildBackToSelect = ()=>{
        this.study = null;
        this.loadStudies();
    };

    doLoad = (fn:Promise<any>)=>{
        this.loading = true;
        fn.then(()=>{this.loading = false});
    }

}

module.exports = ManageController;
