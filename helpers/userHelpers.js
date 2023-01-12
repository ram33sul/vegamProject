var MongoClient = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectId;
var Mongo = MongoClient.connect('mongodb://localhost:27017/example');
//const { resolve } = require('express-hbs/lib/resolver');
const bcrypt = require('bcrypt');
const { response } = require('../app');
const { use } = require('../routes/users');
const { products } = require('../controller/userController');

module.exports = {
    doSignup: (userFormData) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                data1 = await client.db('project1').collection('users').find({ 'email': userFormData.email }).toArray();
                data2 = await client.db('project1').collection('users').find({ 'username': userFormData.username }).toArray();
                let response = {};
                if (data1.length != 0) {
                    response.message = 'Email already exists';
                    response.status = false;
                }
                else if (data2.length != 0) {
                    response.message = 'Username already exists';
                    response.status = false;
                }
                else {
                    delete userFormData.cpassword;
                    userFormData.password = await bcrypt.hash(userFormData.password, 10);
                    userFormData.status = true;
                    userFormData.cart = [];
                    userFormData.cartTotal = 0;
                    userFormData.wishlist = [];
                    userFormData.address = [];
                    userFormData.orders = [];
                    userFormData.wallet = 0;
                    userFormData.lastEditedBy = 'user';
                    await client.db('project1').collection('users').insertOne(userFormData);
                    let data = await client.db('project1').collection('users').find({ 'email': userFormData.email }).toArray();
                    response.data = data[0];
                    response.status = true;
                }
                resolve(response);
            })
        })

    },

    doLogin: (userFormData) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                let data1 = await client.db('project1').collection('users').find({ 'email': userFormData.username }).toArray();
                let data2 = await client.db('project1').collection('users').find({ 'username': userFormData.username }).toArray();
                let response = {};
                if (data1.length != 0) {
                    let status = await bcrypt.compare(userFormData.password, data1[0].password);
                    if (status) {
                        if (data1[0].status) {
                            response.data = data1[0];
                            response.status = true;
                        }
                        else {
                            response.message = 'Your account is blocked';
                            response.status = false;
                        }
                    }
                    else {
                        response.message = 'Password is incorrect'
                        response.status = false;
                    }
                }
                else if (data2.length != 0) {
                    let status = await bcrypt.compare(userFormData.password, data2[0].password);
                    if (status) {
                        if (data2[0].status) {
                            response.data = data2[0];
                            response.status = true;
                        }
                        else {
                            response.message = 'Your account is blocked';
                            response.status = false;
                        }
                    }
                    else {
                        response.message = 'Password is incorrect'
                        response.status = false;
                    }
                }
                else {
                    response.message = 'Username or email is incorrect'
                    response.status = false;
                }
                resolve(response);
            })
        })
    },

    getUsersData: () => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                let response = {};
                let data = await client.db('project1').collection('users').find().toArray();
                response.data = data;
                response.status = true;
                resolve(response);
            })
        })
    },

    blockUser: (id) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                let response = {};
                await client.db('project1').collection('users').updateOne({ '_id': objectId(id) }, { $set: { 'status': false } });
                response.status = true;
                resolve(response);
            })
        })
    },

    unblockUser: (id) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                let response = {};;
                await client.db('project1').collection('users').updateOne({ '_id': objectId(id) }, { $set: { 'status': true } });
                response.status = true;
                resolve(response);
            })
        })
    },

    getUserData: (id) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                let response = {};;
                let data = await client.db('project1').collection('users').find({ '_id': objectId(id) }).toArray();
                response.data = data[0];
                response.status = true;
                resolve(response);
            })
        })
    },

    addToCart: (userId, productId, size) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                let response = {};
                let exist = await client.db('project1').collection('users').find({ '_id': objectId(userId), 'cart.product': { $in: [objectId(productId)] } }).toArray();
                if (exist.length == 0) {
                    let time = new Date();
                    let data = await client.db('project1').collection('products').find({ '_id': objectId(productId) }).toArray();
                    let price = parseFloat(data[0].price.toFixed(2));
                    let adminId = data[0].outletId;
                    await client.db('project1').collection('users').updateOne({ '_id': objectId(userId) }, { $push: { cart: { 'product': objectId(productId), 'outlet': objectId(adminId), 'quantity': 1, 'size': size, 'addedTime': time } } });
                    await client.db('project1').collection('users').updateOne({ '_id': objectId(userId) }, { $inc: { 'cartTotal': price } });
                    response.message = "Product added to cart";
                    response.status = true;
                }
                else {
                    response.message = "Product already in cart";
                    response.status = false;
                }
                await client.db('project1').collection('users').updateOne({ '_id': objectId(userId) }, { $set: { 'appliedCoupon': false } });
                resolve(response);
            })
        })
    },

    getCart: (userId, productId) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                let response = {};
                let cartList = await client.db('project1').collection('users').aggregate([{ $match: { '_id': objectId(userId) } }, { $lookup: { from: 'products', localField: 'cart.product', foreignField: '_id', as: 'cartList' } }]).toArray();
                for (i = 0; i < cartList[0].cart.length; i++) {
                    for (j = 0; j < cartList[0].cartList.length; j++) {
                        let id1 = cartList[0].cart[i].product;
                        let id2 = cartList[0].cartList[j]._id;
                        if (id1.toString() === id2.toString()) {
                            cartList[0].cartList[j].addedTime = cartList[0].cart[i].addedTime;
                            cartList[0].cartList[j].quantity = cartList[0].cart[i].quantity;
                            cartList[0].cartList[j].size = cartList[0].cart[i].size;
                            break;
                        }
                    }
                }
                response.data = cartList[0].cartList;
                response.data = response.data.sort((a, b) => b.addedTime - a.addedTime);
                response.status = true;
                resolve(response);
            })
        })
    },

    addQuantity: (userId, productId) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                let response = {};

                let data = await client.db('project1').collection('users').find({ '_id': objectId(userId) }).toArray();
                let productData = await client.db('project1').collection('products').find({ '_id': objectId(productId) }).toArray();
                index = data[0].cart.findIndex(item => item.product == productId);
                let quantity = data[0].cart[index].quantity;
                let size = data[0].cart[index].size.toLowerCase();
                let stock;
                if (size == 's') { stock = productData[0].stock.s }
                else if (size == 'm') { stock = productData[0].stock.m }
                else if (size == 'l') { stock = productData[0].stock.l }
                else { stock = productData[0].stock.xl }
                if (quantity < 9 && quantity < stock) {


                    let price = parseFloat(productData[0].price.toFixed(2));
                    await client.db('project1').collection('users').updateOne({ '_id': objectId(userId) }, { $inc: { 'cartTotal': price } });
                    await client.db('project1').collection('users').updateOne({ '_id': objectId(userId), 'cart.product': objectId(productId) }, { $inc: { 'cart.$.quantity': 1 } });
                    let data = await client.db('project1').collection('users').find({ '_id': objectId(userId) }).toArray();
                    index = data[0].cart.findIndex(item => item.product == productId);
                    let quantity = data[0].cart[index].quantity;
                    let cartTotal = data[0].cartTotal;

                    response.cartTotal = cartTotal;
                    response.quantity = quantity;
                }
                else {
                    let cartTotal = data[0].cartTotal;
                    response.gst = parseFloat((cartTotal / 10.5).toFixed(2));
                    response.mrp = parseFloat((response.gst * 20).toFixed(2));
                    response.deliveryCharge = 50;
                    response.cartTotal = cartTotal;
                    response.quantity = quantity;
                }
                await client.db('project1').collection('users').updateOne({ '_id': objectId(userId) }, { $set: { 'appliedCoupon': false } });
                response.status = true;
                resolve(response);
            })
        })
    },

    removeCart: (userId, productId) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                let response = {};
                let exist = await client.db('project1').collection('users').find({ '_id': objectId(userId), 'cart.product': { $in: [objectId(productId)] } }).toArray();
                if (exist.length != 0) {
                    let data = await client.db('project1').collection('products').find({ '_id': objectId(productId) }).toArray();
                    let data2 = await client.db('project1').collection('users').find({ '_id': objectId(userId) }).toArray();
                    let price = parseFloat(data[0].price.toFixed(2));
                    index = data2[0].cart.findIndex(item => item.product == productId);
                    let quantity = data2[0].cart[index].quantity;
                    price = price * quantity;
                    price = 0 - price;
                    let oldCartTotal = data2[0].cartTotal;
                    response.cartTotal = oldCartTotal + price;
                    await client.db('project1').collection('users').updateOne({ '_id': objectId(userId) }, { $pull: { cart: { 'product': objectId(productId) } } });
                    await client.db('project1').collection('users').updateOne({ '_id': objectId(userId) }, { $inc: { 'cartTotal': price } });
                    response.message = "Product removed from cart";
                    response.status = true;
                }
                else {
                    response.message = "Product doesn't exist in cart";
                    response.status = false;
                }
                await client.db('project1').collection('users').updateOne({ '_id': objectId(userId) }, { $set: { 'appliedCoupon': false } });
                resolve(response);
            })
        })
    },

    decQuantity: (userId, productId) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                let response = {};

                let data = await client.db('project1').collection('users').find({ '_id': objectId(userId) }).toArray();
                index = data[0].cart.findIndex(item => item.product == productId);
                let quantity = data[0].cart[index].quantity;
                if (quantity > 1) {

                    let productData = await client.db('project1').collection('products').find({ '_id': objectId(productId) }).toArray();
                    let price = parseFloat(productData[0].price.toFixed(2));
                    price = 0 - price;
                    await client.db('project1').collection('users').updateOne({ '_id': objectId(userId) }, { $inc: { 'cartTotal': price } });
                    await client.db('project1').collection('users').updateOne({ '_id': objectId(userId), 'cart.product': objectId(productId) }, { $inc: { 'cart.$.quantity': -1 } });
                    let data = await client.db('project1').collection('users').find({ '_id': objectId(userId) }).toArray();
                    index = data[0].cart.findIndex(item => item.product == productId);
                    let quantity = data[0].cart[index].quantity;
                    let cartTotal = data[0].cartTotal;
                    response.quantity = quantity;
                    response.cartTotal = cartTotal;
                } else {
                    let cartTotal = data[0].cartTotal;
                    response.quantity = quantity;
                    response.cartTotal = cartTotal;
                }
                await client.db('project1').collection('users').updateOne({ '_id': objectId(userId) }, { $set: { 'appliedCoupon': false } });
                response.status = true;
                resolve(response);
            })
        })
    },

    sizeChange: (userId, productId, newSize) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                let response = {};
                await client.db('project1').collection('users').updateOne({ '_id': objectId(userId), 'cart.product': objectId(productId) }, { $set: { 'cart.$.size': newSize } });
                let data = await client.db('project1').collection('users').find({ '_id': objectId(userId) }).toArray();
                let productData = await client.db('project1').collection('products').find({ '_id': objectId(productId) }).toArray();
                let stock;
                if (newSize == 's') { stock = productData[0].stock.s }
                else if (newSize == 'm') { stock = productData[0].stock.m }
                else if (newSize == 'l') { stock = productData[0].stock.l }
                else { stock = productData[0].stock.xl }
                let index = data[0].cart.findIndex(item => item.product == productId);
                let size = data[0].cart[index].size;
                let quantity = data[0].cart[index].quantity;
                let price = 0;
                if (stock < quantity) {
                    let quantityDiff = quantity - stock;
                    price = parseFloat((productData[0].price * quantityDiff).toFixed(2));
                    price = 0 - price;
                    quantity = stock;
                    await client.db('project1').collection('users').updateOne({ '_id': objectId(userId), 'cart.product': objectId(productId) }, { $set: { 'cart.$.quantity': quantity } });
                    await client.db('project1').collection('users').updateOne({ '_id': objectId(userId) }, { $inc: { 'cartTotal': price } });
                }
                price = data[0].cartTotal + price;
                response.cartTotal = price;
                response.quantity = quantity;
                response.updatedSize = size;
                response.status = true
                resolve(response);
            })
        })
    },

    getCheckOut: (userId) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                let data = await client.db('project1').collection('users').find({ '_id': objectId(userId) }).toArray();
                resolve(data[0]);
            })
        })
    },

    placeOrder: (userId, formData, total) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                let address;
                console.log(formData);
                let data = await client.db('project1').collection('users').find({ '_id': objectId(userId) }).toArray();
                if (formData.addressValue == 'newAddress') {
                    delete formData.address.newAddress;
                    await client.db('project1').collection('users').updateOne({ '_id': objectId(userId) }, { $push: { 'address': formData.address } });
                    address = formData.address;
                } else {
                    let index = data[0].address.findIndex(data => data.addressType == formData.addressValue);
                    address = data[0].address[index];
                    if(address==null){
                        let index = data[0].address.findIndex(data => data.addressType == formData.address.addressType);
                        address = data[0].address[index];
                    }
                }
                let order = Object.create(null);
                order.user = objectId(userId);
                for (i = 0; i < data[0].cart.length; i++) {
                    let quantity = data[0].cart[i].quantity;
                    let size = data[0].cart[i].size.toLowerCase();
                    let stock = 'stock.' + size;
                    await client.db('project1').collection('products').updateOne({ '_id': objectId(data[0].cart[i].product) }, { $inc: { [stock]: -quantity } });
                    data[0].cart[i].status = 'placed';
                }
                let productsData = await client.db('project1').collection('users').aggregate([
                    {
                        $match: {
                            '_id': objectId(userId)
                        }
                    },
                    {
                        $lookup: {
                            from: 'products',
                            localField: 'cart.product',
                            foreignField: '_id',
                            as: 'productDetails'
                        }
                    },
                    {
                        $project: {
                            '_id': 0,
                            'cart': '$cart',
                            'productDetails': '$productDetails'
                        }
                    }
                ]).toArray();
                productsData[0].cart.forEach(data => {
                    productsData[0].productDetails.forEach(data2 => {
                        if (data.product.toString() == data2._id.toString()) {
                            data.price = data2.price;
                            data.status = 'placed';
                        }
                    })
                })
                order.products = productsData[0].cart;
                order.mrp = parseFloat(data[0].cartTotal.toFixed(2));
                order.total = parseFloat((order.mrp + (order.mrp * 5 / 100) + 50).toFixed(2));
                order.address = address;
                order.date = new Date();
                order.status = 'placed';
                order.paymentStatus = 'pending';
                await client.db('project1').collection('orders').insertOne({ order });
                let orderData = await client.db('project1').collection('orders').find({}).sort({ _id: -1 }).limit(1).toArray();
                await client.db('project1').collection('users').updateOne({ '_id': objectId(userId) }, { $push: { 'orders': orderData[0]._id } });
                for (i = 0; i < orderData[0].order.products.length; i++) {
                    let outletId = orderData[0].order.products[i].outlet;
                    await client.db('project1').collection('admin').updateOne({ '_id': objectId(outletId) }, { $push: { 'orders': orderData[0]._id } });
                }
                await client.db('project1').collection('users').updateOne({ '_id': objectId(userId) }, { $set: { cart: [] } });
                await client.db('project1').collection('users').updateOne({ '_id': objectId(userId) }, { $set: { cartTotal: 0 } });
                await client.db('project1').collection('users').updateOne({ '_id': objectId(userId) }, { $set: { 'appliedCoupon': false } });
                let response = {};
                response.total = total;
                response.orderId = orderData[0]._id;
                response.status = true;
                resolve(response);
            })
        })
    },
    getOrderSuccess: () => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                let data = await client.db('project1').collection('orders').find({}).sort({ _id: -1 }).limit(1).toArray();
                await client.db('project1').collection('orders').updateOne({ '_id': objectId(data[0]._id) }, { $set: { 'order.paymentStatus': 'completed' } });
                resolve(data[0]);
            })
        })
    },

    getOrders: (userId) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                let data = await client.db('project1').collection('users').aggregate([{ $match: { '_id': objectId(userId) } }, { $lookup: { from: 'orders', localField: 'orders', foreignField: '_id', as: 'ordersList' } }]).toArray();
                resolve(data[0].ordersList);
            })
        })
    },

    cancelTheOrder: (orderId) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                await client.db('project1').collection('orders').updateOne({ '_id': objectId(orderId) }, { $set: { 'order.status': 'cancelled' } });
                let response = true;
                resolve(response);
            })
        })
    },

    cancelProduct: (productId, orderId) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                let flag = 0;
                await client.db('project1').collection('orders').updateOne({ '_id': objectId(orderId), 'order.products.product': objectId(productId) }, { $set: { 'order.products.$.status': 'cancelled' } });
                let data = await client.db('project1').collection('orders').find({ '_id': objectId(orderId) }).toArray();
                for (i = 0; i < data[0].order.products.length; i++) {
                    if (data[0].order.products[i].product.toString() == productId) {
                        let size = data[0].order.products[i].size.toLowerCase();
                        let stock = 'stock.' + size;
                        let quantity = data[0].order.products[i].quantity;
                        await client.db('project1').collection('products').updateOne({ '_id': objectId(productId) }, { $inc: { [stock]: quantity } });
                        let price = data[0].order.products[i].price * quantity;
                        await client.db('project1').collection('users').updateOne({ '_id': objectId(userId) }, { $inc: { 'wallet': price } });
                    }
                    if (data[0].order.products[i].status != 'cancelled') {
                        flag = 1;
                    }
                }
                if (flag == 0) {
                    await client.db('project1').collection('orders').updateOne({ '_id': objectId(orderId) }, { $set: { 'order.status': 'cancelled' } });
                }
                resolve(true);
            })
        })
    },

    returnProduct: (userId, productId, orderId) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                let flag = 0;
                await client.db('project1').collection('orders').updateOne({ '_id': objectId(orderId), 'order.products.product': objectId(productId) }, { $set: { 'order.products.$.status': 'returned' } });
                let data = await client.db('project1').collection('orders').find({ '_id': objectId(orderId) }).toArray();
                for (i = 0; i < data[0].order.products.length; i++) {
                    if (data[0].order.products[i].product.toString() == productId) {
                        let size = data[0].order.products[i].size.toLowerCase();
                        let stock = 'stock.' + size;
                        let quantity = data[0].order.products[i].quantity;
                        await client.db('project1').collection('products').updateOne({ '_id': objectId(productId) }, { $inc: { [stock]: quantity } });
                        let price = data[0].order.products[i].price * quantity;
                        await client.db('project1').collection('users').updateOne({ '_id': objectId(userId) }, { $inc: { 'wallet': price } });
                    }
                    if (data[0].order.products[i].status != 'returned') {
                        flag = 1;
                    }
                }
                if (flag == 0) {
                    await client.db('project1').collection('orders').updateOne({ '_id': objectId(orderId) }, { $set: { 'order.status': 'returned' } });
                }
                resolve(true);
            })
        })
    },

    getProfile: (userId) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                let data = await client.db('project1').collection('users').find({ '_id': objectId(userId) }).toArray();
                resolve(data[0]);
            })
        })
    },

    changeDefaultAddress: (userId, defaultAddress) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                await client.db('project1').collection('users').updateOne({ '_id': objectId(userId) }, { $set: { 'defaultAddress': defaultAddress } });
                let data = await client.db('project1').collection('users').find({ '_id': objectId(userId) }).toArray();
                resolve(data[0].defaultAddress);
            })
        })
    },

    postNewAddress: (userId, formData) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                let data = await client.db('project1').collection('users').find({ '_id': objectId(userId) }).toArray();
                let flag = 0;
                data[0].address.forEach(data => {
                    if (data.addressType == formData.addressType) {
                        flag = 1;
                    }
                });
                if (flag == 0) {
                    await client.db('project1').collection('users').updateOne({ '_id': objectId(userId) }, { $push: { 'address': formData } });
                    resolve(true);
                }
                else {
                    resolve(false);
                }
            })
        })
    },

    deleteAddress: (userId, addressType) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                await client.db('project1').collection('users').updateOne({ '_id': objectId(userId) }, { $pull: { address: { 'addressType': addressType } } });
                resolve(true);
            })
        })
    },

    postProfileEdit: (userId, formData) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                await client.db('project1').collection('users').updateOne({ '_id': objectId(userId) }, { $set: { 'fullName': formData.fullName, 'username': formData.username, 'email': formData.email, 'mobileNumber': formData.mobileNumber } });
                resolve(true);
            })
        })
    },

    postChangePassword: (userId, formData) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                let password = await bcrypt.hash(formData.password, 10);
                await client.db('project1').collection('users').updateOne({ '_id': objectId(userId) }, { $set: { 'password': password } });
                resolve(true);
            })
        })
    },

    getPaypal: (userId) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                let data = await client.db('project1').collection('users').find({ '_id': objectId(userId) }).toArray();
                let cartTotal = data[0].cartTotal;
                resolve(cartTotal);
            })
        })
    },

    getTotalAmount: (userId) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                let totalAmount = await client.db('project1').collection('users').aggregate([
                    {
                        $match: {
                            '_id': objectId(userId)
                        }
                    },
                    {
                        $unwind: '$cart'
                    },
                    {
                        $project: {
                            'product': '$cart.product',
                            'quantity': '$cart.quantity',
                            '_id': 0
                        }
                    },
                    {
                        $lookup: {
                            from: 'products',
                            localField: 'product',
                            foreignField: '_id',
                            as: 'productsDetails'
                        }
                    },
                    {
                        $unwind: '$productsDetails'
                    },
                    {
                        $project: {
                            'product': 1,
                            'quantity': 1,
                            'price': '$productsDetails.price',
                            '_id': 0
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalAmount: {
                                $sum: {
                                    $multiply: [
                                        '$quantity', '$price'
                                    ]
                                }
                            }
                        }
                    }

                ]).toArray();
                let appliedCouponData = await client.db('project1').collection('users').aggregate([
                    {
                        $match: {
                            '_id': objectId(userId)
                        }
                    },
                    {
                        $lookup: {
                            from: 'coupons',
                            localField: 'appliedCoupon',
                            foreignField: '_id',
                            as: 'couponData'
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            'couponData': {
                                $first: '$couponData'
                            }
                        }
                    }
                ]).toArray();
                let couponDiscount;
                if (appliedCouponData[0].couponData) {
                    couponDiscount = appliedCouponData[0].couponData.value;
                } else {
                    couponDiscount = 0;
                }
                let response = {};
                console.log(totalAmount[0]);
                response.mrp = totalAmount[0].totalAmount;
                response.gst = parseFloat((response.mrp * 5 / 100).toFixed(2));
                response.deliveryCharge = 50;
                response.total = response.mrp + response.gst + response.deliveryCharge - couponDiscount;
                resolve(response);
            })
        })
    },

    applyCoupon: (userId, couponId) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                await client.db('project1').collection('users').updateOne({ '_id': objectId(userId) }, { $set: { 'appliedCoupon': objectId(couponId) } });
                resolve(true);
            })
        })
    },

    indexData: (userId) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                let response = {};
                // if (userId) {
                //     let userData = {};
                //     let username = await client.db('project1').collection('users').aggregate([
                //         {
                //             $match: {
                //                 _id: objectId(userId)
                //             }
                //         },
                //         {
                //             $project: {
                //                 _id: 0,
                //                 username: 1
                //             }
                //         }
                //     ]).toArray();
                //     userData.username = username[0];

                //     let cartData = {};
                //     let cart = await client.db('project1').collection('users').aggregate([
                //         {
                //             $match: {
                //                 _id: objectId(userId)
                //             }
                //         },
                //         {
                //             $lookup: {
                //                 from: 'products',
                //                 localField: '$cart.product',
                //                 foreignField: '_id',
                //                 as: 'cartDetails'
                //             }
                //         }
                //     ]).toArray();
                //     for (i = 0; i < cart[0].cart.length; i++) {
                //         for (j = 0; j < cart[0].cartDetails.length; j++) {
                //             if (cart[0].cart[i].product.toString() == cart[0].cartDetails[j]._id.toString()) {
                //                 cart[0].cart[i].name = cart[0].cartDetails[j].color + " " + cart[0].cartDetails[j].pattern + " " + cart[0].cartDetails[j].gender + " " + cart[0].cartDetails[j].category;
                //                 cart[0].cart[i].price = cart[0].cartDetails[j].price;
                //             }
                //         }
                //     }
                //     cartData.cart = cart[0].cart;
                //     cartData.count = cartData.cart.length;

                //     response.userData = userData;
                //     response.cartData = cartData;
                //     console.log("userData: ", userData);
                //     console.log("cartData: ", cartData);
                // }

                let recentData = {}
                let recentAll = await client.db('project1').collection('products').find().sort({ _id: -1 }).limit(8).toArray();
                let recentMen = await client.db('project1').collection('products').find({ gender: 'MALE' }).limit(8).toArray();
                let recentWomen = await client.db('project1').collection('products').find({ gender: 'FEMALE' }).limit(8).toArray();
                recentData.recentAll = recentAll;
                recentData.recentMen = recentMen;
                recentData.recentWomen = recentWomen;

                response.recentData = recentData;
                resolve(response);
            })
        })
    },

    cartData: (userId) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                if(userId){
                    let cart = await client.db('project1').collection('users').aggregate([
                        {
                            $match: {
                                _id: objectId(userId)
                            }
                        },
                        {
                            $lookup: {
                                from: 'products',
                                localField: 'cart.product',
                                foreignField: '_id',
                                as: 'cartDetails'
                            }
                        }
                    ]).toArray();
                    for (i = 0; i < cart[0].cart.length; i++) {
                        for (j = 0; j < cart[0].cartDetails.length; j++) {
                            if (cart[0].cart[i].product.toString() == cart[0].cartDetails[j]._id.toString()) {
                                cart[0].cart[i].name = cart[0].cartDetails[j].color + " " + cart[0].cartDetails[j].pattern + " " + cart[0].cartDetails[j].gender + " " + cart[0].cartDetails[j].category;
                                cart[0].cart[i].price = cart[0].cartDetails[j].price;
                                cart[0].cart[i].actualPrice = cart[0].cartDetails[j].actualPrice;
                            }
                        }
                    }
                    let cartData = {};
                    cartData.cart = cart[0].cart;
                    cartData.count = cartData.cart.length;
                    cartData.total = cart[0].cartTotal;
                    cartData.appliedCoupon = cart[0].appliedCoupon;
                    resolve(cartData);
                } else {
                    resolve(false);
                }
            })
        })
    }

}
