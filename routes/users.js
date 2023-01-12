var express = require('express');
var router = express.Router();
const userController = require('../controller/userController');
const auth = require('../controller/authentication');
const { postProfileEdit } = require('../helpers/userHelpers');

router.get('/test', (req,res) => {
  res.render('user/test.ejs');
})
router.get('/', userController.landingPage);

router.get('/login', auth.userLoggedOut, userController.getLogin);

router.get('/signup', auth.userLoggedOut, userController.getSignup);

router.post('/signup',auth.userLoggedOut, userController.postSignup);

router.post('/login',auth.userLoggedOut, userController.postLogin);

router.get('/home', auth.userLoggedIn, userController.home);

router.get('/products', userController.products);

router.get('/productDetails', userController.getProductDetails);

router.get('/addToCart', auth.userLoggedIn, userController.addToCart);

router.get('/removeCart', auth.userLoggedIn, userController.removeCart);

router.get('/cart', auth.userLoggedIn, userController.getCart);

router.get('/quantityPlus', auth.userLoggedIn, userController.addQuantity);

router.get('/quantityMinus', auth.userLoggedIn, userController.decQuantity);

router.get('/sizeChanged', auth.userLoggedIn, userController.sizeChanged);

router.get('/checkOut', auth.userLoggedIn, userController.getCheckOut);

router.post('/placeOrder', auth.userLoggedIn, userController.postPlaceOrder);

router.get('/orderSuccess', auth.userLoggedIn, userController.orderSuccess);

router.get('/orders', auth.userLoggedIn, userController.getOrders);

router.get('/cancelTheOrder', auth.userLoggedIn, userController.cancelTheOrder);

router.get('/cancelProduct', auth.userLoggedIn, userController.cancelProduct);

router.get('/returnProduct', auth.userLoggedIn, userController.returnProduct);

router.get('/profile', auth.userLoggedIn, userController.getProfile);

router.get('/changeDefaultAddress', auth.userLoggedIn, userController.changeDefaultAddress);

router.post('/postNewAddress', auth.userLoggedIn, userController.postNewAddress);

router.get('/deleteAddress', auth.userLoggedIn, userController.deleteAddress);

router.post('/postProfileEdit', auth.userLoggedIn, userController.postProfileEdit);

router.post('/postChangePassword', auth.userLoggedIn, userController.postChangePassword);

router.get('/profileData', auth.userLoggedIn, userController.getProfileData);

router.get('/getTotalAmount', auth.userLoggedIn, userController.getTotalAmount);

router.get('/paypal', auth.userLoggedIn, userController.getPaypal);

router.get('/logout', userController.logout);

router.post('/create-order', auth.userLoggedIn, userController.createOrder);

router.get('/applyCoupon', auth.userLoggedIn, userController.applyCoupon);

module.exports = router;
