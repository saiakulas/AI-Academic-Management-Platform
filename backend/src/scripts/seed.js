/**
 * EduFlow — Full seed script (Phase 1 + Phase 2)
 * Creates demo users, subjects, classes, students, teachers and notices.
 *
 * Run: node src/scripts/seed.js
 * Run with --fresh flag to wipe all collections first:
 *   node src/scripts/seed.js --fresh
 */
require('dotenv').config();
const mongoose = require('mongoose');

const User       = require('../models/User');
const Student    = require('../models/Student');
const Teacher    = require('../models/Teacher');
const Class      = require('../models/Class');
const Subject    = require('../models/Subject');
const Notice     = require('../models/Notice');
const Assignment = require('../models/Assignment');
const Attendance = require('../models/Attendance');

const FRESH = process.argv.includes('--fresh');

// ─── Seed data ─────────────────────────────────────────────────────────────
const SUBJECTS_DATA = [
  { name: 'Mathematics',       code: 'MATH',  department: 'Science',     grades: [9,10,11,12] },
  { name: 'Physics',           code: 'PHY',   department: 'Science',     grades: [9,10,11,12] },
  { name: 'Chemistry',         code: 'CHEM',  department: 'Science',     grades: [9,10,11,12] },
  { name: 'Biology',           code: 'BIO',   department: 'Science',     grades: [9,10,11,12], isElective: true },
  { name: 'English',           code: 'ENG',   department: 'Languages',   grades: [9,10,11,12] },
  { name: 'History',           code: 'HIST',  department: 'Humanities',  grades: [9,10]       },
  { name: 'Computer Science',  code: 'CS',    department: 'Technology',  grades: [10,11,12],  isElective: true },
  { name: 'Physical Education',code: 'PE',    department: 'Sports',      grades: [9,10,11,12] },
];

const TEACHER_USERS = [
  { firstName: 'Sarah',   lastName: 'Green',   email: 'teacher@eduflow.com',   employeeId: 'EMP001', department: 'Science',    designation: 'Senior Teacher',     specialization: ['Mathematics','Physics'] },
  { firstName: 'David',   lastName: 'Chen',    email: 'dchen@eduflow.com',     employeeId: 'EMP002', department: 'Science',    designation: 'Teacher',            specialization: ['Physics','Chemistry'] },
  { firstName: 'Priya',   lastName: 'Sharma',  email: 'psharma@eduflow.com',   employeeId: 'EMP003', department: 'Languages',  designation: 'Teacher',            specialization: ['English'] },
  { firstName: 'Michael', lastName: 'Torres',  email: 'mtorres@eduflow.com',   employeeId: 'EMP004', department: 'Technology', designation: 'Teacher',            specialization: ['Computer Science'] },
];

const STUDENT_USERS = [
  { firstName: 'James',   lastName: 'Wilson',   email: 'student@eduflow.com', rollNumber: 'S001', gender: 'male',   bloodGroup: 'O+' },
  { firstName: 'Emma',    lastName: 'Johnson',  email: 'ejohnson@student.eduflow.com', rollNumber: 'S002', gender: 'female', bloodGroup: 'A+' },
  { firstName: 'Liam',    lastName: 'Brown',    email: 'lbrown@student.eduflow.com',   rollNumber: 'S003', gender: 'male',   bloodGroup: 'B+' },
  { firstName: 'Sophia',  lastName: 'Davis',    email: 'sdavis@student.eduflow.com',   rollNumber: 'S004', gender: 'female', bloodGroup: 'AB+' },
  { firstName: 'Noah',    lastName: 'Miller',   email: 'nmiller@student.eduflow.com',  rollNumber: 'S005', gender: 'male',   bloodGroup: 'O-' },
];

const PARENT_USERS = [
  { firstName: 'Mary',    lastName: 'Wilson',  email: 'parent@eduflow.com' },
  { firstName: 'Robert',  lastName: 'Johnson', email: 'rjohnson@eduflow.com' },
];

// ─── Helpers ────────────────────────────────────────────────────────────────
const log  = (msg) => console.log(`  ✅ ${msg}`);
const skip = (msg) => console.log(`  ⏭  ${msg}`);
const err  = (msg) => console.error(`  ❌ ${msg}`);

async function upsertUser(data) {
  const exists = await User.findOne({ email: data.email });
  if (exists) { skip(`User exists: ${data.email}`); return exists; }
  const user = await User.create({ ...data, isEmailVerified: true });
  log(`Created user [${user.role}]: ${user.email}`);
  return user;
}

