/**
 * Created by kbarbounakis on 16/7/2014.
 */
var mysql = require('mysql'),
    util = require('util'),
    array = require('most-array'),
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
    QueryEntity = query.QueryEntity;

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

if (typeof Object.isObject !== 'function') {
    /**
     * Gets a boolean that indicates whether the given parameter is object
     * @param {*} obj
     * @returns {boolean}
     */
    Object.isObject = function(obj) {
        return (typeof obj === 'object') && (obj!=null);
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

/**
 * Initializes an SQL formatter class.
 * @class SqlFormatter
 * @constructor
 */
function SqlFormatter() {
    //
    this.provider = null;
}
/**
 * Formats a JSON comparison object to the equivalent sql expression eg. { $gt: 100} as >100, or { $in:[5, 8] } as IN {5,8} etc
 * @param {*} comparison
 * @returns {string}
 */
SqlFormatter.prototype.formatComparison = function(comparison)
{
    if (comparison==null || typeof comparison=== 'undefined')
        return '(%s IS NULL)';
    if (typeof comparison === 'object')
    {
        if (comparison instanceof Date) {
            return '(%s'.concat(util.format('=%s)',this.escape(comparison)));
        }
        var compares = [];
        for(var key in comparison) {
            if (comparison.hasOwnProperty(key))
                compares.push(key);
        }
        if (compares.length==0)
            return '(%s IS NULL)';
        else {
            var arr = [], op = '=';
            for (var i = 0; i < compares.length; i++) {
                var key = compares[i];
                if (QueryExpression.ComparisonOperators[key]===undefined)
                    throw new Error(util.format('Unknown operator %s.', key));
                var escapedValue = this.escape(comparison[key]);
                switch (key) {
                    case '$eq': arr.push('(%s'.concat('=',escapedValue,')'));break;
                    case '$lt': arr.push('(%s'.concat('<',escapedValue,')'));break;
                    case '$lte': arr.push('(%s'.concat('<=',escapedValue,')'));break;
                    case '$gt': arr.push('(%s'.concat('>',escapedValue,')'));break;
                    case '$gte': arr.push('(%s'.concat('>',escapedValue,')'));break;
                    case '$ne': arr.push('(NOT %s'.concat('=',escapedValue,')'));break;
                    case '$in': arr.push('(%s'.concat('(',escapedValue,'))'));break;
                    case '$nin':arr.push('(NOT %s'.concat('(',escapedValue,'))'));break;
                }
            }
            //join expression
            if (arr.length==1)
                return arr[0];
            else if (arr.length>1) {
                return '('.concat(arr.join(' AND '),')');
            }
            else
                return '(%s IS NULL)';
        }
    }
    else
    {
        return '(%s'.concat(util.format('=%s)',this.escape(comparison)));
    }
};
/**
 * Escapes an object or a value and returns the equivalen sql value.
 * @param {*} value
 */
SqlFormatter.prototype.escape = function(value,unquoted)
{
    if (value==null || typeof value==='undefined')
        return mysql.escape(null);

    if (typeof value === 'object')
    {
        //add an exception for Date object
        if (value instanceof Date)
            return mysql.escape(value);
        if (value.hasOwnProperty('$name'))
            return value.$name;
    }
    if (unquoted)
        return value.valueOf();
    else
        return mysql.escape(value);
}

SqlFormatter.prototype.formatWhere = function(where)
{
    var self = this;

    //get expression (the first property of the object)
    var keys = Object.keys(where), property = keys[0];
    if (typeof property === 'undefined')
        return '';
    //get property value
    var propertyValue = where[property];
    switch (property) {
        case '$and':
        case '$or':
            var separator = property=='$or' ? ' OR ' : ' AND ';
            //property value must be an array
            if (!util.isArray(propertyValue))
                throw new Error('Invalid query argument. A logical expression must contain one or more comparison expressions.');
            if (propertyValue.length==0)
                return '';
            return '(' + array(propertyValue).select(function(x) {
                return self.formatWhere(x);
            }).toArray().join(separator) + ')';
            break;
        default:
            var comparison = propertyValue;
            var op =  null, sql = null;
            if (comparison instanceof QueryField) {
                op = '$eq';
                comparison = {$eq:propertyValue};
            }
            else if (typeof comparison === 'object' && comparison != null) {
                //get comparison operator
                op = Object.keys(comparison)[0];
            }
            else {
                //set default comparison operator to equal
                op = '$eq';
                comparison = {$eq:propertyValue};
            }
            switch (op) {
                case '$eq':
                    if (typeof comparison.$eq === 'undefined' || comparison.$eq==null)
                        return util.format('(%s IS NULL)', property);
                    return util.format('(%s=%s)', property, self.escape(comparison.$eq));
                case '$gt':
                    return util.format('(%s>%s)', property, self.escape(comparison.$gt));
                case '$gte':
                    return util.format('(%s>=%s)', property, self.escape(comparison.$gte));
                case '$lt':
                    return util.format('(%s<%s)', property, self.escape(comparison.$lt));
                case '$lte':
                    return util.format('(%s<=%s)', property, self.escape(comparison.$lte));
                case '$ne':
                    if (typeof comparison.$ne === 'undefined' || comparison.$eq==null)
                        return util.format('(NOT %s IS NULL)', property);
                    if (comparison!=null)
                        return util.format('(NOT %s=%s)', property, self.escape(comparison.$ne));
                    else
                        return util.format('(NOT %s IS NULL)', property);
                case '$in':
                    if (util.isArray(comparison.$in)) {
                        if (comparison.$in.length==0)
                            return util.format('(%s IN (NULL))', property);
                        sql = '('.concat(property,' IN (',array(comparison.$in).select(function (x) {
                            return self.escape(x!=null ? x: null)
                        }).toArray().join(', '),'))');
                        return sql;
                    }
                    else if (typeof comparison.$in === 'object') {
                        //try to validate if comparison.$in is a select query expression (sub-query support)
                        var sq = util._extend(new QueryExpression(), comparison.$in);
                        if (sq.$select) {
                            //if sub query is a select expression
                            return util.format('(%s IN (%s))', property, self.format(sq));
                        }
                    }
                    //otherwise throw error
                    throw new Error('Invalid query argument. An in statement must contain one or more values.');
                case '$nin':
                    if (util.isArray(comparison.$in)) {
                        if (comparison.$in.length==0)
                            return util.format('(NOT %s IN (NULL))', property);
                        sql = '(NOT '.concat(property,' IN (',array(comparison.$in).select(function (x) {
                            return self.escape(x!=null ? x: null)
                        }).toArray().join(', '),'))');
                        return sql;
                    }
                    else if (typeof comparison.$in === 'object') {
                        //try to validate if comparison.$nin is a select query expression (sub-query support)
                        var sq = util._extend(new QueryExpression(), comparison.$in);
                        if (sq.$select) {
                            //if sub query is a select expression
                            return util.format('(NOT %s IN (%s))', property, self.format(sq));
                        }
                    }
                    //otherwise throw error
                    throw new Error('Invalid query argument. An in statement must contain one or more values.');
                default :
                    //search if current operator (arithmetic, evaluation etc) exists as a formatter function (e.g. function $add(p1,p2) { ... } )
                    //in this case the first parameter is the defined property e.g. Price
                    // and the property value contains an array of all others parameters (if any) and the comparison operator
                    // e.g. { Price: { $add: [5, { $gt:100} ]} } where we are trying to find elements that meet the following query expression: (Price+5)>100
                    // The identifier <Price> is the first parameter, the constant 5 is the second
                    var fn = this[op], p0 = property, p1 = comparison[op];
                    if (typeof fn === 'function')
                    {
                        var args = [];
                        var argn = null;
                        //push identifier
                        args.push({ $name:property });
                        if (util.isArray(p1)) {
                            //push other parameters
                            for (var j = 0; j < p1.length-1; j++) {
                                args.push(p1[j]);
                            }
                            //get comparison argument (last item of the arguments' array)
                            argn = p1[p1.length-1];
                        }
                        else {
                            //get comparison argument (equal)
                            argn = { $eq: p1.valueOf() };
                        }
                        //call formatter function
                        var f0 = fn.apply(this, args);
                        return self.formatComparison(argn).replace(/%s/g, f0.replace('$','\$'));
                    }
                    else {
                        //equal expression
                        if (typeof p1 !== 'undefined' && p1!=null)
                            return util.format('(%s=%s)', property, self.escape(p1));
                        else
                            return util.format('(%s IS NULL)', property);
                    }

            }
    }
};

/**
 * Implements startsWith(a,b) expression formatter.
 * @param p0 {*}
 * @param p1 {*}
 */
SqlFormatter.prototype.$startswith = function(p0, p1)
{
    //validate params
    if (Object.isNullOrUndefined(p0) || Object.isNullOrUndefined(p1))
        return '';
    return util.format('(%s REGEXP \'^%s\')', this.escape(p0), this.escape(p1, true));
};

/**
 * Implements endsWith(a,b) expression formatter.
 * @param p0 {*}
 * @param p1 {*}
 */
SqlFormatter.prototype.$endswith = function(p0, p1)
{
    //validate params
    if (Object.isNullOrUndefined(p0) || Object.isNullOrUndefined(p1))
        return '';
    var result = util.format('(%s REGEXP \'%s$$\')', this.escape(p0), this.escape(p1, true));
    return result;
};

/**
 * Implements length(a) expression formatter.
 * @param p0 {*}
 */
SqlFormatter.prototype.$length = function(p0)
{
    return util.format('LEN(%s)', this.escape(p0));
};

/**
 * Implements trim(a) expression formatter.
 * @param p0 {*}
 */
SqlFormatter.prototype.$trim = function(p0)
{
    return util.format('TRIM(%s)', this.escape(p0));
};


/**
 * Implements concat(a,b) expression formatter.
 * @param p0 {*}
 * @param p1 {*}
 */
SqlFormatter.prototype.$concat = function(p0, p1)
{
    return util.format('CONCAT(%s,%s)', this.escape(p0),  this.escape(p1));
};



/**
 * Implements indexOf(str,substr) expression formatter.
 * @param {String} p0 The source string
 * @param {String} p1 The string to search for
 */
SqlFormatter.prototype.$indexof = function(p0, p1)
{

    var result = util.format('LOCATE(%s,%s)', this.escape(p1), this.escape(p0));
    return result;
};

/**
 * Implements substring(str,pos) expression formatter.
 * @param {String} p0 The source string
 * @param {Number} pos The starting position
 * @param {Number=} length The length of the resulted string
 * @returns {string}
 */
SqlFormatter.prototype.$substring = function(p0, pos, length)
{
    if (length)
        return util.format('SUBSTRING(%s,%s,%s)', this.escape(p0), pos.valueOf()+1, length.valueOf());
    else
        return util.format('SUBSTRING(%s,%s)', this.escape(p0), pos.valueOf()+1);
};

/**
 * Implements lower(str) expression formatter.
 * @param {String} p0
 * @returns {string}
 */
SqlFormatter.prototype.$tolower = function(p0)
{
    return util.format('LOWER(%s)', this.escape(p0));
};

/**
 * Implements upper(str) expression formatter.
 * @param {String} p0
 * @returns {string}
 */
SqlFormatter.prototype.$toupper = function(p0)
{
    return util.format('UPPER(%s)', this.escape(p0));
};

/**
 * Implements contains(a,b) expression formatter.
 * @param p0 {*}
 * @param p1 {*}
 */
SqlFormatter.prototype.$contains = function(p0, p1)
{
    //validate params
    if (Object.isNullOrUndefined(p0) || Object.isNullOrUndefined(p1))
        return '';
    if (p1.valueOf().toString().length==0)
        return '';
    return util.format('(%s REGEXP \'%s\')', this.escape(p0), this.escape(p1, true));
};

SqlFormatter.prototype.$day = function(p0) { return util.format('DAY(%s)', this.escape(p0)); };
SqlFormatter.prototype.$month = function(p0) { return util.format('MONTH(%s)', this.escape(p0)); };
SqlFormatter.prototype.$year = function(p0) { return util.format('YEAR(%s)', this.escape(p0)); };
SqlFormatter.prototype.$hour = function(p0) { return util.format('HOUR(%s)', this.escape(p0)); };
SqlFormatter.prototype.$minute = function(p0) { return util.format('MINUTE(%s)', this.escape(p0)); };
SqlFormatter.prototype.$second = function(p0) { return util.format('SECOND(%s)', this.escape(p0)); };
SqlFormatter.prototype.$date = function(p0) {
    return util.format('DATE(%s)', this.escape(p0));
};


SqlFormatter.prototype.$floor = function(p0) { return util.format('FLOOR(%s)', this.escape(p0)); };
SqlFormatter.prototype.$ceiling = function(p0) { return util.format('CEILING(%s)', this.escape(p0)); };


/**
 * Implements length(a) expression formatter.
 * @param p0 {*}
 * @param p1 (*)
 */
SqlFormatter.prototype.$round = function(p0,p1) {
    if (Object.isNullOrUndefined(p1))
        p1 = 0;
    return util.format('ROUND(%s,%s)', this.escape(p0), this.escape(p1));
};

/**
 * Implements a + b expression formatter.
 * @param p0 {*}
 * @param p1 {*}
 */
SqlFormatter.prototype.$add = function(p0, p1)
{
    //validate params
    if (Object.isNullOrUndefined(p0) || Object.isNullOrUndefined(p1))
        return '0';
    return util.format('(%s + %s)', this.escape(p0), this.escape(p1));
};

SqlFormatter.prototype.isField = function(obj) {
    if (obj==null || typeof obj==='undefined')
        return false;
    if (typeof obj === 'object')
        if (obj.hasOwnProperty('$name'))
            return true;
    return false;
};

/**
 * Implements a - b expression formatter.
 * @param p0 {*}
 * @param p1 {*}
 */
SqlFormatter.prototype.$sub = function(p0, p1)
{
    //validate params
    if (Object.isNullOrUndefined(p0) || Object.isNullOrUndefined(p1))
        return '0';
    return util.format('(%s - %s)', this.escape(p0), this.escape(p1));
};

/**
 * Implements a * b expression formatter.
 * @param p0 {*}
 * @param p1 {*}
 */
SqlFormatter.prototype.$mul = function(p0, p1)
{
    //validate params
    if (Object.isNullOrUndefined(p0) || Object.isNullOrUndefined(p1))
        return '0';
    return util.format('(%s * %s)', this.escape(p0), this.escape(p1));
};

/**
 * Implements a mod b expression formatter.
 * @param p0 {*}
 * @param p1 {*}
 */
SqlFormatter.prototype.$mod = function(p0, p1)
{
    //validate params
    if (Object.isNullOrUndefined(p0) || Object.isNullOrUndefined(p1))
        return '0';
    return util.format('(%s % %s)', this.escape(p0), this.escape(p1));
};

/**
 * Implements [a / b] expression formatter.
 * @param p0 {*}
 * @param p1 {*}
 */
SqlFormatter.prototype.$div = function(p0, p1)
{
    //validate params
    if (Object.isNullOrUndefined(p0) || Object.isNullOrUndefined(p1))
        return '0';
    return util.format('(%s / %s)', this.escape(p0), this.escape(p1));
};

/**
 * Implements [a mod b] expression formatter.
 * @param p0 {*}
 * @param p1 {*}
 */
SqlFormatter.prototype.$mod = function(p0, p1)
{
    //validate params
    if (Object.isNullOrUndefined(p0) || Object.isNullOrUndefined(p1))
        return '0';
    return util.format('(%s % %s)', this.escape(p0), this.escape(p1));
}

/**
 * Implements [a & b] bitwise and expression formatter.
 * @param p0 {*}
 * @param p1 {*}
 */
SqlFormatter.prototype.$bit = function(p0, p1)
{
    //validate params
    if (Object.isNullOrUndefined(p0) || Object.isNullOrUndefined(p1))
        return '0';
    return util.format('(%s & %s)', this.escape(p0), this.escape(p1));
}

/**
 *
 * @param obj {QueryExpression|*}
 * @returns {string}
 */
SqlFormatter.prototype.formatSelect = function(obj)
{
    var $this = this;
    var sql = '';
    if (!Object.isObject(obj.$select))
        throw new Error('Select expression cannot be empty at this context.');
    //get entity name
    var entity = Object.key(obj.$select);
    var joins = [];
    if (obj.$expand!=null)
    {
        if (util.isArray(obj.$expand))
            joins=obj.$expand;
        else
            joins.push(obj.$expand);
    }
    //get entity fields
    var fields = obj.fields();
    //if fields is not an array
    if (!util.isArray(fields))
        throw new Error('Select expression does not contain any fields or the collection of fields is of the wrong type.');
    //add basic SELECT statement
    if (obj.$fixed) {
        sql = sql.concat('SELECT * FROM (SELECT ', array(fields).select(function(x) {
            return $this.format(x,'%f');
        }).toArray().join(', '), ') ', entity);
    }
    else {
        sql = sql.concat(obj.$distinct ? 'SELECT DISTINCT ' : 'SELECT ', array(fields).select(function(x) {
            return $this.format(x,'%f');
        }).toArray().join(', '), ' FROM ', entity);
    }


    //add join if any
    if (obj.$expand!=null)
    {
        //enumerate joins
        array(joins).each(function(x) {
            if (x.$entity instanceof QueryExpression) {
                //get on statement (the join comparison)
                sql = sql.concat(util.format(' INNER JOIN (%s)', $this.format(x.$entity)));
                //add alias
                if (x.$entity.$alias)
                    sql = sql.concat(' AS ').concat(x.$entity.$alias);
            }
            else {
                //get join table name
                var table = Object.key(x.$entity);
                //get on statement (the join comparison)
                sql = sql.concat(' INNER JOIN ').concat(table);
                //add alias
                if (x.$entity.$as)
                    sql = sql.concat(' AS ').concat(x.$entity.$as);
            }
            if (util.isArray(x.$with))
            {
                if (x.$with.length!=2)
                    throw new Error('Invalid join comparison expression.');
                //get left and right expression
                var left = x.$with[0],
                    right = x.$with[1],
                //the default left table is the query entity
                    leftTable =  entity,
                //the default right table is the join entity
                    rightTable = table
                if (typeof left === 'object') {
                    leftTable = Object.key(left);
                }
                if (typeof right === 'object') {
                    rightTable = Object.key(right);
                }
                var leftFields = left[leftTable], rightFields = right[rightTable] ;
                for (var i = 0; i < leftFields.length; i++)
                {
                    var leftExpr = null, rightExpr = null;
                    if (typeof leftFields[i] == 'object')
                        leftExpr = leftFields[i];
                    else {
                        leftExpr = {};
                        leftExpr[leftTable] = leftFields[i];
                    }
                    if (typeof rightFields[i] == 'object')
                        rightExpr = rightFields[i];
                    else {
                        rightExpr = {};
                        rightExpr[rightTable] = rightFields[i];
                    }
                    sql = sql.concat((i==0) ? ' ON ' : ' AND ', $this.formatField(leftExpr), '=',  $this.formatField(rightExpr));
                }
            }
            else {
                sql = sql.concat(' ON ', $this.formatWhere(x.$with));
            }
        });
    }
    //add WHERE statement if any
    if (Object.isObject(obj.$where))
    {
        if (Object.isObject(obj.$prepared)) {
            var where1 = { $and: [obj.$where, obj.$prepared] }
            sql = sql.concat(' WHERE ',this.formatWhere(where1));
        }
        else {
            sql = sql.concat(' WHERE ',this.formatWhere(obj.$where));
        }

    }
    else {
        if (Object.isObject(obj.$prepared))
            sql = sql.concat(' WHERE ',this.formatWhere(obj.$prepared));
    }

    if (Object.isObject(obj.$group))
        sql = sql.concat(this.formatGroupBy(obj.$group));

    if (Object.isObject(obj.$order))
        sql = sql.concat(this.formatOrder(obj.$order))

    //finally return statement
    return sql;
};
/**
 *
 * @param {QueryExpression} obj
 * @returns {string}
 */
SqlFormatter.prototype.formatLimitSelect = function(obj) {

    var sql=this.formatSelect(obj);
    if (obj.$take) {
        if (obj.$skip)
        //add limit and skip records
            sql= sql.concat(' LIMIT ', obj.$skip.toString() ,', ',obj.$take.toString());
        else
        //add only limit
            sql= sql.concat(' LIMIT ',  obj.$take.toString());
    }
    return sql;
}

SqlFormatter.prototype.formatField = function(obj)
{
    if (obj==null)
        return '';
    if (typeof obj === 'string')
        return obj;
    if (util.isArray(obj)) {
        return array(fields).select(function(x) {
            return x.valueOf();
        }).toArray().join(', ');
    }
    if (typeof obj === 'object') {
        //if field is a constant e.g. { $value:1000 }
        if (obj.hasOwnProperty('$value'))
            return this.escape(obj['$value']);
        //get table name
        var tableName = Object.key(obj);
        var fields = [];
        if (!util.isArray(obj[tableName])) {
            fields.push(obj[tableName])
        }
        else {
            fields = obj[tableName];
        }
        return array(fields).select(function(x) {
            if (QueryField.fieldNameExpression.test(x.valueOf()))
                return tableName.concat('.').concat(x.valueOf());
            else
                return x.valueOf();
        }).toArray().join(', ');
    }
};

/**
 * Formats a order object to the equivalent SQL statement
 * @param obj
 * @returns {string}
 */
SqlFormatter.prototype.formatOrder = function(obj)
{
    var self = this;
    if (!util.isArray(obj))
        return '';
    var sql = array(obj).select(function(x)
    {
        var f = x.$desc ? x.$desc : x.$asc;
        if (typeof f === 'undefined' || f==null)
            throw new Error('An order by object must have either ascending or descending property.');
        if (util.isArray(f)) {
            return array(f).select(function(a) {
                return self.format(a,'%ff').concat(x.$desc ? ' DESC': ' ASC');
            }).join(', ');
        }
        return self.format(f,'%ff').concat(x.$desc ? ' DESC': ' ASC');
    }).toArray().join(', ');
    if (sql.length>0)
        return ' ORDER BY '.concat(sql);
    return sql;
};
/**
 * Formats a group by object to the equivalent SQL statement
 * @param obj {Array}
 * @returns {string}
 */
SqlFormatter.prototype.formatGroupBy = function(obj)
{
    var self = this;
    if (!util.isArray(obj))
        return '';
    var arr = [];
    obj.forEach(function(x) {
        arr.push(self.format(x, '%ff'));
    });
    var sql = arr.join(', ');
    if (sql.length>0)
        return ' GROUP BY '.concat(sql);
    return sql;
};

/**
 * Formats an insert query to the equivalent SQL statement
 * @param obj {QueryExpression|*}
 * @returns {string}
 */
SqlFormatter.prototype.formatInsert = function(obj)
{
    var self= this, sql = '';
    if (!Object.isObject(obj.$insert))
        throw new Error('Insert expression cannot be empty at this context.');
    //get entity name
    var entity = Object.key(obj.$insert);
    //get entity fields
    var obj1 = obj.$insert[entity];
    var props = [];
    for(var prop in obj1)
        if (obj1.hasOwnProperty(prop))
            props.push(prop);
    //add basic INSERT statement
    sql = sql.concat('INSERT INTO ', entity, '(' , props.join(', '), ') VALUES (',
        array(props).select(function(x)
        {
            var value = obj1[x];
            return self.escape(value!=null ? value: null);
        }).toArray().join(', ') ,')');
    return sql;
}

/**
 * Formats an update query to the equivalent SQL statement
 * @param obj {QueryExpression|*}
 * @returns {string}
 */
SqlFormatter.prototype.formatUpdate = function(obj)
{
    var self= this, sql = '';
    if (!Object.isObject(obj.$update))
        throw new Error('Update expression cannot be empty at this context.');
    //get entity name
    var entity = Object.key(obj.$update);
    //get entity fields
    var obj1 = obj.$update[entity];
    var props = [];
    for(var prop in obj1)
        if (obj1.hasOwnProperty(prop))
            props.push(prop);
    //add basic INSERT statement
    sql = sql.concat('UPDATE ', entity, ' SET ',
        array(props).select(function(x)
        {
            var value = obj1[x];
            return x.concat('=', self.escape(value!=null ? value: null));
        }).toArray().join(', '));
    //add WHERE statement
    if (Object.isObject(obj.$where))
        sql = sql.concat(' WHERE ',this.formatWhere(obj.$where));
    return sql;
}

/**
 * Formats a delete query to the equivalent SQL statement
 * @param obj {QueryExpression|*}
 * @returns {string}
 */
SqlFormatter.prototype.formatDelete = function(obj)
{
    var sql = '';
    if (obj.$delete==null)
        throw new Error('Delete expression cannot be empty at this context.');
    //get entity name
    var entity = obj.$delete;
    //add basic INSERT statement
    sql = sql.concat('DELETE FROM ', entity);
    if (Object.isObject(obj.$where))
        sql = sql.concat(' WHERE ',this.formatWhere(obj.$where));
    return sql;
}
/**
 * @param obj {QueryField}
 * @param obj {QueryField}
 * @returns {string}
 */
SqlFormatter.prototype.formatFieldEx = function(obj, s)
{

    if (obj==null)
        return null;
    if (!(obj instanceof QueryField))
        throw new Error('Invalid argument. An instance of QueryField class is expected.')
    //get property
    var prop = Object.key(obj);
    if (prop==null)
        return null;
    var useAlias = (s=='%f');
    if (prop=='$name') {
        return obj.$name;
    }
    else {
        var expr = obj[prop];
        if (expr==null)
            throw new Error('Field definition cannot be empty while formatting.');
        if (typeof expr === 'string') {
            return useAlias ? expr.concat(' AS ', prop) : expr;
        }
        //get aggregate expression
        var alias = prop;
        prop = Object.key(expr);
        var name = expr[prop], s = null;
        switch (prop) {
            case '$count':
                s= util.format('COUNT(%s)',name);
                break;
            case '$min':
                s= util.format('MIN(%s)',name);
                break;
            case '$max':
                s= util.format('MAX(%s)',name);
                break;
            case '$avg':
                s= util.format('AVG(%s)',name);
                break;
            case '$sum':
                s= util.format('SUM(%s)',name);
                break;
            case '$value':
                s= this.escape(name)
                break;
            default :
                var fn = this[prop];
                if (typeof fn === 'function') {
                    /**
                     * get method arguments
                     * @type {Array}
                     */
                    var args = expr[prop];
                    s = fn.apply(this,args);
                }
                else
                    throw new Error('The specified function is not yet implemented.');
        }
        return useAlias ? s.concat(' AS ', alias) : s;
    }
}
/**
 * Formats a query expression and returns the SQL equivalent string
 * @param obj {QueryExpression|*}
 * @param s {string=}
 * @returns {string}
 */
SqlFormatter.prototype.format = function(obj, s)
{
    if (obj==null)
        return null;
    //if a format is defined
    if (s!==undefined)
    {
        if ((s =='%f') || (s =='%ff'))
        {
            //field formatting
            var field = new QueryField();
            if (typeof obj === 'string')
                field.select(obj);
            else
                field = util._extend(new QueryField(), obj)
            return this.formatFieldEx(field, s);
        }
        else if (s=='%o') {
            if (obj instanceof QueryExpression)
                return this.formatOrder(obj.$order);
            return this.formatOrder(obj);
        }
    }

    /**
     * @type {QueryExpression}
     */
    var query = null;
    //cast object to QueryExpression
    if (obj instanceof QueryExpression)
        query = obj;
    else
        query = util._extend(new QueryExpression(), obj);
    //format query
    if (Object.isObject(query.$select)) {
        if (!query.hasPaging())
            return this.formatSelect(query);
        else
            return this.formatLimitSelect(query);
    }
    else if (Object.isObject(query.$insert))
        return this.formatInsert(query);
    else if (Object.isObject(query.$update))
        return this.formatUpdate(query);
    else if (query.$delete!=null)
        return this.formatDelete(query);
    else if (query.$where!=null)
        return this.formatWhere(query.$where);
    else
        return null;

}

if (typeof exports !== 'undefined') {
    module.exports = {
        /**
         * @class SqlFormatter
         * @constructor
         */
        SqlFormatter:SqlFormatter
    }
}