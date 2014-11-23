/**
 * Created by kbarbounakis on 16/7/2014.
 */

var util = require('util');

if (!Object.keys) {
    Object.keys = (function () {
        var hasOwnProperty = Object.prototype.hasOwnProperty,
            hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
            dontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ],
            dontEnumsLength = dontEnums.length;
        return function (obj) {
            if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
                throw new TypeError('Object.keys called on non-object');
            }
            var result = [], prop, i;
            for (prop in obj) {
                if (hasOwnProperty.call(obj, prop)) {
                    result.push(prop);
                }
            }
            if (hasDontEnumBug) {
                for (i = 0; i < dontEnumsLength; i++) {
                    if (hasOwnProperty.call(obj, dontEnums[i])) {
                        result.push(dontEnums[i]);
                    }
                }
            }
            return result;
        };
    }());
}

// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.com/#x15.4.4.18
if (typeof Array.prototype.forEach === 'undefined') {
    /**
     * @param Function(*) callback
     * @param {*=} thisArg
     */
    Array.prototype.forEach = function (callback, thisArg) {
        var T, k;
        if (this == null) {
            throw new TypeError(" this is null or not defined");
        }
        var O = Object(this);
        var len = O.length >>> 0;
        if (typeof callback !== "function") {
            throw new TypeError(callback + " is not a function");
        }
        if (arguments.length > 1) {
            T = thisArg;
        }
        k = 0;
        while (k < len) {
            var kValue;
            if (k in O) {
                kValue = O[k];
                callback.call(T, kValue, k, O);
            }
            k++;
        }
    };
}

if (typeof Object.isNullOrUndefined !== 'function') {
    /**
     * Gets a boolean that indicates whether the given object is null or undefined
     * @param {*} obj
     * @returns {boolean}
     */
    Object.isNullOrUndefined = function(obj) {
        return (typeof obj === 'undefined') || (obj==null);
    }
}

if (typeof Object.key !== 'function') {
    /**
     * Gets a string that represents the name of the very first property of an object. This operation may be used in anonymous object types.
     * @param obj {*}
     * @returns {string}
     */
    Object.key = function(obj) {
        if (typeof obj === 'undefined' || obj == null)
            return null;
        for(var prop in obj) {
            if (obj.hasOwnProperty(prop))
                return prop;
        }
        return null;
    }
}

if (typeof Object.clear !== 'function') {
    /**
     * Clears object properties
     * @param {*} obj
     */
    Object.clear = function(obj) {
        if (typeof obj === 'undefined' || obj == null)
            return;
        var arr = [];
        for(var key in obj)
            if (obj.hasOwnProperty(key)) arr.push(key);
        for(var key in arr)
            delete obj[key];
    }
}

/**
 * @class QueryExpression
 * @constructor
 */
function QueryExpression()
{
    /**
     * Gets or sets an object or an array of objects that represents the entity where a select query will be applied.
     * e.g. $select : { products: ['id', 'title', 'price'] },
     * $select : [{ products: ['id', 'title', 'price'] }, { manufacturer:[ 'id', 'title', 'location'] }]
     * @type {*}
     * @private
     */
    this.$select = undefined;
    /**
     * Gets or sets an object or an array of objects that represents the entity where a delete query will be applied.
     * e.g. { $delete : 'products', $where : { id :100 } }
     * @type {*}
     * @private
     */
    this.$delete = undefined;
    /**
     Gets or sets an object or an array of objects that represents the entity where an update query will be applied.
     * e.g. $update : { products: {title: 'string #1', price: 100}, $where: { id:100 } }
     * @type {*}
     * @private
     */
    this.$update = undefined;
    /**
     * Gets or sets an object or an array of objects that represents the entity where an insert query will be applied.
     * e.g. $insert : { products: { title: 'string #1', price: 100} }
     * @type {*}
     * @private
     */
    this.$insert = undefined;
    /**
     * Gets or sets the order statement of this query
     * e.g. $order: [{ $asc: 'price' }, { $desc: 'dateCreated' }] or $order: [{ $asc: ['price', 'dateCreated'] }]
     * @type {*}
     * @private
     */
    this.$order = undefined;
    /**
     * Gets or sets the group by statement of this query
     * e.g. $group: ['price', 'dateCreated']
     * @type {*}
     * @private
     */
    this.$group = undefined;
    /**
     * @type {*}
     * @private
     */
    this.$expand = undefined;
    /**
     * Represents the filter statement of this query expression
     * e.g. $where : { { price: 100} }
     * @type {*}
     * @private
     */
    this.$where = undefined;
    /**
     * Represents a prepared filter that
     * e.g. $where : { { price: 100} }
     * @type {*}
     * @private
     */
    this.$prepared = undefined;
    /**
     * Represents a select query with only fixed values e.g. SELECT * FROM (SELECT 1 AS id,'test' AS title) t0
     * @type {undefined}
     */
    this.$fixed = undefined;
    /**
     * @private
     */
    this.privates = function() { };

}

/**
 * Clones current object
 * @returns {QueryExpression}
 */
QueryExpression.prototype.clone = function()
{
    return util._extend(new QueryExpression(), this);
};

/**
 * Sets the alias of a QueryExpression instance. This alias is going to be used in sub-query operations
 * @returns {QueryExpression}
 */
QueryExpression.prototype.as = function(alias)
{
    this.$alias = alias;
    return this;
};

/**
 * Represents an enumeration of comparison query operators
 * @type {*}
 */
