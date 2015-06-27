var BigInteger = require('jsbn');

var RSAPublicKey = function(modulusHex, exponentHex) {
    this.modulus = new BigInteger(modulusHex, 16);
    this.encryptionExponent = new BigInteger(exponentHex, 16);
};

var RSA = {
    getPublicKey: function(modulusHex, exponentHex) {
		return new RSAPublicKey(modulusHex, exponentHex);
    },

    encrypt: function(data, pubkey) {
        if (!pubkey) {
            return false;
        }

        data = this.pkcs1pad2(data, (pubkey.modulus.bitLength() + 7) >> 3);

        if (!data) {
            return false;
        }

        data = data.modPowInt(pubkey.encryptionExponent, pubkey.modulus);

        if (!data) {
            return false;
        }

        data = data.toString(16);

        if ((data.length & 1) === 1) {
            data = '0' + data;
        }

        return new Buffer(data, 'hex').toString('base64');
    },

    pkcs1pad2: function(data, keysize) {
        if (keysize < data.length + 11) {
            return null;
        }

        var buffer = [],
            i = data.length - 1;

        while (i >= 0 && keysize > 0) {
            buffer[--keysize] = data.charCodeAt(i--);
        }

        buffer[--keysize] = 0;

        while (keysize > 2) {
            buffer[--keysize] = Math.floor(Math.random() * 254) + 1;
        }

        buffer[--keysize] = 2;
        buffer[--keysize] = 0;

        return new BigInteger(buffer);
    }
};

module.exports = {
    RSA: RSA
};
