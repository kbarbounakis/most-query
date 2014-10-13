/**
 * Created by kbarbounakis on 23/6/2014.
 */
var qry = require('./../index'), util = require('util');

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