QueryExpression.ComparisonOperators = { $eq:'$eq', $ne:'$ne', $gt:'$gt',$gte:'$gte', $lt:'$lt',$lte:'$lte', $in: '$in', $nin:'$nin' };
/**
 * Represents an enumeration of logical query operators
 * @type {*}
 */
QueryExpression.LogicalOperators = { $or:'$or', $and:'$and', $not:'$not', $nor:'$not' };
/**
 * Represents an enumeration of evaluation query operators
 * @type {*}
 */
QueryExpression.EvaluationOperators = { $mod:'$mod', $add:'$add', $sub:'$sub', $mul:'$mul', $div:'$div' };

/**
 * Gets a collection that represents the selected fields of the underlying expression
 * @returns {Array}
 */
QueryExpression.prototype.fields = function() {

    if (typeof this.$select === 'undefined' || this.$select == null)
        return [];
    var entity = Object.key(this.$select);
    var joins = [];
    if (this.$expand!=null)
    {
        if (util.isArray(this.$expand))
            joins=this.$expand;
        else
            joins.push(this.$expand);
    }
    //get entity fields
    var fields = [];
    //get fields
    var re = QueryField.fieldNameExpression, arr = this.$select[entity] || [];
    arr.forEach(function(x)
    {
        if (typeof x === 'string') {
            //todo:add entity alias (if (/^[A-Za-z]+$/.test(x))
            re.lastIndex=0;
            if (!re.test(x))
                fields.push(new QueryField(x));
            else {
                var f = new QueryField(x);
                fields.push(f.from(entity));
            }
        }
        else {
            fields.push(util._extend(new QueryField(), x));
        }
    });
    //enumerate join fields
    joins.forEach(function(x)
    {
        if (x.$entity instanceof QueryExpression) {
            //todo::add fields if any
        }
        else {
            var table = Object.key(x.$entity), tableFields = x.$entity[table] || [];
            tableFields.forEach(function(y) {
                if (typeof x === 'string') {
                    //todo:add table alias (if (/^[A-Za-z]+$/.test(y))
                    fields.push(new QueryField(y));
                }
                else {
                    fields.push(util._extend(new QueryField(), y));
                }
            });
        }
    });
    return fields;
}

/**
 * Gets a boolean value that indicates whether query expression has a filter statement or not.
 * @returns {boolean}
 */
QueryExpression.prototype.hasFilter = function()
{
    return Object.isObject(this.$where);
};
/**
 * @param {Boolean} useOr
 * @returns {QueryExpression}
 */
QueryExpression.prototype.prepare = function(useOr)
{
    if (typeof this.$where === 'object') {
        if (typeof this.$prepared === 'object')
        {
            var preparedWhere = {};
            if (useOr)
                preparedWhere = { $or: [this.$prepared, this.$where] };
            else
                preparedWhere = { $and: [this.$prepared, this.$where] };
            this.$prepared = preparedWhere;
        }
        else {
            this.$prepared = this.$where;
        }
        delete this.$where;
    }
    return this;
};

/**
 * Gets a boolean value that indicates whether query expression has fields or not.
 * @returns {boolean}
 */
QueryExpression.prototype.hasFields = function()
{
    var self = this;
    if (!Object.isObject(self.$select))
        return false;
    var entity = Object.key(self.$select);
    var joins = [];
    if (self.$expand!=null)
    {
        if (util.isArray(self.$expand))
            joins=self.$expand;
        else
            joins.push(self.$expand);
    }
    //search for fields
    if (util.isArray(self.$select[entity])) {
        if (self.$select[entity].length>0)
            return true;
    }
    var result = false;
    //enumerate join fields
    joins.forEach(function(x)
    {
        var table = Object.key(x.$entity);
        if (util.isArray(x.$entity[table])) {
            if (x.$entity[table].length>0)
                result = true;
        }
    });
    return result;
};


/**
 * Gets a boolean value that indicates whether query expression has paging or not.
 * @returns {boolean}
 */
QueryExpression.prototype.hasPaging = function()
{
    return (typeof this.$take !=='undefined' && this.$take!=null);
}

/**
 * @returns {QueryExpression}
 */
QueryExpression.prototype.distinct = function(value)
{
    if (typeof value === 'undefined')
        this.$distinct = true;
    else
        this.$distinct = value || false;
    return this;
};

/**
 * @param name {string|QueryField}
 * @returns {QueryExpression}
 */
QueryExpression.prototype.where = function(name)
{
    if (name===undefined)
        return this;
    this.$where = null;
    this.privates.__prop = name.valueOf();
    return this;
};
/**
 * Initializes a delete query and sets the entity name that is going to be used in this query.
 * @param entity {string}
 * @returns {QueryExpression}
 */
QueryExpression.prototype.delete = function(entity)
{
    if (entity==null)
        return this;
    this.$delete = entity.valueOf();
    //delete other properties (if any)
    delete this.$insert;
    delete this.$select;
    delete this.$update;
    return this;
};

/**
 * Initializes an insert query and sets the object that is going to be inserted.
 * @param obj {*}
 * @returns {QueryExpression}
 */
QueryExpression.prototype.insert = function(obj)
{
    if (obj==null)
        return this;
    if (util.isArray(obj) || !Object.isObject(obj))
        throw new Error('Invalid argument type. Insert expression argument must be an object.');
    this.$insert = { table1: obj };
    //delete other properties (if any)
    delete this.$delete;
    delete this.$select;
    delete this.$update;
    return this;
};


