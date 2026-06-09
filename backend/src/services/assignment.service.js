const Assignment = require('../models/Assignment');
const Student    = require('../models/Student');
const Class      = require('../models/Class');
const ApiError   = require('../utils/ApiError');
const paginate   = require('../utils/paginate');

class AssignmentService {
  async createAssignment(data) {
    const cls = await Class.findById(data.class);
    if (!cls) throw new ApiError(404, 'Class not found');

    const assignment = await Assignment.create(data);
    return this._populate(assignment._id);
  }

  async listAssignments({ page, limit, classId, subjectId, status, assignedBy }) {
    const filter = {};
    if (classId)    filter.class   = classId;
    if (subjectId)  filter.subject = subjectId;
    if (status)     filter.status  = status;
    if (assignedBy) filter.assignedBy = assignedBy;

    return paginate(Assignment, filter, {
      page, limit,
      sort: { dueDate: 1 },
      populate: [
        { path: 'class',      select: 'name section grade' },
        { path: 'subject',    select: 'name code' },
        { path: 'assignedBy', select: 'firstName lastName role' },
      ],
      select: '-submissions', // exclude submissions list from list view
    });
  }

  async getAssignmentById(id) {
    return this._populate(id);
  }

  async updateAssignment(id, updates, requestingUserId, requestingRole) {
    const assignment = await Assignment.findById(id);
    if (!assignment) throw new ApiError(404, 'Assignment not found');

    // Only the creator or admin can update
    if (requestingRole !== 'admin' && assignment.assignedBy.toString() !== requestingUserId) {
      throw new ApiError(403, 'You can only update assignments you created');
    }

    const allowed = ['title', 'description', 'dueDate', 'totalMarks', 'instructions', 'status'];
    allowed.forEach((k) => { if (updates[k] !== undefined) assignment[k] = updates[k]; });
    await assignment.save();
    return this._populate(id);
  }

  async deleteAssignment(id, requestingUserId, requestingRole) {
    const assignment = await Assignment.findById(id);
    if (!assignment) throw new ApiError(404, 'Assignment not found');

    if (requestingRole !== 'admin' && assignment.assignedBy.toString() !== requestingUserId) {
      throw new ApiError(403, 'You can only delete assignments you created');
    }
    await Assignment.findByIdAndDelete(id);
    return { message: 'Assignment deleted successfully' };
  }

  /**
   * Student submits assignment
   */
  async submitAssignment(assignmentId, studentUserId, { content, fileUrl }) {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) throw new ApiError(404, 'Assignment not found');
    if (assignment.status === 'closed') throw new ApiError(400, 'This assignment is closed for submissions');

    const student = await Student.findOne({ user: studentUserId });
    if (!student) throw new ApiError(404, 'Student profile not found');

    // Check student belongs to the class
    if (assignment.class.toString() !== student.currentClass?.toString()) {
      throw new ApiError(403, 'You are not enrolled in this class');
    }

    const alreadySubmitted = assignment.submissions.find(
      (s) => s.student.toString() === student._id.toString()
    );
    if (alreadySubmitted) throw new ApiError(409, 'You have already submitted this assignment');

    const isLate = new Date() > new Date(assignment.dueDate);
    assignment.submissions.push({
      student: student._id,
      content,
      fileUrl,
      status: isLate ? 'late' : 'submitted',
    });
    await assignment.save();
    return this._populate(assignmentId);
  }

  /**
   * Teacher grades a submission
   */
  async gradeSubmission(assignmentId, submissionId, { grade, feedback }, gradedByUserId) {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) throw new ApiError(404, 'Assignment not found');

    const submission = assignment.submissions.id(submissionId);
    if (!submission) throw new ApiError(404, 'Submission not found');

    if (grade > assignment.totalMarks) {
      throw new ApiError(400, `Grade cannot exceed total marks (${assignment.totalMarks})`);
    }

    submission.grade    = grade;
    submission.feedback = feedback;
    submission.gradedBy = gradedByUserId;
    submission.gradedAt = new Date();
    submission.status   = 'graded';
    await assignment.save();
    return this._populate(assignmentId);
  }

  async _populate(id) {
    const a = await Assignment.findById(id)
      .populate('class',      'name section grade')
      .populate('subject',    'name code')
      .populate('assignedBy', 'firstName lastName role')
      .populate({ path: 'submissions.student', populate: { path: 'user', select: 'firstName lastName' } })
      .populate('submissions.gradedBy', 'firstName lastName');
    if (!a) throw new ApiError(404, 'Assignment not found');
    return a;
  }
}

module.exports = new AssignmentService();
