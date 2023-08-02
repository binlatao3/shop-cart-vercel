const express = require('express')
const router = express.Router()
const Product = require('../models/Product')
const User = require('../models/User')
const userCart = require('../models/userCart')

router.get('/',(req,res,next) => {
    var perPage = req.session.perPage || 20
    var sortBy = req.session.sortBy || 0
    , page = 0
    Product.exists({}).then((pd) =>{
        if(pd)
        {
            Product.find({}).then((product) =>{
                var infoProduct = []
                var typeList = []
                var infoItem = []
                product.forEach(c => {
                    var index = typeList.findIndex(e => e.type === c.category);
                    if (index === -1) {
                        typeList.push({
                            type: c.category,
                            number: 1
                        });
                    } else {
                        typeList[index].number++;
                    }
                });
                if(sortBy === 0)
                {
                    Product.find({}).sort({date:-1}).clone()
                    .limit(perPage)
                    .skip(perPage * page)
                    .then((product) =>{
                        if(product)
                        {
                            var user = req.session.user
                            var infoUser = []
                            let totalPrice 
                            let totalNumber
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
                                            var arr = product.map(c =>{
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
                                                        },
                                                        totalSold:c.totalSold
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

                                                    return res.render('store',{
                                                        infoProduct:infoProduct,
                                                        infoUser:infoUser,
                                                        infoItem,
                                                        totalPrice:totalPrice,
                                                        totalNumber:totalNumber,
                                                        setTypeList:typeList, 
                                                        currentpage,
                                                        totalPages,
                                                        prevPage,
                                                        nextPage,
                                                        prevP,
                                                        nextP,
                                                        pageTotal,
                                                        perPage,
                                                        sortBy
                                                    })
                                                }
                                            })
                                        }
                                    }).catch((error) => {
                                        console.log(error)
                                    })
                                })
                            }
                            else
                            {
                                var arr = product.map(c =>{
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
                                            },
                                            totalSold:c.totalSold
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
                                        return res.render('store',{
                                            infoProduct:infoProduct,
                                            setTypeList:typeList, 
                                            currentpage,
                                            totalPages,
                                            prevPage,
                                            nextPage,
                                            prevP,
                                            nextP,
                                            pageTotal,
                                            perPage,
                                            sortBy
                                        })
                                    }
                                })
                            }
                        }
                        else
                        {
                            return res.render('store')
                        }
                    }).catch((error) => {
                        console.log(error)
                    })
                }
                else
                {
                    Product.find({}).sort({totalSold:-1}).clone()
                    .limit(perPage)
                    .skip(perPage * page)
                    .then((product) =>{
                        if(product)
                        {
                            var user = req.session.user
                            var infoUser = []
                            let totalPrice 
                            let totalNumber
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
                                            var arr = product.map(c =>{
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
                                                        },
                                                        totalSold:c.totalSold
                                                    })
                                                infoProduct.sort(function(a,b){
                                                    return b.totalSold - a.totalSold;
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
                                                    console.log(totalPages)

                                                    return res.render('store',{
                                                        infoProduct:infoProduct,
                                                        infoUser:infoUser,
                                                        infoItem,
                                                        totalPrice:totalPrice,
                                                        totalNumber:totalNumber,
                                                        setTypeList:typeList, 
                                                        currentpage,
                                                        totalPages,
                                                        prevPage,
                                                        nextPage,
                                                        prevP,
                                                        nextP,
                                                        pageTotal,
                                                        perPage,
                                                        sortBy
                                                    })
                                                }
                                            })
                                        }
                                    }).catch((error) => {
                                        console.log(error)
                                    })
                                })
                            }
                            else
                            {
                                var arr = product.map(c =>{
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
                                            },
                                            totalSold:c.totalSold
                                        })
                                    infoProduct.sort(function(a,b){
                                        return b.totalSold - a.totalSold;
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
                                        return res.render('store',{
                                            infoProduct:infoProduct,
                                            setTypeList:typeList, 
                                            currentpage,
                                            totalPages,
                                            prevPage,
                                            nextPage,
                                            prevP,
                                            nextP,
                                            pageTotal,
                                            perPage,
                                            sortBy
                                        })
                                    }
                                })
                            }
                        }
                        else
                        {
                            return res.render('store')
                        }
                    }).catch((error) => {
                        console.log(error)
                    })
                }
            })
        }
        else
        {
            return res.render('store')
        }
    })
})

