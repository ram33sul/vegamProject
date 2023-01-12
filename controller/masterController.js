const adminHelpers = require('../helpers/adminHelpers');
const productHelpers = require('../helpers/productHelpers');
const userHelpers = require('../helpers/userHelpers');
const session = require('express-session');
const { response } = require('../app');

module.exports = {

    getLogin: (req, res) => {
        let message = req.session.message;
        req.session.message = '';
        res.render('master/login', { message });
    },

    postLogin: (req, res) => {
        if (req.body.email == 'admin' && req.body.password == 'admin') {
            req.session.message = '';
            req.session.masterStatus = true;
            res.redirect('outlets');
        }
        else {
            req.session.message = 'Incorrect username or password';
            req.session.masterStatus = false;
            res.redirect('login');
        }
    },

    logout: (req, res) => {
        req.session.masterStatus = false;
        res.redirect('login');
    },

    home: (req, res) => {
        if(req.session.data){
            let data = req.session.data;
            req.session.data = null;
            res.render('master/home', { data, page: req.query.page });
        }
        else {
            res.redirect(req.query.page+'?id='+req.query.id);
        }
    },

    users: (req, res) => {
        userHelpers.getUsersData()
            .then((response) => {
                if (response.status) {
                    req.session.data = response.data;
                    res.redirect('home?page=users');
                }
            })
    },

    outlets: (req, res) => {
        adminHelpers.getAdminsData()
            .then((response) => {
                if (response.status) {
                    req.session.data = response.data;
                    res.redirect('home?page=outlets');
                }
            })
    },

    blockUser: (req, res) => {
        userHelpers.blockUser(req.query.id)
            .then((response) => {
                if (response.status) {
                    res.redirect('users');
                }
            })
    },

    unblockUser: (req, res) => {
        userHelpers.unblockUser(req.query.id)
            .then((response) => {
                if (response.status) {
                    res.redirect('users');
                }
            })
    },

    blockOutlet: (req, res) => {
        adminHelpers.blockOutlet(req.query.id)
            .then((response) => {
                if (response.status) {
                    res.redirect('outlets');
                }
            })
    },

    unblockOutlet: (req, res) => {
        adminHelpers.unblockOutlet(req.query.id)
            .then((response) => {
                if (response.status) {
                    res.redirect('outlets');
                }
            })
    },


    getAddUser: (req, res) => {
        res.render('master/addUser', { errorMessage: '', successMessage: '', message: '' });
    },

    getUserDetails: (req, res) => {
        userHelpers.getUserData(req.query.id)
        .then((response) => {
            if (response.status) {
                req.session.data = response.data;
                res.redirect('home?page=userDetails&id='+req.query.id);
            }
        })
    },

    getOutletDetails: (req,res) => {
        adminHelpers.getAdminData(req.query.id)
        .then((response) => {
            if(response.status) {
                req.session.data = response.data;
                res.redirect('home?page=outletDetails&id='+req.query.id);
            }
        })
    },

    getUserOrders: (req,res) => {
        userHelpers.getOrders(req.query.id)
        .then((response) => {
            req.session.data = response;
            res.redirect('home?page=userOrders&id='+req.query.id);
        })
    },

    getAdminOrders: (req,res) => {
        adminHelpers.getOrders(req.query.id)
        .then((response) => {
            req.session.data = response;
            res.redirect('home?page=adminOrders&id='+req.query.id);
        })
    },

    postEditAdmin: (req,res) => {
        adminHelpers.postEditAdmin(req.query.id,req.body)
        .then((response) => {
            res.redirect('outletDetails?id='+req.query.id);
        })
    },

    postEditUser: (req,res) => {
        userHelpers.postProfileEdit(req.query.id,req.body)
        .then((response) => {
            res.redirect('userDetails?id='+req.query.id);
        })
    },

    dashboard: (req,res) => {
        req.session.data = true;
        res.redirect('home?page=dashboard');
    },

    postReport: (req,res) => {
        req.session.date = req.body;
        res.redirect('report');
    },

    getReport: (req,res) => {
        adminHelpers.masterReport(req.session.date)
        .then((response) => {
        req.session.data = response;
        res.redirect('home?page=report');
        })
    }
}