const express = require('express')
const router = express.Router()
const getTime = require('../public/js/getTime')
const {validationResult} = require('express-validator')
const addValidator = require('../middleware/validate/addValidator')
const updateValidator = require('../middleware/validate/updateValidator')
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const resolve = path.resolve
const Product = require('../models/Product')
const User = require('../models/User')

const checkFileType = (req, file, cb) => {
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg")
    {
        cb(null, true);
    }
    else
    {
        req.fileTypeInvalid = "Invalid format, only JPG and PNG";
        return  cb(null, false, req.fileTypeInvalid);
    }
};

const uploader = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            let body = req.body
            let imageProductPath = `/tmp/products`
            if(!fs.existsSync(imageProductPath))
            {
                try {
                    fs.mkdirSync(imageProductPath,{ recursive: true });
                } catch(err) {
                    console.error("Error creating directory: ", err);
                }
            }
            let imagePath = `${imageProductPath}/${body.name}/images/`
            if(!fs.existsSync(imagePath))
            {
                try {
                    console.log("Create Folder success")
                    fs.mkdirSync(imagePath,{ recursive: true });
                } catch(err) {
                    console.error("Error creating directory: ", err);
                }
            }
            cb(null, imagePath);
        }
    }),
    fileFilter:checkFileType
})

router.get('/',(req,res,next) =>{
    res.render('layouts/main',{
        layout: 'navAdmin'
    })
})


router.get('/list-product',(req,res,next) =>{
    var perPage = 10
    , page = 0
    Product.find({}).sort({date:1}).clone()
    .limit(perPage)
    .skip(perPage * page)
    .then(function(result) {

        result= result.map(item=> item.toObject()).sort(function(a,b){
            return new Date(b.date) - new Date(a.date);
        });

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
                for(var i = 1;i<=pageTotal;i++)
                {
                    totalPages.push(i)
                }
                return res.render('admin/listproduct', {
                    title: 'Manage •', 
                    currPage: 'List Product',
                    layout: 'navAdmin', 
                    result,
                    currentpage,
                    totalPages,
                    prevPage,
                    nextPage,
                    prevP,
                    nextP,
                    pageTotal
                })
            }
            else
            {
                return res.render('admin/listproduct', {
                    title: 'Manage •', 
                    currPage: 'List Product',
                    layout: 'navAdmin', 
                })
            }
        })
        .catch((error) => {
            console.log(error)
        })
        
    }).catch((error) => {
        console.log(error)
    })
})

router.get('/list-product/:page',(req,res,next) =>{
    var perPage = 10
    , page =  Math.max(0, req.params.page) - 1;
    Product.find({}).sort({date:1}).clone()
    .limit(perPage)
    .skip(perPage * page)
    .then(function(result) {

        result= result.map(item=> item.toObject()).sort(function(a,b){
            return new Date(b.date) - new Date(a.date);
        });

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
                for(var i = 1;i<=pageTotal;i++)
                {
                    totalPages.push(i)
                }
                return res.render('admin/listproduct', {
                    title: 'Manage •', 
                    currPage: 'List Product',
                    layout: 'navAdmin', 
                    result,
                    currentpage,
                    totalPages,
                    prevPage,
                    nextPage,
                    prevP,
                    nextP,
                    pageTotal
                })
            }
            else
            {
                return res.render('admin/listproduct', {
                    title: 'Manage •', 
                    currPage: 'List Product',
                    layout: 'navAdmin', 
                })
            }
        })
        .catch((error) => {
            console.log(error)
        })
        
    }).catch((error) => {
        console.log(error)
    })
})

router.get('/list-user',(req,res,next) =>{
    var perPage = 10
    , page = 0
    User.find({}).sort({date:1}).clone()
    .limit(perPage)
    .skip(perPage * page)
    .then(function(result) {

        result= result.map(item=> item.toObject()).sort(function(a,b){
            return new Date(b.date) - new Date(a.date);
        });

        User.count({}).exec().then((count) => {
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
                return res.render('admin/listuser', {
                    title: 'Manage •', 
                    currPage: 'List User',
                    layout: 'navAdmin', 
                    result,
                    currentpage,
                    totalPages,
                    prevPage,
                    nextPage,
                    prevP,
                    nextP,
                    pageTotal
                })
            }
            else
            {
                return res.render('admin/listproduct', {
                    title: 'Manage •', 
                    currPage: 'List User',
                    layout: 'navAdmin', 
                })
            }
        })
        .catch((error) => {
            console.log(error)
        })
        
    }).catch((error) => {
        console.log(error)
    })
})

