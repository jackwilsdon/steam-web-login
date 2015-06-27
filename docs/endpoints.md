# Endpoints
## GetRSAKey
#### `makeRequest(formData, username, successCallback, errorCallback)`
##### Arguments
 - `formData` - Any extra form data for the request.
 - `username` - The username to use when retrieving the RSA key.
 - `successCallback(rsaKey, rsaTimestamp, rawData)` - Called when the RSA key has been retrieved successfully.
 - `errorCallback(err, rawData)` - Called when an error occurs.

## DoLogin
#### `makeRequest(formData, username, password, key, rsatimestamp, successCallback, captchaCallback, emailAuthCallback, errorCallback)`
##### Arguments
 - `formData` - Any extra form data for the request.
   - **[optional]** `captchaGid` - The gid of the captcha provided to `captchaCallback`. Only required if `captchaCallback` is called.
   - **[optional]** `captchaText` - The text for the captcha with gid `captchaGid`. Only required if `captchaCallback` is called.
   - **[opitonal]** `emailSteamId` - The steam id provided to `emailAuthCallback`. Only required if `emailAuthCallback` is called.
   - **[optional]** `emailAuth` - The authentication code sent to the user's email. Only required if `emailAuthCallback` is called.
 - `username` - The username to use when logging in.
 - `password` - The password to use when logging in.
 - `key` - Encryption key for password, as returned by [GetRSAKey](#getrsakey) endpoint.
 - `successCallback(transferUrl, transferParameters, rawData)` - Called when the user is logged in successfully.
 - `captchaCallback(captchaGid, rawData)` - Called when a captcha is required.
 - `emailAuthCallback(emailSteamId, emailDomain, rawData)` - Called when email authentication is required.
 - `errorCallback(err, rawData)` - Called when an error occurs.

## Transfer
#### `makeRequest(formData, url, parameters, jar, successCallback, errorCallback)`
##### Arguments
 - `formData` - Any extra form data for the request.
 - `url` - The transfer URL to use, as provided to `successCallback` on [DoLogin](#dologin).
 - `parameters` - The transfer parameters to use, as provieed to `successCallback` on [DoLogin](#dologin).
 - `jar` - The cookie jar to use when making the request.
 - `successCallback()` - Called when the user has been transferred.
 - `errorCallback(err)` - Called when an error occurs.

## GetSessionId
#### `makeRequest(formData, jar, successCallback, errorCallback)`
##### Arguments
 - `formData` - Any extra form data for the request.
 - `jar` - The cookie jar to use when making the request. This should be the same as the jar provided to [Transfer](#transfer).
 - `successCallback(sessionId)` - Called when the session ID has been retrieved.
 - `errorCallback(err)` - Called when an error occurs.
