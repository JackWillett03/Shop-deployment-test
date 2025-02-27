process.env.PORT = 9001; // set the port for testing to 9001

const chai = require('chai');
const expect = chai.expect;
const should = chai.should();
const mongoose = require('mongoose');
const chaiHttp = require('chai-http');
const server = require('../server');
const Staff = require('../models/Staff');
const ShopList = require('../models/ShopList');
const StockList = require('../models/StockList');
const Sales = require('../models/Sales');
const User = require('../models/Users');
chai.use(chaiHttp);

// Tests to make sure the API is running and can be accessed
describe('/Tests to make sure it is running', () =>{
    it('test the api is working', (done) => {
        chai.request(server)
        .get('/')
        .end((err, res) => {
            if (err) {
                return done(err);
            }
            expect(res).to.have.status(200);
            expect(res.body).to.have.property('message').eql('API is running successfully');
            done();
        });
    });

    it('test if the server is running on port 9000', (done) => {
        const port = process.env.PORT || 9000; 
        chai.request(`http://localhost:${port}`)
        .get('/')
        .end((err, res) => {
            if (err) {
                return done(err);
            }
            expect(res).to.have.status(200);
            expect(res.body).to.have.property('message').eql('API is running successfully');
            done();
        });
    });

    
});


let staffToken; // Store the token for a staff member
let testStaffId; // Store the Id of a staff member
let ownerToken; // Store the token for an owner
let ownerId; // Store the Id of the owner

const testStaff = { // Test data
    Username: 'TestStaff',
    Password: 'TestPass1!',
    ShopId: '65b6e3f5f1d4a8a9bce6f1a1',
    IsManager: true,
    IsOwner: false
};

const testOwner = { // Owner test data
    Username: 'TestOwner',
    Password: 'OwnerPass1!',
    IsManager: false,
    IsOwner: true
};

// Tests for the Staff API
describe('Staff tests', () => {
    before(async () => {
        await Staff.deleteMany({}); // Clear the database
    });

    it('Should create an owner (no ShopId)', (done) => {
        chai.request(server)
            .post('/staff')
            .send(testOwner)
            .end((err, res) => {
                if (err) return done(err);
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('IsOwner').eql(true);
                expect(res.body.ShopId).to.be.null; // ShopId should be null
                ownerId = res.body._id;
                done();
            });
    });
    

    it('Should create a standard staff member', (done) => {
        chai.request(server)
            .post('/staff')
            .send(testStaff)
            .end((err, res) => {
                if (err) return done(err);
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('ShopId'); // Staff members should have a ShopId
                testStaffId = res.body._id;
                done();
            });
    });

    it('Should fail to create staff due to invalid password', (done) => {
        const invalidStaff = { ...testStaff, Password: 'password' }; // Password doesn't meet requirements
        chai.request(server)
            .post('/staff')
            .send(invalidStaff)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('message');
                done();
            });
    });

    it('should log in an owner and return a token', (done) => {
        chai.request(server)
            .post('/staff/login')
            .send({ Username: testOwner.Username, Password: testOwner.Password })
            .end((err, res) => {
                if (err) return done(err);
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('token'); // It should return a JWT
                ownerToken = res.body.token;
                done();
            });
    });

    it('should log in a staff member and return a token', (done) => {
        chai.request(server)
            .post('/staff/login')
            .send({ Username: testStaff.Username, Password: testStaff.Password })
            .end((err, res) => {
                if (err) return done(err);
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('token'); // Should return a JWT
                staffToken = res.body.token;
                done();
            });
    });

    it('should get all staff', (done) => {
        chai.request(server)
            .get('/staff')
            .set('Authorization', `Bearer ${ownerToken}`) // Only owner has permission
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array');
                done();
            });
    });

    it('should get staff by ShopId', (done) => {
        chai.request(server)
            .get(`/staff/shop/${testStaff.ShopId}`)
            .set('Authorization', `Bearer ${ownerToken}`)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array');
                done();
            });
    });

    it('should update staff by Id', (done) => {
        chai.request(server)
            .put(`/staff/${testStaffId}`)
            .set('Authorization', `Bearer ${staffToken}`)
            .send({ Username: 'UpdatedStaff', Password: 'NewPass1!' })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('Username').eql('UpdatedStaff');
                done();
            });
    });

    it('should delete a staff member', (done) => {
        chai.request(server)
            .delete(`/staff/${testStaffId}`)
            .set('Authorization', `Bearer ${ownerToken}`)
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });
});


let token; // JWT
let testShop = {
    Name: "Test Shop",
    Location: "Test Location"
};
let shopId;

