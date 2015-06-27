var request = require('request');

var EndpointManager = require('./endpoint_manager.js').EndpointManager;

var loginFormDataMap = {
    captchaGid: 'captchagid',
    captchaText: 'captcha_text',
    emailSteamId: 'emailsteamid',
    emailAuth: 'emailauth'
};

function SteamWeb(endpointManager) {
    Object.defineProperty(this, 'endpointManager', {
        get: function() {
            return endpointManager;
        }
    });
}

SteamWeb.prototype.login = function(username, password, loginFormData, sessionCallback, captchaCallback, emailAuthCallback, errorCallback) {
    if (loginFormData !== undefined && loginFormData !== null) {
        for (var key in loginFormDataMap) {
            if (loginFormDataMap.hasOwnProperty(key) && loginFormData.hasOwnProperty(key)) {
                loginFormData[loginFormDataMap[key]] = loginFormData[key];
                delete loginFormData[key];
            }
        }
    }

    var jar = request.jar();

    var retryFunction = (function(loginFormData) {
        this.login(username, password, loginFormData, sessionCallback, captchaCallback, emailAuthCallback, errorCallback);
    }).bind(this);

    var boundCaptchaCallback = captchaCallback.bind(null, retryFunction),
        boundEmailAuthCallback = emailAuthCallback.bind(null, retryFunction),
        boundErrorCallback = errorCallback.bind(null, retryFunction);

    var rsaKeyCallback = (function(key, rsatimestamp) {
        this.endpointManager.makeRequest('DoLogin', loginFormData, username, password, key, rsatimestamp, loginCallback,
                                            boundCaptchaCallback, boundEmailAuthCallback, boundErrorCallback);
    }).bind(this);

    var loginCallback = (function(transferUrl, transferParameters) {
        this.endpointManager.makeRequest('Transfer', null, transferUrl, transferParameters, jar, transferCallback);
    }).bind(this);

    var transferCallback = (function() {
        this.endpointManager.makeRequest('GetSessionId', null, jar, function(sessionId) {
            sessionCallback(sessionId, jar);
        });
    }).bind(this);

    this.endpointManager.makeRequest('GetRSAKey', null, username, rsaKeyCallback, boundErrorCallback);
};

function initialize(directory, filter, callback) {
    if (arguments.length > 0 && arguments.length < 3) {
        callback = arguments[arguments.length - 1];
    }

    var manager = new EndpointManager(directory, filter);

    manager.loadEndpoints(function() {
        callback(new SteamWeb(manager));
    });
}

function initializeSync(directory, filter) {
    var manager = new EndpointManager(directory, filter);

    manager.loadEndpointsSync();

    return new SteamWeb(manager);
}

module.exports = {
    SteamWeb: SteamWeb,
    initialize: initialize,
    initializeSync: initializeSync
};
