const chai = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const { mockRequest, mockResponse } = require('mock-req-res');

const expect = chai.expect;

describe('Message Controller', () => {
  let Conversation, Message, Notification, controller;
  
  beforeEach(() => {
    Conversation = {
      find: sinon.stub().resolves([]),
      findById: sinon.stub().resolves({ 
        populate: sinon.stub().resolves({ 
          gig_owner_id: { _id: '1' },
          bidder_id: { _id: '2' }
        }),
        save: sinon.stub().resolves()
      })
    };

    Message = {
      find: sinon.stub().resolves([]),
      findById: sinon.stub().resolves({}),
      deleteOne: sinon.stub().resolves()
    };

    Notification = {
      prototype: { save: sinon.stub().resolves() }
    };

    controller = proxyquire('../controllers/messageController', {
      '../models/Conversation': Conversation,
      '../models/Message': Message,
      '../models/Notification': Notification,
      '../models/User': { findById: sinon.stub().resolves({ name: 'Test' }) },
      '../utils/socketIOInstance': { getIO: () => ({ to: () => ({ emit: () => {} }) }) }
    });
  });

  describe('sendMessage', () => {
    it('should validate conversation participation', async () => {
      const req = mockRequest({
        body: { conversationId: '1' },
        user: { userId: '3' }
      });
      const res = mockResponse();
      
      await controller.sendMessage(req, res);
      expect(res.status.calledWith(403)).to.be.true;
    });
  });

  describe('deleteMessage', () => {
    it('should verify message ownership', async () => {
      Message.findById.resolves({ sender_id: { toString: () => '2' } });
      const req = mockRequest({ 
        params: { messageId: '1' },
        user: { userId: '1' }
      });
      const res = mockResponse();
      
      await controller.deleteMessage(req, res);
      expect(res.status.calledWith(403)).to.be.true;
    });
  });
});