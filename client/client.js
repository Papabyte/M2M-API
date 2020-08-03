"use strict";
const channels = require("aa-channels-lib");
const eventBus = require("ocore/event_bus.js");
const prompts = require('prompts');
const fs = require('fs');

eventBus.on("headless_wallet_ready", function() {

	setTimeout(
		async function() {

			if (fs.existsSync('last_peer.txt')) // we read this file to know what last pairing code was used, so we can suggest it as input
				var last_peer = fs.readFileSync('last_peer.txt', 'utf8');

			const pairing_code = await prompts({ // we ask pairing code of API server
				type: 'text',
				name: 'value',
				message: 'Enter pairing code of your peer',
				initial: last_peer,
				validate: value => value.match(/^([\w\/+]+)@([\w.:\/-]+)#([\w\/+-]+)$/) ? true : `Pairing code is invalid`
			});
			fs.writeFile("last_peer.txt", pairing_code.value, (err) => { // we save pairing code in a file
				console.log("error when writing last peer: " + err);
			})

			//this function returns all channels created with this peer, if found we pick the first one assuming we didn't create multiple channels
			// if not found we create one
			channels.getChannelsForPeer(pairing_code.value, null, async function(error, aa_addresses) {
				if (error) {
					console.error(error);
					console.error("no channel found for this peer, I'll create one");

					const amount = await prompts({
						type: 'number',
						name: 'value',
						message: 'Enter amount in bytes for the initial deposit',
						validate: value => value > 10000 ? true : `Amount must be > 10000`
					});

					channels.createNewChannel(pairing_code.value, amount.value, {
						salt: true
					}, function(error, aa_address) {
						if (error)
							return console.error(error);
						operateOnChannel(aa_address);
					})
				} else {
					operateOnChannel(aa_addresses[0])
				}
			});
		}, 2000) // we have to wait a bit before displaying the prompt to be sure logs output were cleared from console
});

// this is the main prompt that is recursively called after each operation
function operateOnChannel(aa_address) {

	channels.getBalancesAndStatus(aa_address, async function (error, objBalancesAndStatus){
		if (error)
			throw Error(error)
		console.error("\x1b[36m","\n\nChannel "+ aa_address +" info:");
		console.error("\x1b[36m","Status: "+ objBalancesAndStatus.status);
		console.error("\x1b[36m","Amount deposited by me and confirmed: "+ objBalancesAndStatus.amount_deposited_by_me);
		console.error("\x1b[36m","Amount spent by me: "+ objBalancesAndStatus.amount_spent_by_me);
		console.error("\x1b[36m","Amount spent by peer: "+ objBalancesAndStatus.amount_spent_by_peer);
		console.error("\x1b[36m","Confirmed amount available for spending: "+ objBalancesAndStatus.free_amount);
		console.error("\x1b[36m","My deposits not confirmed yet: "+ objBalancesAndStatus.my_deposits + "\n");
	
		const index = await prompts({
			type: 'number',
			name: 'value',
			message: 'Choose an operation for this channel, type:\n 1 to request humidity \n 2 to request temperature \n 3 to request wind \n 4 to deposit on channel \n 5 to close channel \n 6 to refresh status \n 7 to quit',
			validate: value => value > 7 || value < 0 ? `Invalid entry` : true
		});

		if (index.value == 4) {
			await deposit(aa_address);
			return operateOnChannel(aa_address);
		}

		if (index.value == 5) {
			return channels.close(aa_address, function(error) {
				if (error)
					console.error(error)
				else
					console.error("closing unit sent");
				return operateOnChannel(aa_address);
			});
		}

		if (index.value == 6)
			return operateOnChannel(aa_address);

		if (index.value == 7)
			return process.exit();

		const latitude = await prompts({
			type: 'number',
			name: 'value',
			message: 'latitude? (-90 to 90)', // we don't check range, it will be done by API server and is an example of returned error
		});

		const longitude = await prompts({
			type: 'number',
			name: 'value',
			message: 'longitude? (-180 to 180)',
		});

		const amount = await prompts({
			type: 'number',
			name: 'value',
			message: 'payment amount?',
		});

		var endPoint;
		switch (index.value) {
			case 1:
				endPoint = 'temperature'
				break;
			case 2:
				endPoint = 'humidity'
				break;
			case 3:
				endPoint = 'wind'
				break;
		}
		
		channels.sendMessageAndPay(aa_address, [endPoint, latitude.value, longitude.value], amount.value, function(error, response) {
			if (error)
				console.error("error when sending payment: " + error);
			else
				console.error(response);
			setTimeout(function() {
				operateOnChannel(aa_address);
			}, 100);
		});
	})
}

async function deposit(aa_address) {
	return new Promise(async (resolve) => {
		const amount = await prompts({
			type: 'number',
			name: 'value',
			message: 'Enter amount in bytes you want to deposit',
			validate: value => value > 10000 ? true : `Amount must be > 10000`
		});

		channels.deposit(aa_address, amount.value, function(error, unit) {
			if (error)
				console.error("error when depositing: " + error)
			else
				console.error("deposit unit " + unit);
			resolve();
		});
	})

}

eventBus.on("payment_received", function(payment_amount, asset, message, aa_address) {
	console.error("payment of " + payment_amount + " " + asset + " received on channel " + aa_address + " with  message: " + message);
});

eventBus.on("channel_closed_with_fraud_proof", function(aa_address, amount) {
	console.error("channel " + aa_address + " closed with fraud proof, settled amount to me: " + amount + " bytes");
});

eventBus.on("channel_closed", function(aa_address, amount) {
	console.error("channel " + aa_address + " closed, settled amount to me: " + amount + " bytes");
});