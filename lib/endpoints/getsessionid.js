var util = require('util');

var EndpointTypes = require('../endpoint'),
    Endpoint = EndpointTypes.Endpoint,
    appendObjects = EndpointTypes.Functions.appendObjects;

function GetSessionId() {
    Endpoint.call(this, 'https://store.steampowered.com', 'GET');
}

GetSessionId.prototype = Object.create(Endpoint.prototype);

GetSessionId.prototype.getRequestOptions = function getRequestOptions(formData, jar) {
    var defaultFormData = this.defaultFormData,
        joinedFormData = {};

    if (typeof(defaultFormData) === 'function') {
        defaultFormData = defaultFormData.call(this);
    }

    if (formData === undefined || formData === null) {
        formData = {};
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
        uri: this.uri,
        method: this.method
    }, joinedFormData);
};

GetSessionId.prototype.makeRequest = function makeRequest(formData, jar, successCallback, errorCallback) {
    Endpoint.prototype.makeRequest.call(this, formData, jar, function(err, res) {
        if (err) {
            errorCallback(err);
            return;
        }

        if (res.statusCode !== 200) {
            errorCallback(new Error(util.format('expected status code 200 but got %d', res.statusCode)));
            return;
        }

        var cookies = jar.getCookies(this.uri),
            sessionId = null;

        for (var index in cookies) {
            var cookie = cookies[index];

            if (cookie.key === 'sessionid' && sessionId === null) {
                sessionId = cookie.value;
            }
        }

        if (!sessionId) {
            errorCallback(new Error('could not find sessionid cookie'));
            return;
        }

        successCallback(sessionId);
    });
};

module.exports = {
    GetSessionId: new GetSessionId()
};
