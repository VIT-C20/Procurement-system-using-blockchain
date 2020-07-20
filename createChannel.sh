export CORE_PEER_TLS_ENABLED=true
export ORDERER_CA=${PWD}/artifacts/channel/crypto-config/ordererOrganizations/tendersys.com/orderers/orderer.tendersys.com/msp/tlscacerts/tlsca.tendersys.com-cert.pem
export PEER0_ORG1_CA=${PWD}/artifacts/channel/crypto-config/peerOrganizations/bidder.tendersys.com/peers/peer0.bidder.tendersys.com/tls/ca.crt
export PEER0_ORG2_CA=${PWD}/artifacts/channel/crypto-config/peerOrganizations/gov.tendersys.com/peers/peer0.gov.tendersys.com/tls/ca.crt
export PEER0_ORG3_CA=${PWD}/artifacts/channel/crypto-config/peerOrganizations/bank.tendersys.com/peers/peer0.bank.tendersys.com/tls/ca.crt
export FABRIC_CFG_PATH=${PWD}/artifacts/channel/config/

export CHANNEL_NAME1=bidchannel
export CHANNEL_NAME2=basicchannel 

setGlobalsForOrderer(){
    export CORE_PEER_LOCALMSPID="OrdererMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/artifacts/channel/crypto-config/ordererOrganizations/tendersys.com/orderers/orderer.tendersys.com/msp/tlscacerts/tlsca.tendersys.com-cert.pem
    export CORE_PEER_MSPCONFIGPATH=${PWD}/artifacts/channel/crypto-config/ordererOrganizations/tendersys.com/users/Admin@tendersys.com/msp
    
}

setGlobalsForPeer0Org1(){
    export CORE_PEER_LOCALMSPID="BidderMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG1_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/artifacts/channel/crypto-config/peerOrganizations/bidder.tendersys.com/users/Admin@bidder.tendersys.com/msp
    export CORE_PEER_ADDRESS=localhost:7051
}

setGlobalsForPeer1Org1(){
    export CORE_PEER_LOCALMSPID="BidderMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG1_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/artifacts/channel/crypto-config/peerOrganizations/bidder.tendersys.com/users/Admin@bidder.tendersys.com/msp
    export CORE_PEER_ADDRESS=localhost:8051
    
}

setGlobalsForPeer0Org2(){
    export CORE_PEER_LOCALMSPID="GovMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG2_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/artifacts/channel/crypto-config/peerOrganizations/gov.tendersys.com/users/Admin@gov.tendersys.com/msp
    export CORE_PEER_ADDRESS=localhost:9051
    
}

setGlobalsForPeer1Org2(){
    export CORE_PEER_LOCALMSPID="GovMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG2_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/artifacts/channel/crypto-config/peerOrganizations/gov.tendersys.com/users/Admin@gov.tendersys.com/msp
    export CORE_PEER_ADDRESS=localhost:10051
    
}

setGlobalsForPeer2Org2(){
    export CORE_PEER_LOCALMSPID="GovMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG2_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/artifacts/channel/crypto-config/peerOrganizations/gov.tendersys.com/users/Admin@gov.tendersys.com/msp
    export CORE_PEER_ADDRESS=localhost:11051
    
}

setGlobalsForPeer3Org2(){
    export CORE_PEER_LOCALMSPID="GovMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG2_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/artifacts/channel/crypto-config/peerOrganizations/gov.tendersys.com/users/Admin@gov.tendersys.com/msp
    export CORE_PEER_ADDRESS=localhost:12051
    
}

setGlobalsForPeer0Org3(){
    export CORE_PEER_LOCALMSPID="BankMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG3_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/artifacts/channel/crypto-config/peerOrganizations/bank.tendersys.com/users/Admin@bank.tendersys.com/msp
    export CORE_PEER_ADDRESS=localhost:13051
}

