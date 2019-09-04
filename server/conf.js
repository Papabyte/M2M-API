exports.bServeAsHub = false;
exports.bLight = true;
exports.bSingleAddress = true;

exports.WS_PROTOCOL = "wss://";
exports.hub = process.env.testnet ? 'obyte.org/bb-test' : 'obyte.org/bb';
exports.deviceName = 'API server';
exports.permanent_pairing_secret = '0000';
exports.control_addresses = [''];

exports.minChannelTimeoutInSecond = 600;
exports.maxChannelTimeoutInSecond = 1000;
exports.defaultTimeoutInSecond = 900;

exports.unconfirmedAmountsLimitsByAssetOrChannel = {
	"base" : {
		max_unconfirmed_by_asset : 1e6,
		max_unconfirmed_by_channel : 1e6,
		minimum_time_in_second : 5
	}
}

exports.isHighAvaibilityNode =  false;

exports.enabledReceivers = ['obyte-messenger'];

console.log('finished API server conf');
