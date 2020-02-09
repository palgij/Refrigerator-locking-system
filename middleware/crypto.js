// https://github.com/peterjgrainger/crypto-example/blob/master/index.js

const {createCipheriv, createDecipheriv, randomBytes} = require('crypto');
 
const algorithm = 'aes-256-ctr';
const key = 'b2df428b9929d3ace7c598bbf4e496b2'; //process.env.KEY || 'b2df428b9929d3ace7c598bbf4e496b2';
const inputEncoding = 'utf8';
const outputEncoding = 'hex';

// {cryptedText: [IV, timeoutToRemoveThisParameter()]}
const encryptedIVs = {};

/**
 * Encrypt using an initialisation vector
 * @param {string} text to encrypt
 */
module.exports.encrypt = text => {
    const iv = new Buffer.from(randomBytes(16));
    const cipher = createCipheriv(algorithm, key, iv);
    let crypted = cipher.update(text, inputEncoding, outputEncoding);
    crypted += cipher.final(outputEncoding);

    // Crypted text doesnt exist
    if (encryptedIVs[crypted.toString()] === undefined) {
        encryptedIVs[crypted.toString()] = [
            iv.toString('hex'), 
            setTimeout(removeCryptedTextParameter.bind(null, crypted.toString()), 180000)
        ];

        return crypted.toString();
    } else {
        return this.encrypt(text);
    }
}

/**
 * Decrypt using an initialisation vector
 * @param {string} text to decrypt
 */
module.exports.decrypt = cryptedText => {

    if (encryptedIVs[cryptedText] === undefined) return "";    

    //extract the IV from the first half of the text
    const IV = new Buffer.from(encryptedIVs[cryptedText][0], outputEncoding);

    //extract the encrypted text without the IV
    const encryptedText = new Buffer.from(cryptedText, outputEncoding);

    //decipher the string
    const decipher = createDecipheriv(algorithm, key, IV);
    let decrypted = decipher.update(encryptedText, outputEncoding, inputEncoding);
    decrypted += decipher.final(inputEncoding);
    return decrypted.toString();
}

module.exports.clearCryptedTextTimeoutAndRemoveIt = cryptedText => {
    if (encryptedIVs[cryptedText] === undefined) return;
    clearTimeout(encryptedIVs[cryptedText][1]);
    removeCryptedTextParameter(cryptedText);
}

module.exports.clearAndSetNewTimeout = (cryptedText, newTimeoutTime) => {
    if (encryptedIVs[cryptedText] === undefined) return;
    clearTimeout(encryptedIVs[cryptedText][1]);
    encryptedIVs[cryptedText][1] = setTimeout(removeCryptedTextParameter.bind(null, cryptedText), newTimeoutTime);
}

let removeCryptedTextParameter = cryptedText => delete encryptedIVs[cryptedText];