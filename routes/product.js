var express = require('express');
var router = express.Router();
const Product = require('../models/Product')
const User = require('../models/User')
const userCart = require('../models/userCart')
const Rating = require('../models/Rating')
const getTime = require('../public/js/getTime')

/* GET home page. */
router.get('/:id', function(req, res, next) {
    const error = req.flash('error') || ''
    // console.log(error)
    var id = (req.params.id).replace(/-/g,' ')
    var infoItem = []

    var perPage = 4
    , page = 0

    Rating.findOne({productName:{'$regex' : `^${id}$`, '$options' : 'i'}},{ "listReview": 1 }).then((rt) =>{
        if(rt.listReview.length == 0)
        {
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
                                        infoUser,
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
                                        infoUser,
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
        }
        else
        {
            let count = rt.listReview.length
            let totalPages = []
            let pageTotal = Math.ceil(count / perPage)
            let currentpage = page + 1

            let prevPage = currentpage <= 1 ? 1 : currentpage - 1
            let nextPage = currentpage >= pageTotal ? pageTotal : currentpage + 1

            let prevP = 1;
            let nextP = pageTotal;

            if (pageTotal <= 6) {
                for(var i = 1;i<=pageTotal;i++)
                {
                    totalPages.push(i)
                }
            }
            else
            {
                totalPages.push(1)

                if (currentpage > 3) {
                    totalPages.push("...");
                }

                if (currentpage == pageTotal) {
                    totalPages.push(currentpage - 2);
                }

                if (currentpage > 2) {
                    totalPages.push(currentpage - 1);
                }

                if (currentpage != 1 && currentpage != pageTotal) {
                    totalPages.push(currentpage);
                }

                if (currentpage < pageTotal - 1) {
                    totalPages.push(currentpage + 1);
                }
            
                // special case where first page is selected...
                if (currentpage == 1) {
                    totalPages.push(currentpage + 2);
                }
            
                //print "..." if currentPage is < lastPage -2
                if (currentpage < pageTotal - 2) {
                    totalPages.push("...");
                }
                totalPages.push(pageTotal)
            }

            let listReview = []
            var arr = rt.listReview.map(lt => {
                listReview.push({
                    userReview: lt.userReview,
                    reviewPost: lt.reviewPost,
                    rating: lt.rating,
                    date: lt.date
                })
            })
            let listReviewSlice = paginateArray(listReview,currentpage,perPage)
            let totalRating = calculateRatingCounts(listReview).reverse()
            let averageRating = calculateAverageRating(totalRating)
            let [integerPart, decimalPart] = separateDecimal(averageRating)
            // console.log(listReviewSlice)
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
                                        infoUser,
                                        totalPrice:totalPrice,
                                        totalNumber:totalNumber,
                                        infoProduct:infoProduct,
                                        infoItem,
                                        error:error,
                                        currentpage,
                                        totalPages,
                                        prevPage,
                                        nextPage,
                                        prevP,
                                        nextP,
                                        pageTotal,
                                        listReview:listReviewSlice,
                                        totalRating,
                                        averageRating,
                                        integerPart,
                                        decimalPart,
                                        count
                                    })
                                }
                                else
                                {
                                    return res.render('product',{
                                        infoUser,
                                        infoItem,
                                        error:error,
                                        currentpage,
                                        totalPages,
                                        prevPage,
                                        nextPage,
                                        prevP,
                                        nextP,
                                        pageTotal,
                                        listReview:listReviewSlice,
                                        totalRating,
                                        averageRating,
                                        integerPart,
                                        decimalPart,
                                        count
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
                            error:error,
                            currentpage,
                            totalPages,
                            prevPage,
                            nextPage,
                            prevP,
                            nextP,
                            pageTotal,
                            listReview:listReviewSlice,
                            totalRating,
                            averageRating,
                            integerPart,
                            decimalPart,
                            count
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
        }
    })
});

