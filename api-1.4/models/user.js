var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var licenseSchema = new Schema({
    licenseTitle: {
        type: String,
        required: true
    },
    licenseIssuedBy: {
        type: String,
        required: true
    },
    licenseIssuedDate: {
        type: String,
        required: true
    },
    licenseExpiryDate: {
        type: String,
        default: 'no expiry'
    },
    licenseLink: {
        type: String,
    }
});

var workExpSchema = new Schema({
    workTitle: {
        type: String,
        required: true
    },
    workDescription: {
        type: String,
        default: ''
    }
})

var User = new Schema({
    companyEmail: {
        type: String,
        required: true,
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/]
    },
    orgName: {
        type: String,
        default: ''
    },
    orgDescription: {
        type: String,
        default: ''
    },
    workExperience: [ workExpSchema ],
    licenses: [ licenseSchema ],
    // admin:  {
    //     type: Boolean,
    //     default: false
    // },
    role: {
        type: String,
        default: 'Bidder',// Gov Bidder
    },
    blockchainAccess: {
        type: Boolean,
        default: false
    },
    address: {
        type: String,
        default: ''
    },
    city: {
        type: String,
        default:''
    },
    state: {
        type: String,
        default: ''
    },
    postalCode: {
        type: String,
        default: ''
    },
    contactName: {
        type: String,
        default: ''
    },
    designation: {
        type: String,
        default: '',
    },
    contactNo: {
        type: String,
        default: ''
    },
    PANno: {
        type: String,
        default: ''
    },
    establishedDate: {
        type: String,
        default: ''
    },
    OTP: {
        type: String,
        default: ''
    },
    expiryOTP: {
        type: String,
        default: ''
    }
    // accessTender: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Tender'
    // }]
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);