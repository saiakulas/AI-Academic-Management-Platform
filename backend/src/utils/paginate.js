/**
 * Reusable pagination helper for Mongoose queries.
 *
 * @param {Model}  model       - Mongoose model
 * @param {Object} filter      - Query filter
 * @param {Object} options     - { page, limit, sort, populate, select }
 * @returns {{ data, pagination }}
 */
const paginate = async (model, filter = {}, options = {}) => {
  const page  = Math.max(1, parseInt(options.page, 10)  || 1);
  const limit = Math.min(100, Math.max(1, parseInt(options.limit, 10) || 10));
  const skip  = (page - 1) * limit;
  const sort  = options.sort || { createdAt: -1 };

  let query = model.find(filter).sort(sort).skip(skip).limit(limit);

  if (options.select)   query = query.select(options.select);
  if (options.populate) {
    const pops = Array.isArray(options.populate) ? options.populate : [options.populate];
    pops.forEach((p) => { query = query.populate(p); });
  }

  const [data, total] = await Promise.all([
    query.exec(),
    model.countDocuments(filter),
  ]);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  };
};

module.exports = paginate;
