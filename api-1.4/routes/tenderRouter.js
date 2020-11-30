const express = require('express');
const tenderRouter = express.Router();
const bodyParser = require("body-parser");
const Tender = require("../models/tender");
const AppliedBidder = require('../models/appliedBidder');
const User = require("../models/user");
const authenticate = require("../util/authenticate");
const cors = require('../util/cors');
var blockchain = require('../blockchain');

tenderRouter.use(bodyParser.json());


tenderRouter.options('*', cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
})
// query all tender (WORKING)
tenderRouter.get("/", cors.corsWithOptions, (req, res) => {
    // ================== Blockchain func >>>> mainQueryChaincode ================
    // var payload = {
    //     chaincodeName: 'tendersys',
    //     channelName: 'bidchannel',
    //     args: ['TENDER0'],
    //     peers: ['peer0.gov.tendersys.com'],
    //     fcn: 'queryAllTenders'
    // };
    // blockchain.mainQueryChaincode(payload)
    // .then(blockchain_res => {
    //     if(blockchain_res.success && blockchain_res.success === false) {
    //         res.statusCode = 500;
    //         res.setHeader("Content-Type", "application/json");
    //         res.json(blockchain_res);
    //     }
    //     else {
    //         res.status(200).json(blockchain_res);
    //     }
    // })
    // .catch(err => res.status(500).json({error: 'Something went wrong! please try again'}));

    // ===========================================================================

    // ======================= For Testing ======================================= 
    Tender.find({}).populate('host')
        .then(
            tender => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(tender);
            }
        )
        .catch(err => res.status(500).json({error: 'Something went wrong, please try again!'}));
    // ===========================================================================
});

// query tender (WORKING)
tenderRouter.get('/:tenderId', cors.corsWithOptions, (req, res) => {
    // ================== Blockchain func >>>> mainQueryChaincode ================
    Tender.findById(req.params.tenderId)
        .then(
            tender => {
                if(tender) {
                    var payload = {
                        chaincodeName: 'tendersys',
                        channelName: 'bidchannel',
                        args: [tender.tenderKey],
                        peers: ['peer0.gov.tendersys.com'],
                        fcn: 'queryTender'
                    };
                    blockchain.mainQueryChaincode(payload)
                    .then(blockchain_res => {
                        if(blockchain_res.success && blockchain_res.success === false) {
                            res.statusCode = 500;
                            res.setHeader("Content-Type", "application/json");
                            res.json(blockchain_res);
                        }
                        else {
                            res.status(200).json({...blockchain_res, bidCount: tender.bidCount, documents: tender.documents, tenderKey: tender.tenderKey});
                        }
                    })
                }
                else {
                    res.status(404).json({error: 'Tender Not Found'})
                }
            }
        )
        .catch(err => res.status(404).json({error: 'Tender Not Found'}))
    // ===========================================================================

    // ======================= For Testing ======================================= 
    // Tender.findById(req.params.tenderId)
    //     .then(
    //         tender => {
    //         res.statusCode = 200;
    //         res.setHeader("Content-Type", "application/json");
    //         res.json(tender);
    //         }
    //     )
    //     .catch(err => res.status(500).json({error: 'Something went wrong, please try again!'}));
    // ===========================================================================
})

// query tender by owner
tenderRouter.get('/host/:hostId', cors.corsWithOptions, (req, res) => {
    // ================== Blockchain func >>>> mainQueryChaincode ================

    // ===========================================================================

    // ======================= For Testing ======================================= 
    Tender.find({ host: req.params.hostId }).populate('host')
        .then(
            tender => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(tender);
            }
        )
        .catch(err => res.status(500).json({error: 'Something went wrong, please try again!'}));
    // ===========================================================================
})

// query tender by owner 
tenderRouter.get('/winnerBidder/:winnerBidderId', cors.corsWithOptions, (req, res) => {
    // ================== Blockchain func >>>> mainQueryChaincode ================

    // ===========================================================================

    // ======================= For Testing ======================================= 
    Tender.find({winnerBidder: req.params.winnerBidderId})
        .then(
            tender => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(tender);
            }
        )
        .catch(err => res.status(500).json({error: 'Something went wrong, please try again!'}));
    // ===========================================================================
})

