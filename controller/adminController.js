const adminHelpers = require('../helpers/adminHelpers');
const productHelpers = require('../helpers/productHelpers');
const session = require('express-session');
const { products } = require('./userController');
const { response } = require('express');
const couponHelpers = require('../helpers/couponHelpers');

module.exports = {
    getSignup: (req,res) => {
        let message = req.session.message;
        req.session.message='';
        res.render('admin/signup', {message});
    },

    postSignup: (req,res) => {
        adminHelpers.doSignup(req.body)
        .then((response) => {
            if(response.status){
                req.session.adminData = response.data;
                req.session.adminStatus = true;
                res.redirect('products');
            }
            else{
                req.session.message = response.message;
                req.session.adminStatus = false;
                res.redirect('signup');
            }
        })
    },

    getLogin: (req,res) => {
        let message = req.session.message;
        req.session.message='';
        res.render('admin/login', {message});
    },

    postLogin: (req,res) => {
        adminHelpers.doLogin(req.body)
        .then((response) => {
            if(response.status){
                req.session.adminData = response.data;
                req.session.adminStatus = true;
                res.redirect('products');
            }
            else{
                req.session.message = response.message;
                req.session.adminStatus = false;
                res.redirect('login');
            }
        })
    },

    logout: (req,res) => {
        req.session.adminStatus = false;
        res.redirect('login');
    },

    home: (req, res) => {
        if(req.session.data){
            let data = req.session.data;
            let errorMessage = req.session.errorMessage;
            let successMessage = req.session.successMessage;
            req.session.data = null;
            req.session.errorMessage = null;
            req.session.successMessage = null;
            res.render('admin/home', { data, page: req.query.page, outletName: req.session.adminData.outletName, successMessage: successMessage, errorMessage: errorMessage });
        }
        else {
            res.redirect(req.query.page+'?id='+req.query.id);
        }
    },

    products: (req,res) => {
        productHelpers.brandProducts(req.session.adminData?._id)
        .then((response) => {
            req.session.data = response;
            res.redirect('home?page=products');
        })
    },

    getAddProduct: (req,res) => {
        req.session.data = true;
        res.redirect('home?page=addProduct');
    },
    
    postAddProduct: (req,res) => {
        console.log(req.files);
        productHelpers.doAddProduct(req.body,req.session.adminData,req.files.image)
        .then((response) => {
            if(response.status){
                req.session.successMessage = response.message;
            }
            else{
                req.session.errorMessage = response.message;
            }
            res.redirect('addProduct');
        })
    },

    productDelete: (req,res) => {
        productHelpers.doProductDelete(req.query.id)
        .then((response) => {
            res.redirect('home?page=products&id='+req.query.id);
        })
    },

    productRecover: (req,res) => {
        productHelpers.doProductRecover(req.query.id)
        .then((response) => {
            res.redirect('home?page=products&id='+req.query.id);
        })
    },

    getEditProduct: (req,res) => {
        productHelpers.getProductData(req.session.adminData._id,req.query.id)
        .then((response) => {
            req.session.data = response.data ;
            res.redirect('home?page=editProduct&id='+req.query.id);
            })
    },

    postEditProduct: (req,res) => {
        let images = [];
        images[0] = req.files?.image0;
        images[1] = req.files?.image1;
        images[2] = req.files?.image2;
        images[3] = req.files?.image3;
        productHelpers.doEditProduct(req.query.id,req.body,images)
        .then((response) => {
            if(response.status){
                req.session.successMessage = response.message;
                res.redirect('editProduct?id='+req.query.id);
            }
        })
    },

    getOrders: (req,res) => {
        adminHelpers.getOrders(req.session.adminData._id)
        .then((response) => {
            req.session.data=response;
            res.redirect('home?page=orders');
        })
    },

    getDashboard: (req,res) => {
        adminHelpers.getDashboard(req.session.adminData._id)
        .then((response) => {
            req.session.data = response;
            res.redirect('home?page=dashboard');
        })
    },

    cancelOrderProduct: (req,res) => {
        adminHelpers.cancelOrderProduct(req.query.productId,req.query.orderId)
        .then((response) => {
            req.session.data = response;
            res.redirect('orders');
        })
    },

    productShipped: (req,res) => {
        adminHelpers.productShipped(req.query.productId,req.query.orderId)
        .then((response) => {
            req.session.data = response;
            res.redirect('orders');
        })
    },

    productDelivered: (req,res) => {
        adminHelpers.productDelivered(req.query.productId,req.query.orderId)
        .then((response) => {
            req.session.data = response;
            res.redirect('orders');
        })
    },

    dashboardReport: (req,res) => {
        req.session.data = true;
        res.redirect('home?page=dashboardReport');
    },

    postReport: (req,res) => {
        req.session.date = req.body;
        res.redirect('report');
    },

    getReport: (req,res) => {
        adminHelpers.report(req.session.adminData._id,req.session.date)
        .then((response) => {
        req.session.data = response;
        res.redirect('home?page=report');
        })
    },

    printReportPdf: (req,res) => {
        adminHelpers.report(req.session.adminData._id,req.session.date)
        .then((response) => {
            adminHelpers.printReportPdf(response)
            .then((response2) => {
                req.session.data = response2;
                res.redirect('report');
            })
        })
    },

    printReportExcel: (req,res) => {
        adminHelpers.report(req.session.adminData._id,req.session.date)
        .then((response) => {
            adminHelpers.printReportExcel(response)
            .then((response2) => {
                req.session.data = response2;
                res.redirect('report');
            })
        })
    },

    getCoupons: (req,res) => {
        couponHelpers.getCoupons(req.session.adminData._id)
        .then((response) => {
            req.session.data = response;
            res.redirect('home?page=dashboardCoupons');
        })
    },

    getAddCoupons: (req,res) => {
        req.session.data = true;
        res.redirect('home?page=addCoupons');
    },

    postAddCoupons: (req,res) => {
        couponHelpers.addCoupons(req.session.adminData._id,req.body)
        .then((response) => {
            if(response.data){
                req.session.successMessage = response.message;
            }
            else{
                req.session.errorMessage = response.message;
            }
            res.redirect('home?page=addCoupons');
        })
    },

    blockCoupon: (req,res) => {
        couponHelpers.blockCoupon(req.session.adminData._id,req.query.id)
        .then((response) => {
            req.session.data = response;
            res.redirect('dashboardCoupons');
        })
    },

    unblockCoupon: (req,res) => {
        couponHelpers.unblockCoupon(req.session.adminData._id,req.query.id)
        .then((response) => {
            req.session.data = response;
            res.redirect('dashboardCoupons');
        })
    },

    dashboardOffers: (req,res) => {
        adminHelpers.dashboardOffers(req.session.adminData._id)
        .then((response) => {
            req.session.data = response.data;
            console.log(response);
            res.redirect('home?page=dashboardOffers');
        }) 
    },

    postCategoryOffer: (req,res) => {
        console.log(req.body);
        adminHelpers.postCategoryOffer(req.session.adminData._id,req.body)
        .then((response) => {
            res.json(response);
        })
    }
 }