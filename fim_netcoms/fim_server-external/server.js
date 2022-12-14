import net from "net";
import crypto, { randomBytes } from 'crypto';
import CryptoJS from 'crypto-js';
import * as cryptFuncs from './netcoms.js';
import { PassThrough } from "stream";
import * as lineReader from 'line-reader';

//This is the shared secret between the server and the client.
var hashBuffer = crypto.createHash('sha256')
    .update('This is my secret hash value, please dont tell it to anyone.')
    .digest();


//TODO: Add a message queue to handle periods where the rate of incoming requests exceeds throughput.
var users = ['Jlennon', 'Pmccartney', 'Gharrison', 'Rstarr', 'Apopp'];
var hashes = [
    'e11efdba883a02011b5bfdd28ceef0d0a57834d9162123f88f8b8b5595f3a17b',
    '92a414c8d475f689734f44a41646f68e36b5b5c85bb6dd5f88cf3041404a7dbd',
    'bc282cea98befa3b13a8f63c1f569817b0760af2ff2a7632e1d79c980cb4b8d7',
    '49cf19ebbf3c88e975aa0e98689e33e933d3f0ec20a0003227491730738fe73a',
    '11dcafa4728abd7599e4b55478c45d3ff5f316395ecd0ae63e861d582234c63a'];
const maxEntries = 50;
const removalInterval = maxEntries*100-100;
const validResponses = new Array(maxEntries);
validResponses.fill(0);
const server = initializeServer(8080);


export function addNew(response)
{
    let alreadyAdded = false;
	//TODO: invalid responses should be filtered out prior to being passed to this function.
    if (response == 0)
    {
        console.log("No new entries to add.");
        alreadyAdded = true;
    }
    for (let i = 0; i < maxEntries; i++)
    {
		//If the entry has not been added yet searches for an empty slot or a n expired entry to replace.
        if (alreadyAdded == false)
        {
			//adds new entry to empty slot
            if (validResponses[i] == 0)
            {
                alreadyAdded = true;
                validResponses[i] = response;
                console.log("New entry added.");
            }
			//replaces expired entry with new entry. needs to be in else if statement to avoid JSON parsing errors.
            else if (Date.now() - validResponses[i].time_stamp > removalInterval)
            {
                alreadyAdded = true;
                validResponses[i] = response;
                console.log("New entry added.");
            }
        }
		//If the entry has already been added then the loop finishes removing any expired entries.
        else if (validResponses[i] != 0)
        {
			//Removes any expired entries remaining after a new entry is added.
            if (Date.now() - validResponses[i].time_stamp > removalInterval)
            {
                validResponses[i] = 0;
            }
        }
    }
    if (alreadyAdded == false)
    {
        console.log("Cannot add new entry to list due to list being full of non-expired entries.");
    }
}

export function initializeServer(portNumber)
{
    const server = net.createServer(socket =>
        {
            socket.on("data", data =>
            {
                let json = JSON.parse(data);
                let response = assemblePlaintext(json.domain, Buffer.from(getHash(json.username)), crypto.randomBytes(32));
                console.log(JSON.parse(response));
                socket.write(response);
            })
        })
    server.listen(portNumber);
    return server;
}

//Creates a JSON object given the requested domain, the secret hash, and the AES key to be used.
export function assemblePlaintext(domainName, sharedSecret, cryptKey)
{
    let timeStamp = Date.now();
	//challenge is generated by xoring the sharedSecret witht the cryptKey.
    let challenge = cryptFuncs.generateChallenge(sharedSecret, cryptKey);
    let plainText = JSON.stringify(cryptFuncs.createJsonObject(domainName, timeStamp, challenge));
    return plainText;
}

export function decryptResponse(clientResponse)
{
    let decryptedText = CryptoJS.AES.decrypt(cipherText, randBuffer.toString('hex'))
        .toString();
		
		
	//Gets the user's response back to ASCII.
    decryptedText = cryptFuncs.hexToAscii(decryptedText);
    try
    {
        decryptedText = JSON.parse(decryptedText);
    }
	//TODO: add functionality to notify user and the requesting website if the response fails to parse correctly.
    catch(err)
    {
        throw("received response does not parse to JSON correctly.");
    }
}

export function validateResponseFormat(decryptedResponse)
{
    const required_fields = ['domain_name', 'time_stamp', 'challenge'];
    for (let i = 0; i< required_fields.length; i++)
    {
        if (required_fields[i] in decryptResponse == false)
        {
            return false;
        }
    }
    return true;
}

export function findMatch(clientResponse)
{
    if (validResponses.length > 0)
    {
        let index = 0;
        for (let index = 0; index < validResponses.length; index++)
        {
            if (clientResponse.time_stamp == validResponses[index].time_stamp)
            {
                if (JSON.stringify(clientResponse)==JSON.stringify(validResponses[index]))
                {
                    console.log("Match Found at index: ", index + "!");
                    return index;
                }
            }
        }
        console.log("No Match Found");
        return -1;
    }
}

export function onMatchProtocol(validResponses, index)
{
    console.log(JSON.stringify(validResponses[index]));
}

export function getHash(lookingFor)
{
    for (let i = 0; i < users.length; i++)
    {
        if (lookingFor == users[i])
        {
            return hashes[i];
        }
    }
}