QueryExpression.prototype.into = function(entity) {
    if (entity==null)
        return this;
    if (this.$insert==null)
        return this;
    var prop = Object.key(this.$insert);
    if (prop==null)
        return this;
    if (prop==entity)
        return this;
    var value = this.$insert[prop];
    if (value==null)
        return this;
    this.$insert[entity] = value;
    delete this.$insert[prop];
    return this;
};

/**
 * Initializes an update query and sets the entity name that is going to be used in this query.
 * @param {string} entity
 * @returns {QueryExpression}
 */
QueryExpression.prototype.update = function(entity)
{
    if (entity==null)
        return this;
    if (typeof entity !== 'string')
        throw new Error('Invalid argument type. Update entity argument must be a string.');
    this.$update = {};
    this.$update[entity] = {};
    //delete other properties (if any)
    delete this.$delete;
    delete this.$select;
    delete this.$insert;
    return this;
};
/**
 * Sets the object that is going to be updated through an update expression.
 * @param {*} obj
 * @returns {QueryExpression}
 */
QueryExpression.prototype.set = function(obj)
{
    if (obj==null)
        return this;
    if (util.isArray(obj) || !Object.isObject(obj))
        throw new Error('Invalid argument type. Update expression argument must be an object.');
    //get entity name (by property)
    var prop = Object.key(this.$update);
    if (prop==null)
        throw new Error('Invalid operation. Update entity cannot be empty at this context.');
    //set object to update
    this.$update[prop] = obj;
    return this;
};

/**
 *
 * @param props {Array}
 * @returns {QueryExpression}
 */
QueryExpression.prototype.select = function(props)
{
    if (props==null)
        return this;
    var fields = [];
    if (!util.isArray(props))
    {
        if (typeof props == 'string')
            fields.push(props);
        else
            throw new Error('Invalid argument type. Select argument must be an array.');
    }
    else
        fields = props;
    //if entity is already defined
    if (this.privates.__entity)
    {
        //initialize $select property
        this.$select = {};
        //and set array of fields
        this.$select[this.privates.__entity] = fields;
    }
    else
    {
        //otherwise store array of fields in temporary property and wait
        this.privates.__fields = fields;
    }
    //delete other properties (if any)
    delete this.$delete;
    delete this.$insert;
    delete this.$update;
    return this;
};
/**
 * Sets the entity of a select query expression
 * @param entity {string|*} A string that represents the entity name
 * @returns {QueryExpression}
 */
QueryExpression.prototype.from = function(entity) {

    if (entity==null)
        return this;
    if (this.privates.__fields) {
        //initialize $select property
        this.$select = {};
        //and set array of fields
        this.$select[entity.valueOf()] = this.privates.__fields;
    }
    else {
        this.privates.__entity = entity.valueOf();
    }
    //delete other properties (if any)
    delete this.$delete;
    delete this.$insert;
    delete this.$update;
    //and return this object
    return this;
};

/**
 * Initializes a join expression with the specified entity
 * @param {*} entity
 * @param {Array=} props
 * @param {String=} alias
 * @returns {QueryExpression}
 */
QueryExpression.prototype.join = function(entity, props, alias) {

    if (entity==null)
        return this;
    if (this.$select==null)
        throw new Error('Query entity cannot be empty when adding a join entity.');
    var obj = {};
    if (entity instanceof QueryEntity) {
        //do nothing (clone object)
        obj = entity;
    }
    else if (entity instanceof QueryExpression) {
        //do nothing (clone object)
        obj = entity;
    }
    else {
        obj[entity] = props || [];
        if (typeof alias === 'string')
            obj.$as=alias;
    }
    this.privates.__expand =  { $entity: obj };
    //and return this object
    return this;
};
/**
 * Sets the join expression of the last join entity
 * @param obj {Array|*}
 * @returns {QueryExpression}
 */
QueryExpression.prototype.with = function(obj) {

    if (obj==null)
        return this;
    if (this.privates.__expand==null)
        throw new Error('Join entity cannot be empty when adding a join expression. Use QueryExpression.join(entity, props) before.');
    if (obj instanceof QueryExpression)
    {
        /**
         * @type {QueryExpression}
         */
        var expr = obj,
            where = null;
        if (expr.$where)
            where = expr.$prepared ? { $and: [expr.$prepared, expr.$where] } : expr.$where;
        else if (expr.$prepared)
            where = expr.$prepared;
        this.privates.__expand.$with = where;
    }
    else {
        this.privates.__expand.$with = obj;
    }
    if (this.$expand==null) {
        this.$expand = this.privates.__expand;
    }
    else {
        if (util.isArray(this.$expand)) {
            this.$expand.push(this.privates.__expand);
        }
        else {
            //get expand object
            var expand = this.$expand;
            //and create array of expand objects
            this.$expand = [expand, this.privates.__expand];
        }
    }
    //destroy temp object
    this.privates.__expand = null;
    //and return QueryExpression
    return this;
};

/**
 * Applies an ascending ordering to a query expression
 * @param name {string|Array}
 * @returns {QueryExpression}
 */
QueryExpression.prototype.orderBy = function(name) {

    if (name==null)
        return this;
    if (this.$order==null)
        this.$order = [];
    this.$order.push({ $asc: name });
    return this;
}
/**
 * Applies a descending ordering to a query expression
 * @param name
 * @returns {QueryExpression}
 */
QueryExpression.prototype.orderByDescending = function(name) {

    if (name==null)
        return this;
    if (this.$order==null)
        this.$order = [];
    this.$order.push({ $desc: name });
    return this;
};

