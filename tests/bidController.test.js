const chai = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const { mockRequest, mockResponse } = require('mock-req-res');

const expect = chai.expect;

describe('Bid Controller', () => {
  let Bid, Gig, Notification, Message, Conversation, controller;
  
  beforeEach(() => {
    Bid = {
      findOne: sinon.stub(),
      find: sinon.stub().returns({ populate: sinon.stub().resolves([]) }),
      prototype: { save: sinon.stub().resolves() },
      deleteOne: sinon.stub().resolves()
    };
    
    Gig = {
      findById: sinon.stub().returns({ populate: sinon.stub(), save: sinon.stub() })
    };

    Notification = {
      prototype: { save: sinon.stub().resolves() }
    };

    Message = {
      prototype: { save: sinon.stub().resolves() }
    };

    Conversation = {
      prototype: { save: sinon.stub().resolves() }
    };

    controller = proxyquire('../controllers/bidController', {
      '../models/Bid': Bid,
      '../models/Gig': Gig,
      '../models/Notification': Notification,
      '../models/Message': Message,
      '../models/Conversation': Conversation,
      '../utils/socketIOInstance': { getIO: () => ({ to: () => ({ emit: () => {} }) }) }
    });
  });

  describe('createBid', () => {
    it('should prevent duplicate bids', async () => {
      Bid.findOne.resolves({});
      const req = mockRequest({ 
        body: { gig_id: '1' },
        user: { userId: '123' }
      });
      const res = mockResponse();
      
      await controller.createBid(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });
  });

  describe('acceptBid', () => {
    it('should validate gig owner', async () => {
      const mockBid = { 
        gig_id: { user_id: { toString: () => '456' } },
        save: sinon.stub().resolves() 
      };
      Bid.findById.resolves(mockBid);
      const req = mockRequest({ 
        params: { bidId: '1' },
        user: { userId: '123' }
      });
      const res = mockResponse();
      
      await controller.acceptBid(req, res);
      expect(res.status.calledWith(403)).to.be.true;
    });
  });
});