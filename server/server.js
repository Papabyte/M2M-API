"use strict";
const channels = require("aa-channels-lib");

const endPoints = {
	temperature: {
		result: (lat, long, handle) => {
			if (lat < -90 || lat > 90)
				return handle("wrong latitude");
			if (long < -180 || long > 180)
				return handle("wrong longitude");
			return handle(null, "20°C");
		},
		price: 1000
	},
	humidity: {
		result: (lat, long, handle) => {
			if (lat < -90 || lat > 90)
				return handle("wrong latitude");
			if (long < -180 || long > 180)
				return handle("wrong longitude");
			return handle(null, "82%");
		},
		price: 5000
	},
	wind: {
		result: (lat, long, handle) => {
			if (lat < -90 || lat > 90)
				return handle("wrong latitude");
			if (long < -180 || long > 180)
				return handle("wrong longitude");
			return "5 knots";
		},
		price: 20000
	}
}

channels.setCallBackForPaymentReceived(function(amount, asset, arrReceivedFromPeer, aa_address, handle) {
	const endPoint = arrReceivedFromPeer[0];
	const arrAguments = arrReceivedFromPeer.slice(1);

	if (asset != "base"){
		refundPeer(aa_address, amount, "refund for incorrect request");
		return handle("incorrect asset for payment");
	}

	if (!endPoints[endPoint]){
		refundPeer(aa_address, amount, "refund for incorrect request");
		return handle("unknown endpoint");
	}

	if (arrAguments.length !== (endPoints[endPoint].result.length - 1))
		return handle("wrong parameters number, expected : " + (endPoints[endPoint].result.length - 1) + ", received " + arrAguments.length);

	var price = endPoints[endPoint].price;
	if (price > amount) {
		refundPeer(aa_address, amount, "refund for incorrect payment");
		return handle("payment expected for this endpoint " + price + " bytes");
	}

	if (price < amount) {
		refundPeer(aa_address, amount - price, "refund for overpayment");
		return handle("payment expected for this endpoint " + price + " bytes");
	}

	endPoints[endPoint].result(...arrAguments, function(error, result) {
		if (error) {
			refundPeer(aa_address, amount, "refund for API error");
			return handle(error);
		} else
			return handle(null, result);
	})

});

function refundPeer(aa_address, amount, reason) {
	channels.sendMessageAndPay(aa_address, reason, amount, function(error) {
		if (error)
			console.error("error when refunding payment " + error);
	});
}

//we print the price list that has to be given to clients
const obj = {};
for (var key in endPoints) {
	obj[key] = endPoints[key].price;
}
console.log(obj);