/**
 * Performs a subsequent ordering in a query expression
 * @param name {string|Array}
 * @returns {QueryExpression}
 */
QueryExpression.prototype.thenBy = function(name) {

    if (name==null)
        return this;
    if (this.$order==null)
    //throw exception (?)
        return this;
    this.$order.push({ $asc: name });
    return this;
};

/**
 * Performs a subsequent ordering in a query expression
 * @param name {string|Array}
 * @returns {QueryExpression}
 */
QueryExpression.prototype.thenByDescending = function(name) {

    if (name==null)
        return this;
    if (this.$order==null)
    //throw exception (?)
        return this;
    this.$order.push({ $desc: name });
    return this;
}
/**
 *
 * @param name {string|Array}
 * @returns {QueryExpression}
 */
QueryExpression.prototype.groupBy = function(name) {

    if (name==null)
        return this;
    if (this.$group==null)
        this.$group = [];
    var self = this;
    if (util.isArray(name)) {
        name.forEach(function (x) {
            if (x)
                self.$group.push(x);
        });
    }
    else
        this.$group.push(name);
    return this;
}
/**
 * @param expr
 * @private
 */
QueryExpression.prototype.__append = function(expr) {
    if (!expr)
        return;
    if (!this.$where) {
        this.$where = expr;
    }
    else {
        var op = this.privates.__expr;
        if (op) {
            //get current operator
            var keys = Object.keys(this.$where);
            if (keys[0]==op) {
                this.$where[op].push(expr);
            }
            else {
                var newFilter = {};
                newFilter[op] = [this.$where, expr];
                this.$where = newFilter;
            }
        }
    }
    delete this.privates.__prop;
    delete this.privates.__expr;
};
/**
 * @param name {string}
 * @returns {QueryExpression}
 */
QueryExpression.prototype.or = function(name)
{
    if (name===undefined)
        return this;
    this.privates.__prop = name.valueOf();
    this.privates.__expr = '$or';
    return this;
};
/**
 * @param name {string|QueryField}
 * @returns {QueryExpression}
 */
QueryExpression.prototype.and = function(name)
{
    if (name===undefined)
        return this;
    this.privates.__prop = name.valueOf();
    this.privates.__expr = '$and';
    return this;
};
/**
 * @param value {*}
 * @returns {QueryExpression}
 */
QueryExpression.prototype.equal = function(value)
{
    if (this.privates.__prop) {
        var expr = {};
        expr[this.privates.__prop] = value;
        this.__append(expr);
    }
    return this;
};

QueryExpression.prototype.eq = QueryExpression.prototype.equal;
/**
 * @param value {*}
 * @returns {QueryExpression}
 */
QueryExpression.prototype.notEqual = function(value)
{
    if (this.privates.__prop) {
        var expr = {};
        expr[this.privates.__prop] = { $ne : value };
        this.__append(expr);
    }
    return this;
};

/**
 *
 * @param values {Array}
 * @returns {QueryExpression}
 */
QueryExpression.prototype.in = function(values)
{
    if (this.privates.__prop) {
        var expr = {};
        expr[this.privates.__prop] = { $in : values };
        this.__append(expr);
    }
    return this;
};
/**
 * @param {*} value The value to be compared
 * @param {Number} result The result of modulo expression
 * @returns {QueryExpression}
 */
QueryExpression.prototype.mod = function(value, result)
{
    if (this.privates.__prop) {
        var expr = {};
        expr[this.privates.__prop] = { $mod : [ value, result] };
        this.__append(expr);
    }
    return this;
};

/**
 * @param {*} value The value to be compared
 * @param {Number} result The result of a bitwise and expression
 * @returns {QueryExpression}
 */
QueryExpression.prototype.bit = function(value, result)
{
    if (this.privates.__prop) {
        var expr = {};
        if (typeof result === 'undefined' || result == null)
            result = value;
        expr[this.privates.__prop] = { $bit : [ value, result] };
        this.__append(expr);
    }
    return this;
};


QueryExpression.prototype.ne = QueryExpression.prototype.notEqual;
/**
 * @param value {*}
 * @returns {QueryExpression}
 */
QueryExpression.prototype.greaterThan = function(value)
{
    if (this.privates.__prop) {
        var expr = {};
        expr[this.privates.__prop] = { $gt : value };
        this.__append(expr);
    }
    return this;
};

/**
 * @param value {*}
 * @returns {QueryExpression}
 */
QueryExpression.prototype.startsWith = function(value)
{
    if (this.privates.__prop) {
        var expr = {};
        expr[this.privates.__prop] = { $startswith : [ value, true] };
        this.__append(expr);
    }
    return this;
};

/**
 * @param value {*}
 * @returns {QueryExpression}
 */
QueryExpression.prototype.endsWith = function(value)
{
    if (this.privates.__prop) {
        var expr = {};
        expr[this.privates.__prop] = { $endswith : [value, true] };
        this.__append(expr);
    }
    return this;
};

/**
 * @param value {*}
 * @returns {QueryExpression}
 */
QueryExpression.prototype.contains = function(value)
{
    if (this.privates.__prop) {
        var expr = {};
        expr[this.privates.__prop] = { $contains : [ value, true] };
        this.__append(expr);
    }
    return this;
};

QueryExpression.prototype.gt = QueryExpression.prototype.greaterThan;
/**
 * @param value {*}
 * @returns {QueryExpression}
 */