// invoke tender (WORKING)
tenderRouter.post('/', cors.corsWithOptions, authenticate.verifyGov, (req, res) => {
    // =================== verify req.body ========================
    if(!req.body.tenderKey) {
        res.status(500).json("Tender key Required!!!")
        return;
    }
    if(!req.body.title) {
        res.status(500).json("Title Required!!!")
        return;
    }
    if(!req.body.status) {
        res.status(500).json("Status Required!!!")
        return;
    }
    
    // TODO add more verification steps

    var payload ={
        tenderKey: req.body.tenderKey,
        title: req.body.title,
        host: req.user._id,
        status: req.body.status
    }
    if(req.body.documents) payload.documents = req.body.documents;
    // =============================================================================
    console.log(payload);
    Tender.find({tenderKey: req.body.tenderKey})
        .then(tender => {
            if(tender.length !== 0) {
                res.status(500).json('Tender key already in use!!');
                return;
            } 
            else {
                Tender.create(payload)
                    .then(tender => {
                        // ============== create payload ============================
                        console.log("from mongodb",tender)
                        var payloadForBlockchain = {
                            username: req.user.username,
                            orgName: req.user.role,
                            fcn: "createTender",
                            peers: ["peer0.bidder.tendersys.com", "peer0.gov.tendersys.com"],
                            chaincodeName: "tendersys",
                            channelName: "bidchannel",
                            args: new Array(
                                req.body.tenderKey,     
                                tender._id.toString(),  
                                req.body.status,
                                '0',
                                req.user._id.toString(),
                                req.body.orgChain,
                                req.body.tenderType,
                                req.body.tenderCategory,
                                req.body.paymentMode,
                                req.body.noCovers,
                                req.body.tenderFee,
                                req.body.feePayableTo,
                                req.body.feePayableAt,
                                req.body.title,
                                req.body.workDescription,
                                req.body.productCategory,
                                req.body.bidValidity,
                                req.body.periodOfWork,
                                req.body.location,
                                req.body.pincode,
                                req.body.bidOpeningDate,
                                req.body.bidClosingDate,
                                req.body.resultDate,
                                (new Date()).toISOString()
                            )
                        }
                        // ==========================================================
                        // console.log(tender);
                        // ================== Blockchain func >>>> mainInvokeChaincode ================
                        blockchain.mainInvokeChaincode(payloadForBlockchain)
                            .then(response => {
                                console.log(response);
                                if(response.success){
                                    res.status(200).json({blockchain_res:{...response}});
                                }else {
                                    tender.remove()
                                        .then(() => {
                                            res.status(500).json({
                                                blockchain_res: {...response},
                                                error: 'Tender not added'
                                            });
                                        })
                                }
                            })
                            .catch(err => console.log(err))
                        // ============================================================================
                        // res.status(200).json(tender);
                    })
            }
        })
        .catch(err => res.status(500).json({error: 'Something went Wrong!!!'}));
})
// invoke tender
tenderRouter.put('/:tenderId/addWinnerBidder', cors.corsWithOptions, authenticate.verifyGov, (req, res) => {
    if(!req.body.winnerBidderId) {
        res.status(404).json({error: 'Winner Bidder Id required!!'})
        return;
    }
    Tender.findById(req.params.tenderId)
        .then(tender => {
            if(tender) {
                if(tender.host.toString() === req.user._id.toString()) {
                    AppliedBidder.findById(req.body.winnerBidderId)
                    .then(appliedBid => {
                        // console.log(appliedBid);
                        // res.status(200).json('ok')
                        if(appliedBid) {
                            let payload = {
                                username: req.user.username,
                                orgName: req.user.role,
                                fcn: "addWinnerBidder",
                                peers: ["peer0.bidder.tendersys.com", "peer0.gov.tendersys.com"],
                                chaincodeName: "tendersys",
                                channelName: "bidchannel",
                                args: [
                                    tender.tenderKey,
                                    appliedBid.bidder.toString(),
                                    req.body.winnerBidderId
                                ]
                            }
                            // ================= Blockchain Func >>> mainInvokeChaincode =============
                            blockchain.mainInvokeChaincode(payload)
                            .then(blockchain_res => {
                                // res.status(200).json(blockchain_res)
                                if(blockchain_res.success) {
                                    tender.winnerBidder = appliedBid._id;
                                    tender.save()
                                    .then(tender => {
                                        res.status(200).json({tender, blockchain_res});
                                    })
                                }
                            })
                            .catch(err => console.log(err))
                            // =======================================================================

                            // tender.winnerBidder = appliedBid._id;
                            // tender.save()
                            //     .then(tender => {
                            //         res.status(200).json(tender);
                            //     })
                        }
                        else{
                            res.status(404).json({error: 'invalid Bidder'});
                        }
                    })
                }
                else {
                    res.status(500).json({error: 'You are not authorized'})
                    return;
                }
            }
            else {
                res.status(404).json({error: 'Tender Not Found'})
                return;
            }
        })
        .catch(err => res.status(500).json({error: 'Something went wrong'}));
})

