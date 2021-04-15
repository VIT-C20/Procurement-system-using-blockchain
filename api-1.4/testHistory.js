const blockchain = require('./blockchain');

async function main() {
    try{
        var payload = {
            chaincodeName: 'tendersys',
            channelName: 'bidchannel',
            args: ['TENDER33'],
            peers: ['peer0.gov.tendersys.com'],
            fcn: 'getHistoryForAsset'
        };
        const res = await blockchain.mainQueryChaincode(payload)
        console.log(res)
    }
    catch(err) {
        console.log(err)
    }
}

main()