QueryExpression.prototype.lowerThan = function(value)
{
    if (this.privates.__prop) {
        var expr = {};
        expr[this.privates.__prop] = { $lt : value };
        this.__append(expr);
    }
    return this;
};
/**
 * @param value {*}
 * @returns {QueryExpression}
 */
QueryExpression.prototype.lt = QueryExpression.prototype.lowerThan;
/**
 * @param value {*}
 * @returns {QueryExpression}
 */
QueryExpression.prototype.lowerOrEqual = function(value)
{
    if (this.privates.__prop) {
        var expr = {};
        expr[this.privates.__prop] = { $lte : value };
        this.__append(expr);
    }
    return this;
};

QueryExpression.prototype.lte = QueryExpression.prototype.lowerOrEqual;
/**
 * @param value {*}
 * @returns {QueryExpression}
 */
QueryExpression.prototype.greaterOrEqual = function(value)
{
    if (this.privates.__prop) {
        var expr = {};
        expr[this.privates.__prop] = { $gte : value };
        this.__append(expr);
    }
    return this;
};
/**
 * Skips the specified number of objects during select.
 * @param {Number} n
 * @returns {QueryExpression}
 */
QueryExpression.prototype.skip = function(n)
{
    this.$skip = n;
    return this;
};

/**
 * Takes the specified number of objects during select.
 * @param {Number} n
 * @returns {QueryExpression}
 */
QueryExpression.prototype.take = function(n)
{
    this.$take = n;
    return this;
};
/**
 * @param value {*}
 * @returns {QueryExpression}
 */
QueryExpression.prototype.gte = QueryExpression.prototype.greaterOrEqual;
/**
 * @private
 * @param {number|*} number
 * @param {number} length
 * @returns {*}
 */
QueryExpression.zeroPad = function(number, length) {
    number = number || 0;
    var res = number.toString();
    while (res.length < length) {
        res = '0' + res;
    }
    return res;
}

QueryExpression.escape = function(val)
{
    if (val === undefined || val === null) {
        return 'null';
    }

    switch (typeof val) {
        case 'boolean': return (val) ? 'true' : 'false';
        case 'number': return val+'';
    }

    if (val instanceof Date) {
        var dt = new Date(val);
        var year   = dt.getFullYear();
        var month  = QueryExpression.zeroPad(dt.getMonth() + 1, 2);
        var day    = QueryExpression.zeroPad(dt.getDate(), 2);
        var hour   = QueryExpression.zeroPad(dt.getHours(), 2);
        var minute = QueryExpression.zeroPad(dt.getMinutes(), 2);
        var second = QueryExpression.zeroPad(dt.getSeconds(), 2);
        var millisecond = QueryExpression.zeroPad(dt.getMilliseconds(), 3);
        val = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second + '.' + millisecond;
    }

    if (typeof val === 'object' && Object.prototype.toString.call(val) === '[object Array]') {
        var values = []
        val.forEach(function(x) {
            QueryExpression.escape(x);
        });
        return values.join(',');
    }

    if (typeof val === 'object') {
        if (val.hasOwnProperty('$name'))
        //return field identifier
            return val['$name'];
        else
            return this.escape(val.valueOf())
    }

    val = val.replace(/[\0\n\r\b\t\\\'\"\x1a]/g, function(s) {
        switch(s) {
            case "\0": return "\\0";
            case "\n": return "\\n";
            case "\r": return "\\r";
            case "\b": return "\\b";
            case "\t": return "\\t";
            case "\x1a": return "\\Z";
            default: return "\\"+s;
        }
    });
    return "'"+val+"'";
}

/**
 * @class QueryEntity
 * @param {string|*} obj
 * @constructor
 */
function QueryEntity(obj) {
    var entity = obj || 'Table';
    this[entity] = [];
    Object.defineProperty(this, 'name', {
        get: function() {
            return entity;
        }, configurable:false, enumerable:false
    });
    var self = this;
    Object.defineProperty(this, 'props', {
        get: function() {
            return self[entity];
        }, configurable:false, enumerable:false
    });
}

QueryEntity.prototype.select = function(name) {
    var f = new QueryField(name);
    return f.from(this.$as ? this.$as : this.name);
}

QueryEntity.prototype.as = function(alias) {
    this.$as = alias;
    return this;
}

/**
 * @class QueryField
 * @param obj {string=}
 * @constructor
 */
function QueryField(obj) {
    if (typeof  obj === 'string') {
        this.$name = obj;
    }
    else if (typeof obj === 'object' && obj!=null) {
        util._extend(this, obj);
    }
}
/**
 * @param name {string} The name of the field that is going to be selected
 * @returns {QueryField}
 */
QueryField.prototype.select = function(name)
{
    if (typeof name != 'string')
        throw  new Error('Invalid argument. Expected string');
    //clear object
    Object.clear(this);
    // field as string e.g. { $name: 'price' }
    this.$name = name;
    return this;
};

QueryField.fieldNameExpression = /^[A-Za-z_0-9]+$/;

/**
 * Sets the entity of the current field
 * @param entity {string}
 * @returns {QueryField}
 */
