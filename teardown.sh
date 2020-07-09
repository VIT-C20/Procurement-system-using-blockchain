#$CHANNEL_NAME1=bidchannel
#$CHANNEL_NAME2=basicchannel

echo "----------Starting the teardown------------"

echo "------------Stopping the docker containers------------"
docker stop $(docker ps -a -q)

echo "------------Removing the artifacts------------."
rm -rf ./artifacts/channel/crypto-config/*
rm ./artifacts/channel/*.tx
rm ./artifacts/channel/genesis.block

echo "------------Removing channels.------------."
rm -rf ./channel-artifacts/*

echo "------------Removing the docker containers.------------"
docker rm $(docker ps -a -q)
