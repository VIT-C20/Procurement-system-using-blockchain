const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AppliedBidder = new Schema({
    tender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tender'
    },
    bidder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    bidDetails: {
        type: String,
        required: true
    },
    quotation: {
        type: Number,
        required: true,
    },
    SupportingDocuments: [
        {
            documentTitle: {
                type: String
            },
            documentDescription: {
                type: String,
                default: ''
            },
            documentLink: {
                type: String,
                default: ''
            }
        }
    ], 
}, {
    timestamps: true
});

const AppliedBidders = mongoose.model('AppliedBidder', AppliedBidder);

module.exports = AppliedBidders;