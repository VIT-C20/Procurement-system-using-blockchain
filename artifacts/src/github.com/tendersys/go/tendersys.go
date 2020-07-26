package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"github.com/hyperledger/fabric-chaincode-go/shim"
	sc "github.com/hyperledger/fabric-protos-go/peer"
	//"github.com/hyperledger/fabric/common/flogging"

	//"github.com/hyperledger/fabric-chaincode-go/pkg/cid"
)

type SmartContract struct {
}

// type Bidder struct {
// 	Id string `json:"id"`
// 	OrgName string `json:"orgName"`
// }

type Tender struct{
	Id    string `json:"id"`
	Title string `json:"title"`
	OrgChain string `json:"orgChain"`
	TenderRef string `json:"tenderRef"`
	WorkDescription string `json:"workDescription"`
	Location string `json:"locatiion"`
	ProductCategory string `json:"productCategory"`
	BidValidity string `json:"bidValidity"`
	PeriodOfWork string `json:"periodOfWork"`
	PublishDate string `json:"publishDate"`
	BidSubmissionStartDate string `json:"bidSubmissionStartDate"`
	BidSubmissionEndDate string `json:"bidSubmissionEndDate"`
	BidResultDate string `json:"bidResultDate"`
	WinnerBidder string `json:"winnerBidder"`
}

func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}


//This function just invokes different functions.
func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {

	function, args := APIstub.GetFunctionAndParameters()
	//logger.Infof("Function name is:  %d", function)
	//logger.Infof("Args length is : %d", len(args))

	switch function {
	case "queryTender":
		return s.queryTender(APIstub, args)
	case "initLedger":
		return s.initLedger(APIstub)
	case "createTender":
		return s.createTender(APIstub, args)
	case "queryAllTenders":
		return s.queryAllTenders(APIstub)
	case "changeTenderDetail":
		return s.changeTenderDetail(APIstub, args)
	case "getHistoryForAsset":
		return s.getHistoryForAsset(APIstub, args)
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
		Tender{
			Id: "1", 
			Title: "Enagement of agency for providing man power group c on job.........", 
			OrgChain:"AIIMS Nagpur", 
			TenderRef: "tender", 
			WorkDescription: "Enagement of agency for providing man power group c on job.........",
			Location: "Nagpur",
			ProductCategory: "Man Power Supply",
			BidValidity: "180_Days",
			PeriodOfWork: "365 Days",
			PublishDate: "Wed Oct 05 2011 20:18:00 GMT+0530",
			BidSubmissionStartDate: "Wed Oct 05 2011 20:18:00 GMT+0530",
			BidSubmissionEndDate: "Wed Oct 05 2011 20:18:00 GMT+0530",
			BidResultDate: "Wed Oct 05 2011 20:18:00 GMT+0530",
		},
		
	}

	i := 0
	for i < len(tenders) {
		tenderAsBytes, _ := json.Marshal(tenders[i])
		APIstub.PutState("TENDER"+strconv.Itoa(i), tenderAsBytes)
		i = i + 1
	}

	return shim.Success(nil)
}

func (s *SmartContract) changeTenderDetail(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	tenderAsBytes, _ := APIstub.GetState(args[0])
	tender := Tender{}

	json.Unmarshal(tenderAsBytes, &tender)
	tender.WinnerBidder = args[1]

	tenderAsBytes, _ = json.Marshal(tender)
	APIstub.PutState(args[0], tenderAsBytes)

	return shim.Success(tenderAsBytes)
}

func (s *SmartContract) queryAllTenders(APIstub shim.ChaincodeStubInterface) sc.Response {

	startKey := "TENDER0"
	endKey := "TENDER999"

	resultsIterator, err := APIstub.GetStateByRange(startKey, endKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing QueryResults
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")
		// Record is a JSON object, so we write as-is
		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- queryAllTenders:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

func (s *SmartContract) createTender(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 8 {
		return shim.Error("Incorrect number of arguments. Expecting 5")
	}

	// var tender = Tender{Title: args[1], Model: args[2], Colour: args[3], Owner: args[4]}

	var tender = Tender{
		Title: args[1],
		OrgChain: args[2],
		TenderRef: args[3],
		WorkDescription: args[4],
		Location: args[5],
		ProductCategory: args[6],
		BidValidity: args[7],
	}

	tenderAsBytes, _ := json.Marshal(tender)
	APIstub.PutState(args[0], tenderAsBytes)

	indexName := "owner~key"
	colorNameIndexKey, err := APIstub.CreateCompositeKey(indexName, []string{tender.OrgChain, args[0]})
	if err != nil {
		return shim.Error(err.Error())
	}
	value := []byte{0x00}
	APIstub.PutState(colorNameIndexKey, value)

	return shim.Success(tenderAsBytes)
}

func (t *SmartContract) getHistoryForAsset(stub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) < 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	tenderKey := args[0]

	resultsIterator, err := stub.GetHistoryForKey(tenderKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing historic values for the marble
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		response, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"TxId\":")
		buffer.WriteString("\"")
		buffer.WriteString(response.TxId)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Value\":")
		// if it was a delete operation on given key, then we need to set the
		//corresponding value null. Else, we will write the response.Value
		//as-is (as the Value itself a JSON marble)
		if response.IsDelete {
			buffer.WriteString("null")
		} else {
			buffer.WriteString(string(response.Value))
		}

		buffer.WriteString(", \"Timestamp\":")
		buffer.WriteString("\"")
		buffer.WriteString(time.Unix(response.Timestamp.Seconds, int64(response.Timestamp.Nanos)).String())
		buffer.WriteString("\"")

		buffer.WriteString(", \"IsDelete\":")
		buffer.WriteString("\"")
		buffer.WriteString(strconv.FormatBool(response.IsDelete))
		buffer.WriteString("\"")

		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- getHistoryForAsset returning:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

func main() {

	// Create a new Smart Contract
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}