tenderRouter.post('/:tenderId/applyBid', cors.corsWithOptions, authenticate.verifyBidder, (req, res) => {
    Tender.findById(req.params.tenderId)
        .then(tender => {
            console.log(tender);
            if(tender && tender.status === 'OPEN') {
                if(req.body.bidDetails && req.body.quotation) {
                    var payload = {
                        tender: req.params.tenderId,
                        bidder: req.user._id,
                        bidDetails: req.body.bidDetails,
                        quotation: req.body.quotation
                    };
                    if (req.body.documents) payload.SupportingDocuments = req.body.documents;
                    AppliedBidder.create(payload)
                        .then(appliedTender => {
                            tender.bidCount += 1;
                            tender.save()
                            .then(updatedTender => console.log(updatedTender))
                            res.status(200).json(appliedTender);
                        })
                }
                else {
                    res.status(404).json({error: 'Required fields are missing'});
                }
            }
            else {
                res.status(500).json({error: 'Tender is closed for Bid'});
            }
        })
        .catch(err => res.status(404).json({error: 'Tender not found'}));
})

tenderRouter.post('/:tenderId/addDocument', cors.corsWithOptions, authenticate.verifyGov, (req, res) => {
    Tender.findById(req.params.tenderId)
        .then((tender) => {
            if (tender != null) {
                tender.documents = tender.documents.concat(req.body);
                tender.save()
                    .then((tender) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(tender);
                    })
            }
            else {
                res.status(403).json({ error: 'Tender Not Found' })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(403).json({ error: 'Something went Wrong!!' })
        })
})

tenderRouter.delete('/:tenderId/documents/:documentId', cors.corsWithOptions, authenticate.verifyGov, (req, res) => {
    Tender.findById(req.params.tenderId)
        .then(tender => {
            const documents = tender.documents.id(req.params.documentId);
            if (documents) {
                documents.remove();
                tender.save()
                    .then(tender => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(tender);
                    })
            }
            else {
                res.status(403).json({ error: 'Tender Not Found' })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(403).json({ error: 'Something went Wrong!!' })
        })
})

tenderRouter.put("/:tenderId", cors.corsWithOptions, authenticate.verifyGov, (req, res) => {
    Tender.findById(req.params.tenderId)
    .then(tender => {
        
        let payload = {
            username: req.user.username,
            orgName: req.user.role,
            fcn: "changeTenderDetail",
            peers: ["peer0.bidder.tendersys.com", "peer0.gov.tendersys.com"],
            chaincodeName: "tendersys",
            channelName: "bidchannel",
            args: [
                tender.tenderKey,
                tender.bidCount.toString(),
                req.body.status,
                req.body.tenderType,
                req.body.tenderCategory,
                req.body.paymentMode,
                req.body.noCovers,
                req.body.tenderFee,
                req.body.feePayableTo,
                req.body.feePayableAt,
                req.body.title,
                req.body.workDescription,
                req.body.productCategory,
                req.body.bidValidity,
                req.body.periodOfWork,
                req.body.location,
                req.body.pincode,
                req.body.bidOpeningDate,
                req.body.bidClosingDate,
                req.body.resultDate,
            ]
        }
        blockchain.mainInvokeChaincode(payload)
        .then(blockchain_res => {
            // res.status(200).json(blockchain_res)
            if (blockchain_res.success) {
                if (req.body.title || req.body.status) {
                    if (req.body.title) tender.title = req.body.title
                    if (req.body.status) tender.status = req.body.status;
                    tender.save()
                        .then(tender => {
                            res.status(200).json({ tender, blockchain_res });
                        })
                }
                else {
                    res.status(200).json({ tender, blockchain_res });
                }
            }
            else {
                console.log(blockchain_res)
                res.status(500).json({ tender, blockchain_res });
            }
        })
        .catch(err => console.log(err))
    })
    .catch(err => res.status(404).json({error : 'tender not found'}))
});

