var util = require('util');

var rsa = require('../rsa.js').RSA ;

var EndpointTypes = require('../endpoint'),
    JSONEndpoint = EndpointTypes.JSONEndpoint,
    appendObjects = EndpointTypes.Functions.appendObjects;

function GetRSAKey() {
    JSONEndpoint.call(this, 'https://steamcommunity.com/login/getrsakey', 'POST');
}

GetRSAKey.prototype = Object.create(JSONEndpoint.prototype);

GetRSAKey.prototype.getRequestOptions = function getRequestOptions(formData, username) {
    var joinedFormData = {};

    if (formData === undefined || formData === null) {
        formData = {};
    }

    if (username !== undefined && username !== null) {
        joinedFormData.username = username;
    }

    appendObjects(joinedFormData, formData);

    return JSONEndpoint.prototype.getRequestOptions.call(this, joinedFormData);
};

GetRSAKey.prototype.makeRequest = function makeRequest(formData, username, successCallback, errorCallback) {
    JSONEndpoint.prototype.makeRequest.call(this, formData, username, function(err, res, body) {
        /* jshint camelcase: false */

        if (err) {
            errorCallback(err);
            return;
        }

        if (!body.success) {
            if ('message' in body) {
                errorCallback(new Error(util.format('Steam said: %s', body.message)), body);
            } else {
                errorCallback(new Error('success != true'), body);
            }

            return;
        }

        var key = rsa.getPublicKey(body.publickey_mod, body.publickey_exp);

        successCallback(key, body.timestamp, body);
    });
};

module.exports = {
    GetRSAKey: new GetRSAKey()
};
