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

let userToken; // Jwt for user tests
let testUsername = "testuser"; // Username for testing
let testEmail = "testuser@example.com"; // Email for testing
let testPassword = "Test@1234"; // Password for testing

// Sample data for registration
const userData = {
    Username: testUsername,
    Email: testEmail,
    Password: testPassword,
};

describe('User tests', () => {
    before(async () => {
        await User.deleteMany({}); // Clear Users
        await Sales.deleteMany({}); // Clear sales data
        await StockList.deleteMany({}); // Clear stocklist data
        await ShopList.deleteMany({}); // Clear shoplist data
    });

    it('should register a new user', (done) => {
        chai.request(server)
            .post('/users/register')
            .send(userData)
            .end((err, res) => {
                if (err) return done(err);
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('Username').eql(testUsername);
                done();
            });
    });

    it('should fail to register when using an existing username', (done) => {
        chai.request(server)
            .post('/users/register')
            .send(userData) // Register the same user again
            .end((err, res) => {
                if (err) return done(err);
                expect(res).to.have.status(409); // Conflict - username exists
                expect(res.body).to.have.property('message').eql('Username already exists');
                done();
            });
    });

    it('should login', (done) => {
        chai.request(server)
            .post('/users/login')
            .send({ Username: testUsername, Password: testPassword })
            .end((err, res) => {
                if (err) return done(err);
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('token');
                userToken = res.body.token; // Store JWT for further tests
                done();
            });
    });

    it('should fail login when using wrong details', (done) => {
        chai.request(server)
            .post('/users/login')
            .send({ Username: testUsername, Password: 'WrongPassword' })
            .end((err, res) => {
                if (err) return done(err);
                expect(res).to.have.status(401); // Unauthorized
                expect(res.body).to.have.property('message').eql('Invalid login');
                done();
            });
    });

    it('should get the user by their username', (done) => {
        chai.request(server)
            .get(`/users/username/${testUsername}`)
            .set('Authorization', `Bearer ${userToken}`)
            .end((err, res) => {
                if (err) return done(err);
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('Username').eql(testUsername);
                expect(res.body).to.have.property('Email').eql(testEmail);
                done();
            });
    });

    it('should fail to get user if the username does not exist', (done) => {
        chai.request(server)
            .get('/users/username/doesntexist')
            .set('Authorization', `Bearer ${userToken}`)
            .end((err, res) => {
                if (err) return done(err);
                expect(res).to.have.status(404); // Not Found
                expect(res.body).to.have.property('message').eql('User not found');
                done();
            });
    });

    it('should update user details', (done) => {
        const updatedData = { Email: "newemail@example.com", Password: "NewPassword@1234" };
        chai.request(server)
            .put(`/users/username/${testUsername}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send(updatedData)
            .end((err, res) => {
                if (err) return done(err);
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('Email').eql(updatedData.Email);
                done();
            });
    });

    it('should fail to update if using the wrong password', (done) => {
        const updatedData = { Email: "wrongemail@example.com", CurrentPassword: "WrongPassword" };
        chai.request(server)
            .put(`/users/username/${testUsername}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send(updatedData)
            .end((err, res) => {
                if (err) return done(err);
                expect(res).to.have.status(401); // Unauthorized
                expect(res.body).to.have.property('message').eql('Current password is incorrect');
                done();
            });
    });

    it('should delete user by their username', (done) => {
        chai.request(server)
            .delete(`/users/username/${testUsername}`)
            .set('Authorization', `Bearer ${userToken}`)
            .end((err, res) => {
                if (err) return done(err);
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('message').eql('User deleted successfully');
                done();
            });
    });

    it('should fail to delete the user if the username does not exist', (done) => {
        chai.request(server)
            .delete('/users/username/doesntexist')
            .set('Authorization', `Bearer ${userToken}`)
            .end((err, res) => {
                if (err) return done(err);
                expect(res).to.have.status(404);
                expect(res.body).to.have.property('message').eql('User not found');
                done();
            });
    });
});