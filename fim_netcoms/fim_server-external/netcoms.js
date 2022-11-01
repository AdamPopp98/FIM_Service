console.log("This module implements the functionality needed to generate fresh encryption keys between two parties that already share a common secret.\nIt also implements methods for client authentication and pseudo-authentication for the server in a client-server in a Dolev-Yao model.\nFresh key exchange is done by xoring a fresh cryptographically random 256-bit value with the secret value shared between the two parties.\nAES-256 is used for data encrytpion once the key exchange has been finished.");
console.log("\nThe server sends the client a plaintext message containing the 256-bit challenge created by xoring a fresh random key with the shared secret.\nThe client then determines the key by xoring the challenge with the shared secret. To authenticate the client sends back the plaintext message\nto the server encrypted under this key. If the server is able to decrypt the client's ciphertext response back into the plaintext that it sent\nthen the server can authenticate the client.");
console.log("\n\nTo run the tests for this module please use the command: 'npm test'.\n\n");


export function generateChallenge(secretHashBuffer, ivBuffer)
{
    var challenge = Buffer.alloc(32);
    for (let i = 0; i < 32; i++)
    {
        challenge[i] = (secretHashBuffer[i] ^ ivBuffer[i]);
        console.assert((secretHashBuffer[i]^challenge[i]) == ivBuffer[i], "XOR operation failed while generating challenge.");
        console.assert((ivBuffer[i]^challenge[i]) == secretHashBuffer[i], "XOR operation failed while generating challenge.");
    }
    return challenge;
}

export function  deriveAesKey(secretHashBuffer, challengeBuffer)
{
    var derivedKey = Buffer.alloc(32);
    for (let i = 0; i < 32; i++)
    {
        derivedKey[i] = (secretHashBuffer[i] ^ challengeBuffer[i]);
        //console.assert((secretHashBuffer[i]^derivedKey[i]) == challengeBuffer[i], "XOR operation failed while deriving key.");
        //console.assert((challengeBuffer[i]^derivedKey[i]) == secretHashBuffer[i], "XOR operation failed while deriving key.");
    }
    return derivedKey;
}

export function hexToAscii(s)
{
    let r = [];
    for (let i = 0; i < s.length - 1; i += 2) {
        r.push(String.fromCharCode(parseInt(s.charAt(i) + s.charAt(i + 1), 16)));
    }
    return r.join("");
}

export function createJsonObject(domainName, timeStamp, challenge)
{
    var jsonObject = {"domain_name" : domainName, "time_stamp" : timeStamp, "challenge" : challenge};
    return jsonObject;
}
