

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
    study: function() {
        return this.belongsTo(Study);
    }
});

export let Question = bookshelf.Model.extend({
    tableName: 'question',
    study: function() {
        return this.belongsTo(Study);
    }
});

export let Answer = bookshelf.Model.extend({
    tableName: 'answer',
    question: function(){
        return this.belongsTo(Question);
    },
    participant: function(){
        return this.belongsTo(User);
    },
    subject: function(){
        return this.belongsTo(Subject);
    },
    study: function(){
        return this.belongsTo(Study);
    }
});

export let Study = bookshelf.Model.extend({
    tableName: 'study',
    subjects: function(){
        return this.hasMany(Subject);
    },
    questions: function(){
        return this.hasMany(Question);
    }
},{
    dependents: ['subjects', 'questions']
});