createChannel1(){
	echo "-----------Channel 1 : Bid Channel------------"
	
    rm -rf ./channel-artifacts/*
    setGlobalsForPeer0Org1
    
    ./artifacts/channel/bin/peer channel create -o localhost:7050 -c $CHANNEL_NAME1 \
    --ordererTLSHostnameOverride orderer.tendersys.com \
    -f ./artifacts/channel/${CHANNEL_NAME1}.tx --outputBlock ./channel-artifacts/${CHANNEL_NAME1}.block \
    --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA
}

createChannel2(){
	
	echo "-----------Channel 2 : Basic Channel------------"
	
    # rm -rf ./channel-artifacts/*
    setGlobalsForPeer0Org1
    
    ./artifacts/channel/bin/peer channel create -o localhost:7050 -c $CHANNEL_NAME2 \
    --ordererTLSHostnameOverride orderer.tendersys.com \
    -f ./artifacts/channel/${CHANNEL_NAME2}.tx --outputBlock ./channel-artifacts/${CHANNEL_NAME2}.block \
    --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA
}

removeOldCrypto(){
    rm -rf ./api-1.4/crypto/*
    rm -rf ./api-1.4/fabric-client-kv-org1/*
    rm -rf ./api-2.0/org1-wallet/*
    rm -rf ./api-2.0/org2-wallet/*
}


joinChannel1(){
	
	echo "-----------Channel 1 : Bid Channel------------"
	
    setGlobalsForPeer0Org1
    ./artifacts/channel/bin/peer channel join -b ./channel-artifacts/$CHANNEL_NAME1.block
    
    setGlobalsForPeer1Org1
    ./artifacts/channel/bin/peer channel join -b ./channel-artifacts/$CHANNEL_NAME1.block
    
    setGlobalsForPeer0Org2
    ./artifacts/channel/bin/peer channel join -b ./channel-artifacts/$CHANNEL_NAME1.block
    
    setGlobalsForPeer1Org2
    ./artifacts/channel/bin/peer channel join -b ./channel-artifacts/$CHANNEL_NAME1.block

    setGlobalsForPeer2Org2
    ./artifacts/channel/bin/peer channel join -b ./channel-artifacts/$CHANNEL_NAME1.block

    setGlobalsForPeer3Org2
    ./artifacts/channel/bin/peer channel join -b ./channel-artifacts/$CHANNEL_NAME1.block

    # setGlobalsForPeer0Org3
    # ./artifacts/channel/bin/peer channel join -b ./channel-artifacts/$CHANNEL_NAME.block
    
}

joinChannel2(){

	echo "-----------Channel 2 : Basic Channel------------"

    setGlobalsForPeer0Org1
    ./artifacts/channel/bin/peer channel join -b ./channel-artifacts/$CHANNEL_NAME2.block
    
    setGlobalsForPeer1Org1
    ./artifacts/channel/bin/peer channel join -b ./channel-artifacts/$CHANNEL_NAME2.block
    
    setGlobalsForPeer0Org2
    ./artifacts/channel/bin/peer channel join -b ./channel-artifacts/$CHANNEL_NAME2.block
    
    setGlobalsForPeer1Org2
    ./artifacts/channel/bin/peer channel join -b ./channel-artifacts/$CHANNEL_NAME2.block

    setGlobalsForPeer2Org2
    ./artifacts/channel/bin/peer channel join -b ./channel-artifacts/$CHANNEL_NAME2.block

    setGlobalsForPeer3Org2
    ./artifacts/channel/bin/peer channel join -b ./channel-artifacts/$CHANNEL_NAME2.block

    setGlobalsForPeer0Org3
    ./artifacts/channel/bin/peer channel join -b ./channel-artifacts/$CHANNEL_NAME2.block
    
}

updateAnchorPeers1(){

	echo "-----------Channel 1 : Bid Channel------------"

     setGlobalsForPeer0Org1
     ./artifacts/channel/bin/peer channel update -o localhost:7050 --ordererTLSHostnameOverride orderer.tendersys.com -c $CHANNEL_NAME1 -f ./artifacts/channel/BidderMSPanchors_bidchannel.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA
    
     setGlobalsForPeer0Org2
     ./artifacts/channel/bin/peer channel update -o localhost:7050 --ordererTLSHostnameOverride orderer.tendersys.com -c $CHANNEL_NAME1 -f ./artifacts/channel/GovMSPanchors_bidchannel.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA
    

    # setGlobalsForPeer0Org1
    # ./artifacts/channel/bin/peer channel update -o localhost:7050 --ordererTLSHostnameOverride orderer.tendersys.com -c $CHANNEL_NAME -f ./artifacts/channel/BidderMSPanchors_basicchannel.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA
    
    # setGlobalsForPeer0Org2
    # ./artifacts/channel/bin/peer channel update -o localhost:7050 --ordererTLSHostnameOverride orderer.tendersys.com -c $CHANNEL_NAME -f ./artifacts/channel/GovMSPanchors_basicchannel.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA
    
    # setGlobalsForPeer0Org3
    # ./artifacts/channel/bin/peer channel update -o localhost:7050 --ordererTLSHostnameOverride orderer.tendersys.com -c $CHANNEL_NAME -f ./artifacts/channel/BankMSPanchors_basicchannel.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA
}

updateAnchorPeers2(){

	echo "-----------Channel 2 : Basic Channel------------"

    setGlobalsForPeer0Org1
    ./artifacts/channel/bin/peer channel update -o localhost:7050 --ordererTLSHostnameOverride orderer.tendersys.com -c $CHANNEL_NAME2 -f ./artifacts/channel/BidderMSPanchors_basicchannel.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA
    
    setGlobalsForPeer0Org2
    ./artifacts/channel/bin/peer channel update -o localhost:7050 --ordererTLSHostnameOverride orderer.tendersys.com -c $CHANNEL_NAME2 -f ./artifacts/channel/GovMSPanchors_basicchannel.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA
    
    setGlobalsForPeer0Org3
    ./artifacts/channel/bin/peer channel update -o localhost:7050 --ordererTLSHostnameOverride orderer.tendersys.com -c $CHANNEL_NAME2 -f ./artifacts/channel/BankMSPanchors_basicchannel.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA
}

# removeOldCrypto

createChannel1
joinChannel1
updateAnchorPeers1

createChannel2
joinChannel2
updateAnchorPeers2
