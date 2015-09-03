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
     * @param {function(*)} callback
     * @param {*=} thisArg
     * @name Array.forEach
     */
    var forEach = function (callback, thisArg) {
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

    if (Object.defineProperty) {
        try {
            Object.defineProperty(Array.prototype, 'forEach', {
                value: forEach, configurable: true, enumerable: false, writable: true
            });
        } catch(e) {}
    }

    if (!Array.prototype.forEach) { Array.prototype.forEach = forEach; }

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
        for (var key1 in obj)
            if (obj.hasOwnProperty(key1)) arr.push(key1);
        for (var key2 in arr) {
            delete obj[key2];
        }
    }
}