router.get('/:id/page/:page', function(req, res, next) {
    const error = req.flash('error') || ''
    // console.log(error)
    var id = (req.params.id).replace(/-/g,' ')
    var infoItem = []

    var perPage = 4
    , page = Math.max(0, req.params.page)

    Rating.findOne({productName:{'$regex' : `^${id}$`, '$options' : 'i'}},{ "listReview": 1 }).then((rt) =>{
        if(rt.listReview.length == 0)
        {
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
                                        infoUser,
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
                                        infoUser,
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
        }
        else
        {
            let count = rt.listReview.length
            let totalPages = []
            let pageTotal = Math.ceil(count / perPage)
            let currentpage = page

            let prevPage = currentpage <= 1 ? 1 : currentpage - 1
            let nextPage = currentpage >= pageTotal ? pageTotal : currentpage + 1

            let prevP = 1;
            let nextP = pageTotal;

            if (pageTotal <= 6) {
                for(var i = 1;i<=pageTotal;i++)
                {
                    totalPages.push(i)
                }
            }
            else
            {
                totalPages.push(1)

                if (currentpage > 3) {
                    totalPages.push("...");
                }

                if (currentpage == pageTotal) {
                    totalPages.push(currentpage - 2);
                }

                if (currentpage > 2) {
                    totalPages.push(currentpage - 1);
                }

                if (currentpage != 1 && currentpage != pageTotal) {
                    totalPages.push(currentpage);
                }

                if (currentpage < pageTotal - 1) {
                    totalPages.push(currentpage + 1);
                }
            
                // special case where first page is selected...
                if (currentpage == 1) {
                    totalPages.push(currentpage + 2);
                }
            
                //print "..." if currentPage is < lastPage -2
                if (currentpage < pageTotal - 2) {
                    totalPages.push("...");
                }
                totalPages.push(pageTotal)
            }

            let listReview = []
            var arr = rt.listReview.map(lt => {
                listReview.push({
                    userReview: lt.userReview,
                    reviewPost: lt.reviewPost,
                    rating: lt.rating,
                    date: lt.date
                })
            })
            let listReviewSlice = paginateArray(listReview,currentpage,perPage)
            let totalRating = calculateRatingCounts(listReview).reverse()
            let averageRating = calculateAverageRating(totalRating)
            let [integerPart, decimalPart] = separateDecimal(averageRating)
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
                                        infoUser,
                                        totalPrice:totalPrice,
                                        totalNumber:totalNumber,
                                        infoProduct:infoProduct,
                                        infoItem,
                                        error:error,
                                        currentpage,
                                        totalPages,
                                        prevPage,
                                        nextPage,
                                        prevP,
                                        nextP,
                                        pageTotal,
                                        listReview:listReviewSlice,
                                        totalRating,
                                        averageRating,
                                        integerPart,
                                        decimalPart,
                                        count
                                    })
                                }
                                else
                                {
                                    return res.render('product',{
                                        infoUser,
                                        infoItem,
                                        error:error,
                                        currentpage,
                                        totalPages,
                                        prevPage,
                                        nextPage,
                                        prevP,
                                        nextP,
                                        pageTotal,
                                        listReview:listReviewSlice,
                                        totalRating,
                                        averageRating,
                                        integerPart,
                                        decimalPart,
                                        count
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
                            error:error,
                            currentpage,
                            totalPages,
                            prevPage,
                            nextPage,
                            prevP,
                            nextP,
                            pageTotal,
                            listReview:listReviewSlice,
                            totalRating,
                            averageRating,
                            integerPart,
                            decimalPart,
                            count
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
        }
    })
});