router.get('/list-user/:page',(req,res,next) =>{
    var perPage = 10
    , page =  Math.max(0, req.params.page) - 1;
    User.find({}).sort({date:1}).clone()
    .limit(perPage)
    .skip(perPage * page)
    .then(function(result) {

        result= result.map(item=> item.toObject()).sort(function(a,b){
            return new Date(b.date) - new Date(a.date);
        });

        User.count({}).exec().then((count) => {
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
                return res.render('admin/listuser', {
                    title: 'Manage •', 
                    currPage: 'List User',
                    layout: 'navAdmin', 
                    result,
                    currentpage,
                    totalPages,
                    prevPage,
                    nextPage,
                    prevP,
                    nextP,
                    pageTotal
                })
            }
            else
            {
                return res.render('admin/listuser', {
                    title: 'Manage •', 
                    currPage: 'List User',
                    layout: 'navAdmin', 
                })
            }
        })
        .catch((error) => {
            console.log(error)
        })
        
    }).catch((error) => {
        console.log(error)
    })
})


router.get('/categories',(req,res,next) =>{
    res.render('admin/listactivated',{
        layout: 'navAdmin',
        currPage: '• Categories' ,
    })
})


router.get('/add-product',(req,res,next) =>{
    const error = req.flash('error') || ''
    res.render('admin/addproduct',{
        layout: 'navAdmin',
        title: 'Manage •', 
        currPage: 'Add Product' ,
        error:error
    })
})

router.post('/add-product',uploader.single('myImage'),addValidator,(req,res,next) =>{
    let result = validationResult(req)
    let message
    if(result.errors.length === 0)
    {
        let body = req.body
        let myImage = req.file
        let tempPathImage = `/tmp/products/${body.name}/images/`
        let newPathImage = path.join(__dirname,`/public/products/${body.name}/images/`)
        if(!fs.existsSync(newPathImage))
        {
            try {
                fs.mkdirSync(newPathImage,{ recursive: true });
            } catch(err) {
                console.error("Error creating directory: ", err);
            }
        }
        let product = new Product({
            name:body.name,
            number:body.number,
            price:body.price,
            date:body.dom,
            category:body.type,
            desc:body.desc,
            detail:body.detail,
            address: body.address,
            image: {
                path: newPathImage,
                name: myImage.originalname,
                imageType: myImage.mimetype
            }
        })
        console.log(tempPathImage + myImage.originalname, newPathImage + myImage.originalname)
        product.save().then(()=>{
            if (fs.existsSync(myImage.path)) {
                fs.renameSync(myImage.path, tempPathImage + myImage.originalname,(err) =>{
                    if (err) {
                        console.error('Error moving file:', err);
                      } else {
                       
                      }
                });
                fs.copyFileSync(tempPathImage + myImage.originalname,newPathImage + myImage.originalname)
                if(fs.existsSync(newPathImage))
                {
                    try {
                        fs.unlinkSync(tempPathImage + myImage.originalname);
                    } catch(err) {
                        console.error("Error creating directory: ", err);
                    }
                }
            } else {
                console.error("File not found:", myImage);
            }
            res.redirect('list-product')
        }).catch((err)=>{
            console.log(err) 
        })
    }
    else if (req.fileTypeInvalid) 
    {
        message = req.fileTypeInvalid
        req.flash('error',message)
        res.redirect('add-product')
    }
    else
    {
        let {myImage} = req.file
        if(myImage)
            fs.unlinkSync(myImage.path)

        let messages = result.mapped()
        let message = ''
        for(m in messages)
        {
            message = messages[m].msg
            break
        }
        req.flash('error',message)
        res.redirect('add-product')
    }
})

router.get('/detail-product/:id',(req,res,next) =>{
    var id = req.params.id
    Product.findById({_id:id}).then((u)=>{
        let result = []
        result.push({
            id:u._id,
            name:u.name,
            number:u.number,
            price:u.price,
            type:u.category,
            detail:u.detail,
            date:u.date,
            desc:u.desc,
            image:u.image,
        })
        res.render('admin/detailproduct',{
            result,
            layout: 'navAdmin',
            title: 'Manage •', 
            currPage: 'Detail Product' ,
        })
    }).catch((error) =>{
        console.log(error)
    })
})

router.get('/delete-product/:id',(req,res,next) =>{
    var id = req.params.id
    if(id)
    {
        Product.findById({_id:id}).then((u)=>{
            Product.deleteOne({_id:u.id}).then((delProduct) =>{
                fs.rmSync(`/tmp/products/${u.name}`, { recursive: true, force: true })
                fs.rmSync(`public/products/${u.name}`, { recursive: true, force: true })
                console.log("success")
            }).catch((error) =>{
                console.log(error)
            })
        }).catch((error) =>{
            console.log(error)
        })
    }
})

router.get('/edit-product/:id',(req,res,next) =>{
    const error = req.flash('error-update') || ''
    var id = req.params.id
    Product.findById({_id:id}).then((u)=>{
        let result = []
        result.push({
            id:u._id,
            name:u.name,
            number:u.number,
            price:u.price,
            type:u.category,
            detail:u.detail,
            date:u.date,
            desc:u.desc,
            image:u.image,
        })
        res.render('admin/editproduct',{
            result,
            layout: 'navAdmin',
            title: 'Manage •', 
            currPage: 'Edit Product' ,
            error:error
        })
    }).catch((error) =>{
        console.log(error)
    })
})

