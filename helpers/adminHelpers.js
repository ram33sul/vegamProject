var MongoClient = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectId;
var Mongo = MongoClient.connect('mongodb://localhost:27017/example');
const { resolve } = require('express-hbs/lib/resolver');
const bcrypt = require('bcrypt');
const { response } = require('../app');


module.exports = {

    doSignup: (adminFormData) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                data1 = await client.db('project1').collection('admin').find({ 'email': adminFormData.email }).toArray();
                data2 = await client.db('project1').collection('admin').find({ 'regNo': adminFormData.regNo }).toArray();
                data3 = await client.db('project1').collection('admin').find({ 'gstNo': adminFormData.gstNo }).toArray();
                let response = {};
                if (data1.length != 0) {
                    response.message = 'Email already exists';
                    response.status = false;
                }
                else if (data2.length != 0) {
                    response.message = 'Outlet Reg Number already exists';
                    response.status = false;
                }
                else if (data3.length != 0) {
                    response.message = 'GST number already exists';
                    response.status = false;
                }
                else {
                    delete adminFormData.cpassword;
                    adminFormData.password = await bcrypt.hash(adminFormData.password, 10)
                    adminFormData.orders = [];
                    adminFormData.categoryOffer = {};
                    adminFormData.status = true;
                    client.db('project1').collection('admin').insertOne(adminFormData);
                    let data = await client.db('project1').collection('admin').find({ 'email': adminFormData.email }).toArray();
                    response.data = data[0];
                    response.status = true;
                }
                resolve(response);
            })
        })

    },

    doLogin: (adminFormData) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                let data = await client.db('project1').collection('admin').find({ 'email': adminFormData.email }).toArray();
                let response = {};
                if (data.length != 0) {
                    let status = await bcrypt.compare(adminFormData.password, data[0].password);
                    if (status) {
                        if (data[0].status) {
                            response.data = data[0];
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
                    response.message = 'Email is incorrect'
                    response.status = false;
                }
                resolve(response);
            })
        })
    },

    getAdminData: (id) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                let data = await client.db('project1').collection('admin').find({ '_id': objectId(id) }).toArray();
                let response = {};
                response.data = data[0];
                response.status = true;
                resolve(response);
            })
        })
    },
    getAdminsData: () => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                let response = {};
                let data = await client.db('project1').collection('admin').find().toArray();
                response.data = data;
                response.status = true;
                resolve(response);
            })
        })
    },

    blockOutlet: (id) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                let response = {};
                await client.db('project1').collection('admin').updateOne({ '_id': objectId(id) }, { $set: { 'status': false } });
                response.status = true;
                resolve(response);
            })
        })
    },

    unblockOutlet: (id) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                let response = {};
                await client.db('project1').collection('admin').updateOne({ '_id': objectId(id) }, { $set: { 'status': true } });
                response.status = true;
                resolve(response);
            })
        })
    },

    getOrders: (id) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                let orders = [];
                let data = await client.db('project1').collection('orders').aggregate([{ $match: { 'order.products.outlet': objectId(id) } }, { $lookup: { from: 'products', localField: 'order.products.product', foreignField: '_id', as: 'productsDetails' } }]).toArray();
                for (i = 0; i < data.length; i++) {
                    for (j = 0; j < data[i].productsDetails.length; j++) {
                        for (k = 0; k < data[i].order.products.length; k++) {
                            if ((data[i].productsDetails[j]._id).toString() == (data[i].order.products[k].product).toString()) {
                                data[i].productsDetails[j].quantity = data[i].order.products[k].quantity;
                                data[i].productsDetails[j].size = data[i].order.products[k].size;
                                data[i].productsDetails[j].orderId = data[i]._id;
                                data[i].productsDetails[j].address = data[i].order.address;
                                data[i].productsDetails[j].status = data[i].order.products[k].status;
                                data[i].productsDetails[j].date = data[i].order.date;
                                orders.push(data[i].productsDetails[j]);
                            }
                        }
                    }
                }
                orders = orders.sort((a, b) => { b.date - a.date });
                resolve(orders);
            })
        })
    },

    postEditAdmin: (id, formData) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                await client.db('project1').collection('admin').updateOne({ '_id': objectId(id) }, { $set: { 'outletName': formData.outletName, 'regNo': formData.regNo, 'gstNo': formData.gstNo, 'email': formData.email, 'gps': formData.gps } });
                resolve(true);
            })
        })
    },

    getDashboard: (id) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                let data = await client.db('project1').collection('orders').find({ 'order.products.outlet': objectId(id) }).toArray();
                let date = new Date();
                let year = date.getFullYear();
                let month = date.getMonth();
                let day = date.getDate();
                let hour = date.getHours();
                let reportHourly = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                let reportDaily = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                let reportWeekly = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                let reportMonthly = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                for (j = 0; j < data.length; j++) {
                    for (k = 0; k < data[j].order.products.length; k++) {
                        if (data[j].order.products[k].outlet == id) {
                            if (data[j].order.date.getDate() == day) {
                                reportHourly[data[j].order.date.getHours()] = reportHourly[data[j].order.date.getHours()] + 1;
                            }
                            else if (data[j].order.date.getDate() == day - 1 && data[j].order.date.getHours() > hour) {
                                reportHourly[data[j].order.date.getHours()] = reportHourly[data[j].order.date.getHours()] + 1;
                            }
                            if (data[j].order.date.getMonth() == month) {
                                reportDaily[data[j].order.date.getDate()] = reportDaily[data[j].order.date.getDate()] + 1;
                            }
                            else if (data[j].order.date.getMonth() == month - 1 && data[j].order.date.getDate() > day) {
                                reportDaily[data[j].order.date.getDate()] = reportDaily[data[j].order.date.getDate()] + 1;
                            }
                        }
                    }
                }
                let temp = [];
                for (i = 0; i < reportHourly.length - hour - 1; i++) {
                    temp[i] = reportHourly[hour + i + 1];
                }
                for (i = reportHourly.length - hour - 1; i < reportHourly.length; i++) {
                    temp[i] = reportHourly[i - reportHourly.length + hour + 1];
                }
                reportHourly = temp;
                console.log(temp);
                console.log(reportHourly);
                console.log(reportDaily);
                let response = {};
                response.reportHourly = reportHourly;
                response.reportDaily = reportDaily;
                response.hour = hour;
                response.day = day;
                response.month = month;
                response.year = year;
                resolve(response);
            })
        })
    },

    cancelOrderProduct: (productId, orderId) => {
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
    productShipped: (productId, orderId) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                await client.db('project1').collection('orders').updateOne({ '_id': objectId(orderId), 'order.products.product': objectId(productId) }, { $set: { 'order.products.$.status': 'shipped' } });
                let data = await client.db('project1').collection('orders').find({ '_id': objectId(orderId) }).toArray();
                let flag = true;
                data[0].order.products.forEach(data => {
                    if (data.status != 'shipped') {
                        flag = false;
                    }
                })
                if (flag) {
                    await client.db('project1').collection('orders').updateOne({ '_id': objectId(orderId) }, { $set: { 'order.status': 'shipped' } });
                }
                resolve(true);
            })
        })
    },

    productDelivered: (productId, orderId) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                await client.db('project1').collection('orders').updateOne({ '_id': objectId(orderId), 'order.products.product': objectId(productId) }, { $set: { 'order.products.$.status': 'delivered' } });
                let data = await client.db('project1').collection('orders').find({ '_id': objectId(orderId) }).toArray();
                let flag = true;
                data[0].order.products.forEach(data => {
                    if (data.status != 'delivered') {
                        flag = false;
                    }
                })
                if (flag) {
                    await client.db('project1').collection('orders').updateOne({ '_id': objectId(orderId) }, { $set: { 'order.status': 'delivered' } });
                }
                resolve(true);
            })
        })
    },

    report: (id, formData) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                let fromDate = formData.fromDate;
                let toDate = formData.toDate;
                let toDate2 = toDate + 'T23:59:59.999Z';
                let data = await client.db('project1').collection('orders').aggregate([
                    {
                        $unwind: '$order.products'
                    },
                    {
                        $match: {
                            'order.products.outlet': objectId(id)
                        }
                    },
                    {
                        $lookup: {
                            from: 'products',
                            localField: 'order.products.product',
                            foreignField: '_id',
                            as: 'productDetails'
                        }
                    },
                    {
                        $unwind: '$productDetails'
                    },
                    {
                        $project: {
                            'product': '$order.products.product',
                            'price': '$productDetails.price',
                            'quantity': '$order.products.quantity',
                            'size': '$order.products.size',
                            'date': '$order.date',
                            _id: null
                        }
                    },
                    {
                        $match: {
                            'date': {
                                '$gte': new Date(fromDate),
                                '$lte': new Date(toDate2)
                            }
                        }
                    },
                    {
                        $group: {
                            _id: "$product",
                            'quantity': {
                                $sum: '$quantity'
                            },
                            'price': {
                                $first: '$price'
                            }
                        }
                    },
                    {
                        $sort: {
                            quantity: -1
                        }
                    }
                ]).toArray();
                let totalProducts = data.length;
                let totalQuantity = 0;
                let totalPrice = 0;
                for (i = 0; i < totalProducts; i++) {
                    totalQuantity = totalQuantity + data[i].quantity;
                    totalPrice = totalPrice + (data[i].quantity * data[i].price);
                }
                let response = {};
                response.data = data;
                response.totalProducts = totalProducts;
                response.totalQuantity = totalQuantity;
                response.totalPrice = totalPrice;
                response.fromDate = fromDate;
                response.toDate = toDate;
                resolve(response);
            })
        })
    },

    masterReport: (formData) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                let fromDate = formData.fromDate;
                let toDate = formData.toDate;
                let toDate2 = toDate + 'T23:59:59.999Z';
                let data = await client.db('project1').collection('orders').aggregate([
                    {
                        $unwind: '$order.products'
                    },
                    {
                        $project: {
                            'outletId': '$order.products.outlet',
                            'quantity': '$order.products.quantity',
                            'date': '$order.products.addedTime'
                        }
                    },
                    {
                        $match: {
                            'date': {
                                $gte: new Date(fromDate),
                                $lte: new Date(toDate2)
                            }
                        }
                    },
                    {
                        $group: {
                            _id: '$outletId',
                            orders: {
                                $sum: 1
                            },
                            quantity: {
                                $sum: '$quantity'
                            }
                        }
                    }
                ]).toArray();
                let totalOrders = 0;
                let totalQuantity = 0;
                data.forEach(data => {
                    totalOrders = totalOrders + data.orders;
                    totalQuantity = totalQuantity + data.quantity;
                })
                let response = {};
                response.data = data;
                response.fromDate = fromDate;
                response.toDate = toDate;
                response.totalOrders = totalOrders;
                response.totalQuantity = totalQuantity;
                response.totalOutlets = data.length;
                resolve(response);
            })
        })
    },

    printReportPdf: (data) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                //Required package
                var pdf = require("pdf-creator-node")
                var fs = require('fs')

                // Read HTML Template
                var html = fs.readFileSync('./views/admin/reportPdf.html', 'utf8')
                var document = {
                    html: html,
                    data: {
                        data: data
                    },
                    path: "./reports/" + data.fromDate + "to" + data.toDate + ".pdf"
                };
                var options = { format: "A3", orientation: "portrait", border: "10mm" };
                pdf.create(document, options)
                    .then(res => {
                        console.log(res)
                    })
                    .catch(error => {
                        console.error(error)
                    });

                resolve(data);
            })
        })
    },

    printReportExcel: (dataGain) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                const User = dataGain.data;
                const excelJS = require("exceljs");

                const workbook = new excelJS.Workbook();  
                const worksheet = workbook.addWorksheet("My Users"); 
                const path = "./reports";  
                worksheet.columns = [
                    { header: "S no.", key: "s_no", width: 10 },
                    { header: "Product Id", key: "_id", width: 25 },
                    { header: "quantity", key: "quantity", width: 10 },
                    { header: "price", key: "price", width: 10 },
                ];
                // Looping through User data
                let counter = 1;
                User.forEach((user) => {
                    user.s_no = counter;
                    worksheet.addRow(user); // Add data in worksheet
                    counter++;
                });
                // Making first line in excel bold
                worksheet.getRow(1).eachCell((cell) => {
                    cell.font = { bold: true };
                });
                try {
                    const data = await workbook.xlsx.writeFile(path+'/'+dataGain.fromDate+'to'+dataGain.toDate+'excel.xlsx')
                        .then(() => {
                            console.log('success');
                            resolve(true);
                        });
                } catch (err) {
                    console.log('failed');
                    resolve({
                        status: "error",
                        message: "Something went wrong",
                    });
                }

            })
        })
    },

    dashboardOffers: (outletId) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                let data = await client.db('project1').collection('admin').aggregate([
                    {
                        $match:{
                            '_id':objectId(outletId)
                        }
                    },
                    {
                        $project:{
                            _id:0,
                            'offers':1
                        }
                    }
                ]).toArray();
                let response = {};
                response.data = data[0].offers;
                response.status = true;
                resolve(response);
            })
        })
    },

    postCategoryOffer: (outletId,formData) => {
        return new Promise((resolve, reject) => {
            Mongo.then(async (client) => {
                let field = 'offers.'+formData.gender;
                let categoryCheck = await client.db('project1').collection('admin').find({'_id':objectId(outletId),[field]:{$exists:  true}}).toArray();
                if(categoryCheck.length==0){
                    await client.db('project1').collection('admin').updateOne({'_id':objectId(outletId)},{$set:{[field]:{}}});
                }
                let keys = Object.keys(formData);
                keys.forEach(async data => {
                    if(data!='gender'&&formData[data].length!=0){
                         let field = 'offers.'+formData.gender+'.'+data;
                         await client.db('project1').collection('admin').updateOne({'_id':objectId(outletId)},{$set:{[field]:formData[data]}});
                         await client.db('project1').collection('products').updateMany(
                            {
                                'outletId':objectId(outletId),
                                'gender':formData.gender.toUpperCase(),
                                'category':data.toUpperCase().substring(0, data.length - 1)
                            },
                            {
                                $set: {
                                    'categoryOffer':parseInt(formData[data])
                                }
                            });
                         await client.db('project1').collection('products').updateMany(
                            {
                                'outletId':objectId(outletId),
                                'gender':formData.gender.toUpperCase(),
                                'category':data.toUpperCase().substring(0, data.length - 1)},
                            [
                                {
                                    $set: {
                                        price: {
                                            $cond: {
                                                if: {
                                                    $lt:[
                                                        "$offer",
                                                        parseInt(formData[data])
                                                    ]
                                                },
                                                then: { 
                                                    $subtract: [
                                                        "$actualPrice",
                                                        {
                                                            $divide: [
                                                                {
                                                                    $multiply: [
                                                                        "$actualPrice",
                                                                        parseInt(formData[data])
                                                                    ]
                                                                },
                                                                100
                                                            ]
                                                        }
                                                    ]
                                                },
                                                else: {
                                                    $subtract: [
                                                        "$actualPrice",
                                                        {
                                                            $divide: [
                                                                {
                                                                    $multiply: [
                                                                        "$actualPrice",
                                                                        "$offer"
                                                                    ]
                                                                },
                                                                100
                                                            ]
                                                        }
                                                    ]
                                                }
                                            }
                                        }
                                    }
                                }
                            ]);
                     }
                 })
                resolve(true);
            })
        })
    }

}