router.post('/', function(req, res, next) {
    var username = req.session.user
    var body = req.body
    var listProduct = []
    var perPage
    console.log('body',body)

    if(body.perPage === '0')
    {
        perPage = 2
        req.session.perPage = perPage
    }
    else if (body.perPage === '1')
    {
        perPage = 5
        req.session.perPage = perPage
    }
    else
    {
        if(!body.perPage)
        {
            console.log('yes')
            perPage = req.session.perPage
        }
    }
    var sortBy = (body.sortBy === '0' ? 0 : 1)
    req.session.sortBy = sortBy
    , page = body.currentpages - 1 || 0
    if(body.listType)
    {
        if(sortBy === 1)
        {
            if(body.priceMin && body.priceMax)
            {
                if(body.state === '1')
                {
                    
                    Product.find({category:{ $in : body.listType },price : { $gt :  body.priceMin, $lt : body.priceMax}}).sort({totalSold:-1})
                    .clone()
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
                                },
                                totalSold:p.totalSold
                            })
                        })
                        Product.count({category:{ $in : body.listType },price : { $gt :  body.priceMin, $lt : body.priceMax}}).exec().then((count) => {
                            if(count)
                            {
                                let totalPages = []
                                let pageTotal = Math.ceil(count / perPage)
                                let currentpage = parseInt(page) + 1
                    
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
                                res.status(200).send({ code: '1',listProduct:listProduct,message:"list,price,checkbox",
                                currentpage,
                                totalPages,
                                prevPage,
                                nextPage,
                                prevP,
                                nextP,
                                pageTotal,
                                sortBy:sortBy,
                                perPage:perPage
                                });
                            }
                            else
                            {
                                if(body.priceMin == '0' && body.priceMax == '0' || !body.priceMin || !body.priceMax)
                                {
                                    Product.find({category:{ $in : body.listType }}).sort({totalSold:-1})
                                    .clone()
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
                                                },
                                                totalSold:p.totalSold
                                            })
                                        })
                                        Product.count({category:{ $in : body.listType }}).exec().then((count) => {
                                            if(count)
                                            {
                                                let totalPages = []
                                                let pageTotal = Math.ceil(count / perPage)
                                                let currentpage = parseInt(body.currentpages)
                                    
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
                                                res.status(200).send({ code: '5',listProduct:listProduct,
                                                currentpage,
                                                totalPages,
                                                prevPage,
                                                nextPage,
                                                prevP,
                                                nextP,
                                                pageTotal,
                                                sortBy:sortBy,
                                                perPage:perPage
                                                });
                                            }
                                        })
                                    })
                                }
                                else
                                {
                                    res.status(200).send({ code: '6',listProduct:listProduct});
                                }
                            }
                        })
                    })
                    .catch((error) => {
                        console.log(error)
                    })
                }
                else if(body.state === '0')
                {
                    Product.find({category:{ $in : body.listType },price : { $gt :  body.priceMin, $lt : body.priceMax}}).sort({totalSold:-1})
                    .clone()
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
                                },
                                totalSold:p.totalSold
                            })
                        })
                        Product.count({category:{ $in : body.listType },price : { $gt :  body.priceMin, $lt : body.priceMax}}).exec().then((count) => {
                            if(count)
                            {
                                let totalPages = []
                                let pageTotal = Math.ceil(count / perPage)
                                let currentpage = parseInt(page) + 1
                    
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
                                res.status(200).send({ code: '3',listProduct:listProduct,message:"list,price,uncheckbox",
                                currentpage,
                                totalPages,
                                prevPage,
                                nextPage,
                                prevP,
                                nextP,
                                pageTotal,
                                sortBy:sortBy,
                                perPage:perPage
                                });
                            }
                            else
                            {
                                if(body.priceMin == '0' && body.priceMax == '0' || !body.priceMin || !body.priceMax)
                                {
                                    Product.find({category:{ $in : body.listType }}).sort({totalSold:-1})
                                    .clone()
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
                                                },
                                                totalSold:p.totalSold
                                            })
                                        })
                                        Product.count({category:{ $in : body.listType }}).exec().then((count) => {
                                            if(count)
                                            {
                                                let totalPages = []
                                                let pageTotal = Math.ceil(count / perPage)
                                                let currentpage = parseInt(body.currentpages)
                                    
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
                                                res.status(200).send({ code: '5',listProduct:listProduct,
                                                currentpage,
                                                totalPages,
                                                prevPage,
                                                nextPage,
                                                prevP,
                                                nextP,
                                                pageTotal,
                                                sortBy:sortBy,
                                                perPage:perPage
                                                });
                                            }
                                        })
                                    })
                                }
                                else
                                {
                                    res.status(200).send({ code: '6',listProduct:listProduct});
                                }
                            }
                        })
                    })
                    .catch((error) => {
                        console.log(error)
                    })
                }
                else
                {

                }
            }
            else
            {
                if(body.state === '1')
                {
                    console.log("2313")
                    Product.find({category:{ $in : body.listType }}).sort({totalSold:-1})
                    .clone()
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
                                },
                                totalSold:p.totalSold
                            })
                        })
                        Product.count({category:{ $in : body.listType }}).exec().then((count) => {
                            if(count)
                            {
                                let totalPages = []
                                let pageTotal = Math.ceil(count / perPage)
                                let currentpage = parseInt(page) + 1
                    
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
                                res.status(200).send({ code: '1',listProduct:listProduct,message:"list,price,checkbox",
                                currentpage,
                                totalPages,
                                prevPage,
                                nextPage,
                                prevP,
                                nextP,
                                pageTotal,
                                sortBy:sortBy,
                                perPage:perPage
                                });
                            }
                            else
                            {
                                res.status(200).send({ code: '6',listProduct:listProduct});
                            }
                        })
                    })
                    .catch((error) => {
                        console.log(error)
                    })
                }
                else if(body.state === '0')
                {
                    console.log("HEFE")
                    Product.find({category:{ $in : body.listType }}).sort({totalSold:-1})
                    .clone()
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
                                },
                                totalSold:p.totalSold
                            })
                        })
                        Product.count({category:{ $in : body.listType }}).exec().then((count) => {
                            if(count)
                            {
                                let totalPages = []
                                let pageTotal = Math.ceil(count / perPage)
                                let currentpage = parseInt(page) + 1
                    
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
                                res.status(200).send({ code: '3',listProduct:listProduct,message:"list,price,uncheckbox",
                                currentpage,
                                totalPages,
                                prevPage,
                                nextPage,
                                prevP,
                                nextP,
                                pageTotal,
                                sortBy:sortBy,
                                perPage:perPage
                                });
                            }
                            else
                            {
                                res.status(200).send({ code: '6',listProduct:listProduct});
                            }
                        })
                    })
                    .catch((error) => {
                        console.log(error)
                    })
                }
                else
                {
                    console.log("TEEETE")
                    Product.find({}).sort({totalSold:-1})
                    .clone()
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
                                },
                                totalSold:p.totalSold
                            })
                        })
                        Product.count({}).exec().then((count) => {
                            if(count)
                            {
                                let totalPages = []
                                let pageTotal = Math.ceil(count / perPage)
                                let currentpage = parseInt(body.currentpages) + 1
                    
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
                                res.status(200).send({ code: '5',listProduct:listProduct,
                                currentpage,
                                totalPages,
                                prevPage,
                                nextPage,
                                prevP,
                                nextP,
                                pageTotal,
                                sortBy:sortBy,
                                perPage:perPage
                            });
                            }
                            else
                            {
                                res.status(200).send({ code: '6',listProduct:listProduct});
                            }
                        })
                    })
                    .catch((error) => {
                        console.log(error)
                    })
                }
            }
        }
        else
        {
            if(body.priceMin && body.priceMax)
            {
                if(body.state === '1')
                {
                    
                    Product.find({category:{ $in : body.listType },price : { $gt :  body.priceMin, $lt : body.priceMax}}).sort({date:-1})
                    .clone()
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
                                },
                                totalSold:p.totalSold
                            })
                        })
                        Product.count({category:{ $in : body.listType },price : { $gt :  body.priceMin, $lt : body.priceMax}}).exec().then((count) => {
                            if(count)
                            {
                                let totalPages = []
                                let pageTotal = Math.ceil(count / perPage)
                                let currentpage = parseInt(page) + 1
                    
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
                                res.status(200).send({ code: '1',listProduct:listProduct,message:"list,price,checkbox",
                                currentpage,
                                totalPages,
                                prevPage,
                                nextPage,
                                prevP,
                                nextP,
                                pageTotal,
                                sortBy:sortBy,
                                perPage:perPage
                                });
                            }
                            else
                            {
                                if(body.priceMin == '0' && body.priceMax == '0' || !body.priceMin || !body.priceMax)
                                {
                                    Product.find({category:{ $in : body.listType }}).sort({date:-1})
                                    .clone()
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
                                                },
                                                totalSold:p.totalSold
                                            })
                                        })
                                        Product.count({category:{ $in : body.listType }}).exec().then((count) => {
                                            if(count)
                                            {
                                                let totalPages = []
                                                let pageTotal = Math.ceil(count / perPage)
                                                let currentpage = parseInt(body.currentpages)
                                    
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
                                                res.status(200).send({ code: '5',listProduct:listProduct,
                                                currentpage,
                                                totalPages,
                                                prevPage,
                                                nextPage,
                                                prevP,
                                                nextP,
                                                pageTotal,
                                                sortBy:sortBy,
                                                perPage:perPage
                                                });
                                            }
                                        })
                                    })
                                }
                                else
                                {
                                    res.status(200).send({ code: '6',listProduct:listProduct});
                                }
                            }
                        })
                    })
                    .catch((error) => {
                        console.log(error)
                    })
                }
                else if(body.state === '0')
                {
                    Product.find({category:{ $in : body.listType },price : { $gt :  body.priceMin, $lt : body.priceMax}}).sort({date:-1})
                    .clone()
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
                                },
                                totalSold:p.totalSold
                            })
                        })
                        Product.count({category:{ $in : body.listType },price : { $gt :  body.priceMin, $lt : body.priceMax}}).exec().then((count) => {
                            if(count)
                            {
                                let totalPages = []
                                let pageTotal = Math.ceil(count / perPage)
                                let currentpage = parseInt(page) + 1
                    
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
                                res.status(200).send({ code: '3',listProduct:listProduct,message:"list,price,uncheckbox",
                                currentpage,
                                totalPages,
                                prevPage,
                                nextPage,
                                prevP,
                                nextP,
                                pageTotal,
                                sortBy:body.sortBy,
                                perPage:perPage
                                });
                            }
                            else
                            {
                                if(body.priceMin == '0' && body.priceMax == '0' || !body.priceMin || !body.priceMax)
                                {
                                    Product.find({category:{ $in : body.listType }}).sort({date:-1})
                                    .clone()
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
                                                },
                                                totalSold:p.totalSold
                                            })
                                        })
                                        Product.count({category:{ $in : body.listType }}).exec().then((count) => {
                                            if(count)
                                            {
                                                let totalPages = []
                                                let pageTotal = Math.ceil(count / perPage)
                                                let currentpage = parseInt(body.currentpages)
                                    
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
                                                res.status(200).send({ code: '5',listProduct:listProduct,
                                                currentpage,
                                                totalPages,
                                                prevPage,
                                                nextPage,
                                                prevP,
                                                nextP,
                                                pageTotal,
                                                sortBy:sortBy,
                                                perPage:perPage
                                                });
                                            }
                                        })
                                    })
                                }
                                else
                                {
                                    res.status(200).send({ code: '6',listProduct:listProduct});
                                }
                            }
                        })
                    })
                    .catch((error) => {
                        console.log(error)
                    })
                }
                else
                {

                }
            }
            else
            {
                if(body.state === '1')
                {
                    
                    Product.find({category:{ $in : body.listType }}).sort({date:-1})
                    .clone()
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
                                },
                                totalSold:p.totalSold
                            })
                        })
                        Product.count({category:{ $in : body.listType }}).exec().then((count) => {
                            if(count)
                            {
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
                                res.status(200).send({ code: '1',listProduct:listProduct,message:"list,price,checkbox",
                                currentpage,
                                totalPages,
                                prevPage,
                                nextPage,
                                prevP,
                                nextP,
                                pageTotal,
                                sortBy:sortBy,
                                perPage:perPage
                                });
                            }
                            else
                            {
                                res.status(200).send({ code: '6',listProduct:listProduct});
                            }
                        })
                    })
                    .catch((error) => {
                        console.log(error)
                    })
                }
                else if(body.state === '0')
                {
                    Product.find({category:{ $in : body.listType }}).sort({date:-1})
                    .clone()
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
                                },
                                totalSold:p.totalSold
                            })
                        })
                        Product.count({category:{ $in : body.listType }}).exec().then((count) => {
                            if(count)
                            {
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
                                res.status(200).send({ code: '3',listProduct:listProduct,message:"list,price,uncheckbox",
                                currentpage,
                                totalPages,
                                prevPage,
                                nextPage,
                                prevP,
                                nextP,
                                pageTotal,
                                sortBy:sortBy,
                                perPage:perPage
                                });
                            }
                            else
                            {
                                res.status(200).send({ code: '6',listProduct:listProduct});
                            }
                        })
                    })
                    .catch((error) => {
                        console.log(error)
                    })
                }
                else
                {
                    Product.find({}).sort({date:-1})
                    .clone()
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
                                },
                                totalSold:p.totalSold
                            })
                        })
                        Product.count({}).exec().then((count) => {
                            if(count)
                            {
                                let totalPages = []
                                let pageTotal = Math.ceil(count / perPage)
                                let currentpage = parseInt(body.currentpages) + 1
                    
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
                                res.status(200).send({ code: '5',listProduct:listProduct,
                                currentpage,
                                totalPages,
                                prevPage,
                                nextPage,
                                prevP,
                                nextP,
                                pageTotal,
                                sortBy:sortBy,
                                perPage:perPage
                            });
                            }
                            else
                            {
                                res.status(200).send({ code: '6',listProduct:listProduct});
                            }
                        })
                    })
                    .catch((error) => {
                        console.log(error)
                    })
                }
            }
        }
    }
    else
    {
        if(sortBy === 1)
        {
            if(body.priceMin && body.priceMax)
            {
                Product.find({price : { $gt :  body.priceMin, $lt : body.priceMax}}).sort({totalSold:-1})
                .clone()
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
                            },
                            totalSold:p.totalSold
                        })
                    })
                    Product.count({price : { $gt :  body.priceMin, $lt : body.priceMax}}).exec().then((count) => {
                        if(count)
                        {
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
                            res.status(200).send({ code: '4',listProduct:listProduct,message:"price",
                            currentpage,
                            totalPages,
                            prevPage,
                            nextPage,
                            prevP,
                            nextP,
                            pageTotal,
                            perPage:perPage,
                            sortBy:sortBy
                            });
                        }
                        else
                        {
                            if(body.priceMin == '0' && body.priceMax == '0' || !body.priceMin || !body.priceMax)
                            {
                                Product.find({}).sort({totalSold:-1})
                                .clone()
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
                                            },
                                            totalSold:p.totalSold
                                        })
                                    })
                                    Product.count({}).exec().then((count) => {
                                        if(count)
                                        {
                                            let totalPages = []
                                            let pageTotal = Math.ceil(count / perPage)
                                            let currentpage = parseInt(body.currentpages) + 1
                                
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
                                            res.status(200).send({ code: '5',listProduct:listProduct,
                                            currentpage,
                                            totalPages,
                                            prevPage,
                                            nextPage,
                                            prevP,
                                            nextP,
                                            pageTotal,
                                            sortBy:sortBy,
                                            perPage:perPage
                                            });
                                        }
                                    })
                                })
                            }
                            else
                            {
                                res.status(200).send({ code: '6',listProduct:listProduct});
                            }
                            
                        }
                    })
                })
                .catch((error) => {
                    console.log(error)
                })
            }
            else
            {
                Product.find({}).sort({totalSold:-1})
                .clone()
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
                            },
                            totalSold:p.totalSold
                        })
                    })
                    Product.count({}).exec().then((count) => {
                        if(count)
                        {
                            let totalPages = []
                            let pageTotal = Math.ceil(count / perPage)
                            let currentpage = parseInt(body.currentpages)
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
                            res.status(200).send({ code: '5',listProduct:listProduct,
                            currentpage,
                            totalPages,
                            prevPage,
                            nextPage,
                            prevP,
                            nextP,
                            pageTotal,
                            sortBy:sortBy,
                            perPage:perPage
                        });
                        }
                        else
                        {
                            res.status(200).send({ code: '6',listProduct:listProduct});
                        }
                    })
                })
                .catch((error) => {
                    console.log(error)
                })
            }
        }
        else
        {
            if(body.priceMin && body.priceMax)
            {
                Product.find({price : { $gt :  body.priceMin, $lt : body.priceMax}}).sort({date:-1})
                .clone()
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
                            },
                            totalSold:p.totalSold
                        })
                    })
                    Product.count({price : { $gt :  body.priceMin, $lt : body.priceMax}}).exec().then((count) => {
                        if(count)
                        {
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
                            res.status(200).send({ code: '4',listProduct:listProduct,message:"price",
                            currentpage,
                            totalPages,
                            prevPage,
                            nextPage,
                            prevP,
                            nextP,
                            pageTotal,
                            sortBy:sortBy,
                            perPage:perPage
                            });
                        }
                        else
                        {
                            if(body.priceMin == '0' && body.priceMax == '0' || !body.priceMin || !body.priceMax)
                            {
                                Product.find({}).sort({date:-1})
                                .clone()
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
                                            },
                                            totalSold:p.totalSold
                                        })
                                    })
                                    Product.count({}).exec().then((count) => {
                                        if(count)
                                        {
                                            let totalPages = []
                                            let pageTotal = Math.ceil(count / perPage)
                                            let currentpage = parseInt(body.currentpages) + 1
                                
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
                                            res.status(200).send({ code: '5',listProduct:listProduct,
                                            currentpage,
                                            totalPages,
                                            prevPage,
                                            nextPage,
                                            prevP,
                                            nextP,
                                            pageTotal,
                                            sortBy:sortBy,
                                            perPage:perPage
                                        });
                                        }
                                    })
                                })
                            }
                            else
                            {
                                res.status(200).send({ code: '6',listProduct:listProduct});
                            }
                            
                        }
                    })
                })
                .catch((error) => {
                    console.log(error)
                })
            }
            else
            {
                Product.find({}).sort({date:-1})
                .clone()
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
                            },
                            totalSold:p.totalSold
                        })
                    })
                    Product.count({}).exec().then((count) => {
                        if(count)
                        {
                            let totalPages = []
                            let pageTotal = Math.ceil(count / perPage)
                            let currentpage = parseInt(body.currentpages)
                
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
                            res.status(200).send({ code: '5',listProduct:listProduct,
                            currentpage,
                            totalPages,
                            prevPage,
                            nextPage,
                            prevP,
                            nextP,
                            pageTotal,
                            sortBy:sortBy,
                            perPage:perPage
                        });
                        }
                        else
                        {
                            res.status(200).send({ code: '6',listProduct:listProduct});
                        }
                    })
                })
                .catch((error) => {
                    console.log(error)
                })
            }
        }
    }

    // return res.redirect('/store')
})