router.post('/edit-product/:id',uploader.single('myImageEdit'),updateValidator ,(req,res,next) =>{
    var id = req.params.id
    let result = validationResult(req)
    if (req.fileTypeInvalid) 
    {
        let message = req.fileTypeInvalid
        req.flash('error-update',message)
        res.redirect(`./${id}`)
    }
    if(result.errors.length === 0)
    {
        let body = req.body
        let myImageEdit = req.file
        if(myImageEdit)
        {
            let newPathImage = `public/products/${body.name}/images/`
            let product = {
                name:body.name,
                number:body.number,
                price:body.price,
                date:body.dom,
                category:body.type,
                desc:body.desc,
                detail:body.detail,
                address: body.address,
                image: {
                    path: newPathImage,
                    name: myImageEdit.originalname,
                    imageType: myImageEdit.mimetype
                }
            }
            Product.findById({_id:id}).then((p)=>{
                // Name don't change
                if (body.name === p.name)
                {
                    let oldFile = `public/products/${p.name}/images/${p.image.name}`
                    Product.findOneAndUpdate({_id:id},product).then(()=>{
                        if(fs.existsSync(oldFile))
                        {
                            fs.unlinkSync(oldFile)
                        }
                        let newPathImage = `public/products/${body.name}/images/`
                        if(!fs.existsSync(newPathImage))
                        {
                            try {
                                fs.mkdirSync(newPathImage,{ recursive: true });
                            } catch(err) {
                                console.error("Error creating directory: ", err);
                            }
                        }
                        fs.renameSync(myImageEdit.path,newPathImage + myImageEdit.originalname)
                        res.redirect(`./${id}`)
                    }).catch((error)=>{
                        console.log(error)
                    })
                }
                else // Change
                {
                    console.log("2 true")
                    let oldFolder = `/public/products/${p.name}`
                    Product.findOneAndUpdate({_id:id},product).then(()=>{
                        if (fs.existsSync(oldFolder)){
                            fs.rmSync(oldFolder, { recursive: true, force: true })
                        }
                        fs.renameSync(myImageEdit.path,`./public/products/${body.name}/images/`+ myImageEdit.originalname)
                        res.redirect(`./${id}`)
                    }).catch((error)=>{
                        console.log(error)
                    })
                }
            }).catch((error)=>{
                console.log(error)
            })
        }
        else
        {
            console.log("3 true")
            Product.findById({_id:id}).then((p)=>{
                let newPathImage = `public/products/${body.name}/images/`
                let product = {
                    _id:id,
                    name:body.name,
                    number:body.number,
                    price:body.price,
                    date:body.dom,
                    category:body.type,
                    desc:body.desc,
                    detail:body.detail,
                    address: body.address,
                    image: {
                        path: newPathImage,
                        name: p.image.name,
                        imageType: p.image.name
                    }
                }
                // Name don't change
                if (body.name === p.name)
                {
                    let newFolder = `./public/products/${p.name}/images`
                    Product.findOneAndUpdate({_id:id},product).then(()=>{
                        if (!fs.existsSync(newFolder)) {
                            fs.mkdirSync(newFolder,{recursive:true});
                        }
                        console.log("success")
                        res.redirect(`./${id}`)
                    }).catch((error)=>{
                        console.log(error)
                    })
                }
                else // Change
                {
                    let newFolder = `./public/products/${body.name}/images`
                    if (!fs.existsSync(newFolder)) {
                        fs.mkdirSync(newFolder,{recursive:true});
                    }
                    if(fs.existsSync(`./public/products/${p.name}/images/${p.image.name}`))
                    {
                        fs.copyFileSync(`./public/products/${p.name}/images/${p.image.name}`, `./public/products/${body.name}/images/${p.image.name}`)

                    }
                    Product.findOneAndUpdate({_id:id},product).then(()=>{
                        let oldFolder = `./public/products/${p.name}`
                        if (fs.existsSync(oldFolder)){
                            fs.rmSync(oldFolder, { recursive: true, force: true })
                        }
                        console.log("success")
                        res.redirect(`./${id}`)
                    }).catch((error)=>{
                        console.log(error)
                    })
                }
            }).catch((error)=>{
                console.log(error)
            })
        }
    }
    else
    {
        let {myImage} = req.files
        if(myImage)
            fs.unlinkSync(myImage[0].path)

        let messages = result.mapped()
        let message = ''
        for(m in messages)
        {
            message = messages[m].msg
            break
        }
        console.log(messages)
        req.flash('error-update',message)
        res.redirect(`./${id}`)
    }
})




module.exports = router