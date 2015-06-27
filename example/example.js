var readMultiple = require('read-multiple'),
    read = require('read');

var SteamWeb = require('../lib/steamweb.js');
var steam = SteamWeb.initializeSync();

readMultiple({
    username: {
        prompt: 'Username: '
    },
    password: {
        prompt: 'Password: ',
        silent: true
    }
}, function(err, username, password) {

    var loginCallback = function(sessionId) {
        console.log('Logged in');
        console.log('Session ID: ' + sessionId);
    };

    var captchaCallback = function(retry, captchaGid, body) {
        console.log('Steam: ' + body.message);
        console.log('Captcha URL: https://steamcommunity.com/public/captcha.php?gid=' + captchaGid);

        read({
            prompt: 'Captcha Text: ',
        }, function(err, captchaText) {
            if (err) {
                throw err;
            }

            if (captchaText.length === 0) {
                return;
            }

            retry({
                captchaGid: captchaGid,
                captchaText: captchaText
            });
        });
    };

    var emailAuthCallback = function(retry, emailSteamId, emailDomain) {
        console.log('Steam has sent a SteamGuard code to your address at ' + emailDomain);

        read({
            prompt: 'SteamGuard Code: '
        }, function(err, emailAuth) {
            if (err) {
                throw err;
            }

            if (emailAuth.length === 0) {
                return;
            }

            retry({
                emailSteamId: emailSteamId,
                emailAuth: emailAuth
            });
        });
    };

    var errorCallback = function(retry, err) {
        throw err;
    };

    steam.login(username.value, password.value, null, loginCallback, captchaCallback, emailAuthCallback, errorCallback);
}, true);