router.get('/page/:page',(req,res,next) => {
    var perPage = req.session.perPage || 20
    var sortBy = req.session.sortBy || 0
    , page =  Math.max(0, req.params.page) - 1;
    console.log(page)
    console.log(perPage)
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
                            },
                            totalSold:c.totalSold
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
                        return res.render('store',{
                            infoProduct:infoProduct,
                            setTypeList:setTypeList, currentpage,
                            totalPages,
                            prevPage,
                            nextPage,
                            prevP,
                            nextP,
                            pageTotal,
                            perPage,
                            sortBy
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

router.post('/page/:page', function(req, res, next) {
    var username = req.session.user
    var body = req.body
    var listProduct = []
    var perPage
    console.log(body)

    if(body.perPage === '0')
    {
        perPage = 2
        req.session.perPage = perPage
    }
    else if (body.perPage === '1')
    {
        perPage = 5
        req.session.perPage = perPage
    }
    else
    {
        if(!body.perPage)
        {
            perPage = req.session.perPage || 2
        }
    }
    var sortBy = (body.sortBy === '0' ? 0 : 1)
    req.session.sortBy = sortBy
    if(body.listType)
    {
        if(sortBy === 1)
        {
            if(body.priceMin && body.priceMax)
            {
                if(body.state === '1')
                {
                    
                    Product.find({category:{ $in : body.listType },price : { $gt :  body.priceMin, $lt : body.priceMax}}).sort({totalSold:-1})
                    .clone()
                    .limit(perPage)
                    .skip(perPage * (parseInt(body.nextpages))).then((product) =>{
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
                                },
                                totalSold:p.totalSold
                            })
                        })
                        Product.count({category:{ $in : body.listType },price : { $gt :  body.priceMin, $lt : body.priceMax}}).exec().then((count) => {
                            if(count)
                            {
                                let totalPages = []
                                let pageTotal = Math.ceil(count / perPage)
                                let currentpage = parseInt(body.currentpages) + 1
                    
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
                                res.status(200).send({ code: '2',listProduct:listProduct,
                                currentpage,
                                totalPages,
                                prevPage,
                                nextPage,
                                prevP,
                                nextP,
                                pageTotal,
                                sortBy:sortBy,
                                perPage:perPage
                                });
                            }
                            else
                            {
                                if(body.priceMin == '0' && body.priceMax == '0' || !body.priceMin || !body.priceMax)
                                {
                                    Product.find({category:{ $in : body.listType }}).sort({totalSold:-1})
                                    .clone()
                                    .limit(perPage)
                                    .skip(perPage * (parseInt(body.nextpages))).then((product) =>{
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
                                                },
                                                totalSold:p.totalSold
                                            })
                                        })
                                        Product.count({category:{ $in : body.listType }}).exec().then((count) => {
                                            if(count)
                                            {
                                                let totalPages = []
                                                let pageTotal = Math.ceil(count / perPage)
                                                let currentpage = parseInt(body.currentpages) + 1
                                    
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
                                                res.status(200).send({ code: '5',listProduct:listProduct,
                                                currentpage,
                                                totalPages,
                                                prevPage,
                                                nextPage,
                                                prevP,
                                                nextP,
                                                pageTotal,
                                                sortBy:sortBy,
                                                perPage:perPage
                                                });
                                            }
                                        })
                                    })
                                }
                                else
                                {
                                    res.status(200).send({ code: '6',listProduct:listProduct});
                                }
                            }
                        })
                    })
                    .catch((error) => {
                        console.log(error)
                    })
                }
                else if(body.state === '0')
                {
                    Product.find({category:{ $in : body.listType },price : { $gt :  body.priceMin, $lt : body.priceMax}}).sort({totalSold:-1})
                    .clone()
                    .limit(perPage)
                    .skip(perPage * (parseInt(body.nextpages))).then((product) =>{
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
                                },
                                totalSold:p.totalSold
                            })
                        })
                        Product.count({category:{ $in : body.listType },price : { $gt :  body.priceMin, $lt : body.priceMax}}).exec().then((count) => {
                            if(count)
                            {
                                let totalPages = []
                                let pageTotal = Math.ceil(count / perPage)
                                let currentpage = parseInt(body.currentpages) + 1
                    
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
                                res.status(200).send({ code: '3',listProduct:listProduct,
                                currentpage,
                                totalPages,
                                prevPage,
                                nextPage,
                                prevP,
                                nextP,
                                pageTotal,
                                sortBy:sortBy,
                                perPage:perPage
                                });
                            }
                            else
                            {
                                if(body.priceMin == '0' && body.priceMax == '0' || !body.priceMin || !body.priceMax)
                                {
                                    Product.find({category:{ $in : body.listType }}).sort({totalSold:-1})
                                    .clone()
                                    .limit(perPage)
                                    .skip(perPage * (parseInt(body.nextpages))).then((product) =>{
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
                                                },
                                                totalSold:p.totalSold
                                            })
                                        })
                                        Product.count({category:{ $in : body.listType }}).exec().then((count) => {
                                            if(count)
                                            {
                                                let totalPages = []
                                                let pageTotal = Math.ceil(count / perPage)
                                                let currentpage = parseInt(body.currentpages) + 1
                                    
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
                                                res.status(200).send({ code: '5',listProduct:listProduct,
                                                currentpage,
                                                totalPages,
                                                prevPage,
                                                nextPage,
                                                prevP,
                                                nextP,
                                                pageTotal,
                                                sortBy:sortBy,
                                                perPage:perPage
                                                });
                                            }
                                        })
                                    })
                                }
                                else
                                {
                                    res.status(200).send({ code: '6',listProduct:listProduct});
                                }
                            }
                        })
                    })
                    .catch((error) => {
                        console.log(error)
                    })
                }
                else
                {
                    Product.find({}).sort({totalSold:-1})
                    .clone()
                    .limit(perPage)
                    .skip(perPage * (parseInt(body.nextpages))).then((product) =>{
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
                                },
                                totalSold:p.totalSold
                            })
                        })
                        Product.count({}).exec().then((count) => {
                            if(count)
                            {
                                let totalPages = []
                                let pageTotal = Math.ceil(count / perPage)
                                let currentpage = parseInt(body.currentpages) + 1
                    
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
                                res.status(200).send({ code: '5',listProduct:listProduct,
                                currentpage,
                                totalPages,
                                prevPage,
                                nextPage,
                                prevP,
                                nextP,
                                pageTotal,
                                sortBy:sortBy,
                                perPage:perPage
                                });
                            }
                            else
                            {
                                res.status(200).send({ code: '6',listProduct:listProduct});
                            }
                        })
                    })
                    .catch((error) => {
                        console.log(error)
                    })
                }
            }
            else
            {
                if(body.state === '1')
                {
                    
                    Product.find({category:{ $in : body.listType }}).sort({totalSold:-1})
                    .clone()
                    .limit(perPage)
                    .skip(perPage * (parseInt(body.nextpages))).then((product) =>{
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
                                },
                                totalSold:p.totalSold
                            })
                        })
                        Product.count({category:{ $in : body.listType }}).exec().then((count) => {
                            if(count)
                            {
                                let totalPages = []
                                let pageTotal = Math.ceil(count / perPage)
                                let currentpage = body.currentpages + 1
                    
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
                                res.status(200).send({ code: '2',listProduct:listProduct,
                                currentpage,
                                totalPages,
                                prevPage,
                                nextPage,
                                prevP,
                                nextP,
                                pageTotal,
                                sortBy:sortBy,
                                perPage:perPage
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
                    Product.find({category:{ $in : body.listType }}).sort({totalSold:-1})
                    .clone()
                    .limit(perPage)
                    .skip(perPage * (parseInt(body.nextpages))).then((product) =>{
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
                                },
                                totalSold:p.totalSold
                            })
                        })
                        Product.count({category:{ $in : body.listType }}).exec().then((count) => {
                            if(count)
                            {
                                let totalPages = []
                                let pageTotal = Math.ceil(count / perPage)
                                let currentpage = body.currentpages + 1
                    
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
                                res.status(200).send({ code: '3',listProduct:listProduct,
                                currentpage,
                                totalPages,
                                prevPage,
                                nextPage,
                                prevP,
                                nextP,
                                pageTotal,
                                sortBy:sortBy,
                                perPage:perPage
                                });
                            }
                            else
                            {
                                res.status(200).send({ code: '4',listProduct:listProduct});
                            }
                        })
                    })
                    .catch((error) => {
                        console.log(error)
                    })
                }
                else
                {
                    Product.find({}).sort({totalSold:-1})
                    .clone()
                    .limit(perPage)
                    .skip(perPage * (parseInt(body.nextpages))).then((product) =>{
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
                                },
                                totalSold:p.totalSold
                            })
                        })
                        Product.count({}).exec().then((count) => {
                            if(count)
                            {
                                let totalPages = []
                                let pageTotal = Math.ceil(count / perPage)
                                let currentpage = parseInt(body.currentpages) + 1
                    
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
                                res.status(200).send({ code: '5',listProduct:listProduct,
                                currentpage,
                                totalPages,
                                prevPage,
                                nextPage,
                                prevP,
                                nextP,
                                pageTotal,
                                sortBy:sortBy,
                                perPage:perPage
                                });
                            }
                            else
                            {
                                res.status(200).send({ code: '6',listProduct:listProduct});
                            }
                        })
                    })
                    .catch((error) => {
                        console.log(error)
                    })
                }
            }
        }
        else
        {
            if(body.priceMin && body.priceMax)
            {
                if(body.state === '1')
                {
                    
                    Product.find({category:{ $in : body.listType },price : { $gt :  body.priceMin, $lt : body.priceMax}}).sort({date:-1})
                    .clone()
                    .limit(perPage)
                    .skip(perPage * (parseInt(body.nextpages))).then((product) =>{
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
                                },
                                totalSold:p.totalSold
                            })
                        })
                        Product.count({category:{ $in : body.listType },price : { $gt :  body.priceMin, $lt : body.priceMax}}).exec().then((count) => {
                            if(count)
                            {
                                let totalPages = []
                                let pageTotal = Math.ceil(count / perPage)
                                let currentpage = parseInt(body.currentpages) + 1
                    
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
                                res.status(200).send({ code: '2',listProduct:listProduct,
                                currentpage,
                                totalPages,
                                prevPage,
                                nextPage,
                                prevP,
                                nextP,
                                pageTotal,
                                sortBy:sortBy,
                                perPage:perPage
                                });
                            }
                            else
                            {
                                if(body.priceMin == '0' && body.priceMax == '0' || !body.priceMin || !body.priceMax)
                                {
                                    Product.find({category:{ $in : body.listType }}).sort({date:-1})
                                    .clone()
                                    .limit(perPage)
                                    .skip(perPage * (parseInt(body.nextpages))).then((product) =>{
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
                                                },
                                                totalSold:p.totalSold
                                            })
                                        })
                                        Product.count({category:{ $in : body.listType }}).exec().then((count) => {
                                            if(count)
                                            {
                                                let totalPages = []
                                                let pageTotal = Math.ceil(count / perPage)
                                                let currentpage = parseInt(body.currentpages) + 1
                                    
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
                                                res.status(200).send({ code: '5',listProduct:listProduct,
                                                currentpage,
                                                totalPages,
                                                prevPage,
                                                nextPage,
                                                prevP,
                                                nextP,
                                                pageTotal,
                                                sortBy:sortBy,
                                                perPage:perPage
                                                });
                                            }
                                        })
                                    })
                                }
                                else
                                {
                                    res.status(200).send({ code: '6',listProduct:listProduct});
                                }
                            }
                        })
                    })
                    .catch((error) => {
                        console.log(error)
                    })
                }
                else if(body.state === '0')
                {
                    Product.find({category:{ $in : body.listType },price : { $gt :  body.priceMin, $lt : body.priceMax}}).sort({date:-1})
                    .clone()
                    .limit(perPage)
                    .skip(perPage * (parseInt(body.nextpages))).then((product) =>{
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
                                },
                                totalSold:p.totalSold
                            })
                        })
                        Product.count({category:{ $in : body.listType },price : { $gt :  body.priceMin, $lt : body.priceMax}}).exec().then((count) => {
                            if(count)
                            {
                                let totalPages = []
                                let pageTotal = Math.ceil(count / perPage)
                                let currentpage = parseInt(body.currentpages) + 1
                    
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
                                res.status(200).send({ code: '3',listProduct:listProduct,
                                currentpage,
                                totalPages,
                                prevPage,
                                nextPage,
                                prevP,
                                nextP,
                                pageTotal,
                                sortBy:sortBy,
                                perPage:perPage
                                });
                            }
                            else
                            {
                                if(body.priceMin == '0' && body.priceMax == '0' || !body.priceMin || !body.priceMax)
                                {
                                    Product.find({category:{ $in : body.listType }}).sort({date:-1})
                                    .clone()
                                    .limit(perPage)
                                    .skip(perPage * (parseInt(body.nextpages))).then((product) =>{
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
                                                },
                                                totalSold:p.totalSold
                                            })
                                        })
                                        Product.count({category:{ $in : body.listType }}).exec().then((count) => {
                                            if(count)
                                            {
                                                let totalPages = []
                                                let pageTotal = Math.ceil(count / perPage)
                                                let currentpage = parseInt(body.currentpages) + 1
                                    
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
                                                res.status(200).send({ code: '5',listProduct:listProduct,
                                                currentpage,
                                                totalPages,
                                                prevPage,
                                                nextPage,
                                                prevP,
                                                nextP,
                                                pageTotal,
                                                sortBy:sortBy,
                                                perPage:perPage
                                                });
                                            }
                                        })
                                    })
                                }
                                else
                                {
                                    res.status(200).send({ code: '6',listProduct:listProduct});
                                }
                            }
                        })
                    })
                    .catch((error) => {
                        console.log(error)
                    })
                }
                else
                {
                    Product.find({}).sort({date:-1})
                    .clone()
                    .limit(perPage)
                    .skip(perPage * (parseInt(body.nextpages))).then((product) =>{
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
                                },
                                totalSold:p.totalSold
                            })
                        })
                        Product.count({}).exec().then((count) => {
                            if(count)
                            {
                                let totalPages = []
                                let pageTotal = Math.ceil(count / perPage)
                                let currentpage = parseInt(body.currentpages) + 1
                    
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
                                res.status(200).send({ code: '5',listProduct:listProduct,
                                currentpage,
                                totalPages,
                                prevPage,
                                nextPage,
                                prevP,
                                nextP,
                                pageTotal,
                                sortBy:sortBy,
                                perPage:perPage
                                });
                            }
                            else
                            {
                                res.status(200).send({ code: '6',listProduct:listProduct});
                            }
                        })
                    })
                    .catch((error) => {
                        console.log(error)
                    })
                }
            }
            else
            {
                if(body.state === '1')
                {
                    
                    Product.find({category:{ $in : body.listType }}).sort({date:-1})
                    .clone()
                    .limit(perPage)
                    .skip(perPage * (parseInt(body.nextpages))).then((product) =>{
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
                                },
                                totalSold:p.totalSold
                            })
                        })
                        Product.count({category:{ $in : body.listType }}).exec().then((count) => {
                            if(count)
                            {
                                let totalPages = []
                                let pageTotal = Math.ceil(count / perPage)
                                let currentpage = body.currentpages + 1
                    
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
                                res.status(200).send({ code: '2',listProduct:listProduct,
                                currentpage,
                                totalPages,
                                prevPage,
                                nextPage,
                                prevP,
                                nextP,
                                pageTotal,
                                sortBy:sortBy,
                                perPage:perPage
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
                    Product.find({category:{ $in : body.listType }}).sort({date:-1})
                    .clone()
                    .limit(perPage)
                    .skip(perPage * (parseInt(body.nextpages))).then((product) =>{
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
                                },
                                totalSold:p.totalSold
                            })
                        })
                        Product.count({category:{ $in : body.listType }}).exec().then((count) => {
                            if(count)
                            {
                                let totalPages = []
                                let pageTotal = Math.ceil(count / perPage)
                                let currentpage = body.currentpages + 1
                    
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
                                res.status(200).send({ code: '3',listProduct:listProduct,
                                currentpage,
                                totalPages,
                                prevPage,
                                nextPage,
                                prevP,
                                nextP,
                                pageTotal,
                                sortBy:sortBy,
                                perPage:perPage
                                });
                            }
                            else
                            {
                                res.status(200).send({ code: '4',listProduct:listProduct});
                            }
                        })
                    })
                    .catch((error) => {
                        console.log(error)
                    })
                }
                else
                {
                    Product.find({}).sort({date:-1})
                    .clone()
                    .limit(perPage)
                    .skip(perPage * (parseInt(body.nextpages))).then((product) =>{
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
                                },
                                totalSold:p.totalSold
                            })
                        })
                        Product.count({}).exec().then((count) => {
                            if(count)
                            {
                                let totalPages = []
                                let pageTotal = Math.ceil(count / perPage)
                                let currentpage = parseInt(body.currentpages) + 1
                    
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
                                res.status(200).send({ code: '5',listProduct:listProduct,
                                currentpage,
                                totalPages,
                                prevPage,
                                nextPage,
                                prevP,
                                nextP,
                                pageTotal,
                                sortBy:sortBy,
                                perPage:perPage
                                });
                            }
                            else
                            {
                                res.status(200).send({ code: '6',listProduct:listProduct});
                            }
                        })
                    })
                    .catch((error) => {
                        console.log(error)
                    })
                }
            }
        }
    }
    else
    {
        if(sortBy === 1)
        {
            if(body.priceMin && body.priceMax)
            {
                if(body.state === '1')
                {
                    
                    Product.find({price : { $gt :  body.priceMin, $lt : body.priceMax}}).sort({totalSold:-1})
                    .clone()
                    .limit(perPage)
                    .skip(perPage * (parseInt(body.nextpages))).then((product) =>{
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
                                },
                                totalSold:p.totalSold
                            })
                        })
                        Product.count({price : { $gt :  body.priceMin, $lt : body.priceMax}}).exec().then((count) => {
                            if(count)
                            {
                                let totalPages = []
                                let pageTotal = Math.ceil(count / perPage)
                                let currentpage = parseInt(body.currentpages) + 1
                    
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
                                res.status(200).send({ code: '2',listProduct:listProduct,
                                currentpage,
                                totalPages,
                                prevPage,
                                nextPage,
                                prevP,
                                nextP,
                                pageTotal,
                                sortBy:sortBy,
                                perPage:perPage
                                });
                            }
                            else
                            {
                                if(body.priceMin == '0' && body.priceMax == '0' || !body.priceMin || !body.priceMax)
                                {
                                    Product.find({}).sort({totalSold:-1})
                                    .clone()
                                    .limit(perPage)
                                    .skip(perPage * (parseInt(body.nextpages))).then((product) =>{
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
                                        Product.count({}).exec().then((count) => {
                                            if(count)
                                            {
                                                let totalPages = []
                                                let pageTotal = Math.ceil(count / perPage)
                                                let currentpage = parseInt(body.currentpages)
                                    
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
                                                res.status(200).send({ code: '5',listProduct:listProduct,
                                                currentpage,
                                                totalPages,
                                                prevPage,
                                                nextPage,
                                                prevP,
                                                nextP,
                                                pageTotal,
                                                sortBy:sortBy,
                                                perPage:perPage
                                                });
                                            }
                                        })
                                    })
                                }
                                else
                                {
                                    res.status(200).send({ code: '6',listProduct:listProduct});
                                }
                            }
                        })
                    })
                    .catch((error) => {
                        console.log(error)
                    })
                }
                else if(body.state === '0')
                {
                    Product.find({price : { $gt :  body.priceMin, $lt : body.priceMax}}).sort({totalSold:-1})
                    .clone()
                    .limit(perPage)
                    .skip(perPage * (parseInt(body.nextpages))).then((product) =>{
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
                                },
                                totalSold:p.totalSold
                            })
                        })
                        Product.count({price : { $gt :  body.priceMin, $lt : body.priceMax}}).exec().then((count) => {
                            if(count)
                            {
                                let totalPages = []
                                let pageTotal = Math.ceil(count / perPage)
                                let currentpage = parseInt(body.currentpages) + 1
                    
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
                                res.status(200).send({ code: '3',listProduct:listProduct,
                                currentpage,
                                totalPages,
                                prevPage,
                                nextPage,
                                prevP,
                                nextP,
                                pageTotal,
                                sortBy:sortBy,
                                perPage:perPage
                                });
                            }
                            else
                            {
                                if(body.priceMin == '0' && body.priceMax == '0' || !body.priceMin || !body.priceMax)
                                {
                                    Product.find({}).sort({totalSold:-1})
                                    .clone()
                                    .limit(perPage)
                                    .skip(perPage * (parseInt(body.nextpages))).then((product) =>{
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
                                                },
                                                totalSold:p.totalSold
                                            })
                                        })
                                        Product.count({}).exec().then((count) => {
                                            if(count)
                                            {
                                                let totalPages = []
                                                let pageTotal = Math.ceil(count / perPage)
                                                let currentpage = parseInt(body.currentpages) + 1
                                    
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
                                                res.status(200).send({ code: '5',listProduct:listProduct,
                                                currentpage,
                                                totalPages,
                                                prevPage,
                                                nextPage,
                                                prevP,
                                                nextP,
                                                pageTotal,
                                                sortBy:sortBy,
                                                perPage:perPage
                                                });
                                            }
                                        })
                                    })
                                }
                                else
                                {
                                    res.status(200).send({ code: '6',listProduct:listProduct});
                                }
                            }
                        })
                    })
                    .catch((error) => {
                        console.log(error)
                    })
                }
                else
                {
                    Product.find({}).sort({totalSold:-1})
                    .clone()
                    .limit(perPage)
                    .skip(perPage * (parseInt(body.nextpages))).then((product) =>{
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
                                },
                                totalSold:p.totalSold
                            })
                        })
                        Product.count({}).exec().then((count) => {
                            if(count)
                            {
                                let totalPages = []
                                let pageTotal = Math.ceil(count / perPage)
                                let currentpage = parseInt(body.currentpages) + 1
                    
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
                                res.status(200).send({ code: '5',listProduct:listProduct,
                                currentpage,
                                totalPages,
                                prevPage,
                                nextPage,
                                prevP,
                                nextP,
                                pageTotal,
                                sortBy:sortBy,
                                perPage:perPage
                                });
                            }
                            else
                            {
                                res.status(200).send({ code: '6',listProduct:listProduct});
                            }
                        })
                    })
                    .catch((error) => {
                        console.log(error)
                    })
                }
            }
            else
            {
                console.log("YESS")

                if(body.state === '1')
                {
                    
                    Product.find({}).sort({totalSold:-1})
                    .clone()
                    .limit(perPage)
                    .skip(perPage * (parseInt(body.nextpages))).then((product) =>{
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
                                },
                                totalSold:p.totalSold
                            })
                        })
                        Product.count({}).exec().then((count) => {
                            if(count)
                            {
                                let totalPages = []
                                let pageTotal = Math.ceil(count / perPage)
                                let currentpage = body.currentpages + 1
                    
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
                                res.status(200).send({ code: '2',listProduct:listProduct,
                                currentpage,
                                totalPages,
                                prevPage,
                                nextPage,
                                prevP,
                                nextP,
                                pageTotal,
                                sortBy:sortBy,
                                perPage:perPage
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
                    Product.find({}).sort({totalSold:-1})
                    .clone()
                    .limit(perPage)
                    .skip(perPage * (parseInt(body.nextpages) + 1)).then((product) =>{
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
                                },
                                totalSold:p.totalSold
                            })
                        })
                        Product.count({}).exec().then((count) => {
                            if(count)
                            {
                                let totalPages = []
                                let pageTotal = Math.ceil(count / perPage)
                                let currentpage = parseInt(body.currentpages)  + 1
                    
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
                                res.status(200).send({ code: '3',listProduct:listProduct,
                                currentpage,
                                totalPages,
                                prevPage,
                                nextPage,
                                prevP,
                                nextP,
                                pageTotal,
                                sortBy:sortBy,
                                perPage:perPage
                                });
                            }
                            else
                            {
                                res.status(200).send({ code: '4',listProduct:listProduct});
                            }
                        })
                    })
                    .catch((error) => {
                        console.log(error)
                    })
                }
                else
                {
                    Product.find({}).sort({totalSold:-1})
                    .clone()
                    .limit(perPage)
                    .skip(perPage * (parseInt(body.currentpages))).then((product) =>{
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
                                },
                                totalSold:p.totalSold
                            })
                        })
                        Product.count({}).exec().then((count) => {
                            if(count)
                            {
                                let totalPages = []
                                let pageTotal = Math.ceil(count / perPage)
                                let currentpage = parseInt(body.currentpages) + 1
                    
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
                                res.status(200).send({ code: '5',listProduct:listProduct,
                                currentpage,
                                totalPages,
                                prevPage,
                                nextPage,
                                prevP,
                                nextP,
                                pageTotal,
                                sortBy:sortBy,
                                perPage:perPage
                                });
                            }
                            else
                            {
                                res.status(200).send({ code: '6',listProduct:listProduct});
                            }
                        })
                    })
                    .catch((error) => {
                        console.log(error)
                    })
                }
            }
        }
        else
        {
            if(body.priceMin && body.priceMax)
            {
                if(body.state === '1')
                {
                    
                    Product.find({price : { $gt :  body.priceMin, $lt : body.priceMax}}).sort({date:-1})
                    .clone()
                    .limit(perPage)
                    .skip(perPage * (parseInt(body.nextpages))).then((product) =>{
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
                                },
                                totalSold:p.totalSold
                            })
                        })
                        Product.count({price : { $gt :  body.priceMin, $lt : body.priceMax}}).exec().then((count) => {
                            if(count)
                            {
                                let totalPages = []
                                let pageTotal = Math.ceil(count / perPage)
                                let currentpage = parseInt(body.currentpages) + 1
                    
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
                                res.status(200).send({ code: '2',listProduct:listProduct,
                                currentpage,
                                totalPages,
                                prevPage,
                                nextPage,
                                prevP,
                                nextP,
                                pageTotal,
                                sortBy:sortBy,
                                perPage:perPage
                                });
                            }
                            else
                            {
                                if(body.priceMin == '0' && body.priceMax == '0' || !body.priceMin || !body.priceMax)
                                {
                                    Product.find({}).sort({date:-1})
                                    .clone()
                                    .limit(perPage)
                                    .skip(perPage * (parseInt(body.nextpages))).then((product) =>{
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
                                        Product.count({}).exec().then((count) => {
                                            if(count)
                                            {
                                                let totalPages = []
                                                let pageTotal = Math.ceil(count / perPage)
                                                let currentpage = parseInt(body.currentpages) + 1
                                    
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
                                                res.status(200).send({ code: '5',listProduct:listProduct,
                                                currentpage,
                                                totalPages,
                                                prevPage,
                                                nextPage,
                                                prevP,
                                                nextP,
                                                pageTotal,
                                                sortBy:sortBy,
                                                perPage:perPage
                                                });
                                            }
                                        })
                                    })
                                }
                                else
                                {
                                    res.status(200).send({ code: '6',listProduct:listProduct});
                                }
                            }
                        })
                    })
                    .catch((error) => {
                        console.log(error)
                    })
                }
                else if(body.state === '0')
                {
                    Product.find({price : { $gt :  body.priceMin, $lt : body.priceMax}}).sort({date:-1})
                    .clone()
                    .limit(perPage)
                    .skip(perPage * (parseInt(body.nextpages))).then((product) =>{
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
                                },
                                totalSold:p.totalSold
                            })
                        })
                        Product.count({price : { $gt :  body.priceMin, $lt : body.priceMax}}).exec().then((count) => {
                            if(count)
                            {
                                let totalPages = []
                                let pageTotal = Math.ceil(count / perPage)
                                let currentpage = parseInt(body.currentpages) + 1
                    
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
                                res.status(200).send({ code: '3',listProduct:listProduct,
                                currentpage,
                                totalPages,
                                prevPage,
                                nextPage,
                                prevP,
                                nextP,
                                pageTotal,
                                sortBy:sortBy,
                                perPage:perPage
                                });
                            }
                            else
                            {
                                if(body.priceMin == '0' && body.priceMax == '0' || !body.priceMin || !body.priceMax)
                                {
                                    Product.find({}).sort({date:-1})
                                    .clone()
                                    .limit(perPage)
                                    .skip(perPage * (parseInt(body.nextpages))).then((product) =>{
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
                                                },
                                                totalSold:p.totalSold
                                            })
                                        })
                                        Product.count({}).exec().then((count) => {
                                            if(count)
                                            {
                                                let totalPages = []
                                                let pageTotal = Math.ceil(count / perPage)
                                                let currentpage = parseInt(body.currentpages) + 1
                                    
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
                                                res.status(200).send({ code: '5',listProduct:listProduct,
                                                currentpage,
                                                totalPages,
                                                prevPage,
                                                nextPage,
                                                prevP,
                                                nextP,
                                                pageTotal,
                                                sortBy:sortBy,
                                                perPage:perPage
                                                });
                                            }
                                        })
                                    })
                                }
                                else
                                {
                                    res.status(200).send({ code: '6',listProduct:listProduct});
                                }
                            }
                        })
                    })
                    .catch((error) => {
                        console.log(error)
                    })
                }
                else
                {
                    Product.find({}).sort({date:-1})
                    .clone()
                    .limit(perPage)
                    .skip(perPage * (parseInt(body.nextpages))).then((product) =>{
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
                                },
                                totalSold:p.totalSold
                            })
                        })
                        Product.count({}).exec().then((count) => {
                            if(count)
                            {
                                let totalPages = []
                                let pageTotal = Math.ceil(count / perPage)
                                let currentpage = parseInt(body.currentpages) + 1
                    
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
                                res.status(200).send({ code: '5',listProduct:listProduct,
                                currentpage,
                                totalPages,
                                prevPage,
                                nextPage,
                                prevP,
                                nextP,
                                pageTotal,
                                sortBy:sortBy,
                                perPage:perPage
                                });
                            }
                            else
                            {
                                res.status(200).send({ code: '6',listProduct:listProduct});
                            }
                        })
                    })
                    .catch((error) => {
                        console.log(error)
                    })
                }
            }
            else
            {
                if(body.state === '1')
                {
                    
                    Product.find({}).sort({date:-1})
                    .clone()
                    .limit(perPage)
                    .skip(perPage * (parseInt(body.nextpages))).then((product) =>{
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
                                },
                                totalSold:p.totalSold
                            })
                        })
                        Product.count({}).exec().then((count) => {
                            if(count)
                            {
                                let totalPages = []
                                let pageTotal = Math.ceil(count / perPage)
                                let currentpage = body.currentpages + 1
                    
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
                                res.status(200).send({ code: '2',listProduct:listProduct,
                                currentpage,
                                totalPages,
                                prevPage,
                                nextPage,
                                prevP,
                                nextP,
                                pageTotal,
                                sortBy:sortBy,
                                perPage:perPage
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
                    Product.find({}).sort({date:-1})
                    .clone()
                    .limit(perPage)
                    .skip(perPage * (parseInt(body.nextpages))).then((product) =>{
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
                                },
                                totalSold:p.totalSold
                            })
                        })
                        Product.count({}).exec().then((count) => {
                            if(count)
                            {
                                let totalPages = []
                                let pageTotal = Math.ceil(count / perPage)
                                let currentpage = parseInt(body.currentpages)  + 1
                    
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
                                res.status(200).send({ code: '3',listProduct:listProduct,
                                currentpage,
                                totalPages,
                                prevPage,
                                nextPage,
                                prevP,
                                nextP,
                                pageTotal,
                                sortBy:sortBy,
                                perPage:perPage
                                });
                            }
                            else
                            {
                                res.status(200).send({ code: '4',listProduct:listProduct});
                            }
                        })
                    })
                    .catch((error) => {
                        console.log(error)
                    })
                }
                else
                {
                    Product.find({}).sort({date:-1})
                    .clone()
                    .limit(perPage)
                    .skip(perPage * (parseInt(body.nextpages))).then((product) =>{
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
                                },
                                totalSold:p.totalSold
                            })
                        })
                        Product.count({}).exec().then((count) => {
                            if(count)
                            {
                                let totalPages = []
                                let pageTotal = Math.ceil(count / perPage)
                                let currentpage = parseInt(body.currentpages) + 1
                    
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
                                res.status(200).send({ code: '5',listProduct:listProduct,
                                currentpage,
                                totalPages,
                                prevPage,
                                nextPage,
                                prevP,
                                nextP,
                                pageTotal,
                                sortBy:sortBy,
                                perPage:perPage
                                });
                            }
                            else
                            {
                                res.status(200).send({ code: '6',listProduct:listProduct});
                            }
                        })
                    })
                    .catch((error) => {
                        console.log(error)
                    })
                }
            }
        }
    }

    // return res.redirect('/store')
})


module.exports = router