QueryField.prototype.from = function(entity)
{
    if (typeof entity !== 'string')
        throw  new Error('Invalid argument. Expected string');
    //get property
    if (!Object.isNullOrUndefined(this.$name))
    {
        if (typeof this.$name === 'string') {
            //check if an entity is already defined
            var name = this.$name;
            if (QueryField.fieldNameExpression.test(name))
            //if not append entity name
                this.$name = entity.concat('.', name)
            else
            //split field name and add entity
                this.$name = entity.concat('.', name.split('.')[1]);
        }
        else
            throw new Error("Invalid field definition.");
    }
    else {
        //get default property
        var alias = Object.key(this);
        if (Object.isNullOrUndefined(alias))
            throw new Error("Field definition cannot be empty at this context");
        //get field expression
        var expr = this[alias];
        //get field name
        var aggregate = Object.key(expr);
        if (Object.isNullOrUndefined(aggregate))
            throw new Error("Field expression cannot be empty at this context");
        var name = expr[aggregate];
        if (QueryField.fieldNameExpression.test(name))
        //if not append entity name
            expr[aggregate] = entity.concat('.', name)
        else
        //split field name and add entity
            expr[aggregate] = entity.concat('.', name.split('.')[1]);
    }
    return this;
};


QueryField.prototype.count = function(name) {
    if (typeof name != 'string')
        throw  new Error('Invalid argument. Expected string');
    //clear object
    Object.clear(this);
    // field as aggregate function e.g. { price: { $count: 'price' } }
    this[name] = { $count: name };
    return this;
};
/**
 * @param {...string} [strings]
 * @return {string}
 */
QueryField.prototype.concat = function(strings) {
    return this.$name.concat(strings)
};

QueryField.prototype.sum = function(name) {
    if (typeof name != 'string')
        throw  new Error('Invalid argument. Expected string');
    //clear object
    Object.clear(this);
    // field as aggregate function e.g. { price: { $sum: 'price' } }
    this[name] = { $sum: name };
    return this;
};

QueryField.prototype.min = function(name) {
    if (typeof name != 'string')
        throw  new Error('Invalid argument. Expected string');
    //clear object
    Object.clear(this);
    // field as aggregate function e.g. { price: { $min: 'price' } }
    this[name] = { $min: name };
    return this;
};

QueryField.prototype.average = function(name) {
    if (typeof name != 'string')
        throw  new Error('Invalid argument. Expected string');
    //clear object
    Object.clear(this);
    // field as aggregate function e.g. { price: { $avg: 'price' } }
    this[name] = { $avg: name };
    return this;
};

QueryField.prototype.max = function(name) {
    if (typeof name != 'string')
        throw  new Error('Invalid argument. Expected string');
    //clear object
    Object.clear(this);
    // field as aggregate function e.g. { price: { $max: 'price' } }
    this[name] = { $max: name };
    return this;
};

/**
 *
 * @param {String} alias
 * @returns {QueryField|String}
 */
QueryField.prototype.as = function(alias) {
    if (typeof alias === 'undefined')
    {
        if (typeof this.$name !== 'undefined')
            return null;
        var keys = Object.keys(this);
        if (keys.length==0)
            return null;
        else
            return keys[0];
    }
    if (typeof alias != 'string')
        throw  new Error('Invalid argument. Expected string');
    //get first property
    var prop = Object.key(this);
    if (prop == null)
        throw  new Error('Invalid object state. Field is not selected.');
    var value = this[prop];
    if (prop!=alias) {
        this[alias] = value;
        delete this[prop];
    }
    return this;
};


QueryField.prototype.name = function() {
    var name = null;
    if (typeof this.$name === 'string') {
        name = this.$name
    }
    else {
        var prop = Object.key(this);
        if (prop) {
            name = this[prop];
        }
    }
    if (typeof name === 'string') {
        //check if an entity is already defined
        var re = new RegExp(QueryField.fieldNameExpression.source);
        if (re.test(name))
            return name;
        else
            return name.split('.')[1];
    }
    return null;
};

QueryField.prototype.valueOf = function() {
    return this.$name;
};
/**
 * @param name {string}
 * @returns {QueryField}
 */
QueryField.select = function(name) {
    return new QueryField(name);
};
/**
 * @param name {string}
 * @returns {QueryField}
 */
QueryField.count = function(name) {
    var f = new QueryField();
    return f.count(name);
};

/**
 * @param name {string}
 * @returns {QueryField}
 */
QueryField.min = function(name) {
    var f = new QueryField();
    return f.min(name);
};
/**
 * @param name {string}
 * @returns {QueryField}
 */
QueryField.max = function(name) {
    var f = new QueryField();
    return f.max(name);
};
/**
 * @param name {string}
 * @returns {QueryField}
 */
QueryField.average = function(name) {
    var f = new QueryField();
    return f.average(name);
};
/**
 * @param name {string}
 * @returns {QueryField}
 */
QueryField.sum = function(name) {
    var f = new QueryField();
    return f.sum(name);
};
/**
 * @class OpenDataQuery
 * @constructor
 */
function OpenDataQuery() {
    /**
     * Gets or sets a string that represents the target model
     * @type {String}
     */
    this.$model = undefined;
    /**
     * @type {String}
     */
    this.$filter = undefined;
    /**
     * @type {number}
     */
    this.$top = undefined;
    /**
     * @type {number}
     */
    this.$skip = undefined;
    /**
     * @private
     */
    this.privates = function() {};
}
/**
 * @private
 * @returns OpenDataQuery
 */
