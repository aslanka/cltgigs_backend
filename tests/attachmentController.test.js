const chai = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const { mockRequest, mockResponse } = require('mock-req-res');
const fs = require('fs');

const expect = chai.expect;

describe('Attachment Controller', () => {
  let Attachment, fsStub, controller;
  
  beforeEach(() => {
    Attachment = {
      findById: sinon.stub(),
      deleteOne: sinon.stub()
    };
    
    fsStub = {
      unlink: sinon.stub().callsFake((path, cb) => cb(null))
    };

    controller = proxyquire('../controllers/attachmentController', {
      '../models/Attachment': Attachment,
      'fs': fsStub
    });
  });

  describe('uploadAttachmentGeneral', () => {
    it('should return 400 if no file uploaded', async () => {
      const req = mockRequest({ file: null });
      const res = mockResponse();
      
      await controller.uploadAttachmentGeneral(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it('should create attachment record on success', async () => {
      const mockFile = { filename: 'test.jpg' };
      const req = mockRequest({
        file: mockFile,
        body: { type: 'gig', foreign_key_id: '123' }
      });
      const res = mockResponse();
      const mockSave = sinon.stub().resolves({ _id: '1', file_url: '/uploads/test.jpg' });
      Attachment.prototype.save = mockSave;

      await controller.uploadAttachmentGeneral(req, res);
      expect(mockSave.calledOnce).to.be.true;
      expect(res.status.calledWith(201)).to.be.true;
    });
  });

  describe('deleteAttachment', () => {
    it('should handle file deletion errors', async () => {
      const req = mockRequest({ params: { attachmentId: '1' } });
      const res = mockResponse();
      Attachment.findById.resolves({ file_url: '/uploads/test.jpg' });
      fsStub.unlink.callsFake((path, cb) => cb(new Error('File error')));

      await controller.deleteAttachment(req, res);
      expect(Attachment.deleteOne.calledOnce).to.be.true;
    });
  });
});