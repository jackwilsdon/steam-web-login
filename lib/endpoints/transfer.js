var util = require('util');

var EndpointTypes = require('../endpoint'),
    Endpoint = EndpointTypes.Endpoint,
    appendObjects = EndpointTypes.Functions.appendObjects;

function Transfer() {
    Endpoint.call(this, null, 'POST');
}

Transfer.prototype = Object.create(Endpoint.prototype);

Transfer.prototype.getRequestOptions = function getRequestOptions(formData, url, parameters, jar) {
    var defaultFormData = this.defaultFormData,
        joinedFormData = {};

    if (typeof(defaultFormData) === 'function') {
        defaultFormData = defaultFormData.call(this);
    }

    if (formData === undefined || formData === null) {
        formData = {};
    }

    if (parameters !== undefined && parameters !== null) {
        appendObjects(joinedFormData, parameters);
    }

    appendObjects(joinedFormData, formData);

    var defaultOptions  = this.defaultOptions,
        joinedOptions = {};

    if (typeof(defaultOptions) === 'function') {
        defaultOptions = defaultOptions.call(this);
    }

    appendObjects(joinedOptions, defaultOptions);

    if (jar !== undefined && jar !== null) {
        appendObjects(joinedOptions, {
            jar: jar
        });
    }

    return Endpoint.prototype.getRequestOptions.call({
        defaultFormData: defaultFormData,
        defaultOptions: joinedOptions,
        uri: url,
        method: this.method
    }, joinedFormData);
};

Transfer.prototype.makeRequest = function makeRequest(formData, url, parameters, jar, successCallback, errorCallback) {
    Endpoint.prototype.makeRequest.call(this, formData, url, parameters, jar, function(err, res) {
        if (err) {
            errorCallback(err);
            return;
        }

        if (res.statusCode !== 200) {
            errorCallback(new Error(util.format('expected status code 200 but got %d', res.statusCode)));
            return;
        }

        successCallback();
    });
};

module.exports = {
    Transfer: new Transfer()
};
