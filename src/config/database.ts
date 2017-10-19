

let knex = require('knex')({
    client: 'sqlite3',
    connection: {
        database : 'sqldb',
        filename  : './sqldb.db'
    }
});

let bookshelf = require('bookshelf')(knex);
let cascadeDelete = require('bookshelf-cascade-delete');
bookshelf.plugin(cascadeDelete);


export let User = bookshelf.Model.extend({
    tableName: 'user'
});

export let Subject = bookshelf.Model.extend({
    tableName: 'subject',
});

export let Participant = bookshelf.Model.extend({
    tableName: 'participant'
});

export let Question = bookshelf.Model.extend({
    tableName: 'question'
});

export let Answer = bookshelf.Model.extend({
    tableName: 'answer',
    question: function(){
        return this.belongsTo(Question);
    },
    participant: function(){
        return this.belongsTo(Participant);
    },
    subject: function(){
        return this.belongsTo(Subject);
    }
});

export let Study = bookshelf.Model.extend({
    tableName: 'study',
    subjects: function(){
        return this.hasMany(Subject);
    },
    participants: function(){
        return this.hasMany(Participant);
    },
    questions: function(){
        return this.hasMany(Question);
    }
},{
    dependents: ['subjectList', 'participants', 'questions']
});