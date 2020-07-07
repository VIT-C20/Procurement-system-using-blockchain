package main

import (
	//"bytes"
	"encoding/json"
	"fmt"
	"strconv"
	//"time"

	"github.com/hyperledger/fabric-chaincode-go/shim"
	sc "github.com/hyperledger/fabric-protos-go/peer"
	//"github.com/hyperledger/fabric/common/flogging"

	//"github.com/hyperledger/fabric-chaincode-go/pkg/cid"
)

type SmartContract struct {
}

type Tender struct{
	Id    string `json:"id"`
	Title string `json:"title"`
}

func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}

func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {

	function, args := APIstub.GetFunctionAndParameters()
	//logger.Infof("Function name is:  %d", function)
	//logger.Infof("Args length is : %d", len(args))

	switch function {
	case "queryTender":
		return s.queryTender(APIstub, args)
	case "initLedger":
		return s.initLedger(APIstub)
	
	default:
		return shim.Error("Invalid Smart Contract function name.")
	}

	// return shim.Error("Invalid Smart Contract function name.")
}

func (s *SmartContract) queryTender(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	tenderAsBytes, _ := APIstub.GetState(args[0])
	return shim.Success(tenderAsBytes)
}

func (s *SmartContract) initLedger(APIstub shim.ChaincodeStubInterface) sc.Response {
	
	tenders := []Tender{
		Tender{Id: "1", Title: "Tender1"},
		Tender{Id: "2", Title: "Tender2"},
	}

	i := 0
	for i < len(tenders) {
		tenderAsBytes, _ := json.Marshal(tenders[i])
		APIstub.PutState("TENDER"+strconv.Itoa(i), tenderAsBytes)
		i = i + 1
	}

	return shim.Success(nil)
}

func main() {

	// Create a new Smart Contract
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}
