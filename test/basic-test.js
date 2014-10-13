/**
 * Created by Kyriakos Barbounakis on 3/7/14.
 */
var qry = require('./../index'), util = require('util');

exports.testNullValues = function(test) {
    var q = qry.query('employees').where('office').equal(null).select(['id','firstName','lastName']);
    util.log(qry.format(q));
    test.done();
}

exports.testJoin1 = function(test) {
    try {
        var q = qry.query('employees').select(['employeeNumber']).distinct();
        var table = qry.entity('employees'),
            perms = qry.entity('PermissionBase').as('p0');
        //initialize expression (item)
        var expr = qry.where(table.select('employeeNumber')).equal(perms.select('target')).
            and(perms.select('privilege')).equal('Employee').
            and(perms.select('parentPrivilege')).equal(null).
            and(perms.select('workspace')).equal(1).
            and(perms.select('mask')).bit(1,1).
            and(perms.select('account')).in([6, 9]).prepare(true);
        //attach second statement (parent)
        expr.where(table.select('officeCode')).equal(perms.select('target')).
            and(perms.select('privilege')).equal('Employee').
            and(perms.select('parentPrivilege')).equal('Office').
            and(perms.select('workspace')).equal(1).
            and(perms.select('mask')).bit(1,1).
            and(perms.select('account')).in([6, 9]).prepare(true);
        //attach third statement (self)
        expr.where(table.select('officeCode')).in([2]).prepare(true);
        //join table with the expression specified
        q.join(perms).with(expr);
        //util.log(qry.format(q));
        //create sub-query
        var q2 = qry.query('employees').select(['employees.*']).join(q.as('q0')).with(qry.where(table.select('employeeNumber')).equal(qry.entity('q0').select('employeeNumber')));
        util.log(JSON.stringify(q2));
        util.log(qry.format(q2));

        test.done();
    }
    catch (e) {
        throw e;
    }
}

function log_query_field(q)
{
    console.log(util.format('JSON Field: %s', JSON.stringify(q)));
    console.log(util.format('SQL Field: %s', qry.format(q, '%f')));
    console.log(util.format('SQL Filter Field: %s', qry.format(q, '%ff')));
}

function log_query(q)
{
    console.log(util.format('JSON Query: %s', JSON.stringify(q)));
    console.log(util.format('SQL Query: %s', qry.format(q)));
}

function log_sql_query(q)
{
    console.log(util.format('SQL Query: %s', qry.format(q)));
}

exports.testWhere = function(test)
{
    //arithmetic function
    log_sql_query({ $where: { Price: { $add: [ 5, 10 ] } } });
    log_sql_query({ $where: { Price: { $add: [ 5, { $gt:10, $lt:15 } ] } } });
    log_sql_query({ $where: { Price: { $add: [ 5, { $gt:10 } ] } } });
    log_sql_query({ $where: { Price: { $sub: [ 5, { $gt:10 } ] } } });
    log_sql_query({ $where: { Price: { $mul: [ 2, { $gte:200 } ] } } });
    log_sql_query({ $where: { Price: { $div: [ 2, { $gt:4 } ] } } });
    log_sql_query({ $where: { Status: { $mod: [ 2, 0 ] } } });
    //string function
    log_sql_query({ $where: { lastName: { $startswith: [ 'Mu', true ] } } });
    log_sql_query({ $where: { lastName: { $startswith: [ 'Mu', { $ne:true } ] } } });
    log_sql_query({ $where: { lastName: { $contains: [ 'u', true ] } } });
    log_sql_query({ $where: { lastName: { $endswith: [ 'phy', true ] } } });
    log_sql_query({ $where: { lastName: { $length: [ {$gt:10} ] } } });
    log_sql_query({ $where: { lastName: { $indexof: [ 'ur', { $gt:0 } ] } } });
    log_sql_query({ $where: { lastName: { $substring: [ 1, 'urphy' ] } } });
    log_sql_query({ $where: { lastName: { $substring: [ 1, 2, 'ur' ] } } });
    log_sql_query({ $where: { lastName: { $tolower: [ 'murphy' ] } } });
    log_sql_query({ $where: { lastName: { $toupper: [ 'MURPHY' ] } } });
    log_sql_query({ $where: { lastName: { $trim: [ 'Murphy' ] } } });
    log_sql_query({ $where: { lastName: { $concat: [ ' John','Murphy John' ] } } });
    //date functions
    log_sql_query({ $where: { orderDate: { $day: [31] } } });
    log_sql_query({ $where: { orderDate: { $day: [ { $gte:21 , $lt:24}] } } });
    log_sql_query({ $where: { orderDate: { $month: [2] } } });
    log_sql_query({ $where: { orderDate: { $year: [2004] } } });
    log_sql_query({ $where: { orderDate: { $hour: [14] } } });
    log_sql_query({ $where: { orderDate: { $minute: [30] } } });
    log_sql_query({ $where: { orderDate: { $second: [0] } } });
    log_sql_query({ $where: { orderDate: { $date: [ { $gt: new Date(2003,0,15) } ] } } });
    log_sql_query({ $where: { orderDate: { $date: [ new Date(2003,0,15) ] } } });
    //math functions
    log_sql_query({ $where: { amount: { $floor: [ { $gt:6000 }] } } });
    log_sql_query({ $where: { amount: { $ceiling: [ { $gt:6000 }] } } });
    log_sql_query({ $where: { amount: { $round: [ { $gt:6000.50 }] } } });
    test.done();
};


exports.testFields = function(test)
{
//    log_query_field(qry.fields.select('price'));
//    log_query_field(qry.fields.select('price').as('productPrice'));
//    log_query_field(qry.fields.average('price'));
//    log_query_field(qry.fields.max('price').as('maxPrice'));
//    log_query_field(qry.fields.select('price').from('products'));
//    log_query_field(qry.fields.average('price').from('products'));
//    log_query_field(qry.fields.max('price').from('products').as('maxPrice'));
    test.done();
};
