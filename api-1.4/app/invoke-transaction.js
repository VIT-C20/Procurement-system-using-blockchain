'use strict';
var util = require('util');
var axios = require('axios').default
var helper = require('./helper.js');
// var logger = helper.getLogger('invoke-chaincode');


var invokeChaincode = async function (peerNames, channelName, chaincodeName, fcn, args, username, org_name) {
	console.log(util.format('\n============ invoke transaction on channel %s ============\n', channelName));
	var error_message = null;
	var tx_id_string = null;
	try {
		// first setup the client for this org
		console.log(org_name, username)
		var client = await helper.getClientForOrg(org_name, username);
		console.log('Successfully got the fabric client for the organization "%s"', org_name);
		var channel = client.getChannel(channelName);
		if (!channel) {
			let message = util.format('Channel %s was not defined in the connection profile', channelName);
			console.error(message);
			throw new Error(message);
		}
		var tx_id = client.newTransactionID();
		// will need the transaction ID string for the event registration later
		tx_id_string = tx_id.getTransactionID();
		var request = {
			targets: peerNames,
			chaincodeId: chaincodeName,
			fcn: fcn,
			args: args,
			chainId: channelName,
			txId: tx_id
		};
		let results = await channel.sendTransactionProposal(request);

		var proposalResponses = results[0];
		var proposal = results[1];

		var all_good = true;
		for (var i in proposalResponses) {
			let one_good = false;
			console.log("Logging proposal Responses", proposalResponses[i])
			if (proposalResponses && proposalResponses[i].response &&
				proposalResponses[i].response.status === 200) {
				one_good = true;
				console.info('invoke chaincode proposal was good');
			} else {
				console.error('invoke chaincode proposal was bad');
			}
			all_good = all_good & one_good;
		}

		if (all_good) {
			console.info(util.format(
				'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s',
				proposalResponses[0].response.status, proposalResponses[0].response.message,
				proposalResponses[0].response.payload, proposalResponses[0].endorsement.signature));

			// wait for the channel-based event hub to tell us
			// that the commit was good or bad on each peer in our organization
			var promises = [];
			let event_hubs = channel.getChannelEventHubsForOrg();
			event_hubs.forEach((eh) => {
				console.log('invokeEventPromise - setting up event');
				let invokeEventPromise = new Promise((resolve, reject) => {
					let event_timeout = setTimeout(() => {
						let message = 'REQUEST_TIMEOUT:' + eh.getPeerAddr();
						console.error(message);
						eh.disconnect();
					}, 50000);
					eh.registerTxEvent(tx_id_string, async (tx, code, block_num) => {
						console.info('The chaincode invoke chaincode transaction has been committed on peer %s', eh.getPeerAddr());
						console.info('Transaction %s has status of %s in blocl %s', tx, code, block_num);
						console.log('Getting transaction for transaction ID %s', tx)

						clearTimeout(event_timeout);

						if (code !== 'VALID') {
							let message = util.format('The invoke chaincode transaction was invalid, code:%s', code);
							console.error(message);
							reject(new Error(message));
						} else {
							let message = 'The invoke chaincode transaction was valid.';
							console.info(message);
							resolve(message);
						}
					}, (err) => {
						clearTimeout(event_timeout);
						console.error(err);
						reject(err);
					},

						{ unregister: true, disconnect: true }
					);
					eh.connect();
				});
				promises.push(invokeEventPromise);
			});

			var orderer_request = {
				txId: tx_id,
				proposalResponses: proposalResponses,
				proposal: proposal
			};
			var sendPromise = channel.sendTransaction(orderer_request);
			// put the send to the orderer last so that the events get registered and
			// are ready for the orderering and committing
			promises.push(sendPromise);
			let results = await Promise.all(promises);
			console.log(util.format('------->>> R E S P O N S E : %j', results));
			let response = results.pop(); //  orderer results are last in the results
			if (response.status === 'SUCCESS') {
				console.info('Successfully sent transaction to the orderer.');
			} else {
				error_message = util.format('Failed to order the transaction. Error code: %s', response.status);
				console.log(error_message);
			}

			// now see what each of the event hubs reported
			for (let i in results) {
				let event_hub_result = results[i];
				let event_hub = event_hubs[i];
				console.log('Event results for event hub :%s', event_hub.getPeerAddr());
				if (typeof event_hub_result === 'string') {
					console.log(event_hub_result);
				} else {
					if (!error_message) error_message = event_hub_result.toString();
					console.log(event_hub_result.toString());
				}
			}
		} else {
			error_message = util.format('Failed to send Proposal and receive all good ProposalResponse');
			console.log(error_message);
		}
	} catch (error) {
		console.error('Failed to invoke due to error: ' + error.stack ? error.stack : error);
		error_message = error.toString();
	}

	if (!error_message) {
		let message = util.format(
			'Successfully invoked the chaincode %s to the channel \'%s\' for transaction ID: %s',
			org_name, channelName, tx_id_string);
		console.info(message);

		return { "tx_id": tx_id_string };
	} else {
		let message = util.format('Failed to invoke chaincode. cause:%s', error_message);
		console.error(message);
		throw new Error(message);
	}
};



exports.invokeChaincode = invokeChaincode;
