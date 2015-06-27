var util = require('util');

var rsa = require('../rsa.js').RSA;

var EndpointTypes = require('../endpoint'),
    JSONEndpoint = EndpointTypes.JSONEndpoint,
    appendObjects = EndpointTypes.Functions.appendObjects;

function DoLogin() {
    JSONEndpoint.call(this, 'https://steamcommunity.com/login/dologin/', 'POST');
}

DoLogin.prototype = Object.create(JSONEndpoint.prototype);

DoLogin.prototype.getRequestOptions = function getRequestOptions(formData, username, password, key, rsatimestamp) {
    var joinedFormData = {};

    if (formData === undefined || formData === null) {
        formData = {};
    }

    if (username !== undefined && username !== null) {
        joinedFormData.username = username;
    }

    if (password !== undefined && password !== null && key !== undefined && key !== null) {
        var encryptedPassword = rsa.encrypt(password, key);

        joinedFormData.password = encryptedPassword;
    }

    if (rsatimestamp !== undefined && rsatimestamp !== null) {
        joinedFormData.rsatimestamp = rsatimestamp;
    }

    joinedFormData.twofactorcode = '';

    appendObjects(joinedFormData, formData);

    return JSONEndpoint.prototype.getRequestOptions.call(this, joinedFormData);
};

DoLogin.prototype.makeRequest = function makeRequest(formData, username, password, key, rsatimestamp, successCallback, captchaCallback, emailAuthCallback, errorCallback) {
    JSONEndpoint.prototype.makeRequest.call(this, formData, username, password, key, rsatimestamp, function(err, res, body) {
        /* jshint camelcase: false */

        if (err) {
            errorCallback(err, body);
            return;
        }

        if (!body.success && !body.captcha_needed && !body.emailauth_needed) {
            if ('message' in body) {
                errorCallback(new Error(util.format('Steam said: %s', body.message)), body);
            } else {
                errorCallback(new Error('success != true'), body);
            }

            return;
        }

        if (body.captcha_needed) {
            captchaCallback(body.captcha_gid, body);
        } else if (body.emailauth_needed) {
            emailAuthCallback(body.emailsteamid, body.emaildomain, body);
        } else {
            successCallback(body.transfer_url, body.transfer_parameters, body);
        }
    });
};

module.exports = {
    DoLogin: new DoLogin()
};
