/**
 * MOST Web Framework
 * A JavaScript Web Framework
 * http://themost.io
 *
 * Copyright (c) 2014, Kyriakos Barbounakis k.barbounakis@gmail.com, Anthi Oikonomou anthioikonomou@gmail.com
 *
 * Released under the BSD3-Clause license
 * Date: 2014-02-15
 */
/**
 * @ignore
 */
var util = require('util'),
    odata = require('./odata'),
    frmt = require('./formatter'),
    /**
     * @class SqlFormatter
     * @constructor
     */
    SqlFormatter = frmt.SqlFormatter,
    query = require('./query'),
    /**
     * @constructs QueryExpression
     */
    QueryExpression = query.QueryExpression,
    /**
     * @constructs QueryField
     */
    QueryField = query.QueryField,
    /**
     * @constructs QueryEntity
     */
    QueryEntity = query.QueryEntity,
    /**
     * @constructs ODataFormatter
     */
    OpenDataQuery = query.OpenDataQuery;

/**
 * @module most-query
 */
var qry = {
    /**
     * @namespace
     * @memberOf module:most-query
     */
    classes: {
        /**
         * @constructs QueryExpression
         */
        QueryExpression:QueryExpression,
        /**
         * @constructs QueryField
         */
        QueryField:QueryField,
        /**
         * @constructs QueryEntity
         */
        QueryEntity:QueryEntity,
        /**
         * @constructs SqlFormatter
         */
        SqlFormatter:SqlFormatter,
        /**
         * @constructs OpenDataQuery
         */
        OpenDataQuery:OpenDataQuery
    },
    /**
     * @returns {QueryExpression}
     * @param {string=} entity - The entity that is going to be used in this operation
     * @memberOf module:most-query
     */
    query: function(entity) {

        var q = new QueryExpression();
        q.from(entity);
        return q;
    },
    /**
     * Initializes a QueryExpression instance.
     * @returns {QueryExpression}
     * @param  {String|*} obj
     * @memberOf module:most-query
     */
    where: function(obj) {
        var q = new QueryExpression();
        return q.where(obj);
    },
    /**
     * Initializes a select query expression from the specified entity
     * @returns {QueryExpression}
     * @param entity {string} - The entity that is going to be used in this operation
     * @memberOf module:most-query
     */
    selectFrom: function(entity) {

        var q = new QueryExpression();
        q.from(entity);
        return q;
    },
    /**
     * Initializes a delete query expression from the specified entity
     * @param entity {string}
     * @returns {QueryExpression}
     * @memberOf module:most-query
     */
    deleteFrom: function(entity) {
        var q = new QueryExpression();
        q.delete(entity);
        return q;
    },
    /**
     * @param {*} obj
     * @returns {QueryExpression}
     * @memberOf module:most-query
     */
    insert: function(obj) {
        var q = new QueryExpression();
        return q.insert(obj);
    },
    /**
     * @param {string} entity
     * @returns {QueryExpression}
     * @memberOf module:most-query
     */
    update: function(entity) {
        var q = new QueryExpression();
        return q.update(entity);
    },
    /**
     * Formats a query object and returns the equivalent SQL statement
     * @param {QueryExpression|*} query
     * @param {string=} s
     * @returns {string}
     * @memberOf module:most-query
     */
    format: function(query, s) {
        var formatter = new SqlFormatter();
        return formatter.format(query, s);
    },
    /**
     * @param {string} query
     * @param {*} values
     * @returns {string}
     * @memberOf module:most-query
     */
    prepare: function(query, values) {
        if (typeof values === 'undefined' || values===null)
            return query;
        var mysql=require('mysql');
        return mysql.format(query,values);
    },
    /**
     * Creates an entity reference that is going to be used in query expressions.
     * @param {string} entity The entity name
     * @param {Array=} fields An array that represents the entity's field collection to be used.
     * @returns {QueryEntity|*}
     * @memberOf module:most-query
     */
    createEntity: function(entity, fields) {
        var obj = new QueryEntity(entity);
        obj[entity] = fields || [];
        return obj;
    },
    /**
     * Creates an entity reference that is going to be used in query expressions.
     * @param {string} entity - The entity name
     * @param {Array=} fields - An array that represents the entity's field collection to be used.
     * @returns {QueryEntity|*}
     * @memberOf module:most-query
     */
    entity: function(entity, fields) {
        var obj = new QueryEntity(entity);
        obj[entity] = fields || [];
        return obj;
    },
    /**
     * Creates a field reference that is going to be used in query expressions (like join statements etc).
     * @param {string} entity - The entity name
     * @param {string} name - The field name
     * @memberOf module:most-query
     */
    createField: function(entity, name) {
        var f = {};
        f[entity] = [name];
        return f;
    },
    /**
     * Creates an field reference that is going to be used in query expressions (like join statements etc).
     * @param entity {string} The entity name
     * @param value {*} The field name
     */
    createValue: function(value) {
        return { $value:value };
    },
    /**
     * @namespace
     * @memberOf module:most-query
     */
    fields: {
        /**
         * @param obj {string}
         * @returns {QueryField}
         */
        select: function(name) {
            return new QueryField(name);
        },
        /**
         * @param name {string}
         * @returns {QueryField}
         */
        count:function(name) {
            var f = new QueryField();
            return f.count(name);
        },
        /**
         * @param name {string}
         * @returns {QueryField}
         */
        min:function(name) {
            var f = new QueryField();
            return f.min(name);
        },
        /**
         * @param name {string}
         * @returns {QueryField}
         */
        month:function(name) {
            var f = { };
            f[name] = { $month:[ qry.fields.select(name) ] };
            return util._extend(new QueryField(), f);
        },
        /**
         * @param name {string}
         * @returns {QueryField}
         */
        year:function(name) {
            var f = { };
            f[name] = { $year:[ qry.fields.select(name) ] };
            return util._extend(new QueryField(), f);
        },
        /**
         * @param name {string}
         * @returns {QueryField}
         */
        day:function(name) {
            var f = { };
            f[name] = { $day:[ qry.fields.select(name) ] };
            return util._extend(new QueryField(), f);
        },
        /**
         * @param name {string}
         * @returns {QueryField}
         */
        date:function(name) {
            var f = { };
            f[name] = { $date:[ qry.fields.select(name) ] };
            return util._extend(new QueryField(), f);
        },
        /**
         * @param name {string}
         * @returns {QueryField}
         */
        hour:function(name) {
            var f = { };
            f[name] = { $hour:[ qry.fields.select(name) ] };
            return util._extend(new QueryField(), f);
        },
        /**
         * @param name {string}
         * @returns {QueryField}
         */
        minute:function(name) {
            var f = { };
            f[name] = { $minute:[ qry.fields.select(name) ] };
            return util._extend(new QueryField(), f);
        },
        /**
         * @param name {string}
         * @returns {QueryField}
         */
        second:function(name) {
            var f = { };
            f[name] = { $second:[ qry.fields.select(name) ] };
            return util._extend(new QueryField(), f);
        },
        /**
         * @param name {string}
         * @returns {QueryField}
         */
        max:function(name) {
            var f = new QueryField();
            return f.max(name);
        },
        /**
         * @param name {string}
         * @returns {QueryField}
         */
        average:function(name) {
            var f = new QueryField();
            return f.average(name);
        },
        /**
         * @param name {string}
         * @returns {QueryField}
         */
        sum:function(name) {
            var f = new QueryField();
            return f.sum(name);
        }
    },
    /**
     * @namespace
     * @memberOf module:most-query
     */
    openData: {
        /**
         * @param {String} str The open data filter expression
         * @param {function} callback The callback function
         * @returns {QueryExpression} The equivalent query expression
         */
        parse:function(str, callback) {
            return odata.parse(str, callback);
        },
        /**
         * Creates a new instance of OData parser
         * @returns {OpenDataParser}
         */
        createParser: function() {
            return odata.createParser();
        }
    }
}


if (typeof exports !== 'undefined')
{
    /**
     * @see qry
     */
    module.exports = qry;
}
