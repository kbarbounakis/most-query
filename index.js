/**
 * Created by kyriakos barbounakis on 2/15/14.
 */
var util = require('util'),
    odata = require('./odata'),
    frmt = require('./formatter'),
    /**
     * @class {SqlFormatter}
     * @constructor
     */
    SqlFormatter = frmt.SqlFormatter,
    query = require('./query'),
    /**
     * @class {QueryExpression}
     * @constructor
     */
    QueryExpression = query.QueryExpression,
    /**
     * @class {QueryField}
     * @constructor
     */
    QueryField = query.QueryField,
    /**
     * @class {QueryEntity}
     * @constructor
     */
    QueryEntity = query.QueryEntity,
    /**
     * @class {ODataFormatter}
     * @constructor
     */
    OpenDataQuery = query.OpenDataQuery;

var qry = {
    /**
     * @namespace
     */
    classes: {
        /**
         * @constructor
         */
        QueryExpression:QueryExpression,
        /**
         * @constructor
         */
        QueryField:QueryField,
        /**
         * @constructor
         */
        QueryEntity:QueryEntity,
        /**
         * @constructor
         */
        SqlFormatter:SqlFormatter,
        /**
         * @constructor
         */
        OpenDataQuery:OpenDataQuery
    },
    /**
     * @returns {QueryExpression}
     * @param entity {string=} - The entity that is going to be used in this operation
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
     */
    where: function(obj) {
        var q = new QueryExpression();
        return q.where(obj);
    },
    /**
     * Initializes a select query expression from the specified entity
     * @returns {QueryExpression}
     * @param entity {string} - The entity that is going to be used in this operation
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
     */
    deleteFrom: function(entity) {
        var q = new QueryExpression();
        q.delete(entity);
        return q;
    },
    /**
     * @param obj {*}
     * @returns {QueryExpression}
     */
    insert: function(obj) {
        var q = new QueryExpression();
        return q.insert(obj);
    },
    /**
     * @param {string} entity
     * @returns {QueryExpression}
     */
    update: function(entity) {
        var q = new QueryExpression();
        return q.update(entity);
    },
    /**
     * Formats a query object and returns the equivalent SQL statement
     * @param query {QueryExpression|*}
     * @param query {string=}
     * @returns {string}
     */
    format: function(query, s) {
        var formatter = new SqlFormatter();
        return formatter.format(query, s);
    },
    /**
     * @param {string} query
     * @param {*} values
     */
    prepare: function(query, values) {
        var mysql=require('mysql');
        return mysql.format(query,values);
    },
    /**
     * Creates an entity reference that is going to be used in query expressions.
     * @param entity {string} The entity name
     * @param fields {Array=} An array that represents the entity's field collection to be used.
     * @returns {*}
     */
    createEntity: function(entity, fields) {
        var obj = new QueryEntity(entity);
        obj[entity] = fields || [];
        return obj;
    },
    entity: function(entity, fields) {
        var obj = new QueryEntity(entity);
        obj[entity] = fields || [];
        return obj;
    },
    /**
     * Creates an field reference that is going to be used in query expressions (like join statements etc).
     * @param entity {string} The entity name
     * @param name {string} The field name
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
     */
    openData: {
        /**
         * @param {String} str The open data filter expression
         * @param {Function} callback The callback function
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
    module.exports = qry;
}