router.post('/:id',  async function(req, res, next) {
    var username = req.session.user
    var body = req.body
    var perPage = 4
    , page = 0;
    var id = (req.params.id).replace(/-/g,' ')

    if(username)
    {
        if(body.productNumber)
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
            if(!body.rating)
            {
                res.status(200).send({ code: '11',message:'Please choose your rating' });
            }
            else
            {
                Product.exists({name:body.productName}).then((p) =>{
                    if(p)
                    {
                        Rating.exists({productName:body.productName}).then((r) =>{
                            if(r)
                            {
                                (async () => {
                                    let listReview = {
                                      userReview: await nameUser(username),
                                      reviewPost: body.postReview,
                                      rating: body.rating,
                                      date: formatDate()
                                    };
                  
                                    Rating.updateOne({ productName: body.productName }, { $push: { "listReview": listReview } }).then((p) => {
                                        if(p)
                                        {
                                            Rating.findOne({productName:{'$regex' : `^${id}$`, '$options' : 'i'}},{ "listReview": 1 }).then((rt) =>{
                                                let count = rt.listReview.length
                                                let totalPages = []
                                                let pageTotal = Math.ceil(count / perPage)
                                                let currentpage = page + 1
                                
                                                let prevPage = currentpage <= 1 ? 1 : currentpage - 1
                                                let nextPage = currentpage >= pageTotal ? pageTotal : currentpage + 1
                                
                                                let prevP = 1;
                                                let nextP = pageTotal;

                                                if (pageTotal <= 6) {
                                                    for(var i = 1;i<=pageTotal;i++)
                                                    {
                                                        totalPages.push(i)
                                                    }
                                                }
                                                else
                                                {
                                                    totalPages.push(1)

                                                    if (currentpage > 3) {
                                                        totalPages.push("...");
                                                    }

                                                    if (currentpage == pageTotal) {
                                                        totalPages.push(currentpage - 2);
                                                    }

                                                    if (currentpage > 2) {
                                                        totalPages.push(currentpage - 1);
                                                    }

                                                    if (currentpage != 1 && currentpage != pageTotal) {
                                                        totalPages.push(currentpage);
                                                    }

                                                    if (currentpage < pageTotal - 1) {
                                                        totalPages.push(currentpage + 1);
                                                    }
                                                
                                                    // special case where first page is selected...
                                                    if (currentpage == 1) {
                                                        totalPages.push(currentpage + 2);
                                                    }
                                                
                                                    //print "..." if currentPage is < lastPage -2
                                                    if (currentpage < pageTotal - 2) {
                                                        totalPages.push("...");
                                                    }
                                                    totalPages.push(pageTotal)
                                                }
                                
                                                let listReview = []
                                                var arr = rt.listReview.map(lt => {
                                                    listReview.push({
                                                        userReview: lt.userReview,
                                                        reviewPost: lt.reviewPost,
                                                        rating: lt.rating,
                                                        date: lt.date
                                                    })
                                                })
                                                let listReviewSlice = paginateArray(listReview,currentpage,perPage)
                                
                                                console.log(listReviewSlice)
                                                res.status(200).send({ code: '10', message: 'Comment Success' ,listReviewSlice,totalPages});
                                            })
                                        }
                                    });
                                })();
                            }
                        }).catch((err)=>{
                            console.log(err) 
                        }) 
                    }
                }).catch((err)=>{
                    console.log(err) 
                }) 
            }
        }
    }
    else
    {
        res.status(200).send({ code: '0',message:'Need to login' });
    }
});

router.post('/:id/page/:page',  async function(req, res, next) {
    var username = req.session.user
    var body = req.body

    var perPage = 4
    
    var id = (req.params.id).replace(/-/g,' ')

    if(username)
    {
        if(body.productNumber)
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
            Rating.findOne({productName:{'$regex' : `^${id}$`, '$options' : 'i'}},{ "listReview": 1 }).then((rt) =>{
                let count = rt.listReview.length
                let totalPages = []
                let pageTotal = Math.ceil(count / perPage)
                let currentpage = parseInt(req.params.page)

                let prevPage = currentpage <= 1 ? 1 : currentpage - 1
                let nextPage = currentpage >= pageTotal ? pageTotal : currentpage + 1

                let prevP = 1;
                let nextP = pageTotal;

                if (pageTotal <= 6) {
                    for(var i = 1;i<=pageTotal;i++)
                    {
                        totalPages.push(i)
                    }
                }
                else
                {
                    totalPages.push(1)

                    if (currentpage > 3) {
                        totalPages.push("...");
                    }

                    if (currentpage == pageTotal) {
                        totalPages.push(currentpage - 2);
                    }

                    if (currentpage > 2) {
                        totalPages.push(currentpage - 1);
                    }

                    if (currentpage != 1 && currentpage != pageTotal) {
                        totalPages.push(currentpage);
                    }

                    if (currentpage < pageTotal - 1) {
                        totalPages.push(currentpage + 1);
                    }
                
                    // special case where first page is selected...
                    if (currentpage == 1) {
                        totalPages.push(currentpage + 2);
                    }
                
                    //print "..." if currentPage is < lastPage -2
                    if (currentpage < pageTotal - 2) {
                        totalPages.push("...");
                    }
                    totalPages.push(pageTotal)
                }
                console.log(currentpage)
                console.log(totalPages)

                let listReview = []
                var arr = rt.listReview.map(lt => {
                    listReview.push({
                        userReview: lt.userReview,
                        reviewPost: lt.reviewPost,
                        rating: lt.rating,
                        date: lt.date
                    })
                })
                let listReviewSlice = paginateArray(listReview,currentpage,perPage)

                if(!body.rating && !body.currentpages && !body.nextpages && !body.totalpages)
                {
                    res.status(200).send({ code: '11',message:'Please choose your rating'});
                }
                else if(!body.rating && body.currentpages && body.nextpages && body.totalpages)
                {
                    res.status(200).send({ code: '50',totalPages,
                    prevPage,
                    nextPage,
                    prevP,
                    nextP,
                    pageTotal,
                    listReview:listReviewSlice});
                }
                else
                {
                    Product.exists({name:body.productName}).then((p) =>{
                        if(p)
                        {
                            Rating.exists({productName:body.productName}).then((r) =>{
                                if(r)
                                {
                                    (async () => {
                                        let listReview = {
                                        userReview: await nameUser(username),
                                        reviewPost: body.postReview,
                                        rating: body.rating,
                                        date: formatDate()
                                        };
                    
                                        Rating.updateOne({ productName: body.productName }, { $push: { "listReview": listReview } }).then(() => {
                                        res.status(200).send({ code: '10', message: 'Comment Success' });
                                        });
                                    })();
                                }
                            }).catch((err)=>{
                                console.log(err) 
                            }) 
                        }
                    }).catch((err)=>{
                        console.log(err) 
                    }) 
                }
            })
        }
    }
    else
    {
        Rating.findOne({productName:{'$regex' : `^${id}$`, '$options' : 'i'}},{ "listReview": 1 }).then((rt) =>{
            let count = rt.listReview.length
            let totalPages = []
            let pageTotal = Math.ceil(count / perPage)
            let currentpage = parseInt(req.params.page) + 1

            let prevPage = currentpage <= 1 ? 1 : currentpage - 1
            let nextPage = currentpage >= pageTotal ? pageTotal : currentpage + 1

            let prevP = 1;
            let nextP = pageTotal;
            for(var i = 1;i<=pageTotal;i++)
            {
                totalPages.push(i)
            }

            let listReview = []
            var arr = rt.listReview.map(lt => {
                listReview.push({
                    userReview: lt.userReview,
                    reviewPost: lt.reviewPost,
                    rating: lt.rating,
                    date: lt.date
                })
            })
            let listReviewSlice = paginateArray(listReview,currentpage - 1,perPage)
            if(!body.rating && !body.currentpages && !body.nextpages && !body.totalpages)
            {
                res.status(200).send({ code: '0',message:'Need to login' });
            }
            else if(!body.rating && body.currentpages && body.nextpages && body.totalpages)
            {
                res.status(200).send({ code: '50',totalPages,
                prevPage,
                nextPage,
                prevP,
                nextP,
                pageTotal,
                listReview:listReviewSlice});
            }
        })
    }
});

