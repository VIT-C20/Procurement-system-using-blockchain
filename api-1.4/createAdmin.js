const blockchain = require('./blockchain');

async function main() {
    try{
        const gov = await blockchain.mainBlockchainUser("dummyUser", "Gov");
        console.log(gov)
        const bidder = await blockchain.mainBlockchainUser("dummyUser", "Bidder");
        console.log(bidder)
    }
    catch(err) {
        console.log(err)
    }
}

main()
