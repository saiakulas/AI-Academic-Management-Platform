const noticeService = require('../../services/notice.service');
const ApiResponse   = require('../../utils/ApiResponse');
const asyncHandler  = require('../../utils/asyncHandler');

const createNotice = asyncHandler(async (req, res) => {
  const notice = await noticeService.createNotice(req.body, req.user._id);
  res.status(201).json(new ApiResponse(201, { notice }, 'Notice created successfully'));
});

const listNotices = asyncHandler(async (req, res) => {
  const result = await noticeService.listNotices({
    ...req.query,
    viewerRole: req.user.role,
  });
  res.status(200).json(new ApiResponse(200, result, 'Notices retrieved'));
});

const getNoticeById = asyncHandler(async (req, res) => {
  const notice = await noticeService.getNoticeById(req.params.id, req.user.role);
  res.status(200).json(new ApiResponse(200, { notice }, 'Notice retrieved'));
});

const updateNotice = asyncHandler(async (req, res) => {
  const notice = await noticeService.updateNotice(
    req.params.id, req.body,
    req.user._id.toString(), req.user.role
  );
  res.status(200).json(new ApiResponse(200, { notice }, 'Notice updated'));
});

const deleteNotice = asyncHandler(async (req, res) => {
  const result = await noticeService.deleteNotice(
    req.params.id,
    req.user._id.toString(), req.user.role
  );
  res.status(200).json(new ApiResponse(200, result, result.message));
});

const pinNotice = asyncHandler(async (req, res) => {
  const notice = await noticeService.pinNotice(req.params.id, req.body.isPinned);
  res.status(200).json(new ApiResponse(200, { notice }, 'Notice pin status updated'));
});

module.exports = { createNotice, listNotices, getNoticeById, updateNotice, deleteNotice, pinNotice };
