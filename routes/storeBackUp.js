const express = require('express')
const router = express.Router()
const Product = require('../models/Product')
const User = require('../models/User')
const userCart = require('../models/userCart')

router.get('/',(req,res,next) => {
    var perPage = 3
    , page = 0
    Product.find({}).then((product) =>{
        var infoProduct = []
        var typeList = []
        var arr = product.map(c =>{
            typeList.push({
                type: c.category,
                number: product.filter((obj) => obj.category === c.category).length
            })
        })
        var setTypeList = typeList.filter(
        (type, index) => index === typeList.findIndex(
            other => type.name === other.name
            && type.number === other.number
        ));
        Product.find({}).sort({date:-1}).clone()
        .limit(perPage)
        .skip(perPage * page)
        .then((product) =>{
            if(product)
            {
                var arr = product.map(c =>{
                    typeList.push({
                        type: c.category,
                        number: product.filter((obj) => obj.category === c.category).length
                    })
                    infoProduct.push({
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
                    infoProduct.sort(function(a,b){
                        return new Date(b.date) - new Date(a.date);
                    });
                })
                Product.count({}).exec().then((count) => {
                    if(count)
                    {
                        let totalPages = []
                        let pageTotal = Math.ceil(count / perPage)
                        let currentpage = page + 1
            
                        let prevPage = currentpage <= 1 ? 1 : currentpage - 1
                        let nextPage = currentpage >= pageTotal ? pageTotal : currentpage + 1
            
                        let prevP = 1;
                        let nextP = pageTotal;
                        // totalPages.push(2)
                        // totalPages.push(3)
                        // totalPages.push(4)
                        // totalPages.push(5)
                        // totalPages.push(6)
                        // totalPages.push(7)
                        // if (currentpage > 3) {
                        //     totalPages.push("...");
                        // }
                        // if (currentpage < pageTotal - 2) {
                        //     totalPages.push("...");
                        //  }
                        for(var i = 1;i<=pageTotal;i++)
                        {
                            totalPages.push(i)
                        }
                        return res.render('store',{
                            infoProduct:infoProduct,
                            setTypeList:setTypeList, currentpage,
                            totalPages,
                            prevPage,
                            nextPage,
                            prevP,
                            nextP,
                            pageTotal
                        })
                    }
                })
            }
            else
            {
                return res.render('store')
            }
        }).catch((error) => {
            console.log(error)
        })
    })
})

router.get('/page/:page',(req,res,next) => {
    var perPage = 3
    , page =  Math.max(0, req.params.page) - 1;
    Product.find({}).sort({date:-1}).clone()
    .limit(perPage)
    .skip(perPage * page)
    .then((product) =>{
        var infoProduct = []
        var typeList = []
        if(product)
        {
            var arr = product.map(c =>{
                typeList.push({
                    type: c.category,
                    number: product.filter((obj) => obj.category === c.category).length
                })
                infoProduct.push({
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
                infoProduct.sort(function(a,b){
                    return new Date(b.date) - new Date(a.date);
                });
            })
            var setTypeList = typeList.filter(
            (type, index) => index === typeList.findIndex(
                other => type.name === other.name
                && type.number === other.number
            ));
            Product.count({}).exec().then((count) => {
                if(count)
                {
                    let totalPages = []
                    let pageTotal = Math.ceil(count / perPage)
                    let currentpage = page + 1
        
                    let prevPage = currentpage <= 1 ? 1 : currentpage - 1
                    let nextPage = currentpage >= pageTotal ? pageTotal : currentpage + 1
        
                    let prevP = 1;
                    let nextP = pageTotal;
                    // totalPages.push(2)
                    // totalPages.push(3)
                    // totalPages.push(4)
                    // totalPages.push(5)
                    // totalPages.push(6)
                    // totalPages.push(7)
                    // if (currentpage > 3) {
                    //     totalPages.push("...");
                    // }
                    // if (currentpage < pageTotal - 2) {
                    //     totalPages.push("...");
                    //  }
                    for(var i = 1;i<=pageTotal;i++)
                    {
                        totalPages.push(i)
                    }
                    return res.render('store',{
                        infoProduct:infoProduct,
                        setTypeList:setTypeList, currentpage,
                        totalPages,
                        prevPage,
                        nextPage,
                        prevP,
                        nextP,
                        pageTotal
                    })
                }
            })
        }
        else
        {
            return res.render('store')
        }
    }).catch((error) => {
        console.log(error)
    })
})

router.post('/', function(req, res, next) {
    var username = req.session.user
    var body = req.body
    var listProduct = []

    var perPage = 2
    , page = 0

    if(body.listType)
    {
        if(body.priceMin && body.priceMax)
        {
            if(body.state === '1')
            {
                
                Product.find({category:{ $in : body.listType },price : { $gt :  body.priceMin, $lt : body.priceMax}}).clone()
                .limit(perPage)
                .skip(perPage * page).then((product) =>{
                    var arr = product.map(p =>{
                        listProduct.push({
                            id:p._id,
                            name:p.name,
                            price:p.price,
                            date:p.date,
                            category:p.category,
                            image:{
                                path:p.image.path,
                                name:p.image.name,
                                imageType:p.image.imageType
                            }
                        })
                    })
                    console.log(listProduct.length)
                    Product.count({category:{ $in : body.listType },price : { $gt :  body.priceMin, $lt : body.priceMax}}).exec().then((count) => {
                        if(count)
                        {
                            let totalPages = []
                            let pageTotal = Math.ceil(count / perPage)
                            let currentpage = page + 1
                
                            let prevPage = currentpage <= 1 ? 1 : currentpage - 1
                            let nextPage = currentpage >= pageTotal ? pageTotal : currentpage + 1
                
                            let prevP = 1;
                            let nextP = pageTotal;
                            for(var i = 1;i<=pageTotal;i++)
                            {
                                totalPages.push(i)
                            }
                            res.status(200).send({ code: '1',listProduct:listProduct,
                            currentpage,
                            totalPages,
                            prevPage,
                            nextPage,
                            prevP,
                            nextP,
                            pageTotal
                            });
                        }
                        else
                        {
                            res.status(200).send({ code: '1',listProduct:listProduct});
                        }
                    })
                })
                .catch((error) => {
                    console.log(error)
                })
            }
            else if(body.state === '0')
            {
                console.log(body)
            }
            else
            {

            }
        }
        else
        {
            // if(body.state === '1')
            // {
            //     Product.find({category:{ $in : body.listType }}).then((product) =>{
            //         var arr = product.map(p =>{
            //             listProduct.push({
            //                 id:p._id,
            //                 name:p.name,
            //                 price:p.price,
            //                 date:p.date,
            //                 category:p.category,
            //                 image:{
            //                     path:p.image.path,
            //                     name:p.image.name,
            //                     imageType:p.image.imageType
            //                 }
            //             })
            //         })
            //         console.log(listProduct.length)
            //     }).catch((error) => {
            //         console.log(error)
            //     })
            // }
            // else if(body.state === '0')
            // {
            //     console.log(body)
            // }
            // else
            // {

            // }
        }
    }
    else
    {
        console.log("True")
    }

    // return res.redirect('/store')
})

module.exports = router