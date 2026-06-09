const Notice   = require('../models/Notice');
const ApiError = require('../utils/ApiError');
const paginate = require('../utils/paginate');

class NoticeService {
  async createNotice(data, authorId) {
    const notice = await Notice.create({ ...data, author: authorId });
    return Notice.findById(notice._id)
      .populate('author', 'firstName lastName role');
  }

  /**
   * List notices — filtered by viewer's role so parent/student only see
   * notices targeted at them
   */
  async listNotices({ page, limit, category, priority, viewerRole }) {
    const filter = { isPublished: true };
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    // Only return notices where viewerRole is in targetAudience
    if (viewerRole) filter.targetAudience = viewerRole;

    // Filter out expired notices
    filter.$or = [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }];

    return paginate(Notice, filter, {
      page, limit,
      sort: { isPinned: -1, createdAt: -1 },
      populate: [{ path: 'author', select: 'firstName lastName role' }],
    });
  }

  async getNoticeById(id, viewerRole) {
    const notice = await Notice.findById(id)
      .populate('author', 'firstName lastName role');
    if (!notice) throw new ApiError(404, 'Notice not found');

    if (viewerRole && !notice.targetAudience.includes(viewerRole)) {
      throw new ApiError(403, 'You do not have permission to view this notice');
    }
    return notice;
  }

  async updateNotice(id, updates, requestingUserId, requestingRole) {
    const notice = await Notice.findById(id);
    if (!notice) throw new ApiError(404, 'Notice not found');

    if (requestingRole !== 'admin' && notice.author.toString() !== requestingUserId) {
      throw new ApiError(403, 'You can only edit notices you created');
    }

    const allowed = ['title', 'content', 'targetAudience', 'priority',
                     'category', 'expiresAt', 'isPublished', 'isPinned'];
    allowed.forEach((k) => { if (updates[k] !== undefined) notice[k] = updates[k]; });
    await notice.save();
    return Notice.findById(id).populate('author', 'firstName lastName role');
  }

  async deleteNotice(id, requestingUserId, requestingRole) {
    const notice = await Notice.findById(id);
    if (!notice) throw new ApiError(404, 'Notice not found');

    if (requestingRole !== 'admin' && notice.author.toString() !== requestingUserId) {
      throw new ApiError(403, 'You can only delete notices you created');
    }
    await Notice.findByIdAndDelete(id);
    return { message: 'Notice deleted successfully' };
  }

  async pinNotice(id, pin) {
    const notice = await Notice.findByIdAndUpdate(id, { isPinned: pin }, { new: true })
      .populate('author', 'firstName lastName role');
    if (!notice) throw new ApiError(404, 'Notice not found');
    return notice;
  }
}

module.exports = new NoticeService();
