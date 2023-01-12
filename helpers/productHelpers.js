var MongoClient = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectId;
var Mongo = MongoClient.connect('mongodb://localhost:27017/example');
// const { resolve } = require('express-hbs/lib/resolver');
const bcrypt = require('bcrypt');
const { response } = require('../app');
const { ObjectId } = require('mongodb');
const multer = require('multer');
const fs = require('fs');

module.exports = {
    doAddProduct: (productFormData,adminData,images) => {
        return new Promise((resolve,reject) => {
            Mongo.then(async (client) => {
                let response = {};
                productFormData.outletName = adminData.outletName;
                productFormData.outletId = objectId(adminData._id);
                productFormData.status = true ;
                productFormData.stock = {};
                productFormData.stock.s=parseInt(productFormData.s);
                productFormData.stock.m=parseInt(productFormData.m);
                productFormData.stock.l=parseInt(productFormData.l);
                productFormData.stock.xl=parseInt(productFormData.xl);
                delete productFormData.s;
                delete productFormData.m;
                delete productFormData.l;
                delete productFormData.xl;
                productFormData.actualPrice = parseInt(productFormData.price);
                productFormData.offer = parseInt(productFormData.offer);
                productFormData.price = parseFloat((productFormData.price*(100-productFormData.offer)/100).toFixed(2));
                productFormData.lastEditedBy = 'admin';
                await client.db('project1').collection('products').insertOne(productFormData);
                data = await client.db('project1').collection('products').find({}).sort({_id:-1}).limit(1).toArray();
                imageName = './public/images/products/'+data[0]._id;
                images.forEach((element,index) => {
                    element.mv(imageName+index+'.jpg', (err) => {
                        if(err){
                            console.log(err);
                        }
                    });
                })
                response.data = data[0];
                response.message = 'Product added successfully';
                response.status = true;
                resolve(response);
            })
        })
    },
    
    getProductsData: (sortby) => {
        return new Promise((resolve,reject) => {
            Mongo.then(async (client) => {
                let data;
                let response = {};
                if(sortby=='priceLowToHigh'){
                    data = await client.db('project1').collection('products').find().sort({price:1}).toArray();
                    response.sortby = sortby;
                }
                else if(sortby=='priceHighToLow'){
                    data = await client.db('project1').collection('products').find().sort({price:-1}).toArray();
                    response.sortby = sortby;
                }
                else{
                    data = await client.db('project1').collection('products').find().toArray();
                    response.sortby = 'latest';
                }
                response.data = data;
                resolve(response);
            })
        })
    },

    brandProducts: (outletId) => {
        return new Promise((resolve,reject) => {
            Mongo.then(async (client) => {
                let data = await client.db('project1').collection('products').find({'outletId':objectId(outletId)}).toArray();
                resolve(data);
            })
        })
    },

    doProductDelete: (id) => {
        return new Promise((resolve,reject) => {
            Mongo.then(async (client) => {
                await client.db('project1').collection('products').updateOne({'_id':objectId(id)},{$set:{'status':false}});
                let response = true ;
                resolve(response);
            })
        }) 
    },

    doProductRecover: (id) => {
        return new Promise((resolve,reject) => {
            Mongo.then(async (client) => {
                await client.db('project1').collection('products').updateOne({'_id':objectId(id)},{$set:{'status':true}});
                let response = true ;
                resolve(response);
            })
        }) 
    },

    getProductData: (userId,productId) => {
        return new Promise((resolve,reject) => {
            Mongo.then(async (client) => {
                let response = {}
                let data = await client.db('project1').collection('products').find({'_id':objectId(productId)}).toArray();
                response.data = data[0];
                if(userId){
                    let inCartExists = await client.db('project1').collection('users').find({'_id':objectId(userId),'cart.product':{$in:[objectId(productId)]}}).toArray();
                    if(inCartExists.length!=0){
                        response.data.inCart = true;
                    }
                    else{
                        response.data.inCart = false;
                    }
                }
                resolve(response);
            })
        })
    },

    doEditProduct: (id,formData,images) => {
        
        return new Promise((resolve,reject) => {
            Mongo.then(async (client) => {
                let response = {};
                formData.sQuantity = parseInt(formData.s);
                formData.mQuantity = parseInt(formData.m);
                formData.lQuantity = parseInt(formData.l);
                formData.xlQuantity = parseInt(formData.xl);
                formData.actualPrice = parseInt(formData.price);
                formData.offer = parseInt(formData.offer);
                formData.price = parseFloat((formData.actualPrice*(100-formData.offer)/100).toFixed(2));
                formData.lastEditedBy = 'admin';
                for(i=0;i<4;i++){
                    if(images[i]){
                        fs.unlink('./public/images/products/'+id+i+'.jpg', (err) => {
                            if(err){
                                console.log(err);
                            }
                            else{
                                console.log('image deleted');
                            }
                        });
                    }
                }
                await client.db('project1').collection('products')
                .updateOne({'_id':objectId(id)},{$set:{'category':formData.category,'color':formData.color,'pattern':formData.pattern,'gender':formData.gender,'actualPrice':formData.actualPrice,'offer':formData.offer,'price':formData.price,'imageUrl':formData.imageUrl,'stock.s':formData.sQuantity,'stock.m':formData.mQuantity,'stock.l':formData.lQuantity,'stock.xl':formData.xlQuantity}});
                let imageName = './public/images/products/'+id;
                images.forEach((element,index) => {
                    if(element){
                        element.mv(imageName+index+'.jpg');
                    }
                })
                response.status = true ;
                response.message = 'Product edited successfully';
                resolve(response);
            })
        }) 
    },

}