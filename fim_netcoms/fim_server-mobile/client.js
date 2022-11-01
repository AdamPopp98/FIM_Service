import net from "net";
import crypto from 'crypto';
import CryptoJS from 'crypto-js';
import * as funcs from './netcoms.js';

var HOST = '127.0.0.1';
var PORT = 8080;


//This is the shared secret between the server and the client.
var hashBuffer = crypto.createHash('sha256')
    .update('This is my secret hash value, please dont tell it to anyone.')
    .digest();

//Initializes a new client every 300ms until 1000 clients have been created to test server throughput. 
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
for (let i = 0; i < 1000; i++)
{
    await sleep(300);
    initializeClient();
}

export function initializeClient()
{
    let client = new net.Socket();
    client.connect(PORT, HOST, function()
    {
		//TODO: move the client.on code to here after implementing the push notification functionality.
        console.log("Connected to Server! Waiting for JSON challenge...");
    });
    client.on('data', function(data)
    {
        console.log("received challenge from server. Sending proper response...");
		//Converts data from a buffer into a json object.
        let json = JSON.parse(data);
		//derives the correct AES key by xoring the challenge with the secret hash.
        let derivedKey = funcs.deriveAesKey(hashBuffer, Buffer.from(json.challenge));
		//encrypts the json that the server sent with AES256 under the derived key.
        let cipherText = CryptoJS.AES.encrypt(JSON.stringify(json), derivedKey.toString('hex'))
            .toString();
		//Sends this cipherText back to the server.
        client.write(cipherText);
		//closes the TCP connection.
        client.destroy();
    });
    return client;
}