OpenDataQuery.prototype.append = function() {

    var self = this;
    if (self.privates.left) {
        var expr = null;

        if (self.privates.op=='in') {
            if (util.isArray(self.privates.right)) {
                //expand values
                var exprs = [];
                self.privates.right.forEach(function(x) {
                    exprs.push(self.privates.left + ' eq ' + QueryExpression.escape(x));
                });
                if (exprs.length>0)
                    expr = '(' + exprs.join(' or ') + ')';
            }
        }
        else if (self.privates.op=='nin') {
            if (util.isArray(self.privates.right)) {
                //expand values
                var exprs = [];
                self.privates.right.forEach(function(x) {
                    exprs.push(self.privates.left + ' ne ' + QueryExpression.escape(x));
                });
                if (exprs.length>0)
                    expr = '(' + exprs.join(' and ') + ')';
            }
        }
        else
            expr = self.privates.left + ' ' + self.privates.op + ' ' + QueryExpression.escape(self.privates.right);
        if (expr) {
            if (typeof self.$filter === 'undefined' || self.$filter == null)
                self.$filter = expr;
            else {
                self.privates.lop = self.privates.lop || 'and';
                self.privates._lop = self.privates._lop || self.privates.lop;
                if (self.privates._lop == self.privates.lop)
                    self.$filter = self.$filter + ' ' + self.privates.lop + ' ' + expr;
                else
                    self.$filter = '(' + self.$filter + ') ' + self.privates.lop + ' ' + expr;
                self.privates._lop = self.privates.lop;
            }
        }
    }
    delete self.privates.lop;delete self.privates.left; delete self.privates.op; delete self.privates.right;
    return this;
};

/**
 * @param {Array|String} attr
 * @returns OpenDataQuery
 */
OpenDataQuery.prototype.select = function(attr) {
    if (util.isArray(attr)) {
        this.$select = attr.join(',');
    }
    else
        this.$select = attr;
}

/**
 * @param {number} val
 * @returns OpenDataQuery
 */
OpenDataQuery.prototype.take = function(val) {
    this.$top = val;
    return this;
}
/**
 * @param {number} val
 * @returns OpenDataQuery
 */
OpenDataQuery.prototype.skip = function(val) {
    this.$skip = val;
    return this;
}

/**
 * @param {String} name
 * @returns OpenDataQuery
 */
OpenDataQuery.prototype.orderBy = function(name) {
    if (typeof name !=='undefined' || name!=null)
        this.$orderby = name.toString();
    return this;
}

/**
 * @param {String} name
 * @returns OpenDataQuery
 */
OpenDataQuery.prototype.orderByDescending = function(name) {
    if (typeof name !=='undefined' || name!=null)
        this.$orderby = name.toString() + ' desc';
    return this;
}

/**
 * @param {String} name
 * @returns OpenDataQuery
 */
OpenDataQuery.prototype.thenBy = function(name) {
    if (typeof name !=='undefined' || name!=null) {
            this.$orderby += (this.$orderby ? ',' + name.toString() : name.toString());
    }
}

/**
 * @param {String} name
 * @returns OpenDataQuery
 */
OpenDataQuery.prototype.thenByDescending = function(name) {
    if (typeof name !=='undefined' || name!=null) {
        this.$orderby += (this.$orderby ? ',' + name.toString() : name.toString()) + ' desc';
    }
}

/**
 * @param {String} name
 * @returns OpenDataQuery
 */
OpenDataQuery.prototype.where = function(name) {
    this.privates.left = name;
    return this;
}

/**
 * @param {String=} name
 * @returns OpenDataQuery
 */
OpenDataQuery.prototype.and = function(name) {
    this.privates.lop = 'and';
    if (typeof name !== 'undefined')
        this.privates.left = name;
    return this;
}

/**
 * @param {String=} name
 * @returns OpenDataQuery
 */
OpenDataQuery.prototype.or = function(name) {
    this.privates.lop = 'or';
    if (typeof name !== 'undefined')
        this.privates.left = name;
    return this;
}

/**
 * @param {*} value
 * @returns OpenDataQuery
 */
OpenDataQuery.prototype.equal = function(value) {
    this.privates.op = 'eq';this.privates.right = value; return this.append();
}

/**
 * @param {String} name
 * @returns OpenDataQuery
 */
OpenDataQuery.prototype.indexOf = function(name) {
    this.privates.left = 'indexof(' + name + ')';
    return this;
}

/**
 * @param {String} name
 * @returns OpenDataQuery
 */
OpenDataQuery.prototype.andIndexOf = function(name) {
    this.privates.lop = 'and';
    return this.indexOf(name);
}

/**
 * @param {String} name
 * @returns OpenDataQuery
 */
OpenDataQuery.prototype.orIndexOf = function(name) {
    this.privates.lop = 'or';
    return this.indexOf(name);
}

/**
 * @param {*} name
 * @param {*} s
 * @returns OpenDataQuery
 */
OpenDataQuery.prototype.endsWith = function(name, s) {
    this.privates.left = util.format('endswith(%s,%s)',name,QueryExpression.escape(s));
    return this;
}

/**
 * @param {*} name
 * @param {*} s
 * @returns OpenDataQuery
 */
OpenDataQuery.prototype.startsWith = function(name, s) {
    this.privates.left = util.format('startswith(%s,%s)',name,QueryExpression.escape(s));
    return this;
}

/**
 * @param {*} name
 * @param {*} s
 * @returns OpenDataQuery
 */
OpenDataQuery.prototype.substringOf = function(name, s) {
    this.privates.left = util.format('substringof(%s,%s)',name,QueryExpression.escape(s));
    return this;
}

/**
 * @param {*} name
 * @param {number} pos
 * @param {number} length
 * @returns OpenDataQuery
 */
OpenDataQuery.prototype.substring = function(name, pos, length) {
    this.privates.left = util.format('substring(%s,%s,%s)',name,pos,length);
    return this;
}

