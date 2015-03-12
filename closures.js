/**
 * MOST Web Framework
 * A JavaScript Web Framework
 * http://themost.io
 *
 * Copyright (c) 2014, Kyriakos Barbounakis k.barbounakis@gmail.com, Anthi Oikonomou anthioikonomou@gmail.com
 *
 * Released under the BSD3-Clause license
 * Date: 2015-03-12
 */
var util = require('util'),
    expressions = require('./expressions'),
    jsep = require('jsep'),
    _ = require('./underscore-extra');

var ExpressionTypes = {
    LogicalExpression : 'LogicalExpression',
    BinaryExpression: 'BinaryExpression',
    MemberExpression: 'MemberExpression',
    MethodExpression: 'MethodExpression',
    Literal: 'Literal'
};

var FunctionUtils = {
    STRIP_COMMENTS: /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg,
    STRIP_SOURCE_COMMENTS: /(?:\/\*(?:[\s\S]*?)\*\/)|(?:([\s;])+\/\/(?:.*)$)/gm,
    SOURCE_COMPRESS:/\/\*.+?\*\/|\/\/.*(?=[\n\r])/g,
    SOURCE_TRIM:/(^\s*|\s*$)/g,
    ARGUMENT_NAMES: /([^\s,]+)/g,
    /**
     * @param func
     * @returns {Array|*}
     */
    parameters: function (func) {
        var fnStr = func.toString().replace(this.STRIP_COMMENTS, '');
        var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(this.ARGUMENT_NAMES);
        if (result === null)
            result = [];
        return result;
    },
    /**
     * @param {function} func
     * @returns {string}
     */
    body: function (func) {
        var s = func.toString().replace(this.STRIP_SOURCE_COMMENTS, '$1').replace(this.SOURCE_COMPRESS, '').replace(/\s{2,}/g, ' ');
        return s.substring(s.indexOf('{') + 1, s.lastIndexOf('}')).replace(this.SOURCE_TRIM, '');
    },
    /**
     * @param {function} func
     * @returns {string}
     */
    closure: function (func) {
        return this.body(func).replace(/^return/g,'').replace(/;$/g,'');
    }
};

/**
 * @class ClosureParser
 * @constructor
 */
function ClosureParser() {
     //
}
/**
 * Parses a javascript expression and returns the equivalent QueryExpression instance.
 * @param {function(*)} fn The closure expression to parse
 * @param {function(Error=,*=)} callback
 */
ClosureParser.prototype.parse = function(fn, callback) {
    var self = this;
    if (typeof fn === 'undefined' || fn == null ) {
        callback();
        return;
    }
    try {
        //convert the given function to javascript expression
        var expr = jsep(FunctionUtils.closure(fn));
        //parse this expression
        this.parseCommon(expr, function(err, result) {
            //and finally return the equivalent query expression
            if (result) {
                if (typeof result.exprOf === 'function') {
                    callback.call(self, err, result.exprOf());
                    return;
                }
            }
            callback.call(self, err, result);
        });
    }
    catch(e) {
        callback(e);
    }

};

ClosureParser.prototype.parseCommon = function(expr, callback) {
    if (expr.type === ExpressionTypes.LogicalExpression) {
        this.parseLogical(expr, callback);
    }
    else if (expr.type === ExpressionTypes.BinaryExpression) {
        this.parseBinary(expr, callback);
    }
    else if (expr.type === ExpressionTypes.Literal) {
        this.parseLiteral(expr, callback);
    }
    else if (expr.type === ExpressionTypes.MemberExpression) {
        this.parseMember(expr, callback);
    }
    else if (expr.type === ExpressionTypes.MethodExpression) {
        this.parseMethod(expr, callback);
    }
    else {
        callback(new Error('The given expression is not yet implemented.'));
    }
};

