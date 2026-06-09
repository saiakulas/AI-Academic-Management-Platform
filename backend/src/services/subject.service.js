const Subject  = require('../models/Subject');
const ApiError = require('../utils/ApiError');
const paginate = require('../utils/paginate');

class SubjectService {
  async createSubject(data) {
    const exists = await Subject.findOne({ code: data.code.toUpperCase() });
    if (exists) throw new ApiError(409, `Subject with code '${data.code.toUpperCase()}' already exists`);
    return Subject.create({ ...data, code: data.code.toUpperCase() });
  }

  async listSubjects({ page, limit, search, department, isActive }) {
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive !== 'false';
    if (department) filter.department = { $regex: department, $options: 'i' };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }
    return paginate(Subject, filter, { page, limit, sort: { name: 1 } });
  }

  async getSubjectById(id) {
    const subject = await Subject.findById(id);
    if (!subject) throw new ApiError(404, 'Subject not found');
    return subject;
  }

  async updateSubject(id, updates) {
    if (updates.code) updates.code = updates.code.toUpperCase();
    const subject = await Subject.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!subject) throw new ApiError(404, 'Subject not found');
    return subject;
  }

  async deleteSubject(id) {
    const subject = await Subject.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!subject) throw new ApiError(404, 'Subject not found');
    return { message: 'Subject deactivated successfully' };
  }
}

module.exports = new SubjectService();
