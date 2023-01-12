require("dotenv").config()
const userHelpers = require('../helpers/userHelpers');
const session = require('express-session');
const productHelpers = require('../helpers/productHelpers');
const couponHelpers = require('../helpers/couponHelpers');
const { response } = require('express');
const CC = require('currency-converter-lt');
let currencyConverter = new CC();
const json = require('formidable/src/plugins/json');
const { payment } = require('paypal-rest-sdk');
const paypal = require("@paypal/checkout-server-sdk")
const Environment =
    process.env.NODE_ENV === "production"
        ? paypal.core.LiveEnvironment
        : paypal.core.SandboxEnvironment
const paypalClient = new paypal.core.PayPalHttpClient(
    new Environment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
    )
)
const storeItems = new Map([
    [1, { price: 100, name: "Learn React Today" }],
    [2, { price: 200, name: "Learn CSS Today" }],
])

module.exports = {

    landingPage: (req, res) => {
        Promise.all([userHelpers.indexData(req.session.userData?._id),userHelpers.cartData(req.session.userData?._id)])
        .then((values) => {
            console.log(values[1]);
            res.render('user/home',{data: values[0], cartData: values[1], userData: req.session.userData, page: 'index'});
        })
    },

    getSignup: (req, res) => {
        let message = req.session.message;
        req.session.message = '';
        res.render('user/home', { message, page: 'signup' });
    },

    postSignup: (req, res) => {
        userHelpers.doSignup(req.body)
            .then((response) => {
                if (response.status) {
                    req.session.userData = response.data;
                    req.session.status = true;
                    res.redirect('products');
                }
                else {
                    req.session.message = response.message;
                    req.session.status = false;
                    res.redirect('signup');
                }
            })
    },

    getLogin: (req, res) => {
        let message = req.session.message;
        req.session.message = '';
        req.session.page = req.query?.page;
        req.session._id = req.query?.id;
        res.render('user/home', { message , page : 'login' });
    },

    postLogin: (req, res) => {
        userHelpers.doLogin(req.body)
            .then((response) => {
                if (response.status) {
                    req.session.userData = response.data;
                    req.session.status = true;
                    if(req.session.page=='productDetails'){
                        req.session.page=null;
                        let id = req.session._id;
                        req.session._id=null;
                        res.redirect('productDetails?id='+id)
                    }
                    else {
                        res.redirect('products');
                    }
                }
                else {
                    req.session.message = response.message;
                    req.session.status = false;
                    res.redirect('login');
                }
            })
    },
    home: (req, res) => {
        if (req.session.data) {
            userHelpers.cartData(req.session.userData?._id)
            .then((response) => {
                let data = req.session.data;
                req.session.data = null;
                console.log(data);
                res.render('user/home', { data, page: req.query.page, username: req.session.userData.username, userData: req.session.userData, cartData: response });
            })
        }
        else {
            res.redirect(req.query.page + '?id=' + req.query.id);
        }
    },

    products: (req, res) => {
        Promise.all([productHelpers.getProductsData(req.query.sortby),userHelpers.cartData(req.session.userData?._id)])
            .then((values) => {
                res.render('user/home',{data: values[0].data, userData: req.session.userData, cartData: values[1], page:'products', sortby: values[0].sortby});
            })
    },

    logout: (req, res) => {
        req.session.status = false;
        req.session.userData = null;
        res.redirect('/');
    },

    getProductDetails: (req, res) => {
        Promise.all([productHelpers.getProductData(req.session.userData?._id, req.query.id), userHelpers.cartData(req.session.userData?._id)])
            .then((values) => {
                res.render('user/home', {data: values[0].data, cartData: values[1], userData: req.session.userData, page: 'productDetails' });
            })
    },

    addToCart: (req, res) => {
        userHelpers.addToCart(req.session.userData._id, req.query.id, req.query.size)
            .then((response) => {
                res.json(response);
            })
    },

    getCart: (req, res) => {
        userHelpers.getCart(req.session.userData._id)
            .then((response) => {
                if (response.status) {
                    couponHelpers.getCouponsUser(req.session.userData._id)
                    .then((response2) => {
                        if(response2.status){
                            req.session.data = {};
                            req.session.data.cartData = response.data;
                            req.session.data.couponsData = response2.data.couponsData;
                            req.session.data.appliedCouponData = response2.data.appliedCouponData;
                            console.log(req.session.data);
                            res.redirect('home?page=cart');
                        }
                    })
                }
            })
    },

    removeCart: (req, res) => {
        userHelpers.removeCart(req.session.userData._id, req.query.id)
            .then((response) => {
                res.json(response);
            })
    },

    addQuantity: (req, res) => {
        userHelpers.addQuantity(req.session.userData._id, req.query.id)
            .then((response) => {
                res.json(response);
            })
    },

    decQuantity: (req, res) => {
        userHelpers.decQuantity(req.session.userData._id, req.query.id)
            .then((response) => {
                res.json(response);
            })
    },

    sizeChanged: (req, res) => {
        userHelpers.sizeChange(req.session.userData._id, req.query.id, req.query.size)
            .then((response) => {
                res.json(response);
            })
    },

    getCheckOut: (req, res) => {
        userHelpers.getCheckOut(req.session.userData._id)
            .then((response) => {
                req.session.data = response;
                res.redirect('home?page=checkOut');
            })
    },

    postPlaceOrder: (req, res) => {
        userHelpers.getTotalAmount(req.session.userData._id)
        .then((total) => {
            userHelpers.placeOrder(req.session.userData._id, req.body, total)
            .then((response) => {
                res.redirect('orderSuccess?id=' + response.orderId);
            })
        })
    },

    orderSuccess: (req, res) => {
        userHelpers.getOrderSuccess()
            .then((response) => {
                req.session.data = response._id;
                res.redirect('home?page=orderSuccess&id=' + req.query.id);
            })
    },

    getOrders: (req, res) => {
        userHelpers.getOrders(req.session.userData._id)
            .then((response) => {
                req.session.data = response;
                res.redirect('home?page=orders');
            })
    },

    cancelTheOrder: (req, res) => {
        userHelpers.cancelTheOrder(req.query.id)
            .then((response) => {
                res.json(response);
            })
    },

    cancelProduct: (req, res) => {
        userHelpers.cancelProduct(req.query.productId, req.query.orderId)
            .then((response) => {
                res.redirect('orders');
            })
    },

    returnProduct: (req,res) => {
        userHelpers.returnProduct(req.session.userData._id,req.query.productId, req.query.orderId)
        .then((response) => {
            res.redirect('orders');
        })
    },

    getProfile: (req, res) => {
        userHelpers.getProfile(req.session.userData._id)
            .then((response) => {
                req.session.data = response;
                res.redirect('home?page=profile');
            })
    },

    changeDefaultAddress: (req, res) => {
        userHelpers.changeDefaultAddress(req.session.userData._id, req.query.address)
            .then((response) => {
                res.json(response);
            })
    },

    postNewAddress: (req, res) => {
        userHelpers.postNewAddress(req.session.userData._id, req.body)
            .then((response) => {
                res.json(response);
            })
    },

    deleteAddress: (req, res) => {
        userHelpers.deleteAddress(req.session.userData._id, req.query.id)
            .then((response) => {
                res.json(response);
            })
    },

    postProfileEdit: (req, res) => {
        userHelpers.postProfileEdit(req.session.userData._id, req.body)
            .then((response) => {
                res.json(response);
            })
    },

    postChangePassword: (req, res) => {
        userHelpers.postChangePassword(req.session.userData._id, req.body)
            .then((response) => {
                res.json(response);
            })
    },

    getProfileData: (req, res) => {
        userHelpers.getUserData(req.session.userData._id)
            .then((response) => {
                res.json(response.data);
            })
    },

    getPaypal: (req, res) => {
        userHelpers.getPaypal(req.session.userData._id)
            .then((response) => {
                req.session.data = response;
                res.redirect('home?page=paypal');
            })
    },

    getTotalAmount: (req, res) => {
        userHelpers.getTotalAmount(req.session.userData._id)
            .then((response) => {
                res.json(response);
            })
    },

    createOrder: async (req, res) => {
        userHelpers.getTotalAmount(req.session.userData._id)
            .then(async (response1) => {
                userHelpers.placeOrder(req.session.userData._id, req.body, response1.total)
                    .then(async (response) => {
                        const request = new paypal.orders.OrdersCreateRequest()
                        const responseTotal = response.total;
                        const total = await currencyConverter.from("INR").to("USD").amount(responseTotal).convert();
                        request.prefer("return=representation")
                        request.requestBody({
                            intent: "CAPTURE",
                            purchase_units: [
                                {
                                    amount: {
                                        currency_code: "USD",
                                        value: total,
                                        breakdown: {
                                            item_total: {
                                                currency_code: "USD",
                                                value: total,
                                            },
                                        },
                                    },
                                },
                            ],
                        })
                        try {
                            const order = await paypalClient.execute(request)
                            res.json({ id: order.result.id })
                            
                        } catch (e) {
                            res.status(500).json({ error: e.message })
                        }
                    })
            })
    },

    applyCoupon: (req,res) => {
        userHelpers.applyCoupon(req.session.userData._id,req.query.id)
        .then((response) => {
            res.json(response);
        })
    },


}