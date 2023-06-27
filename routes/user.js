var express = require('express');
var router = express.Router();
const {validationResult} = require('express-validator')
const registerValidator = require('../middleware/validate/registerValidator')
const loginValidator = require('../middleware/validate/loginValidator')
const billingValidator = require('../middleware/validate/billingValidator')
const checkUser = require('../middleware/auth/checkUser')
const nodemailer = require('nodemailer');
const getTime = require('../public/js/getTime')

const Product = require('../models/Product')
const User = require('../models/User')
const userCart = require('../models/userCart')
const Bill = require('../models/Bill')


var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    service: 'gmail',
    secure: false,
    requireTLS: false,
    port: 25,
    auth: {
        user: "noreply.electroshop@gmail.com",
        pass: "gsqahfmkbwytmvro",
    }
});


/* GET home page. */
router.get('/login',checkUser(0), function(req, res, next) {
    const error = req.flash('error') || ''
    var user = req.session.user
    if(user){
        res.redirect('/');
    }
    else{
        res.render('user/login',{
            error:error,
        })
    }
});


router.post('/login', loginValidator,function(req, res, next) {
    let result = validationResult(req)
    let body = req.body
    if(result.errors.length === 0)
    {
        User.findOne({username: body.username}).then((user)=> {
            if(user)
            {
                if(body.password !== user.password)
                {
                    let message = 'Incorrect username or password'
                    req.flash('error',message)
                    return res.redirect('/user/login')
                }
                else
                {
                    req.session.user = body.username
                    return res.redirect('/') 
                }
            }
            {
                let message = 'Incorrect username or password'
                req.flash('error',message)
                return res.redirect('/user/login')
            }
        })
    }
    else
    {
        let messages = result.mapped()
        let message = ''
        for(m in messages)
        {
            message = messages[m].msg
            break
        }
        req.flash('error',message)
        res.redirect('/user/login')
    }
});

router.get('/register',function(req, res, next) {
    const error = req.flash('error') || ''
    const success = req.flash('success') || ''
    // var user = req.session.user
    // if(user){
    //     res.redirect('/');
    // }else{
    //     res.render('login')
    // };
    res.render('user/register',{
        error:error,
        success:success
    })
});

router.post('/register', registerValidator,function(req, res, next) {
    let result = validationResult(req)
    if(result.errors.length === 0)
    {
        let body = req.body
        console.log("True")
        let user = new User({
            fullname:body.fullname,
            username:body.username,
            email:body.email,
            password:body.password,
        })
        user.save().then(()=>{
            let success = "Register Success!"
            req.flash('success',success)
            res.redirect('/user/register')
        }).catch((err)=>{
            console.log(err) 
        })
    }
    else
    {
        let messages = result.mapped()
        let message = ''
        for(m in messages)
        {
            message = messages[m].msg
            break
        }
        req.flash('error',message)
        res.redirect('/user/register')
    }
});

router.get('/check-out',checkUser(1), function(req, res, next) {
    const error = req.flash('error') || ''
    var user = req.session.user
    var infoUser = []
    var infoProduct = []
    if(user)
    {

        User.find({username:user}).then((u) =>{
            var arr = u.map(c => {
                infoUser.push({
                    id:c._id,
                    fullname:c.fullname,
                    username:c.username
                })
            })
            userCart.findOne({username:user}).then((c) =>{
                if(c)
                {
                    let totalPrice = c.carts.reduce((accum,item) => accum + item.productPrice * item.productNumber, 0)
                    let totalNumber = c.carts.reduce((accum,item) => accum + item.productNumber, 0)
                    var arr = c.carts.map(ct => {
                        infoProduct.push({
                            productName:ct.productName,
                            productNumber:ct.productNumber,
                            productPrice:ct.productPrice,
                            productImage:{
                                path:ct.productImage.path,
                                name:ct.productImage.name,
                                imageType:ct.productImage.imageType
                            }
                        })
                    })
                    return res.render('user/checkout',{ 
                        infoUser:infoUser,
                        totalPrice:totalPrice,
                        totalNumber:totalNumber,
                        infoProduct:infoProduct,
                        error:error
                    })
                }
                else
                {
                    return res.render('user/checkout',{
                        infoUser:infoUser,
                        error:error
                    });
                }
            }).catch((error) => {
                console.log(error)
            })
        }).catch((error) => {
            console.log(error)
        })
    }
});

