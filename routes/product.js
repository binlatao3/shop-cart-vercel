var express = require('express');
var router = express.Router();
const Product = require('../models/Product')
const User = require('../models/User')
const userCart = require('../models/userCart')

/* GET home page. */
router.get('/:id', function(req, res, next) {
    const error = req.flash('error') || ''
    // console.log(error)
    var id = (req.params.id).replace(/-/g,' ')
    var infoItem = []
    Product.find({name:{'$regex' : `^${id}$`, '$options' : 'i'}}).then((product) =>{
        if(product)
        {
            var arr = product.map(c => {
                infoItem.push({
                    id:c._id,
                    name:c.name,
                    number:c.number,
                    price:c.price,
                    date:c.date,
                    category:c.category,
                    desc:c.desc,
                    detail:c.detail ,
                    image:{
                        path:c.image.path,
                        name:c.image.name,
                        imageType:c.image.imageType
                    }
                })
            })

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

                            return res.render('product',{ 
                                infoUser:infoUser,
                                totalPrice:totalPrice,
                                totalNumber:totalNumber,
                                infoProduct:infoProduct,
                                infoItem,
                                error:error
                            })
                        }
                        else
                        {
                            return res.render('product',{
                                infoUser:infoUser,
                                infoItem,
                                error:error
                            });
                        }
                    }).catch((error) => {
                        console.log(error)
                    })
                })
            }
            else
            {
                return res.render('product',{
                    infoItem,
                    error:error
                });
            }
        }
        else
        {
            return res.render('product',{
            });
        }
    }).catch((error) => {
        console.log(error)
    })
});


router.post('/:id', function(req, res, next) {
    var username = req.session.user
    var body = req.body
    if(username)
    {
        if(parseInt(body.productNumber) > 9)
        {
            res.status(200).send({ code: '1',message:'Can only buy 10 items at a time' });
        }
        else
        {
            Product.findOne({name:body.productName}).then((p)=>{
                let cart = new userCart({
                    username:username,
                    carts:[
                        {
                            productName:body.productName,
                            productNumber:body.productNumber,
                            productPrice:p.price,
                            productImage:{
                                path:p.image.path,
                                name:p.image.name,
                                imageType:p.image.imageType
                            }
                        }
                    ]
                })
                userCart.findOne({username:username}).then((c) =>{
                    if(c)
                    {
                        let totalNumber = c.carts.reduce((accum,item) => accum + item.productNumber, 0) + parseInt(body.productNumber)
                        let totalPrice = c.carts.reduce((accum,item) => accum + item.productPrice * item.productNumber, 0) + 
                        parseInt(body.productNumber) * p.price
                        if(totalNumber > 10)
                        {
                            res.status(200).send({ code: '6',message:'Can only buy 10 items at a time' });
                        }
                        else
                        {
                            if (c.carts.filter(e => e.productName === body.productName).length > 0) {
                                let number = c.carts.find(e => e.productName === body.productName).productNumber
                                if(number > body.stockNumberLeft)
                                {
                                    res.status(200).send({ code: '7',message:"Can't buy more than the amount in stock" });
                                }
                                else
                                {
                                    userCart.updateOne({username:username,"carts.productName" :body.productName},{"carts.$.productNumber": parseInt(number + parseInt(body.productNumber))}).then((cp)=>{
                                        res.status(200).send({ code: '4',message:'Success add to cart' ,productName:body.productName,productNumber:parseInt(number + parseInt(body.productNumber)),totalNumber:totalNumber,
                                        totalPrice:totalPrice});
                                    }).catch((err)=>{
                                        console.log(err) 
                                    })     
                                }
                            }
                            else
                            {
                                let newCart ={
                                    productName:body.productName,
                                    productNumber:body.productNumber,
                                    productPrice:p.price,
                                    productImage:{
                                        path:p.image.path,
                                        name:p.image.name,
                                        imageType:p.image.imageType
                                    }
                                }
                                userCart.updateOne({username:username},{ $push:{"carts":newCart}}).then(()=>{
                                    res.status(200).send({ code: '5',message:'Success add to cart' ,newCart:newCart,totalNumber:totalNumber,
                                    totalPrice:totalPrice});
                                }).catch((err)=>{
                                    console.log(err) 
                                })     
                            }
                        }
                    }
                    else
                    {
                        cart.save().then(()=>{
                            res.status(200).send({ code: '3',message:'Success add to cart' ,cart:cart.carts});
                        }).catch((err)=>{
                            console.log(err) 
                        })      
                    }
                }).catch((err)=>{
                    console.log(err) 
                }) 
            })
        }
    }
    else
    {
        res.status(200).send({ code: '0',message:'Need to login' });
    }
});


module.exports = router;