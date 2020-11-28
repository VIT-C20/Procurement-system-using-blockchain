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

type Document struct{
	documentTitle string `json: "documentTitle"`
	documentDescription string `json: "documentDescription"`
	documentLink string `json: "documentLink"`
}

type Tender struct{
	TenderKey string `json:"tenderKey"`
	Id  string `json:"id"`
	Status string `json:"status"`
	BidCount string `json: "bidCount"`
	Host string `json: "host"`
	OrgChain string `json: "orgChain"`
	TenderType string `json: "tenderType"`
	TenderCategory string `json: "tenderCategory"`
	PaymentMode string `json: "paymentMode"`
	NoCovers string `json: "noCovers"`
	TenderFee string `json: "tenderFee"`
	FeePayableTo string `json: "feePayableTo"`
	FeePayableAt string `json: "feePayableAt"`
	Title string `json:"title"`
	WorkDescription string `json:"workDescription"`
	ProductCategory string `json:"productCategory"`
	BidValidity string `json:"bidValidity"`
	PeriodOfWork string `json:"periodOfWork"`
	Location string `json:"locatiion"`
	Pincode string `json: "pincode"`
	BidOpeningDate string `json: "bidOpeningDate"`
	BidClosingDate string `json: "bidClosingDate"`
	ResultDate string `json: "resultDate"`
	PublishDate string `json: "publishDate"`
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
			TenderKey : "TENDER0",
			Id : "123456789",
			Status : "Open",
			BidCount : "0",
			Host : "1234exGovUserId",
			OrgChain : "Central Water and Power Research Station",
			TenderType : "Open Tender",
			TenderCategory : "Works",
			PaymentMode : "Offline",
			NoCovers : "2",
			TenderFee : "0.00",
			FeePayableTo : "PAO CWPRS PUNE",
			FeePayableAt : "Pune",
			Title : "Maintenance and up keeping of day to day activities for Pakal Dul H E Physical model at CWPRS Pune24",
			WorkDescription : "Maintenance and up keeping of day to day activities for Pakal Dul H E Physical model at CWPRS Pune24",
			ProductCategory : "Civil Works",
			BidValidity : "60",
			PeriodOfWork : "365",
			Location : "CWPRS Khadakwasla Pune",
			Pincode : "411024",
			BidOpeningDate : "03-Dec-2020 03:00 PM",
			BidClosingDate : "14-Dec-2020 03:00 PM",
			ResultDate : "15-Dec-2020 03:00 PM",
			PublishDate : "26-Nov-2020 06:00 PM",
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

func (s *SmartContract) addWinnerBidder(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

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

func (s *SmartContract) changeTenderDetail(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 21 {
		return shim.Error("Incorrect number of arguments. Expecting 20")
	}

	tenderAsBytes, _ := APIstub.GetState(args[0])
	tender := Tender{}

	json.Unmarshal(tenderAsBytes, &tender)
	// tender.WinnerBidder = args[1]

		tender.BidCount = args[1]
		tender.Status = args[2]
		tender.TenderType = args[3]
		tender.TenderCategory = args[4]
		tender.PaymentMode = args[5]
		tender.NoCovers = args[6]
		tender.TenderFee = args[7]
		tender.FeePayableTo = args[8]
		tender.FeePayableAt = args[9]
		tender.Title = args[10]
		tender.WorkDescription = args[11]
		tender.ProductCategory = args[12]
		tender.BidValidity = args[13]
		tender.PeriodOfWork = args[14]
		tender.Location = args[15]
		tender.Pincode = args[16]
		tender.BidOpeningDate = args[17]
		tender.BidClosingDate = args[18]
		tender.ResultDate = args[19]

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

	if len(args) != 24 {
		return shim.Error("Incorrect number of arguments. Expecting 11")
	}

	// var tender = Tender{Title: args[1], Model: args[2], Colour: args[3], Owner: args[4]}

	var tender = Tender{
		Id : args[1],
		Status : args[2],
		BidCount : args[3],
		Host : args[4],
		OrgChain : args[5],
		TenderType : args[6],
		TenderCategory : args[7],
		PaymentMode : args[8],
		NoCovers : args[9],
		TenderFee : args[10],
		FeePayableTo : args[11],
		FeePayableAt : args[12],
		Title : args[13],
		WorkDescription : args[14],
		ProductCategory : args[15],
		BidValidity : args[16],
		PeriodOfWork : args[17],
		Location : args[18],
		Pincode : args[19],
		BidOpeningDate : args[20],
		BidClosingDate : args[21],
		ResultDate : args[22],
		PublishDate : args[23],
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
