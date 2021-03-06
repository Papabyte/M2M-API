# Example M2M API
This repository contains code for an API server and client that demonstrates [Obyte payment channels](https://github.com/Papabyte/aa-channels-lib) for a  machine-to-machine payment application.

Obyte messenger is used as communication medium so no additional setup is required.

The client requests data while sending an instant payment through channel, if payment matches price server sends requested data, otherwise it refunds client.

A command prompt interface is provided client side to play with channel.

 ![client-interface](source-doc/client-interface.png?raw=true "Vendor configuration")


## Instructions

* Install Node.js > version 6
* `git clone https://github.com/Papabyte/M2M-API.git`

#### Server
* `cd server`
* `npm install`
* `node server.js` to start server
* Enter a passphrase (you can let it empty on testnet)
* Send testnet bytes to the address that appears at `====== my single address:`
* Note the indicated pairing code, it will be asked by client


#### Client 
* `cd server`
* `npm install`
* `node client.js` to start client
* Enter a passphrase (you can let it empty on testnet)
* Send testnet bytes to the address that appears at `====== my single address:`
* Follow instructions


