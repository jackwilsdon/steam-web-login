var request = require('request');

function appendObjects(destination) {
    for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                destination[key] = source[key];
            }
        }
    }
}

function Endpoint(uri, method, defaultFormData, defaultOptions) {
    if (method === undefined || method === null) {
        method = 'get';
    }

    if (defaultFormData === undefined || defaultFormData === null) {
        defaultFormData = {};
    }

    if (defaultOptions === undefined || defaultOptions === null) {
        defaultOptions = {};
    }

    this.__defineGetter__('uri', function() {
        return uri;
    });

    this.__defineGetter__('method', function() {
        return method;
    });

    this.__defineGetter__('defaultFormData', function() {
        return defaultFormData;
    });

    this.__defineGetter__('defaultOptions', function() {
        return defaultOptions;
    });
}

Endpoint.prototype.getRequestOptions = function getRequestOptions(formData) {
    var defaultFormData = this.defaultFormData,
        joinedFormData  = {};

    if (typeof(defaultFormData) === 'function') {
        defaultFormData = defaultFormData.call(this);
    }

    if (formData === undefined || formData === null) {
        formData = {};
    }

    appendObjects(joinedFormData, defaultFormData, formData);

    var defaultOptions = this.defaultOptions,
        joinedOptions = {};

    if (typeof(defaultOptions) === 'function') {
        defaultOptions = defaultOptions.call(this);
    }

    appendObjects(joinedOptions, defaultOptions);

    joinedOptions.uri = this.uri;
    joinedOptions.method = this.method;
    joinedOptions.form = joinedFormData;

    return joinedOptions;
};

Endpoint.prototype.makeRequest = function makeRequest() {
    var formData = arguments.length > 0 ? arguments[0] : null,
        callback = arguments.length > 1 ? arguments[arguments.length - 1] : null;

    var args = [];

    args.push(formData);

    for (var i = 1; i < arguments.length - 1; i++) {
        args.push(arguments[i]);
    }

    var options = this.getRequestOptions.apply(this, args);

    if (callback === null) {
        request(options);
    } else {
        request(options, callback);
    }
};

function JSONEndpoint(uri, method, defaultFormData, defaultOptions) {
    var joinedOptions = {};

    if (defaultOptions === undefined || defaultOptions === null) {
        defaultOptions = { json: true };
    }

    appendObjects(joinedOptions, defaultOptions);

    Endpoint.call(this, uri, method, defaultFormData, joinedOptions);
}

JSONEndpoint.prototype = Object.create(Endpoint.prototype);

module.exports = {
    Endpoint: Endpoint,
    JSONEndpoint: JSONEndpoint,
    Functions: {
        appendObjects: appendObjects
    }
};
