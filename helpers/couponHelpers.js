var MongoClient = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectId;
var Mongo = MongoClient.connect('mongodb://localhost:27017/example');
const { resolve } = require('express-hbs/lib/resolver');
const bcrypt = require('bcrypt');
const { response } = require('../app');
const e = require('express');

module.exports = {

    getCoupons: (outletId) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                let data = await client.db('project1').collection('coupons').find({'outletId':objectId(outletId)}).toArray();
                resolve(data);
            })
        })
    },

    addCoupons: (outletId,formData) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                formData.value = parseInt(formData.value);
                formData.minSpent = parseInt(formData.minSpent);
                formData.outletId = objectId(outletId);
                formData.addedTime = new Date();
                formData.status = true;
                let data = await client.db('project1').collection('coupons').find({'name':formData.name}).toArray();
                let response = {};
                if(data.length==0){
                    await client.db('project1').collection('coupons').insertOne(formData);
                    response.data = true;
                    response.message = "Coupon added successfully"
                }
                else{
                    response.data = false;
                    response.message = "Coupon name already exists"
                }
                resolve(response);
            })
        })
    },

    getCouponsUser: (userId) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                let couponsData = await client.db('project1').collection('users').aggregate([
                    {
                        $match: {
                            '_id':objectId(userId)
                        }
                    },
                    {
                        $unwind: '$cart'
                    },
                    {
                        $project:{
                            'productId':'$cart.product',
                            'outletId':'$cart.outlet',
                            'quantity':'$cart.quantity'
                        }
                    },
                    {
                        $lookup: {
                            from:'products',
                            localField:'productId',
                            foreignField:'_id',
                            as:'productDetails'
                        }
                    },
                    {
                        $project: {
                            '_id':0,
                            'productId':1,
                            'outletId':1,
                            'total': {
                                $multiply: [
                                    '$quantity',
                                    {
                                        $first: '$productDetails.price'
                                    }
                                ]
                            },
                            'outletName': {
                                $first: '$productDetails.outletName'
                            }
                        }
                    },
                    {
                        $group: {
                            _id:'$outletId',
                            'total':{
                                $sum: '$total'
                            },
                            'outletName':{
                                $first: '$outletName'
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: 'coupons',
                            pipeline: [
                                {
                                    $match: {
                                        'status':true
                                    }
                                }
                            ],
                            localField: '_id',
                            foreignField: 'outletId',
                            as: 'couponDetails',
                        }
                    }                  
                ]).toArray();
                let appliedCouponData = await client.db('project1').collection('users').aggregate([
                    {
                        $match:{
                            '_id':objectId(userId)
                        }
                    },
                    {
                        $lookup:{
                            from:'coupons',
                            localField:'appliedCoupon',
                            foreignField:'_id',
                            as:'couponData'
                        }
                    },
                    {
                        $project:{
                            _id:0,
                            'couponData':{
                                $first:'$couponData'
                            }
                        }
                    }
                ]).toArray();
                let response={};
                response.data={};
                response.data.couponsData=couponsData;
                if(appliedCouponData[0].couponData){
                    response.data.appliedCouponData=appliedCouponData[0].couponData;
                }
                else{
                    response.data.appliedCouponData={};
                    response.data.appliedCouponData.name='COUPON NOT APPLIED';
                    response.data.appliedCouponData.value=0;
                }
                response.status=true;
                resolve(response);
            })
        })
    },

    cancelAppliedCoupon: (userId) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                await client.db('project1').collection('users').updateOne({'_id':objectId(userId)},{$set:{'appliedCoupon':false}});
                resolve(true);
            })
        })
    },

    blockCoupon: (outletId,couponId) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                await client.db('project1').collection('coupons').updateOne({'_id':objectId(couponId)},{$set:{'status':false}});
                resolve(true);
            })
        })
    },

    unblockCoupon: (outletId,couponId) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                await client.db('project1').collection('coupons').updateOne({'_id':objectId(couponId)},{$set:{'status':true}});
                resolve(true);
            })
        })
    }
}