router.post('/check-out',checkUser(1),billingValidator, function(req, res, next) {
    let result = validationResult(req)
    if(result.errors.length === 0)
    {
        let body = req.body
        let user = req.session.user
        let infoItem = []
        let cities = { 0: "An Giang", 1: "Bắc Giang" , 2: "Bắc Kạn" , 3: "Bạc Liêu" , 4: "Bắc Ninh" , 5: "Bà Rịa-Vũng Tàu" , 
        6: "Bến Tre" , 7: "Bình Định" , 8: "Bình Dương" , 9: "Bình Phước" , 10: "Bình Thuận" , 11: "Cà Mau" , 12: "Cao Bằng" 
        , 13: "Đắc Lắk" , 14: "Đắc Nông" , 15: "Điện Biên" , 16: "Đồng Nai" , 17: "Đồng Tháp" , 18: "Gia Lai" ,
         19: "Hà Giang" , 20: "Hải Duong" , 21: "Hà Nam" , 22: "Hà Tây" , 23: "Hà Tĩnh" , 24: "Hậu Giang" , 
         25: "Hòa Bình" , 26: "Hưng Yên" , 27: "Khánh Hòa" , 28: "Kiên Giang" , 29: "Kon Tum" , 30: "Lai Châu" , 
         31: "Lam Dong" , 32: "Lang Son" , 33: "Lao Cai" , 34: "Long An" , 35: "Nam Dinh" , 36: "Nghệ An" , 37: "Ninh Bình" , 
         38: "Ninh Thuận" , 39: "Phú Thọ" , 40: "Phú Yên" , 41: "Quảng Bình" , 42: "Quảng Nam" , 43: "Quảng Ngải" , 
         44: "Quảng Ninh" , 45: "Quảng Trị" , 46: "Sóc Trăng" , 47: "Sơn La" , 48: "Tây Ninh", 49: "Thái Bình" , 
         50: "Thái Nguyen" , 51: "Thanh Hóa" , 52: "Thừa Thiên-Huế" , 53: "Tiền Giang" , 54: "Trà Vinh", 55: "Tuyên Quang" ,
         56: "Vĩnh Long" , 57: "Vĩnh Phuc" , 58: "Yên Bái" , 59: "Cần Thơ" , 60: "Đà Nẵng" , 61: "Hải Phòng" , 62: "Hà Nội" , 
         63: "Hồ Chí Minh" }

        userCart.findOne({username:user}).then((c) =>{
            if(c)
            {
                totalPrice = c.carts.reduce((accum,item) => accum + item.productPrice * item.productNumber, 0)
                totalNumber = c.carts.reduce((accum,item) => accum + item.productNumber, 0)
                var arr = c.carts.map(ct => {
                    infoItem.push({
                        productName:ct.productName,
                        productNumber:ct.productNumber,
                        productPrice:ct.productPrice,
                        productImage:{
                            path:ct.productImage.path,
                            name:ct.productImage.name,
                            imageType:ct.productImage.imageType
                        }
                    })
                })
                User.findOne({username:user}).then((u) =>{
                    if(u)
                    {
                        var method;
                        const loopProductInfor = (infoItem) => {
                            let loopdata =''
                            if(infoItem)
                            {
                                infoItem.forEach(c => {
                                    loopdata+=`
                                    <tr>
                                       <td style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding: 15px 10px 5px 10px;" width="75%" align="left">${c.productNumber}x ${c.productName} </td>
                                       <td style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding: 15px 10px 5px 10px;" width="25%" align="left"> $${addDos(c.productPrice)} </td>
                                    </tr>
                                   `;
                                })
                                return loopdata
                            }
                        };

                        var creditCardBill = body.creditCardBill
                        var dateBill = body.dateBill

                        const PayMethod = (creditCardBill,dateBill) => {
                            if(creditCardBill && dateBill)
                            {
                                method = 'Paypal System'
                            }
                            else
                            {
                                method = 'Direct Payment'
                            }
                            return method
                        };

                        let html = `<!DOCTYPE html>
                            <html>
                            <head>
                                <title></title>
                                <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                                <meta name="viewport" content="width=device-width, initial-scale=1">
                                <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                                <style type="text/css">
                                    body,
                                    table,
                                    td,
                                    a {
                                    -webkit-text-size-adjust: 100%;
                                    -ms-text-size-adjust: 100%;
                                    }
                                    table,
                                    td {
                                    mso-table-lspace: 0pt;
                                    mso-table-rspace: 0pt;
                                    }
                                    img {
                                    -ms-interpolation-mode: bicubic;
                                    }
                                    img {
                                    border: 0;
                                    height: auto;
                                    line-height: 100%;
                                    outline: none;
                                    text-decoration: none;
                                    }
                                    table {
                                    border-collapse: collapse !important;
                                    }
                                    body {
                                    height: 100% !important;
                                    margin: 0 !important;
                                    padding: 0 !important;
                                    width: 100% !important;
                                    }
                                    a[x-apple-data-detectors] {
                                    color: inherit !important;
                                    text-decoration: none !important;
                                    font-size: inherit !important;
                                    font-family: inherit !important;
                                    font-weight: inherit !important;
                                    line-height: inherit !important;
                                    }
                                    @media screen and (max-width: 480px) {
                                    .mobile-hide {
                                    display: none !important;
                                    }
                                    .mobile-center {
                                    text-align: center !important;
                                    }
                                    }
                                    div[style*="margin: 16px 0;"] {
                                    margin: 0 !important;
                                    }
                                </style>
                            <body style="margin: 0 !important; padding: 0 !important; background-color: #eeeeee;" bgcolor="#eeeeee">
                                <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: Open Sans, Helvetica, Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
                                    For what reason would it be advisable for me to think about business content? That might be little bit risky to have crew member like them.
                                </div>
                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                        <td align="center" style="background-color: #eeeeee;" bgcolor="#eeeeee">
                                        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
                                            <tr>
                                                <td align="center" style="padding: 35px 35px 20px 35px; background-color: #ffffff;" bgcolor="#ffffff">
                                                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
                                                    <tr>
                                                        <td align="center" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding-top: 25px;">
                                                            <img src="https://img.icons8.com/carbon-copy/100/000000/checked-checkbox.png" width="125" height="120" style="display: block; border: 0px;" /><br>
                                                            <h2 style="font-size: 30px; font-weight: 800; line-height: 36px; color: #333333; margin: 0;"> Thank You For Your Order! </h2>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding-top: 10px;">
                                                            <p style="font-size: 16px; font-weight: 400; line-height: 24px; color: #777777;"> Dear ${u.fullname},This is your invoice information. If there are any errors, please contact us.</p>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td align="left" style="padding-top: 20px;">
                                                            <table cellspacing="0" cellpadding="0" border="0" width="100%">
                                                                <tr>
                                                                <td width="75%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;"> Order Confirmation</td>
                                                                <td width="25%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;"> ${getTime.getDate()} </td>
                                                                </tr>
                                                                ${loopProductInfor(infoItem)}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td align="left" style="padding-top: 20px;">
                                                            <table cellspacing="0" cellpadding="0" border="0" width="100%">
                                                                <tr>
                                                                <td width="75%" align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px; border-top: 3px solid #eeeeee; border-bottom: 3px solid #eeeeee;"> TOTAL </td>
                                                                <td width="25%" align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px; border-top: 3px solid #eeeeee; border-bottom: 3px solid #eeeeee;"> $${addDos(totalPrice)} </td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td align="center" height="100%" valign="top" width="100%" style="padding: 0 35px 35px 35px; background-color: #ffffff;" bgcolor="#ffffff">
                                                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:660px;">
                                                    <tr>
                                                        <td align="center" valign="top" style="font-size:0;">
                                                            <div style="display:inline-block; max-width:50%; min-width:240px; vertical-align:top; width:100%;">
                                                                <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:300px;">
                                                                <tr>
                                                                    <td align="left" valign="top" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px;">
                                                                        <p style="font-weight: 800;">Delivery Address</p>
                                                                        <p>${body.addressBill}<br>${cities[body.cityBill]}<br></p>
                                                                    </td>
                                                                </tr>
                                                                </table>
                                                            </div>
                                                            <div style="display:inline-block; max-width:50%; min-width:240px; vertical-align:top; width:100%;">
                                                                <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:300px;">
                                                                <tr>
                                                                    <td align="left" valign="top" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px;">
                                                                        <p style="font-weight: 800;">Payment Method</p>
                                                                        <p>${PayMethod(creditCardBill,dateBill)}</p>
                                                                    </td>
                                                                </tr>
                                                                </table>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                        </td>
                                    </tr>
                                </table>
                            </body>
                            </html>`

                            
                        if(body.emailBill)
                        {
                            var mailOptions = {
                                from: 'Electro Shop <noreply.electroshop@gmail.com>',
                                to: body.emailBill,
                                subject: `Order From Electro Shop`,
                                html:html
                            };

                            if(body.creditCardBill && body.dateBill)
                            {
                                let bill = new Bill({
                                    username:user,
                                    address:body.addressBill,
                                    city:cities[body.cityBill],
                                    emailReceive:body.emailBill,
                                    dateCreate: new Date(),
                                    telephone:body.telBill,
                                    notes:body.notesBill,
                                    methodPay:"Paypal System",
                                    carts:infoItem,
                                    totalNumber:totalNumber,
                                    totalPrice:totalPrice,
                                })

                                bill.save().then(()=>{
                                    userCart.deleteOne({username:user}).then()
                                    .catch((err)=>{
                                        console.log(err)
                                    })
                                    infoItem.map(p =>{
                                        Product.findOne({name:p.productName}).then((u) =>{
                                            Product.updateOne({name:u.name},{$set:{'number':parseInt(u.number - p.productNumber)}}).then()
                                            .catch((error)=>{
                                                console.log(error)
                                            })
                                        }).catch((error)=>{
                                            console.log(error)
                                        })
                                    })
                                    transporter.sendMail(mailOptions, function(error, info){
                                        if (error) {
                                            console.log(error);
                                        }
                                    });
                                    message = "We will send invoice information via email. Please check your mailbox"         
                                    req.flash('success',message)
                                    res.redirect('/user/pay-status')
                                }).catch((err)=>{
                                    console.log(err) 
                                })      
                            }
                            else
                            {
                                let bill = new Bill({
                                    username:user,
                                    address:body.addressBill,
                                    city:cities[body.cityBill],
                                    emailReceive:body.emailBill,
                                    dateCreate: new Date(),
                                    telephone:body.telBill,
                                    notes:body.notesBill,
                                    methodPay:"Direct Payment",
                                    carts:infoItem,
                                    totalNumber:totalNumber,
                                    totalPrice:totalPrice,
                                })

                                bill.save().then(()=>{
                                    userCart.deleteOne({username:user}).then().catch((err)=>{
                                        console.log(err)
                                    })
                                    infoItem.map(p =>{
                                        Product.findOne({name:p.productName}).then((u) =>{
                                            Product.updateOne({name:u.name},{$set:{'number':parseInt(u.number - p.productNumber)}}).then()
                                            .catch((error)=>{
                                                console.log(error)
                                            })
                                        }).catch((error)=>{
                                            console.log(error)
                                        })
                                    })
                                    transporter.sendMail(mailOptions, function(error, info){
                                        if (error) {
                                            console.log(error);
                                        }
                                    });
                                    message = "We will send invoice information via email. Please check your mailbox"
                                    req.flash('success',message)
                                    res.redirect('/user/pay-status')
                                }).catch((err)=>{
                                    console.log(err) 
                                })      
                            }
                        }
                        else
                        {
                            var mailOptions = {
                                from: 'Electro Shop <noreply.electroshop@gmail.com>',
                                to: u.email,
                                subject: `Order From Electro Shop`,
                                html:html
                            };
                            
                            if(body.creditCardBill && body.dateBill)
                            {
                                let bill = new Bill({
                                    username:user,
                                    address:body.addressBill,
                                    city:cities[body.cityBill],
                                    emailReceive:u.email,
                                    dateCreate: new Date(),
                                    telephone:body.telBill,
                                    notes:body.notesBill,
                                    methodPay:"Paypal System",
                                    carts:infoItem,
                                    totalNumber:totalNumber,
                                    totalPrice:totalPrice,
                                })
                                bill.save().then(()=>{
                                    userCart.deleteOne({username:user}).then().catch((err)=>{
                                        console.log(err)
                                    })
                                    infoItem.map(p =>{
                                        Product.findOne({name:p.productName}).then((u) =>{
                                            Product.updateOne({name:u.name},{$set:{'number':parseInt(u.number - p.productNumber)}}).then()
                                            .catch((error)=>{
                                                console.log(error)
                                            })
                                        }).catch((error)=>{
                                            console.log(error)
                                        })
                                    })
                                    transporter.sendMail(mailOptions, function(error, info){
                                        if (error) {
                                            console.log(error);
                                        }
                                    });
                                    message = "We will send invoice information via email. Please check your mailbox"
                                    req.flash('success',message)
                                    res.redirect('/user/pay-status')
                                }).catch((err)=>{
                                    console.log(err) 
                                })      
                            }
                            else
                            {
                                let bill = new Bill({
                                    username:user,
                                    address:body.addressBill,
                                    city:cities[body.cityBill],
                                    emailReceive:u.email,
                                    dateCreate: new Date(),
                                    telephone:body.telBill,
                                    notes:body.notesBill,
                                    methodPay:"Direct Payment",
                                    carts:infoItem,
                                    totalNumber:totalNumber,
                                    totalPrice:totalPrice,
                                })
                                bill.save().then(()=>{
                                    userCart.deleteOne({username:user}).then().catch((err)=>{
                                        console.log(err)
                                    })
                                    infoItem.map(p =>{
                                        Product.findOne({name:p.productName}).then((u) =>{
                                            Product.updateOne({name:u.name},{$set:{'number':parseInt(u.number - p.productNumber)}}).then()
                                            .catch((error)=>{
                                                console.log(error)
                                            })
                                        }).catch((error)=>{
                                            console.log(error)
                                        })
                                    })
                                    transporter.sendMail(mailOptions, function(error, info){
                                        if (error) {
                                            console.log(error);
                                        }
                                    });
                                    message = "We will send invoice information via email. Please check your mailbox"
                                    req.flash('success',message)
                                    res.redirect('/user/pay-status')
                                }).catch((err)=>{
                                    console.log(err) 
                                })      
                            }
                        }
                    }
                }).catch((err)=>{
                    console.log(err) 
                })     
            }
        })
        // let user = new User({
        //     fullname:body.fullname,
        //     username:body.username,
        //     email:body.email,
        //     password:body.password,
        // })
        // user.save().then(()=>{
        //     let success = "Register Success!"
        //     req.flash('success',success)
        //     res.redirect('/user/check-out')
        // }).catch((err)=>{
        //     console.log(err) 
        // })
    }
    else
    {
        let messages = result.mapped()
        let message = ''
        for(m in messages)
        {
            message = messages[m].msg
            break
        }
        req.flash('error',message)
        res.redirect('/user/check-out')
    }
});

