const chai = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const { mockRequest, mockResponse } = require('mock-req-res');

const expect = chai.expect;

describe('Gig Controller', () => {
  let Gig, Attachment, Bid, controller;
  
  beforeEach(() => {
    Gig = {
      find: sinon.stub().returns({
        populate: sinon.stub().returns({
          skip: sinon.stub().returns({
            limit: sinon.stub().returns({
              sort: sinon.stub().resolves([])
            })
          })
        })
      }),
      countDocuments: sinon.stub().resolves(0),
      findById: sinon.stub().returns({ populate: sinon.stub().resolves({}) }),
      deleteMany: sinon.stub().resolves()
    };

    Attachment = {
      find: sinon.stub().resolves([]),
      deleteMany: sinon.stub().resolves()
    };

    Bid = {
      aggregate: sinon.stub().resolves([])
    };

    controller = proxyquire('../controllers/gigController', {
      '../models/Gig': Gig,
      '../models/Attachment': Attachment,
      '../models/Bid': Bid,
      '../services/zipcodeService': { findZipcodesWithinWithDistance: sinon.stub().resolves([]) }
    });
  });

  describe('getAllGigs', () => {
    it('should handle zipcode filtering', async () => {
      const req = mockRequest({ 
        query: { zipCode: '12345', distance: '10' }
      });
      const res = mockResponse();
      
      await controller.getAllGigs(req, res);
      expect(Gig.find.calledOnce).to.be.true;
    });
  });

  describe('createGig', () => {
    it('should validate budget ranges', async () => {
      const req = mockRequest({
        body: { is_volunteer: 'false' },
        user: { userId: '123' }
      });
      const res = mockResponse();
      
      await controller.createGig(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });
  });
});