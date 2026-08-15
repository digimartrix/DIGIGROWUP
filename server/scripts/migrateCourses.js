import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/Course.js';
import Module from '../models/Module.js';
import Lesson from '../models/Lesson.js';
import Enrollment from '../models/Enrollment.js';

dotenv.config();

const SAMPLE_VIDEOS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
];

const SAMPLE_PDFS = [
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  'https://www.adobe.com/support/products/enterprise/knowledgecenter/media/c461_sample_exploring.pdf',
];

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('[MIGRATE] Connected to MongoDB');

  const courses = await Course.find({});
  console.log(`[MIGRATE] Found ${courses.length} courses to verify/upgrade.`);

  let cIdx = 0;
  for (const course of courses) {
    const isPdfCourse = course.title.toLowerCase().includes('python') || course.title.toLowerCase().includes('handbook') || course.title.toLowerCase().includes('guide');
    course.courseType = isPdfCourse ? 'pdf' : (course.courseType || 'video');
    course.status = course.status || 'published';
    course.estimatedDuration = course.estimatedDuration || `${course.estimatedHours || 10} hours`;
    course.learningObjectives = course.learningObjectives?.length ? course.learningObjectives : [
      'Master core concepts and foundational principles',
      'Build practical end-to-end applications and projects',
      'Understand architectural best practices and patterns',
      'Gain career-ready engineering problem solving skills',
    ];
    course.prerequisites = course.prerequisites?.length ? course.prerequisites : [
      'Basic computer literacy and text editor familiarity',
      'Curiosity and passion for building modern software',
    ];
    await course.save();

    // Verify modules & lessons
    const modules = await Module.find({ courseId: course._id }).sort('order');
    let lIdx = 0;
    for (const mod of modules) {
      const lessons = await Lesson.find({ moduleId: mod._id }).sort('order');
      for (const lesson of lessons) {
        lesson.courseId = course._id;
        lesson.type = course.courseType;
        lesson.uploadStatus = 'ready';
        if (!lesson.contentUrl) {
          lesson.contentUrl = course.courseType === 'pdf'
            ? SAMPLE_PDFS[lIdx % SAMPLE_PDFS.length]
            : SAMPLE_VIDEOS[lIdx % SAMPLE_VIDEOS.length];
        }
        if (!lesson.duration && course.courseType === 'video') {
          lesson.duration = 420 + (lIdx * 60); // 7-10 minutes
        }
        if (!lesson.fileName) {
          lesson.fileName = `${lesson.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.${course.courseType === 'pdf' ? 'pdf' : 'mp4'}`;
        }
        await lesson.save();
        lIdx++;
      }
    }
    cIdx++;
  }

  // Ensure Enrollments have calculated progress
  const enrollments = await Enrollment.find({});
  for (const e of enrollments) {
    const modules = await Module.find({ courseId: e.courseId }).select('_id');
    const totalLessons = await Lesson.countDocuments({ moduleId: { $in: modules.map(m => m._id) } });
    const completedCount = e.completedLessons?.length || 0;
    e.progress = totalLessons > 0 ? Math.min(100, Math.round((completedCount / totalLessons) * 100)) : 0;
    if (e.progress === 100) e.status = 'completed';
    await e.save();
  }

  console.log(`[MIGRATE] Completed migration for ${courses.length} courses and ${enrollments.length} enrollments.`);
  await mongoose.disconnect();
  process.exit(0);
}

migrate().catch((err) => {
  console.error('[MIGRATE] Error:', err);
  process.exit(1);
});
