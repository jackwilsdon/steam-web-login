var fs   = require('fs'),
    path = require('path'),
    util = require('util');

var Endpoint = require('./endpoint.js').Endpoint;

function loadEndpointFiles(instance, files) {
    var directory = instance.directory;

    files.filter(instance.filter).forEach(function(filename) {
        var fullPath = path.resolve(directory, filename);

        var fileEndpoints = require(fullPath);

        if (!(fileEndpoints instanceof Object)) {
            throw new Error(util.format('expected %s to export object but got %s instead', filename, typeof(fileEndpoints)));
        }

        for (var endpointName in fileEndpoints) {
            var endpoint = fileEndpoints[endpointName];

            if (!(endpoint instanceof Endpoint)) {
                throw new Error(util.format('expected %s in %s to be endpoint but got %s instead', endpointName, filename, typeof(endpoint)));
            }

            instance.endpoints[endpointName] = endpoint;
        }
    });
}

var defaultFilter = function defaultFilter(filename) {
    var isDotFile = filename.indexOf('.') === 0,
        fileExtension = path.extname(filename);

    if (isDotFile) {
        return false;
    }

    if (fileExtension !== '.js') {
        return false;
    }

    return true;
};

var defaultCallback = function defaultCallback(err) {
    if (err) {
        throw err;
    }
};

function EndpointManager(directory, filter) {
    var endpoints = {};

    if (directory === undefined || directory === null) {
        directory = path.join(__dirname, 'endpoints');
    }

    if (filter === undefined || filter === null) {
        filter = defaultFilter;
    }

    directory = path.resolve(directory);

    Object.defineProperty(this, 'directory', {
        get: function() {
            return directory;
        }
    });

    Object.defineProperty(this, 'filter', {
        get: function() {
            return filter;
        }
    });

    Object.defineProperty(this, 'endpoints', {
        get: function() {
            return endpoints;
        }
    });
}

EndpointManager.prototype.hasEndpoint = function hasEndpoint(name) {
    return this.endpoints.hasOwnProperty(name);
};

EndpointManager.prototype.addEndpoint = function addEndpoint(name, endpoint) {
    if (this.hasEndpoint(name)) {
        return false;
    }

    this.endpoints[name] = endpoint;

    return true;
};

EndpointManager.prototype.removeEndpoint = function removeEndpoint(name) {
    if (!this.hasEndpoint(name)) {
        return false;
    }

    delete this.endpoints[name];

    return true;
};

EndpointManager.prototype.getEndpoint = function getEndpoint(name) {
    if (!this.hasEndpoint(name)) {
        return false;
    }

    return this.endpoints[name];
};

EndpointManager.prototype.getRequestOptions = function getRequestOptions(name) {
    if (!this.hasEndpoint(name)) {
        return {};
    }

    var args = [];

    for (var i = 1; i < arguments.length; i++) {
        args.push(arguments[i]);
    }

    var endpoint = this.getEndpoint(name);

    return endpoint.getRequestOptions.apply(endpoint, args);
};

EndpointManager.prototype.getEndpointNames = function getEndpointNames() {
    return Object.keys(this.endpoints);
};

EndpointManager.prototype.removeAllEndpoints = function removeAllEndpoints() {
    for (var name in this.getEndpointNames()) {
        if (!this.removeEndpoint(name)) {
            return false;
        }
    }

    return true;
};

EndpointManager.prototype.loadEndpoints = function loadEndpoints(callback) {
    if (callback === undefined || callback === null) {
        callback = defaultCallback;
    }

    this.removeAllEndpoints();

    var self = this;

    fs.readdir(this.directory, function(err, files) {
        if (err) {
            callback(err);
            return;
        }

        try {
            loadEndpointFiles(self, files);
        } catch (e) {
            callback(e);
        }

        callback();
    });
};

EndpointManager.prototype.loadEndpointsSync = function loadEndpointsSync() {
    this.removeAllEndpoints();

    var files = fs.readdirSync(this.directory);
    loadEndpointFiles(this, files);
};

EndpointManager.prototype.makeRequest = function makeRequest(name) {
    if (!this.hasEndpoint(name)) {
        if (arguments.length > 1) {
            arguments[arguments.length - 1](new Error(util.format('invalid endpoint %s', name)));
        }

        return;
    }

    var args = [];

    for (var i = 1; i < arguments.length; i++) {
        args.push(arguments[i]);
    }

    var endpoint = this.getEndpoint(name);

    return endpoint.makeRequest.apply(endpoint, args);
};

module.exports = {
    EndpointManager: EndpointManager
};