router.get('/pay-status',checkUser(1),function(req, res, next) {
    const success = req.flash('success') || ''
    var user = req.session.user
    var infoUser = []
    var infoProduct = []
    if(user)
    {

        User.find({username:user}).then((u) =>{
            var arr = u.map(c => {
                infoUser.push({
                    id:c._id,
                    fullname:c.fullname,
                    username:c.username
                })
            })
            userCart.findOne({username:user}).then((c) =>{
                if(c)
                {
                    let totalPrice = c.carts.reduce((accum,item) => accum + item.productPrice * item.productNumber, 0)
                    let totalNumber = c.carts.reduce((accum,item) => accum + item.productNumber, 0)
                    var arr = c.carts.map(ct => {
                        infoProduct.push({
                            productName:ct.productName,
                            productNumber:ct.productNumber,
                            productPrice:ct.productPrice,
                            productImage:{
                                path:ct.productImage.path,
                                name:ct.productImage.name,
                                imageType:ct.productImage.imageType
                            }
                        })
                    })
                    return res.render('user/status',{ 
                        infoUser:infoUser,
                        totalPrice:totalPrice,
                        totalNumber:totalNumber,
                        infoProduct:infoProduct,
                        success:success
                    })
                }
                else
                {
                    return res.render('user/status',{
                        infoUser:infoUser,
                        success:success
                    });
                }
            }).catch((error) => {
                console.log(error)
            })
        }).catch((error) => {
            console.log(error)
        })
    }
});


function addDos(value)
{
	value += '';
	let x = value.split('.');
	let x1 = x[0];
	let x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + '.' + '$2'); // changed comma to dot here
	}
	return x1 + x2;
}


module.exports = router;