const Product = require('../models/Product')

module.exports.getTotalPriceAndNumber = async function(carts){
    let totalPrice = 0;
    let totalNumber = 0;
    const infoProduct = [];
    
    for (const ct of carts) {
        const pc = await Product.exists({ name: ct.productName });
        if (pc) {
        infoProduct.push({
            productName: ct.productName,
            productNumber: ct.productNumber,
            productPrice: ct.productPrice,
            productImage: {
            path: ct.productImage.path,
            name: ct.productImage.name,
            imageType: ct.productImage.imageType,
            },
        });
    
        totalPrice += ct.productPrice * ct.productNumber;
        totalNumber += ct.productNumber;
        }
    }
    
    return { infoProduct, totalPrice, totalNumber };
}