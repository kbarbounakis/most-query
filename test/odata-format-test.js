var qry = require('./../index'),
    util = require('util'),
    QueryExpression = qry.classes.QueryExpression,
    OpenDataQuery = qry.classes.OpenDataQuery;

exports.testFormat1 = function(test) {
    var q = new OpenDataQuery();
    q.where('status').equal(2).and('type').equal('open').or('type').equal('pending');
    util.log(JSON.stringify(q));
    test.done();
}

exports.testFormat2 = function(test) {
    var q = new OpenDataQuery();
    q.where('status').equal(2).and('type').in(['open','pending']);
    console.log();
    util.log(JSON.stringify(q));
    test.done();
}

exports.testFormatNotIn = function(test) {
    var q = new OpenDataQuery();
    q.where('status').equal(2).and('type').notIn(['open','pending']);
    console.log();
    util.log(JSON.stringify(q));
    test.done();
}

exports.testFormatIndexOf = function(test) {
    var q = new OpenDataQuery();
    q.where('status').equal(2).andIndexOf('title').greaterOrEqual(0);
    console.log();
    util.log(JSON.stringify(q));
    test.done();
}

exports.testFormatStartsWith = function(test) {
    var q = new OpenDataQuery();
    q.where('status').equal(2).and().startsWith('title','The').equal(true);
    console.log();
    util.log(JSON.stringify(q));
    test.done();
}

exports.testFormatConcat = function(test) {
    var q = new OpenDataQuery();
    q.where('status').equal(2).and().concat(q.field('title'), ' Shop').equal('Pet Shop');
    console.log();
    util.log(JSON.stringify(q));
    test.done();
}

exports.testFormatRound = function(test) {
    var q = new OpenDataQuery();
    q.round('price').greaterThan(99).take(25);
    console.log();
    util.log(JSON.stringify(q));
    test.done();
}