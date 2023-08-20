const express = require('express')
const router = express.Router()
const Product = require('../models/Product')
const User = require('../models/User')
const userCart = require('../models/userCart')



router.get('/',(req,res,next) => {
    var perPage = 18
    , page = req.query.page ? req.query.page : 0

    let item = req.query.item.toString();
    let category = req.query.category ==='All' ? '' : req.query.category;
    let idx = req.query.idx;
    Product.exists({name: { $regex: item, $options: 'i' }}).then((pd) =>{
        if(pd)
        {   
            var infoProduct = []
            var typeList = []
            var infoItem = []
            
            if(category === '')
            {
                if(item === '')
                {
                    Product.find({})
                    .sort({date: -1, _id: -1}).clone()
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
                                                    }
    
                                                    return res.render('search',{
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
                                        return res.render('search',{
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
                                        })
                                    }
                                })
                            }
                        }
                        else
                        {
                            return res.render('search')
                        }
                    }).catch((error) => {
                        console.log(error)
                    })       
                }
                else
                {
                    Product.find({ name: { $regex: item, $options: 'i' }})
                    .sort({date: -1, _id: -1}).clone()
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
                                            })

                                            Product.count({ name: { $regex: item, $options: 'i' }}).exec().then((count) => {
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

                                                    return res.render('search',{
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
                                                        item:item
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
                                })
                                Product.count({ name: { $regex: item, $options: 'i' }}).exec().then((count) => {
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
                                        return res.render('search',{
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
                                            item:item
                                        })
                                    }
                                })
                            }
                        }
                        else
                        {
                            return res.render('search')
                        }
                    }).catch((error) => {
                        console.log(error)
                    })        
                } 
            }
            else
            {
                if(item === '')
                {
                    Product.find({category:category})
                    .sort({date: -1, _id: -1}).clone()
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
    
                                            console.log(infoProduct)
    
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
    
                                                    return res.render('search',{
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
                                                        item:item
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
                                        return res.render('search',{
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
                                            item:item
                                        })
                                    }
                                })
                            }
                        }
                        else
                        {
                            return res.render('search')
                        }
                    }).catch((error) => {
                        console.log(error)
                    })       
                }
                else
                {
                    Product.find({ name: { $regex: item, $options: 'i' }},{category:category})
                    .sort({date: -1, _id: -1}).clone()
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

                                            console.log(infoProduct)

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

                                                    return res.render('search',{
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
                                                        item:item
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
                                        return res.render('search',{
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
                                            item:item
                                        })
                                    }
                                })
                            }
                        }
                        else
                        {
                            return res.render('search')
                        }
                    }).catch((error) => {
                        console.log(error)
                    })        
                } 
            }
        }
        else
        {
            return res.render('search',{
                message:"Not found item"
            })
        }
    })
})


// router.post('/',(req,res,next) => {
//     const searchData = req.body;
//     console.log('body',searchData)
//     return res.redirect(`/search?item=${searchData.item}&category=${searchData.category}&idx=${searchData.idx}`)
// })

router.post('/',(req,res,next) => {
    const {category,item,idx,page} = req.query;
    // console.log(req.query)
    const body = req.body
    const perPage = 18
    let listProduct = []
    if(item !== '')
    {
        if(category !== '')
        {
            Product.find({}).sort({date: -1, _id: -1})
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
                        res.status(200).send({ code: '10',listProduct:listProduct,
                        currentpage,
                        totalPages,
                        prevPage,
                        nextPage,
                        prevP,
                        nextP,
                        pageTotal,
                        perPage:perPage
                        });
                    }
                    else
                    {
                        res.status(200).send({ code: '0',message:'Not found item'});
                    }
                })
            })
            .catch((error) => {
                console.log(error)
            })
        }
        else
        {
            Product.find({category:category}).sort({date: -1, _id: -1})
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
                Product.count({category:category}).exec().then((count) => {
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
                        res.status(200).send({ code: '10',listProduct:listProduct,
                        currentpage,
                        totalPages,
                        prevPage,
                        nextPage,
                        prevP,
                        nextP,
                        pageTotal,
                        perPage:perPage
                        });
                    }
                    else
                    {
                        res.status(200).send({ code: '0',message:'Not found item'});
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
        if(category !== '')
        {
            Product.find({ name: { $regex: item, $options: 'i' }}).sort({date: -1, _id: -1})
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
                Product.count({ name: { $regex: item, $options: 'i' }}).exec().then((count) => {
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
                        perPage:perPage
                        });
                    }
                    else
                    {
                        res.status(200).send({ code: '0',message:'Not found item'});
                    }
                })
            })
            .catch((error) => {
                console.log(error)
            })
        }
        else
        {
            Product.find({ name: { $regex: item, $options: 'i' }},{category:category}).sort({date: -1, _id: -1})
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
                Product.count({ name: { $regex: item, $options: 'i' }},{category:category}).exec().then((count) => {
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
                        perPage:perPage
                        });
                    }
                    else
                    {
                        res.status(200).send({ code: '0',message:'Not found item'});
                    }
                })
            })
            .catch((error) => {
                console.log(error)
            })
        }
    }
})

module.exports = router