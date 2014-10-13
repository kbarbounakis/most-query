/**
 * Created by kbarbounakis on 12/5/2014.
 */
var qry = require('./../index'),
    util = require('util'),
    async = require('async');

function log_query(q)
{
    util.log(util.format('JSON Query: %s', JSON.stringify(q)));
    util.log(util.format('SQL Query: %s\n', qry.format(q)));
    util.log(util.format('SQL Query: %s\n', qry.format(q)));
}

function sampleResolveMember(member, callback)
{
    callback(null,'Product.'.concat(member));
}

function sampleResolveMethod(method, args, callback)
{
    if (method=='me') {
        callback(null, 1);
    }
    else if (method=='today') {
        callback(null, new Date());
    }
    else {
        callback();
    }
}


exports.testLogicalExpression = function(test)
{
    var parser = qry.openData.createParser();
    parser.resolveMember = sampleResolveMember;
    parser.resolveMethod = sampleResolveMethod;
    //var str = "(Price add 5) gt 100";
    var str = "startswith(Title,'Export') eq true";
    parser.parse(str, function(err, query) {
        if (err) { throw err; }
        log_query({ $where:query });
        test.done();
    });
};

exports.testExpressions = function(test)
{

    var parser = qry.openData.createParser();
    parser.resolveMember = sampleResolveMember;
    parser.resolveMethod = sampleResolveMethod;
    var arr = [
        "Status eq 0 or Status eq 1",
        "(Status ne 0) and (Status ne 1)",
        "User eq me()",
        "OrderDate gt today()",
        "Status ne 0",
        "Status gt -1",
        "(City eq 'Redmond')",
        "((City eq 'Redmond') or (City eq 'New York')) or (City eq 'Los Angeles')",
        "Price gt 20",
        "Price ge 20.5",
        "Price lt 20",
        "Price le 100",
        "(Price le 200) and (Price gt 3.5)",
        "startswith(Title,'Export') eq true",
        "length(Title) gt 20",
        "indexof(Location_Code, 'BLUE') eq 0",
        "substring(Location_Code, 5) eq 'RED'",
        "tolower(Location_Code) eq 'code red'",
        "toupper(FText) eq '2ND ROW'",
        "trim(FCode) eq 'CODE RED'",
        "concat(FText, ', ') eq '2nd row, CODE RED'",
        "day(FDateTime) eq 12",
        "month(FDateTime) eq 12",
        "round(FDecimal) eq 1"
    ];

    async.eachSeries(arr, function(item,cb) {
        parser.parse(item,
            function(err, query) {
            if (err) { cb(err); return; }
            log_query({ $where:query });
            cb();
        });
    }, function(err) {
        if (err) { throw err; }
        test.done();
    });
};


