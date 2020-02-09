// https://github.com/peterjgrainger/crypto-example/blob/master/index.js

const {createCipheriv, createDecipheriv, randomBytes} = require('crypto');
 
const algorithm = 'aes-256-ctr';
const key = 'b2df428b9929d3ace7c598bbf4e496b2'; //process.env.KEY || 'b2df428b9929d3ace7c598bbf4e496b2';
const inputEncoding = 'utf8';
const outputEncoding = 'hex';

/**
 * Encrypt using an initialisation vector
 * @param {string} value to encrypt
 */
encrypt = value => {
    const iv = new Buffer.from(randomBytes(16));
    const cipher = createCipheriv(algorithm, key, iv);
    let crypted = cipher.update(value, inputEncoding, outputEncoding);
    crypted += cipher.final(outputEncoding);
    return `${iv.toString('hex')}:${crypted.toString()}`;
}

/**
 * Decrypt using an initialisation vector
 * @param {string} value value to decrypt
 */
decrypt = value => {
    const textParts = value.split(':');

    //extract the IV from the first half of the value
    const IV = new Buffer.from(textParts.shift(), outputEncoding);

    //extract the encrypted text without the IV
    const encryptedText = new Buffer.from(textParts.join(''), outputEncoding);

    //decipher the string
    const decipher = createDecipheriv(algorithm,key, IV);
    let decrypted = decipher.update(encryptedText, outputEncoding, inputEncoding);
    decrypted += decipher.final(inputEncoding);
    return decrypted.toString();
}

let ss = encrypt('Awesum!');
console.log(ss);
console.log(decrypt(ss));