/**
 * @param {*} name
 * @returns OpenDataQuery
 */
OpenDataQuery.prototype.length = function(name) {
    this.privates.left = util.format('length(%s)',name);
    return this;
}

/**
 * @param {*} name
 * @returns OpenDataQuery
 */
OpenDataQuery.prototype.toLower = function(name) {
    this.privates.left = util.format('tolower(%s)',name);
    return this;
}

/**
 * @param {*} name
 * @returns OpenDataQuery
 */
OpenDataQuery.prototype.toUpper = function(name) {
    this.privates.left = util.format('toupper(%s)',name);
    return this;
}

/**
 * @param {*} name
 * @returns OpenDataQuery
 */
OpenDataQuery.prototype.trim = function(name) {
    this.privates.left = util.format('trim(%s)',name);
    return this;
}

/**
 * @param {*} s0
 * @param {*} s1
 * @param {*=} s2
 * @param {*=} s3
 * @param {*=} s4
 * @returns OpenDataQuery
 */
OpenDataQuery.prototype.concat = function(s0, s1, s2, s3, s4) {
    this.privates.left = 'concat(' + QueryExpression.escape(s0) + ',' + QueryExpression.escape(s1);
    if (typeof s2 !== 'undefined')
        this.privates.left +=',' + QueryExpression.escape(s2);
    if (typeof s3 !== 'undefined')
        this.privates.left +=',' + QueryExpression.escape(s3)
    if (typeof s4 !== 'undefined')
        this.privates.left +=',' + QueryExpression.escape(s4)
    this.privates.left +=')';
    return this;
}

OpenDataQuery.prototype.field = function(name) {
    return { "$name":name }
}

/**
 * @param {String} name
 * @returns OpenDataQuery
 */
OpenDataQuery.prototype.day = function(name) {
    this.privates.left = util.format('day(%s)',name);
    return this;
}

/**
 * @param {String} name
 * @returns OpenDataQuery
 */
OpenDataQuery.prototype.day = function(name) {
    this.privates.left = util.format('hour(%s)',name);
    return this;
}

/**
 * @param {String} name
 * @returns OpenDataQuery
 */
OpenDataQuery.prototype.minute = function(name) {
    this.privates.left = util.format('minute(%s)',name);
    return this;
}

/**
 * @param {String} name
 * @returns OpenDataQuery
 */
OpenDataQuery.prototype.month = function(name) {
    this.privates.left = util.format('month(%s)',name);
    return this;
}


/**
 * @param {String} name
 * @returns OpenDataQuery
 */
OpenDataQuery.prototype.second = function(name) {
    this.privates.left = util.format('second(%s)',name);
    return this;
}


/**
 * @param {String} name
 * @returns OpenDataQuery
 */
OpenDataQuery.prototype.year = function(name) {
    this.privates.left = util.format('year(%s)',name);
    return this;
}

/**
 * @param {String} name
 * @returns OpenDataQuery
 */
OpenDataQuery.prototype.round = function(name) {
    this.privates.left = util.format('round(%s)',name);
    return this;
}

/**
 * @param {String} name
 * @returns OpenDataQuery
 */
OpenDataQuery.prototype.floor = function(name) {
    this.privates.left = util.format('floor(%s)',name);
    return this;
}

/**
 * @param {String} name
 * @returns OpenDataQuery
 */
OpenDataQuery.prototype.ceiling = function(name) {
    this.privates.left = util.ceiling('floor(%s)',name);
    return this;
}

/**
 * @param {*} value
 * @returns OpenDataQuery
 */
OpenDataQuery.prototype.notEqual = function(value) {
    this.privates.op = 'ne';this.privates.right = value; return this.append();
}


/**
 * @param {*} value
 * @returns OpenDataQuery
 */
OpenDataQuery.prototype.greaterThan = function(value) {
    this.privates.op = 'gt';this.privates.right = value; return this.append();
}

/**
 * @param {*} value
 * @returns OpenDataQuery
 */
OpenDataQuery.prototype.greaterOrEqual = function(value) {
    this.privates.op = 'ge';this.privates.right = value; return this.append();
}

/**
 * @param {*} value
 * @returns OpenDataQuery
 */
OpenDataQuery.prototype.lowerThan = function(value) {
    this.privates.op = 'lt';this.privates.right = value; return this.append();
}

/**
 * @param {*} value
 * @returns OpenDataQuery
 */
OpenDataQuery.prototype.lowerOrEqual = function(value) {
    this.privates.op = 'le';this.privates.right = value; return this.append();
}

/**
 * @param {Array} values
 * @returns OpenDataQuery
 */
OpenDataQuery.prototype.in = function(values) {
    this.privates.op = 'in';this.privates.right = values; return this.append();
}

/**
 * @param {Array} values
 * @returns OpenDataQuery
 */
OpenDataQuery.prototype.notIn = function(values) {
    this.privates.op = 'nin';this.privates.right = values; return this.append();
}

if (typeof exports !== 'undefined') {
    /**
     * @class QueryExpression
     * @constructor
     */
    module.exports.QueryExpression = QueryExpression;
    /**
     * @class QueryField
     * @constructor
     */
    module.exports.QueryField = QueryField;
    /**
     * @class QueryEntity
     * @constructor
     */
    module.exports.QueryEntity = QueryEntity;
    /**
     * @class OpenDataQuery
     * @constructor
     */
    module.exports.OpenDataQuery = OpenDataQuery;
}

