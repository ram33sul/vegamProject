module.exports = {
    userLoggedOut : (req,res,next) => {
        if(req.session.status){
            res.redirect('products');
        }
        else{
            next();
        }
    },

    userLoggedIn: (req,res,next) => {
        if(req.session.status){
            next();
        }
        else{
            res.redirect('login');
        }
    },

    adminLoggedOut : (req,res,next) => {
        if(req.session.adminStatus){
            res.redirect('admin/products');
        }
        else{
            next();
        }
    },

    adminLoggedIn : (req,res,next) => {
        if(req.session.adminStatus){
            next();
        }
        else{
            res.redirect('login');
        }
    },

    masterLoggedOut : (req,res,next) => {
        if(req.session.masterStatus){
            res.redirect('outlets');
        }
        else{
            next();
        }
    },

    masterLoggedIn : (req,res,next) => {
        if(req.session.masterStatus){
            next();
        }
        else{
            res.redirect('login');
        }
    },

}