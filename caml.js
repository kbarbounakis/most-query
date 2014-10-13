/**
 * Created by kbarbounakis on 13/4/2014.
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

XmlSerializable.prototype.getSchema = function() {
    return null;
};

XmlSerializable.prototype.writeXml = function() {
    return null;
};

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
    /**
     * @type {Boolean}
     */
    this.ascending = true;
}

util.inherits(FieldRef, XmlSerializable);

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
}

if (typeof exports !== 'undefined')
{
    module.exports = caml;
}