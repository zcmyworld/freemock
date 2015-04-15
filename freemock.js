
var m = require('module');
var originalLoader = null;
var originalCache = {};
var mockObj = {};
var status = false;

var actual_opts = {};
var default_opts = {}


var ignoreObj = {}
exports.getStatus = function() {
    return status;
}

/**
 * 判断参数是否有效
 * @ param opts {Object}
 */
function getEffectOptions(opts) {
    for (var opt in opts) {
        if (default_opts[opt] == undefined) {
            throw new Error("param not exist");
            continue;
        }
        actual_opts[opt] = opts[opt];
    }
}

/**
 * 替换module处理的方法，替换假象
 */

function hookedLoader(request, parent, isMain) {

    if (!originalLoader) {
        throw new Error("Loader has not been hooked");
    }

    if (mockObj.hasOwnProperty(request)) {
        return mockObj[request];
    }

    if (ignoreObj.hasOwnProperty(request)) {
        return
    }

    return originalLoader(request, parent, isMain);
}

exports.setIgnore = function(arr) {
    for (var i in arr) {
        ignoreObj[arr[i]] = 1;
    }
}

/**
 * 启动freemock
 */
exports.start = function start() {

    if (originalLoader) {
        return;
    }
    // mockObj['./shit'] = 1
    originalCache = m._cache;
    m._cache = {}

    originalLoader = m._load;
    m._load = hookedLoader;
}


/**
 * 关闭freemock
 */
exports.end = function end() {
    if (!originalLoader) {
        return;
    }
    m._load = originalLoader;
    m._cache = originalCache;
    originalLoader = null;
    originalCache = {}
    for (var module in mockObj) {
        var _methodObj = mockObj[module].method;
        for (var method in _methodObj) {
            var _method = _methodObj[method];
            if (_method.runTime && _method.runTime != _method.runCount) {
                throw new Error('Error - runTime not match')
            }
        }
    }
    mockObj = {}
}


function freemock() {}

freemock.prototype._setMethod = function(method) {
    var self = this;
    methodName = method.methodName;
    method.runCount = 0;
    self[methodName] = function() {
        method.runCount++;
        var actualArgs = arguments;
        if (method.expectArgs) {
            var expectArgs = method.expectArgs
            if (expectArgs.length != actualArgs.length) {
                throw new Error('Error - args length not match');
            } else {
                for (var i in expectArgs) {
                    if (!_deepEqual(expectArgs[i], actualArgs[i])) {
                        throw new Error('Error - args not match');
                    }
                }
            }
        }

        if (method.willCallback) {
            method.willCallback();
        }

        if (method.willThrow) {
            throw method.willThrow
        }


        if (method.willReturn) {
            return method.willReturn;
        }


    }

}


freemock.prototype.setMethod = function(methodObj) {
    var self = this;
    if (!methodObj) {
        throw new Error('Error - method not exist');
    }
    for (var methodName in methodObj) {
        methodObj[methodName].methodName = methodName;
        self._setMethod(methodObj[methodName]);
        mockObj[self._mod].method[methodName] = methodObj[methodName];
    }
}


/**
 * 根据路劲生成假象
 * @ param mod {String}
 */
exports.getMock = function getMock(mod) {
    if (!mod) {
        throw new Error('Error -  method : "getMock"');
    }
    var mock = new freemock();
    mock.method = {};
    mock._mod = mod;
    mockObj[mod] = mock;
    return mock;
}



function _deepEqual(actual, expected) {
    if (typeof actual == 'function' && typeof expected == 'function') {
        return true;
    }
    if (actual === expected) {
        return true;

    } else if (Buffer.isBuffer(actual) && Buffer.isBuffer(expected)) {
        if (actual.length != expected.length) {
            return false;
        }
        for (var i = 0; i < actual.length; i++) {
            if (actual[i] !== expected[i]) {
                return false;
            }
        }
        return true;
    } else if (actual instanceof Date && expected instanceof Date) {
        return actual.getTime() === expected.getTime();
    } else if (actual instanceof RegExp && expected instanceof RegExp) {
        return actual.source === expected.source &&
            actual.global === expected.global &&
            actual.multiline === expected.multiline &&
            actual.lastIndex === expected.lastIndex &&
            actual.ignoreCase === expected.ignoreCase;

    } else if (typeof actual != 'object' && typeof expected != 'object') {
        return actual == expected;
    } else {
        return objEquiv(actual, expected);
    }
}

function isUndefinedOrNull(value) {
    return value === null || value === undefined;
}

function isArguments(object) {
    return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
    if (isUndefinedOrNull(a) || isUndefinedOrNull(b)) {
        return false;
    }
    if (a.prototype !== b.prototype) {
        return false;
    }
    var aIsArgs = isArguments(a),
        bIsArgs = isArguments(b);
    if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs)) {
        return false;
    }
    if (aIsArgs) {
        a = pSlice.call(a);
        b = pSlice.call(b);
        return _deepEqual(a, b);
    }
    try {
        var ka = Object.keys(a),
            kb = Object.keys(b),
            key, i;
    } catch (e) {
        return false;
    }
    if (ka.length != kb.length) {
        return false;
    }
    ka.sort();
    kb.sort();
    for (i = ka.length - 1; i >= 0; i--) {
        if (ka[i] != kb[i]) {
            return false;
        }
    }
    for (i = ka.length - 1; i >= 0; i--) {
        key = ka[i];
        if (!_deepEqual(a[key], b[key])) {
            return false;
        }
    }
    return true;
}