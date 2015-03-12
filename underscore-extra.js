/**
 * Created by developer on 3/12/15.
 */
/**
 * @type {UnderscoreStatic}
 * @private
 */
var _ = require('underscore');

_.isNullOrUndefined = function(obj) {
    return _.isNull(obj) || _.isUndefined(obj);
};

if (typeof exports !== 'undefined')
{
    /**
     * @see UnderscoreStatic
     */
    module.exports = _;
}