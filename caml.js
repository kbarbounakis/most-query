/**
 * MOST Web Framework
 * A JavaScript Web Framework
 * http://themost.io
 *
 * Copyright (c) 2014, Kyriakos Barbounakis k.barbounakis@gmail.com, Anthi Oikonomou anthioikonomou@gmail.com
 *
 * Released under the BSD-3-Clause license
 * Date: 2014-04-13
 */
var util = require('util');
/**
 * Represents an xml serializable object
 * @class XmlSerializable
 * @constructor
 */
function XmlSerializable() {
    //
}
// noinspection JSUnusedGlobalSymbols
XmlSerializable.prototype.getSchema = function() {
    return null;
};
// noinspection JSUnusedGlobalSymbols
XmlSerializable.prototype.writeXml = function() {
    return null;
};
// noinspection JSUnusedGlobalSymbols
XmlSerializable.prototype.readXml = function() {
    return null;
};

/**
 * @class FieldRef
 * @constructor
 */
function FieldRef() {
    /**
     * @type {String}
     */
    this.name = undefined;
    // noinspection JSUnusedGlobalSymbols
    /**
     * @type {Boolean}
     */
    this.ascending = true;
}

util.inherits(FieldRef, XmlSerializable);

// noinspection JSUnusedGlobalSymbols
FieldRef.prototype.getSchema = function() {
    return {
        element: { name: 'FieldRef', namespace: null },
        properties: {
            name: { attribute: 'Name', type: 'String' },
            ascending: { attribute: 'Ascending', value: true, type: 'Boolean' }
        }
    };
};

var caml = {
    /**
     * @class FieldRef
     */
    FieldRef:FieldRef
};

if (typeof exports !== 'undefined')
{
    module.exports = caml;
}