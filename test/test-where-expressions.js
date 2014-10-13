/**
 * Created by anoik_000 on 9/5/2014.
 */
var qry = require('./../index'), util = require('util');


function log_sql_query(q)
{
    console.log(util.format('SQL Query: %s', qry.format(q)));
}

exports.testGroupBy = function(test) {
    try {
       log_sql_query(qry.query('OrderData').select([qry.fields.month('orderDate').as('monthOfOrder')]));
        log_sql_query(qry.query('OrderData').select([qry.fields.date('orderDate')]));
        log_sql_query(qry.query('OrderData').select([qry.fields.day('orderDate').as('orderDay'), qry.fields.month('orderDate').as('orderMonth'), qry.fields.year('orderDate').as('orderYear')]));

        qry.openData.parse('year(orderDate) eq 2014', function(err, result) {
            if (err) { throw err; }
            var expr = qry.query('OrderData').select([qry.fields.count('id').as('orderCount'), qry.fields.month('orderDate').as('orderMonth')]).groupBy([qry.fields.month('orderDate')]);
            expr.$where = result;
            log_sql_query(expr);
            test.done();
        });


    }
    catch (e) {
        throw e;
    }
}

exports.testExpression1 = function(test) {
    try {

        var expr = qry.query('TaskAssigned').where('valueId').equal(3).select(['parentId']).take(1);
        util.log(qry.format(expr));
        var q = qry.query('Task').where('id').in(expr).select(['id','name','desciption']);
        util.log(qry.format(q));
        var q = qry.query('Task').where('id').eq(expr).select(['id','name','desciption']);
        util.log(qry.format(q));
        test.done();
    }
    catch (e) {
        throw e;
    }
}

