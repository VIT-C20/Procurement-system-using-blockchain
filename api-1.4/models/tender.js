const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// var ReportSchema = new Schema({
//     comment:  {
//         type: String,
//         required: true
//     },
//     // author:  {
//     //     type: mongoose.Schema.Types.ObjectId,
//     //     ref: 'User'
//     // }
// }, {
//     timestamps: true
// });


const tenderSchema = new Schema({
    tenderKey: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        required: true
    },
    documents: [{
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
    }],
    winnerBidder: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AppliedBidder'
    },
    bidCount: {
        type: Number,
        default: 0
    }
    // reports: [ ReportSchema ]
}, {
    timestamps: true
})

const Tenders = mongoose.model('Tender', tenderSchema);

module.exports = Tenders;