ClosureParser.prototype.parseLogical = function(expr, callback) {
    var self = this;
    var op = (expr.operator === '||') ? expressions.Operators.Or : expressions.Operators.And;
    //valdate operands
    if (_.isNullOrUndefined(expr.left) || _.isNullOrUndefined(expr.right)) {
        callback(new Error('Invalid logical expression. Left or right operand is missig or undefined.'));
    }
    else {
        self.parseCommon(expr.left, function(err, left) {
            if (err) {
                callback(err);
            }
            else {
                self.parseCommon(expr.right, function(err, right) {
                    if (err) {
                        callback(err);
                    }
                    else {
                        //create expression
                        callback(null, expressions.createLogicalExpression(op, [left, right]));
                    }
                });
            }
        });
    }

};

ClosureParser.BinaryToExpressionOperator = function(op) {
  switch (op) {
      case '===':
      case '==':
          return expressions.Operators.Eq;
      case '!=':
          return expressions.Operators.Ne;
      case '>':
          return expressions.Operators.Gt;
      case '>=':
          return expressions.Operators.Ge;
      case '<':
          return expressions.Operators.Lt;
      case '<=':
          return expressions.Operators.Le;
      case '-':
          return expressions.Operators.Sub;
      case '+':
          return expressions.Operators.Add;
      case '*':
          return expressions.Operators.Mul;
      case '/':
          return expressions.Operators.Div;
      case '%':
          return expressions.Operators.Mod;
      default:
          return;
  }
};
ClosureParser.prototype.parseBinary = function(expr, callback) {
    var self = this;
    var op = ClosureParser.BinaryToExpressionOperator(expr.operator);
    if (_.isNullOrUndefined(op)) {
        callback(new Error('Invalid binary operator.'));
    }
    else {
        self.parseCommon(expr.left, function(err, left) {
            if (err) {
                callback(err);
            }
            else {
                self.parseCommon(expr.right, function(err, right) {
                    if (err) {
                        callback(err);
                    }
                    else {
                        if (expressions.isArithmeticOperator(op)) {
                            callback(null, expressions.createArithmeticExpression(left, op, right));
                        }
                        else if (expressions.isComparisonOperator(op)) {
                            callback(null, expressions.createComparisonExpression(left, op, right));
                        }
                        else {
                            callback(new Error('Unsupported binary expression'));
                        }
                    }
                });
            }
        });
    }

};

ClosureParser.prototype.parseMember = function(expr, callback) {
    var self = this;
    if (expr.property) {
        if (expr.property.name) {
            self.resolveMember(expr.property.name, function(err, member) {
                if (err) {
                    callback(err);
                    return;
                }
                callback(null, expressions.createMemberExpression(member));
            });
            return;
        }
    }
    callback(new Error('Invalid member expression.'));
};

ClosureParser.prototype.parseMethod = function(expr, callback) {
    callback();
};

ClosureParser.prototype.parseLiteral = function(expr, callback) {
    callback(null, expressions.createLiteralExpression(expr.value));
};

/**
 * Abstract function which resolves entity based on the given member name
 * @param {String} member
 */
ClosureParser.prototype.resolveMember = function(member, callback)
{
    if (typeof callback !== 'function')
    //sync process
        return member;
    else
        callback.call(this, null, member);
};

/**
 * Resolves a custom method of the given name and arguments and returns an equivalent MethodCallExpression instance.
 * @param method
 * @param args
 * @param callback
 * @returns {MethodCallExpression}
 */
ClosureParser.prototype.resolveMethod = function(method, args, callback)
{
    if (typeof callback !== 'function')
    //sync process
        return null;
    else
        callback.call(this);
};

var closures = {
    /**
     * @param {function(*)} fn The closure expression to parse
     * @param {function(Error=,*=)} callback A callback function which is going to return the equivalent QueryExpression
     */
    parse: function(fn, callback) {
        var p = new ClosureParser();
        return p.parse(fn, callback);
    },
    /**
     * Creates a new instance of OData parser
     * @returns {ClosureParser}
     */
    createParser: function() {
        return new ClosureParser();
    }
}

if (typeof exports !== 'undefined')
{
    /**
     * @see closures
     */
    module.exports = closures;
}