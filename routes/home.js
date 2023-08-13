const express = require('express')
const router = express.Router()
const Product = require('../models/Product')
const getTime = require('../public/js/getTime')
const User = require('../models/User')
const userCart = require('../models/userCart')
const getData = require('./getData')
const checkUser = require('../middleware/auth/checkUser')

router.get('/',(req,res,next) => {
    var newLap = []
    var newPhone = []
    var newCam = []
    var listCart = []
    var typeList = []
    Product.find({}).then((product) =>{
        if(product)
        {
            var arr = product.map(c => {

                var index = typeList.findIndex(e => e.type === c.category);
                if (index === -1) {
                    typeList.push({
                        type: c.category,
                    });
                }
                if(c.category === 'Laptop')
                    if(newLap.length < 5)
                    {
                        newLap.push({
                            id:c._id,
                            name:c.name,
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
                        newLap.sort(function(a,b){
                            return new Date(b.date) - new Date(a.date);
                        });
                    }
                if(c.category === 'Smartphone')
                    if(newPhone.length < 5)
                    {
                        newPhone.push({
                            id:c._id,
                            name:c.name,
                            price:c.price,
                            date:c.date,
                            category:c.category,
                            desc:c.text,
                            detail:c.detail ,
                            image:{
                                path:c.image.path,
                                name:c.image.name,
                                imageType:c.image.imageType
                            },
                            totalSold:c.totalSold
                        })
                        newPhone.sort(function(a,b){
                            return new Date(b.date) - new Date(a.date);
                        });
                    }
                if(c.category === 'Camera')
                    if(newCam.length < 5)
                    {
                        newCam.push({
                            id:c._id,
                            name:c.name,
                            price:c.price,
                            date:c.date,
                            category:c.category,
                            desc:c.text,
                            detail:c.detail ,
                            image:{
                                path:c.image.path,
                                name:c.image.name,
                                imageType:c.image.imageType
                            }
                        })
                        newCam.sort(function(a,b){
                            return new Date(b.date) - new Date(a.date);
                        });
                    }
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
                            getData.getTotalPriceAndNumber(c.carts).then(result => {
                                const { infoProduct, totalPrice, totalNumber } = result;
        
                                return res.render('index',{ 
                                    infoUser:infoUser,
                                    totalPrice:totalPrice,
                                    totalNumber:totalNumber,
                                    infoProduct:infoProduct,
                                    newLap,
                                    newPhone,
                                    newCam,
                                    typeList
                                })
                            })
                            .catch(error => {
                                console.error(error);
                            });
                        }
                        else
                        {
                            return res.render('index',{
                                infoUser:infoUser,
                                newLap,
                                newPhone,
                                newCam,
                                typeList
                            });
                        }
                    }).catch((error) => {
                        console.log(error)
                    })
                })
            }
            else
            {
                return res.render('index',{
                    newLap,
                    newPhone,
                    newCam,
                    typeList
                });
            }
        }
    }).catch((error) => {
        console.log(error)
    })
})

