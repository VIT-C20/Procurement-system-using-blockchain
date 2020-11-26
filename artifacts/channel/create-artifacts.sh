
# chmod -R 0755 ./crypto-config
# # Delete existing artifacts
# rm -rf ./crypto-config
# rm genesis.block mychannel.tx
# rm -rf ../../channel-artifacts/*

#Generate Crypto artifactes for organizations
./bin/cryptogen generate --config=./crypto-config.yaml --output=./crypto-config/



# System channel
SYS_CHANNEL="sys-channel"

# channel name defaults to "mychannel"
CHANNEL_NAME1="bidchannel"

echo $CHANNEL_NAME1

# Generate System Genesis block
./bin/configtxgen -profile OrdererGenesis -configPath . -channelID $SYS_CHANNEL  -outputBlock ./genesis.block


# Generate channel configuration block
./bin/configtxgen -profile BidChannel -configPath . -outputCreateChannelTx ./bidchannel.tx -channelID $CHANNEL_NAME1

echo "#######    Generating anchor peer update for Org1MSP  ##########"
./bin/configtxgen -profile BidChannel -configPath . -outputAnchorPeersUpdate ./BidderMSPanchors_bidchannel.tx -channelID $CHANNEL_NAME1 -asOrg BidderMSP

echo "#######    Generating anchor peer update for Org2MSP  ##########"
./bin/configtxgen -profile BidChannel -configPath . -outputAnchorPeersUpdate ./GovMSPanchors_bidchannel.tx -channelID $CHANNEL_NAME1 -asOrg GovMSP

# CHANNEL_NAME2="basicchannel"

# echo $CHANNEL_NAME2

# ./bin/configtxgen -profile BasicChannel -configPath . -outputCreateChannelTx ./basicchannel.tx -channelID $CHANNEL_NAME2

# echo "#######    Generating anchor peer update for Org1MSP  ##########"
# ./bin/configtxgen -profile BasicChannel -configPath . -outputAnchorPeersUpdate ./BidderMSPanchors_basicchannel.tx -channelID $CHANNEL_NAME2 -asOrg BidderMSP

# echo "#######    Generating anchor peer update for Org2MSP  ##########"
# ./bin/configtxgen -profile BasicChannel -configPath . -outputAnchorPeersUpdate ./GovMSPanchors_basicchannel.tx -channelID $CHANNEL_NAME2 -asOrg GovMSP

# echo "#######    Generating anchor peer update for Org3MSP  ##########"
# ./bin/configtxgen -profile BasicChannel -configPath . -outputAnchorPeersUpdate ./BankMSPanchors_basicchannel.tx -channelID $CHANNEL_NAME2 -asOrg BankMSP