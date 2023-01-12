var express = require('express');
var router = express.Router();
const adminController = require('../controller/adminController');
const auth = require('../controller/authentication');
const multer = require('multer');
const { route } = require('./users');


router.get('/', auth.adminLoggedOut, adminController.getLogin);

router.get('/login', auth.adminLoggedOut, adminController.getLogin);

router.post('/login', auth.adminLoggedOut, adminController.postLogin);

router.get('/signup', auth.adminLoggedOut, adminController.getSignup);

router.post('/signup',auth.adminLoggedOut, adminController.postSignup);

//router.use(auth.adminLoggedIn);

router.get('/logout', auth.adminLoggedIn, adminController.logout);

router.get('/home', auth.adminLoggedIn, adminController.home); 

router.get('/products',auth.adminLoggedIn, adminController.products);

router.get('/addProduct',auth.adminLoggedIn, adminController.getAddProduct);

router.post('/addProducts',  auth.adminLoggedIn, adminController.postAddProduct);

router.get('/productDelete', auth.adminLoggedIn, adminController.productDelete);

router.get('/productRecover', auth.adminLoggedIn, adminController.productRecover);

router.get('/editProduct',auth.adminLoggedIn, adminController.getEditProduct);

router.post('/editProduct', auth.adminLoggedIn, adminController.postEditProduct);

router.get('/orders', auth.adminLoggedIn, adminController.getOrders);

router.get('/cancelOrderProduct', auth.adminLoggedIn, adminController.cancelOrderProduct);

router.get('/productShipped', auth.adminLoggedIn, adminController.productShipped);

router.get('/productDelivered', auth.adminLoggedIn, adminController.productDelivered);

router.get('/dashboard', auth.adminLoggedIn, adminController.getDashboard);

router.get('/dashboardReport', auth.adminLoggedIn, adminController.dashboardReport);

router.post('/postReport', auth.adminLoggedIn, adminController.postReport);

router.get('/report', auth.adminLoggedIn, adminController.getReport);

router.get('/printReportPdf', auth.adminLoggedIn, adminController.printReportPdf);

router.get('/printReportExcel', auth.adminLoggedIn, adminController.printReportExcel);

router.get('/dashboardCoupons', auth.adminLoggedIn, adminController.getCoupons);

router.get('/addCoupons', auth.adminLoggedIn, adminController.getAddCoupons);

router.post('/postAddCoupons', auth.adminLoggedIn, adminController.postAddCoupons);

router.get('/blockCoupon', auth.adminLoggedIn, adminController.blockCoupon);

router.get('/unblockCoupon', auth.adminLoggedIn, adminController.unblockCoupon);

router.get('/dashboardOffers', auth.adminLoggedIn, adminController.dashboardOffers);

router.post('/postCategoryOffer', auth.adminLoggedIn, adminController.postCategoryOffer);

module.exports = router;