tenderRouter.get('/:tenderId/getBids', cors.corsWithOptions, authenticate.verifyGov, (req, res) => {
    Tender.findById(req.params.tenderId)
        .then(tender => {
            if (tender) {
                if (tender.host.toString() === req.user._id.toString()) {
                    AppliedBidder.find({ tender: req.params.tenderId }).populate('bidder')
                        .then(biddersArr => {
                            if (biddersArr.length === 0) res.status(200).json('No Bids');
                            else res.status(200).json(biddersArr);
                        })
                } else {
                    res.status(403).json('You are not authorized')
                }
            } else {
                res.status(404).json('Tender not found')
            }
        })
        .catch(err => res.status(500).json('Something went wrong!!! Please try again'))
})

tenderRouter.get('/:tenderId/getBids/:bidId', cors.corsWithOptions,  (req, res) => {
    Tender.findById(req.params.tenderId)
        .then(tender => {
            if (tender) {
                AppliedBidder.findById(req.params.bidId).populate('bidder')
                .then(bid => {
                    res.status(200).json(bid)
                })
                .catch(err => res.status(400).json({error: 'Bid not found'}))
            } else {
                res.status(404).json('Tender not found')
            }
        })
        .catch(err => res.status(500).json('Something went wrong!!! Please try again'))
})

tenderRouter.get('/myBids/:bidderId', cors.corsWithOptions, authenticate.verifyBidder, (req, res) => {
    User.findById(req.params.bidderId)
    .then(bidder => {
        AppliedBidder.find({bidder: req.params.bidderId}).populate('bidder')
        .then(bids => {
            res.status(200).json(bids)
        })
    })
    .catch(err => res.status(404).json({error: 'Bidder Not Found'}))
})

tenderRouter.get('/:bidderId/myBids/:bidId', cors.corsWithOptions, authenticate.verifyBidder, (req, res) => {
    AppliedBidder.findById(req.params.bidId).populate('bidder')
    .then(bid => {
        if(req.params.bidderId === bid.bidder._id){
            res.status(200).json(bid)
        }
        else{
            res.status(401).json('Unauthorized')
        }
    })
    .catch(err => res.status(404).json('Bid Not Found'))
})

tenderRouter.get('/getHistory/:tenderId', cors.corsWithOptions, (req, res) => {
    // ================== Blockchain func >>>> mainQueryChaincode ================
    Tender.findById(req.params.tenderId)
        .then(
            tender => {
                if (tender) {
                    var payload = {
                        chaincodeName: 'tendersys',
                        channelName: 'bidchannel',
                        args: [tender.tenderKey],
                        peers: ['peer0.gov.tendersys.com'],
                        fcn: 'getHistoryForAsset'
                    };
                    blockchain.mainQueryChaincode(payload)
                        .then(blockchain_res => {
                            console.log(blockchain_res)
                            if (blockchain_res.success && blockchain_res.success === false) {
                                res.statusCode = 500;
                                res.setHeader("Content-Type", "application/json");
                                res.json(blockchain_res);
                            }
                            else {
                                res.status(200).json(blockchain_res);
                            }
                        })
                }
                else {
                    res.status(404).json({ error: 'Tender Not Found' })
                }
            }
        )
        .catch(err => res.status(404).json({ error: 'Tender Not Found' }))
    // ===========================================================================
})

module.exports = tenderRouter;