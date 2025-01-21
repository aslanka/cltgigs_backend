const chai = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const { mockRequest, mockResponse } = require('mock-req-res');

const expect = chai.expect;

describe('Auth Controller', () => {
  let User, bcryptStub, jwtStub, controller;
  
  beforeEach(() => {
    User = {
      findOne: sinon.stub(),
      prototype: { save: sinon.stub().resolves() }
    };
    
    bcryptStub = {
      genSalt: sinon.stub().resolves('salt'),
      hash: sinon.stub().resolves('hashed'),
      compare: sinon.stub().resolves(true)
    };

    jwtStub = {
      sign: sinon.stub().returns('token')
    };

    controller = proxyquire('../controllers/authController', {
      '../models/User': User,
      'bcrypt': bcryptStub,
      'jsonwebtoken': jwtStub
    });
  });

  describe('registerUser', () => {
    it('should reject existing users', async () => {
      User.findOne.resolves({});
      const req = mockRequest({ body: { email: 'test@test.com' } });
      const res = mockResponse();
      
      await controller.registerUser(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });
  });

  describe('loginUser', () => {
    it('should reject invalid credentials', async () => {
      User.findOne.resolves(null);
      const req = mockRequest({ body: { email: 'test@test.com' } });
      const res = mockResponse();
      
      await controller.loginUser(req, res);
      expect(res.status.calledWith(401)).to.be.true;
    });
  });
});