// ─── Main seed ──────────────────────────────────────────────────────────────
async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    log('MongoDB connected');

    if (FRESH) {
      console.log('\n⚠️  --fresh flag detected. Dropping all collections...');
      await Promise.all([
        User.deleteMany({}), Student.deleteMany({}), Teacher.deleteMany({}),
        Class.deleteMany({}), Subject.deleteMany({}), Notice.deleteMany({}),
        Assignment.deleteMany({}), Attendance.deleteMany({}),
      ]);
      log('Collections cleared');
    }

    // ── 1. Admin ────────────────────────────────────────────────
    console.log('\n📌 Admin');
    await upsertUser({ firstName: 'Admin', lastName: 'Principal', email: 'admin@eduflow.com', password: 'Demo@1234', role: 'admin' });

    // ── 2. Parents ───────────────────────────────────────────────
    console.log('\n📌 Parents');
    const parentDocs = [];
    for (const p of PARENT_USERS) {
      const u = await upsertUser({ ...p, password: 'Demo@1234', role: 'parent' });
      parentDocs.push(u);
    }

    // ── 3. Subjects ──────────────────────────────────────────────
    console.log('\n📌 Subjects');
    const subjectMap = {};
    for (const s of SUBJECTS_DATA) {
      let subject = await Subject.findOne({ code: s.code });
      if (!subject) {
        subject = await Subject.create({ ...s, isActive: true });
        log(`Created subject: ${subject.name} (${subject.code})`);
      } else {
        skip(`Subject exists: ${s.code}`);
      }
      subjectMap[s.code] = subject;
    }

    // ── 4. Teachers + Teacher profiles ───────────────────────────
    console.log('\n📌 Teachers');
    const teacherDocs = [];
    for (const t of TEACHER_USERS) {
      const { employeeId, department, designation, specialization, ...userFields } = t;
      const user = await upsertUser({ ...userFields, password: 'Demo@1234', role: 'teacher' });

      let teacher = await Teacher.findOne({ user: user._id });
      if (!teacher) {
        const subjectIds = subjectMap
          ? specialization.map((sp) => {
              const found = Object.values(subjectMap).find((s) => s.name === sp);
              return found?._id;
            }).filter(Boolean)
          : [];

        teacher = await Teacher.create({
          user, employeeId, department, designation,
          specialization,
          subjects: subjectIds,
          isActive: true,
        });
        log(`Created teacher profile: ${user.firstName} (${employeeId})`);
      } else {
        skip(`Teacher profile exists: ${employeeId}`);
      }
      teacherDocs.push(teacher);
    }

    // ── 5. Classes ───────────────────────────────────────────────
    console.log('\n📌 Classes');
    const classMap = {};
    const classConfigs = [
      { name: 'Grade 10 - A', section: 'A', grade: 10, academicYear: '2024-25', room: 'Room 101', classTeacher: teacherDocs[0]?._id },
      { name: 'Grade 10 - B', section: 'B', grade: 10, academicYear: '2024-25', room: 'Room 102', classTeacher: teacherDocs[1]?._id },
      { name: 'Grade 11 - A', section: 'A', grade: 11, academicYear: '2024-25', room: 'Room 201', classTeacher: teacherDocs[2]?._id },
    ];
    for (const c of classConfigs) {
      let cls = await Class.findOne({ grade: c.grade, section: c.section, academicYear: c.academicYear });
      if (!cls) {
        cls = await Class.create({
          ...c,
          subjects: [
            { subject: subjectMap['MATH']?._id, teacher: teacherDocs[0]?._id },
            { subject: subjectMap['PHY']?._id,  teacher: teacherDocs[1]?._id },
            { subject: subjectMap['ENG']?._id,  teacher: teacherDocs[2]?._id },
            { subject: subjectMap['CS']?._id,   teacher: teacherDocs[3]?._id },
          ],
          isActive: true,
        });
        log(`Created class: ${cls.name}`);
      } else {
        skip(`Class exists: Grade ${c.grade}-${c.section}`);
      }
      classMap[`${c.grade}${c.section}`] = cls;
    }

    // Update teacher class references
    if (teacherDocs[0]) {
      await Teacher.findByIdAndUpdate(teacherDocs[0]._id, {
        classes: [classMap['10A']?._id, classMap['10B']?._id].filter(Boolean),
      });
    }

    // ── 6. Students + Student profiles ───────────────────────────
    console.log('\n📌 Students');
    const studentDocs = [];
    for (let i = 0; i < STUDENT_USERS.length; i++) {
      const { rollNumber, gender, bloodGroup, ...userFields } = STUDENT_USERS[i];
      const user = await upsertUser({ ...userFields, password: 'Demo@1234', role: 'student' });

      let student = await Student.findOne({ user: user._id });
      if (!student) {
        student = await Student.create({
          user:            user._id,
          rollNumber,
          admissionNumber: `ADM2024${rollNumber}`,
          gender,
          bloodGroup,
          currentClass:    classMap['10A']?._id,
          admissionDate:   new Date('2024-06-01'),
          parents:         i < 2 ? [parentDocs[i]?._id].filter(Boolean) : [],
          isActive:        true,
        });
        log(`Created student profile: ${user.firstName} (${rollNumber})`);
      } else {
        skip(`Student profile exists: ${rollNumber}`);
      }
      studentDocs.push(student);
    }

    // ── 7. Notices ───────────────────────────────────────────────
    console.log('\n📌 Notices');
    const adminUser = await User.findOne({ role: 'admin' });
    const noticesData = [
      {
        title:          'Welcome to EduFlow — Academic Year 2024-25',
        content:        'We are pleased to announce the commencement of the new academic year. All students are expected to follow the school guidelines and maintain punctuality.',
        targetAudience: ['admin', 'teacher', 'student', 'parent'],
        priority:       'high',
        category:       'general',
        isPinned:       true,
      },
      {
        title:          'Mid-Term Examination Schedule',
        content:        'Mid-term examinations will be held from November 20–25, 2024. Students are advised to prepare accordingly. Timetables will be shared by class teachers.',
        targetAudience: ['teacher', 'student', 'parent'],
        priority:       'urgent',
        category:       'exam',
      },
      {
        title:          'Annual Sports Day — November 30',
        content:        'The Annual Sports Day will be held on November 30, 2024 at the school grounds. All students are encouraged to participate. Parents are cordially invited.',
        targetAudience: ['teacher', 'student', 'parent'],
        priority:       'normal',
        category:       'event',
      },
      {
        title:          'Staff Meeting — Professional Development',
        content:        'A mandatory staff meeting is scheduled for November 15, 2024 at 3:30 PM in the conference room. Attendance is compulsory for all teaching staff.',
        targetAudience: ['admin', 'teacher'],
        priority:       'high',
        category:       'general',
      },
    ];

    for (const n of noticesData) {
      const exists = await Notice.findOne({ title: n.title });
      if (!exists) {
        await Notice.create({ ...n, author: adminUser._id, isPublished: true });
        log(`Created notice: ${n.title.substring(0, 40)}...`);
      } else {
        skip(`Notice exists: ${n.title.substring(0, 40)}`);
      }
    }

    // ── 8. Sample Assignment ─────────────────────────────────────
    console.log('\n📌 Assignments');
    const assignmentExists = await Assignment.findOne({});
    if (!assignmentExists && teacherDocs[0] && classMap['10A'] && subjectMap['MATH']) {
      const teacherUser = await User.findOne({ _id: teacherDocs[0].user });
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      await Assignment.create({
        title:        'Chapter 5 — Quadratic Equations',
        description:  'Solve all exercises from Chapter 5. Show complete working for each problem.',
        class:        classMap['10A']._id,
        subject:      subjectMap['MATH']._id,
        assignedBy:   teacherUser._id,
        dueDate,
        totalMarks:   50,
        instructions: 'Submit before the due date. Late submissions will be penalized.',
        status:       'published',
      });
      log('Created sample assignment');
    } else {
      skip('Assignment data exists or dependencies missing');
    }

    // ─── Summary ───────────────────────────────────────────────────────────
    console.log('\n' + '─'.repeat(55));
    console.log('🎉  Seed complete!\n');
    console.log('  Demo credentials (password: Demo@1234)');
    console.log('  ─────────────────────────────────────────────');
    console.log('  admin@eduflow.com         → Admin (Principal)');
    console.log('  teacher@eduflow.com       → Teacher (Sarah Green)');
    console.log('  dchen@eduflow.com         → Teacher (David Chen)');
    console.log('  student@eduflow.com       → Student (James Wilson)');
    console.log('  parent@eduflow.com        → Parent  (Mary Wilson)');
    console.log('─'.repeat(55));

  } catch (e) {
    err(`Seed failed: ${e.message}`);
    console.error(e.stack);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
