const StudyMaterial = require('../models/StudyMaterial');
const ApiError  = require('../utils/ApiError');
const paginate  = require('../utils/paginate');

class StudyMaterialService {
  async create(data, uploadedBy) {
    const material = await StudyMaterial.create({ ...data, uploadedBy });
    return this._populate(material._id);
  }

  async list({ page, limit, subjectId, classId, materialType, search, isPublished }) {
    const filter = {};
    if (subjectId)    filter.subject      = subjectId;
    if (classId)      filter.class        = classId;
    if (materialType) filter.materialType = materialType;
    if (isPublished !== undefined) filter.isPublished = isPublished !== 'false';
    if (search) {
      filter.$or = [
        { title:       { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags:        { $in: [new RegExp(search, 'i')] } },
      ];
    }

    return paginate(StudyMaterial, filter, {
      page, limit,
      sort: { createdAt: -1 },
      populate: [
        { path: 'subject',    select: 'name code' },
        { path: 'class',      select: 'name section grade' },
        { path: 'uploadedBy', select: 'firstName lastName role' },
      ],
    });
  }

  async getById(id) {
    return this._populate(id);
  }

  async update(id, updates, requestingUserId, requestingRole) {
    const material = await StudyMaterial.findById(id);
    if (!material) throw new ApiError(404, 'Study material not found');

    if (requestingRole !== 'admin' && material.uploadedBy.toString() !== requestingUserId) {
      throw new ApiError(403, 'You can only edit materials you uploaded');
    }

    const allowed = ['title', 'description', 'materialType', 'tags', 'isPublished'];
    allowed.forEach((k) => { if (updates[k] !== undefined) material[k] = updates[k]; });
    await material.save();
    return this._populate(id);
  }

  async delete(id, requestingUserId, requestingRole) {
    const material = await StudyMaterial.findById(id);
    if (!material) throw new ApiError(404, 'Study material not found');

    if (requestingRole !== 'admin' && material.uploadedBy.toString() !== requestingUserId) {
      throw new ApiError(403, 'You can only delete materials you uploaded');
    }
    await StudyMaterial.findByIdAndDelete(id);
    return { message: 'Material deleted successfully' };
  }

  async incrementDownloads(id) {
    await StudyMaterial.findByIdAndUpdate(id, { $inc: { downloads: 1 } });
  }

  async _populate(id) {
    const m = await StudyMaterial.findById(id)
      .populate('subject',    'name code')
      .populate('class',      'name section grade')
      .populate('uploadedBy', 'firstName lastName role');
    if (!m) throw new ApiError(404, 'Study material not found');
    return m;
  }
}

module.exports = new StudyMaterialService();
