const express = require('express')
const router = express.Router()
const Product = require('../models/Product')
const User = require('../models/User')
const userCart = require('../models/userCart')

router.get('/',(req,res,next) => {
    var perPage = 2
    , page = 0
    
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
                                            pageTotal
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
                                pageTotal
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
                            }
                        })
                    })
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
                            pageTotal
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
                                            }
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
                                            for(var i = 1;i<=pageTotal;i++)
                                            {
                                                totalPages.push(i)
                                            }
                                            res.status(200).send({ code: '5',listProduct:listProduct,
                                            currentpage,
                                            totalPages,
                                            prevPage,
                                            nextPage,
                                            prevP,
                                            nextP,
                                            pageTotal
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
                            }
                        })
                    })
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
                            res.status(200).send({ code: '3',listProduct:listProduct,message:"list,price,uncheckbox",
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
                                            }
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
                                            for(var i = 1;i<=pageTotal;i++)
                                            {
                                                totalPages.push(i)
                                            }
                                            res.status(200).send({ code: '5',listProduct:listProduct,
                                            currentpage,
                                            totalPages,
                                            prevPage,
                                            nextPage,
                                            prevP,
                                            nextP,
                                            pageTotal
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
                            }
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
                            for(var i = 1;i<=pageTotal;i++)
                            {
                                totalPages.push(i)
                            }
                            res.status(200).send({ code: '1',listProduct:listProduct,message:"list,price,checkbox",
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
                            }
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
                            for(var i = 1;i<=pageTotal;i++)
                            {
                                totalPages.push(i)
                            }
                            res.status(200).send({ code: '3',listProduct:listProduct,message:"list,price,uncheckbox",
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
                            for(var i = 1;i<=pageTotal;i++)
                            {
                                totalPages.push(i)
                            }
                            res.status(200).send({ code: '5',listProduct:listProduct,
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
                        }
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
                        pageTotal
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
                                        for(var i = 1;i<=pageTotal;i++)
                                        {
                                            totalPages.push(i)
                                        }
                                        res.status(200).send({ code: '5',listProduct:listProduct,
                                        currentpage,
                                        totalPages,
                                        prevPage,
                                        nextPage,
                                        prevP,
                                        nextP,
                                        pageTotal
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
                        for(var i = 1;i<=pageTotal;i++)
                        {
                            totalPages.push(i)
                        }
                        res.status(200).send({ code: '5',listProduct:listProduct,
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
                        res.status(200).send({ code: '6',listProduct:listProduct});
                    }
                })
            })
            .catch((error) => {
                console.log(error)
            })
        }
    }

    // return res.redirect('/store')
})

router.get('/page/:page',(req,res,next) => {
    var perPage = 2
    , page =  Math.max(0, req.params.page) - 1;
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

router.post('/page/:page', function(req, res, next) {
    var username = req.session.user
    var body = req.body
    var listProduct = []
    var perPage = 2
    if(body.listType)
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
                            }
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
                            pageTotal
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
                                            }
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
                                            for(var i = 1;i<=pageTotal;i++)
                                            {
                                                totalPages.push(i)
                                            }
                                            res.status(200).send({ code: '5',listProduct:listProduct,
                                            currentpage,
                                            totalPages,
                                            prevPage,
                                            nextPage,
                                            prevP,
                                            nextP,
                                            pageTotal
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
                            }
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
                            pageTotal
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
                                            }
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
                                            for(var i = 1;i<=pageTotal;i++)
                                            {
                                                totalPages.push(i)
                                            }
                                            res.status(200).send({ code: '5',listProduct:listProduct,
                                            currentpage,
                                            totalPages,
                                            prevPage,
                                            nextPage,
                                            prevP,
                                            nextP,
                                            pageTotal
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
                .skip(perPage * parseInt(body.nextpages)).then((product) =>{
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
                            pageTotal
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
                            }
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
                            }
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
                            pageTotal
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
                .skip(perPage * parseInt(body.nextpages)).then((product) =>{
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
                            pageTotal
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
                            }
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
                            pageTotal
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
                                            for(var i = 1;i<=pageTotal;i++)
                                            {
                                                totalPages.push(i)
                                            }
                                            res.status(200).send({ code: '5',listProduct:listProduct,
                                            currentpage,
                                            totalPages,
                                            prevPage,
                                            nextPage,
                                            prevP,
                                            nextP,
                                            pageTotal
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
                            }
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
                            pageTotal
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
                                            for(var i = 1;i<=pageTotal;i++)
                                            {
                                                totalPages.push(i)
                                            }
                                            res.status(200).send({ code: '5',listProduct:listProduct,
                                            currentpage,
                                            totalPages,
                                            prevPage,
                                            nextPage,
                                            prevP,
                                            nextP,
                                            pageTotal
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
                .skip(perPage * parseInt(body.nextpages)).then((product) =>{
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
                            pageTotal
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
                            }
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
                            pageTotal
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
                .skip(perPage * parseInt(body.nextpages)).then((product) =>{
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
                            pageTotal
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


module.exports = router