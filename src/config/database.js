"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let knex = require('knex')({
    client: 'sqlite3',
    connection: {
        database: 'sqldb',
        filename: './sqldb.db'
    }
});
let bookshelf = require('bookshelf')(knex);
let cascadeDelete = require('bookshelf-cascade-delete');
bookshelf.plugin(cascadeDelete);
exports.User = bookshelf.Model.extend({
    tableName: 'user'
});
exports.Subject = bookshelf.Model.extend({
    tableName: 'subject',
});
exports.Question = bookshelf.Model.extend({
    tableName: 'question'
});
exports.Answer = bookshelf.Model.extend({
    tableName: 'answer',
    question: function () {
        return this.belongsTo(exports.Question);
    },
    participant: function () {
        return this.belongsTo(exports.User);
    },
    subject: function () {
        return this.belongsTo(exports.Subject);
    },
    study: function () {
        return this.belongsTo(exports.Study);
    }
});
exports.Study = bookshelf.Model.extend({
    tableName: 'study',
    subjects: function () {
        return this.hasMany(exports.Subject);
    },
    participants: function () {
        return this.hasMany(exports.User);
    },
    questions: function () {
        return this.hasMany(exports.Question);
    }
}, {
    dependents: ['subjectList', 'participants', 'questions']
});
//# sourceMappingURL=database.js.map