function paginateArray(array, page, perPage) {
    const reversedArray = array.slice().reverse();
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage - 1;
    const paginatedArray = reversedArray.slice(startIndex, endIndex + 1);
    return paginatedArray;
}

async function nameUser(username) {
    try {
        const u = await User.findOne({ username: username });
        if (u) {
        return u.fullname;
        }
    } catch (error) {
        console.log(error);
    }
}

function formatDate() {
    // Chuyển đổi chuỗi thành đối tượng Date
    var date = new Date();
  
    // Tạo các mảng chứa thông tin ngày, tháng và năm
    var months = [
      "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
    ];
  
    // Lấy thông tin ngày, tháng, năm và giờ
    var day = date.getDate();
    var month = months[date.getMonth()];
    var year = date.getFullYear();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var period = hour >= 12 ? "PM" : "AM";
  
    // Định dạng lại giờ
    hour = hour % 12;
    hour = hour ? hour : 12; // 0 giờ được hiển thị là 12 giờ
  
    // Định dạng lại phút nếu chỉ có một chữ số
    minute = minute < 10 ? "0" + minute : minute;
  
    // Tạo chuỗi định dạng mới
    var formattedDate = day + " " + month + " " + year + ", " + hour + ":" + minute + " " + period;
  
    return formattedDate;
}

function calculateRatingCounts(listReview) {
    const ratingCounts = {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0
    };
  
    for (let i = 0; i < listReview.length; i++) {
      const rating = listReview[i].rating;
      ratingCounts[rating.toString()] += 1;
    }
  
    const totalCount = listReview.length;
  
    const result = [];
    for (let rating in ratingCounts) {
      const count = ratingCounts[rating];
      const percent = ((count / totalCount) * 100).toFixed(2);
      result.push({ rating: rating, count: count, percent: percent });
    }
  
    return result;
}

function calculateAverageRating(data) {
    let totalCount = 0;
    let totalSum = 0;
  
    for (let i = 0; i < data.length; i++) {
        const rating = parseInt(data[i].rating);
        const count = data[i].count;
        totalCount += count;
        totalSum += rating * count;
    }

    const average = (totalSum / totalCount).toFixed(1);

    return average;
}

function separateDecimal(number) {
    const integerPart = parseInt(number);
    const decimalPart = number - integerPart;
    return [integerPart, decimalPart.toFixed(1)];
}
  
module.exports = router;