describe('ShopList tests', () => {
    before(async () => {
        await ShopList.deleteMany({}); // Clear ShopList 
        await Staff.deleteMany({}); // Clear Staff 
    });

    before((done) => {
        const OwnerData = { // Create an owner
            Username: 'Admin',
            Password: 'Admin@123',
            IsOwner: true
        };

        chai.request(server)
            .post('/staff')
            .send(OwnerData)
            .end((err, res) => {
                if (err) return done(err);
                // log in as the owner to get the jwt
                chai.request(server)
                    .post('/staff/login')
                    .send({ Username: OwnerData.Username, Password: OwnerData.Password })
                    .end((err, res) => {
                        if (err) return done(err);
                        token = res.body.token; // store the jwt
                        done();
                    });
            });
    });

    it('should add a new shop', (done) => {
        chai.request(server)
            .post('/shops')
            .set('Authorization', `Bearer ${token}`) // Use the JWT 
            .send(testShop)
            .end((err, res) => {
                if (err) return done(err);
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('Name').eql(testShop.Name);
                shopId = res.body._id; // Save the Id for the other tests
                done();
            });
    });

    it('should get all shops', (done) => {
        chai.request(server)
            .get('/shops')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array');
                done();
            });
    });

    it('should get a shop by its name', (done) => {
        chai.request(server)
            .get(`/shops/name/${testShop.Name}`)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array');
                done();
            });
    });

    it('should get a shop by its location', (done) => {
        chai.request(server)
            .get(`/shops/location/${testShop.Location}`)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array');
                done();
            });
    });

    it('should update a shop', (done) => {
        const updatedShop = { Name: "Updated Shop", Location: "Updated Location" };
        chai.request(server)
            .put(`/shops/${shopId}`) // Use the shopId 
            .set('Authorization', `Bearer ${token}`) // Use the JWT
            .send(updatedShop) 
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('Name').eql(updatedShop.Name);
                done();
            });
    });

    it('should delete a shop', (done) => {
        chai.request(server)
            .delete(`/shops/${shopId}`)
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message').eql('Shop and linked data deleted successfully');
                done();
            });
    });
});

let stockToken; // Jwt for stock tests
let testStockId;
let testShopId = "65b6e3f5f1d4a8a9bce6f1a1"; // ShopId
let testStock = { // Create test stock data
    Item: "Test Item",
    ShopId: testShopId,
    CurrentStock: 100,
    Price: 50,
    Tags: ["electronics", "new"]
};

describe('StockList tests', () => {
    before(async () => {
        await StockList.deleteMany({}); // Clear StockList
        await Staff.deleteMany({}); // Clear Staff 
        await ShopList.deleteMany({}); // Clear ShopList
    });

    before((done) => {
        // Create Owner account
        const OwnerData = {
            Username: 'Admin',
            Password: 'Admin@123',
            IsOwner: true
        };

        chai.request(server)
            .post('/staff')
            .send(OwnerData)
            .end((err, res) => {
                if (err) return done(err);
                // Log in as owner
                chai.request(server)
                    .post('/staff/login')
                    .send({ Username: OwnerData.Username, Password: OwnerData.Password })
                    .end((err, res) => {
                        if (err) return done(err);
                        stockToken = res.body.token; // Get JWT
                        done();
                    });
            });
    });

    it('should add new stock', (done) => {
        chai.request(server)
            .post('/stocks')
            .set('Authorization', `Bearer ${stockToken}`) // Use the jwt
            .send(testStock)
            .end((err, res) => {
                if (err) return done(err);
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('Item').eql(testStock.Item);
                testStockId = res.body._id; // Save stock Id 
                done();
            });
    });

    it('should get all stock', (done) => {
        chai.request(server)
            .get('/stocks')
            .set('Authorization', `Bearer ${stockToken}`)
            .end((err, res) => {
                if (err) return done(err);
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array');
                done();
            });
    });

    it('should get stock by item name', (done) => {
        chai.request(server)
            .get(`/stocks/item/${testStock.Item}`)
            .end((err, res) => {
                if (err) return done(err);
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array');
                done();
            });
    });

    it('should get stock by ShopId', (done) => {
        chai.request(server)
            .get(`/stocks/shop/${testShopId}`)
            .end((err, res) => {
                if (err) return done(err);
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array');
                done();
            });
    });

    it('should get stock by tag', (done) => {
        chai.request(server)
            .get(`/stocks/tags/electronics`)
            .end((err, res) => {
                if (err) return done(err);
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array');
                done();
            });
    });

    it('should update stock by Id', (done) => {
        const updatedStock = {
            Item: "Updated Item",
            ShopId: testShopId,
            CurrentStock: 150,
            Price: 60,
            Tags: ["electronics", "sale"]
        };

        chai.request(server)
            .put(`/stocks/${testStockId}`)
            .set('Authorization', `Bearer ${stockToken}`)
            .send(updatedStock)
            .end((err, res) => {
                if (err) return done(err);
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('Item').eql(updatedStock.Item);
                expect(res.body).to.have.property('CurrentStock').eql(updatedStock.CurrentStock);
                done();
            });
    });

    it('should delete stock by Id', (done) => {
        chai.request(server)
            .delete(`/stocks/${testStockId}`)
            .set('Authorization', `Bearer ${stockToken}`)
            .end((err, res) => {
                if (err) return done(err);
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message').eql('Stock and related sales deleted successfully');
                done();
            });
    });
});