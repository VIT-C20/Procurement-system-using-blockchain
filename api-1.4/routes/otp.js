var express = require('express');
var router = express.Router();
const bodyParser = require("body-parser");
var User = require("../models/user");
var authenticate = require("../util/authenticate");
var cors = require('../util/cors');
router.use(bodyParser.json());
router.options('*', cors.corsWithOptions, (req, res) => {
  res.sendStatus(200);
})
const nodemailer = require('nodemailer')
const bcrypt = require('bcryptjs')

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SENDERMAIL,
    pass: process.env.PASSWORD
  }
})

router.get('/', cors.corsWithOptions, authenticate.verifyGov, async (req, res) => {
  try {
    console.log('in send otp')
    // return res.status(200).json('hello')
    const user = await User.findById(req.user._id)
    if (!user) {
        console.log('here')
        return res.status(404).json({message: 'User not found'})
    }
      const OTP = Math.floor(100000 + Math.random() * 900000).toString()
      console.log('otp generated')
    console.log('otp', OTP)
    const hashedOTP = await bcrypt.hash(OTP, 12)
    user.OTP = hashedOTP
    user.expiryOTP = Date.now() + 600000
      const updatedUser = await user.save()
      console.log(updatedUser)
    console.log(user.companyEmail)
    await transporter.sendMail({
      to: user.companyEmail,
      from: process.env.SENDERMAIL,
      subject: 'OTP Verification',
      html: `
        <h3>OTP: ${OTP}</h3>
        <h3>Valid for only 10 min.</h3>
      `
    })
    return res.status(200).json({message: 'OTP send to your registered company email'})
  }
  catch (err) {
      console.log(err)
    return res.status(400).json({message: 'Something went wrong'})
  }
})

module.exports = router