router.post('/',async function(req, res, next) {
    if(Object.keys(req.body).length !== 0)
    {
        let body = req.body
        // console.log(req.body)
        if(req.session.user)
        {
            if(!body.action)
            {
                let keyword = body.item
                let category = body.category
                let infoProduct = await findProducts(keyword,category)
                res.status(200).send({ code: '3',infoProduct:infoProduct,keyword:keyword,category:category });
            }
            else
            {
                let username = req.session.user
                let productName = body.productName
                if(body.action === 'add')
                {
                    Product.findOne({name:body.productName}).then((p)=>{
                        let cart = new userCart({
                            username:username,
                            carts:[
                                {
                                    productName:body.productName,
                                    productNumber:body.productNumber,
                                    productPrice:body.productPrice,
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
                                let totalNumber = c.carts.reduce((accum,item) => accum + item.productNumber, 0)
                                let totalPrice = c.carts.reduce((accum,item) => accum + item.productPrice * item.productNumber, 0)
                                if(totalNumber > 9)
                                {
                                    res.status(200).send({ code: '1',message:'Can only buy 10 items at a time' });
                                }
                                else
                                {
                                    console.log(body.productNumber,p.number)
                                    if (c.carts.filter(e => e.productName === body.productName).length > 0) {
                                        let number = c.carts.find(e => e.productName === body.productName).productNumber
                                        if(body.productNumber > p.number)
                                        {
                                            res.status(200).send({ code: '7',message:"Can't buy more than the amount in stock" });
                                        }
                                        else
                                        {
                                            userCart.updateOne({username:username,"carts.productName" :body.productName},{"carts.$.productNumber": parseInt(number + 1)}).then((cp)=>{
                                                res.status(200).send({ code: '4',message:'Success add to cart' ,productName:body.productName,productNumber:parseInt(number + 1),totalNumber:totalNumber+1,
                                                totalPrice:totalPrice + parseInt(body.productPrice)});
                                            }).catch((err)=>{
                                                console.log(err) 
                                            })  
                                        }    
                                    }
                                    else if(body.productNumber > p.number)
                                    {
                                        res.status(200).send({ code: '7',message:"Can't buy more than the amount in stock" });
                                    }
                                    else
                                    {
                                        let newCart ={
                                            productName:body.productName,
                                            productNumber:body.productNumber,
                                            productPrice:body.productPrice,
                                            productImage:{
                                                path:p.image.path,
                                                name:p.image.name,
                                                imageType:p.image.imageType
                                            }
                                        }
                                        userCart.updateOne({username:username},{ $push:{"carts":newCart}}).then(()=>{
                                            res.status(200).send({ code: '5',message:'Success add to cart' ,newCart:newCart,totalNumber:totalNumber+1,
                                            totalPrice:totalPrice + parseInt(body.productPrice)});
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
                        })  
                    }).catch((err)=>{
                        console.log(err) 
                    }) 
                }
                if(body.action === 'delete')
                {
                    userCart.findOne({username:username}).then((c) =>{
                        if(c)
                        {
                            let totalNumber = c.carts.reduce((accum,item) => accum + item.productNumber, 0)
                            let totalPrice = c.carts.reduce((accum,item) => accum + item.productPrice * item.productNumber, 0)
                            
                            if(c.carts.filter(e => e.productName === body.productName).length > 0)
                            {
                                let nameToDelete = c.carts.find(e => e.productName === body.productName).productName
                                let numberToDelete  = c.carts.find(e => e.productName === body.productName).productNumber 
                                let priceToDelete  = c.carts.find(e => e.productName === body.productName).productPrice
                                console.log(nameToDelete,numberToDelete,priceToDelete)
                                userCart.updateOne({username:username},{ $pull: { carts: { productName: nameToDelete } } },{multi:true})
                                .then((cp) =>{
                                    res.status(200).send({ code: '0',message:'Delete success',productName:nameToDelete,totalNumber:totalNumber-numberToDelete
                                    ,totalPrice:totalPrice-(priceToDelete * numberToDelete)});
                                }).catch((err)=>{
                                    console.log(err) 
                                }) 
                            }
                        }
                    }).catch((err)=>{
                        console.log(err) 
                    }) 
                }
            }
        }
        else
        {
            if(!body.action)
            {
                let keyword = body.item
                let category = body.category
                let infoProduct = await findProducts(keyword,category)
                res.status(200).send({ code: '3',infoProduct:infoProduct,keyword:keyword,category:category });
            }
            else
            {
                res.status(200).send({ code: '2',message:'Need to login' });
            }
        }

    }
    else
    {
        res.status(200).send({ code: '0',message:'Something wrong' });
    }
 });
 
router.get('/user/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/')
})

function findProducts(keyword, category) {
    return new Promise((resolve, reject) => {
        if (keyword === '') {
            // Trả về giá trị rỗng nếu keyword là chuỗi rỗng
            resolve([]);
        } else {
            let query = {
                name: { $regex: keyword, $options: 'i' }
            };

            if (category.toLowerCase() !== 'all') {
                query.category = category;
            }

            Product.find(query).sort({ date: -1, _id: -1 })
                .then(products => {
                    let infoProduct = products.map(c => ({
                        id: c._id,
                        name: c.name,
                        price: c.price,
                        date: c.date,
                        category: c.category,
                        desc: c.desc,
                        detail: c.detail,
                        image: {
                            path: c.image.path,
                            name: c.image.name,
                            imageType: c.image.imageType
                        },
                        totalSold: c.totalSold
                    }));
                    resolve(infoProduct);
                })
                .catch(error => {
                    reject(error);
                });
        }
    });
}

    

module.exports = router