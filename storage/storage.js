const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Product = require('../models/Product')

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret:process.env.CLOUDINARY_SECRET,
    secure:true,
});
const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        return {
            folder: 'ShopCart',
            allowedFormats: ['jpeg', 'png', 'jpg'],
            public_id: req.body.name,
            unique_filename: true,
        }
    }
});

async function destroyCloudinary(publicId) {
    try {
        const result = await cloudinary.uploader.destroy('ShopCart/'+publicId);
        console.log(result);
    } catch (error) {
        console.error(error);
    }
}

async function renameCloudinary(publicId, newPublicId) {
    try {
        const result = await cloudinary.uploader.rename('ShopCart/'+publicId, 'ShopCart/'+newPublicId,{ overwrite: true },);
        await Product.findOneAndUpdate(
            { name: newPublicId },
            { $set: { 'image.path': result.url } }
        );

    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    storage,
    destroyCloudinary,
    renameCloudinary
};