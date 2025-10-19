const Exam = require('../models/Exam');
const ExamSubmission = require('../models/ExamSubmission');
const asyncHandler = require('../utils/asyncHandler');

// Create a new exam (quiz or video)
exports.createExam = asyncHandler(async (req, res) => {
  const { examName, examCode, examType, duration, videoLink } = req.body;

  // Validate exam code uniqueness
  const existingExam = await Exam.findOne({ examCode: examCode.toUpperCase() });
  if (existingExam) {
    return res.status(400).json({
      success: false,
      message: 'Exam code already exists'
    });
  }

  const exam = await Exam.create({
    examName,
    examCode: examCode.toUpperCase(),
    examType,
    duration,
    videoLink: examType === 'video' ? videoLink : undefined,
    questions: [],
    createdBy: req.user._id
  });

  res.status(201).json({
    success: true,
    data: exam,
    message: `${examType === 'quiz' ? 'Quiz' : 'Video'} exam created successfully`
  });
});

// Add questions to a quiz (single or multiple)
exports.addQuestions = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  const { questions } = req.body; // Array of questions

  const exam = await Exam.findById(examId);

  if (!exam) {
    return res.status(404).json({
      success: false,
      message: 'Exam not found'
    });
  }

  if (exam.examType !== 'quiz') {
    return res.status(400).json({
      success: false,
      message: 'Questions can only be added to quiz type exams'
    });
  }

  // Add questions to the exam
  exam.questions.push(...questions);
  await exam.save();

  res.status(200).json({
    success: true,
    data: exam,
    message: `${questions.length} question(s) added successfully`
  });
});

// Update questions (replace all questions)
exports.updateQuestions = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  const { questions } = req.body;

  const exam = await Exam.findById(examId);

  if (!exam) {
    return res.status(404).json({
      success: false,
      message: 'Exam not found'
    });
  }

  if (exam.examType !== 'quiz') {
    return res.status(400).json({
      success: false,
      message: 'Questions can only be updated for quiz type exams'
    });
  }

  exam.questions = questions;
  await exam.save();

  res.status(200).json({
    success: true,
    data: exam,
    message: 'Questions updated successfully'
  });
});

// Get exam details by exam code (for students)
exports.getExamByCode = asyncHandler(async (req, res) => {
  const { examCode } = req.params;

  const exam = await Exam.findOne({ examCode: examCode.toUpperCase(), isActive: true });

  if (!exam) {
    return res.status(404).json({
      success: false,
      message: 'Exam not found or inactive'
    });
  }

  // For quiz, don't send correct answers to students
  if (exam.examType === 'quiz') {
    const examData = exam.toObject();
    examData.questions = examData.questions.map(q => ({
      question: q.question,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      _id: q._id
    }));
    
    return res.status(200).json({
      success: true,
      data: examData
    });
  }

  res.status(200).json({
    success: true,
    data: exam
  });
});

// Submit quiz answers
exports.submitQuiz = asyncHandler(async (req, res) => {
  const { examId, studentName, usn, answers, startedAt, submittedAt, autoSubmitted, autoSubmitReason } = req.body;

  const exam = await Exam.findById(examId);

  if (!exam) {
    return res.status(404).json({
      success: false,
      message: 'Exam not found'
    });
  }

  if (exam.examType !== 'quiz') {
    return res.status(400).json({
      success: false,
      message: 'This endpoint is only for quiz submissions'
    });
  }

  // Check if student already submitted
  const existingSubmission = await ExamSubmission.findOne({ exam: examId, usn: usn.toUpperCase() });
  if (existingSubmission) {
    return res.status(400).json({
      success: false,
      message: 'You have already submitted this exam'
    });
  }

  // Calculate score
  let score = 0;
  const processedAnswers = answers.map((answer, index) => {
    const correctAnswer = exam.questions[index].correctOption;
    // Only mark as correct if answer exists and matches - MUST be boolean
    const isCorrect = Boolean(answer.selectedOption && answer.selectedOption === correctAnswer);
    if (isCorrect) score++;
    
    return {
      questionIndex: index,
      selectedOption: answer.selectedOption || 'Not Answered',
      isCorrect: isCorrect  // Ensure it's always a boolean
    };
  });

  // Calculate time taken
  const timeTaken = Math.round((new Date(submittedAt) - new Date(startedAt)) / 60000); // in minutes

  const submission = await ExamSubmission.create({
    exam: examId,
    studentName,
    usn: usn.toUpperCase(),
    examType: 'quiz',
    answers: processedAnswers,
    score,
    totalQuestions: exam.questions.length,
    timeTaken,
    startedAt,
    submittedAt,
    autoSubmitted: autoSubmitted || false,
    autoSubmitReason: autoSubmitReason || 'manual'
  });

  res.status(201).json({
    success: true,
    data: {
      score,
      totalQuestions: exam.questions.length,
      percentage: ((score / exam.questions.length) * 100).toFixed(2),
      timeTaken
    },
    message: 'Quiz submitted successfully'
  });
});

// Submit video watch completion
exports.submitVideoWatch = asyncHandler(async (req, res) => {
  const { examId, studentName, usn, watchTime, totalVideoDuration, startedAt, submittedAt } = req.body;

  const exam = await Exam.findById(examId);

  if (!exam) {
    return res.status(404).json({
      success: false,
      message: 'Exam not found'
    });
  }

  if (exam.examType !== 'video') {
    return res.status(400).json({
      success: false,
      message: 'This endpoint is only for video watch submissions'
    });
  }

  // Check if student already submitted
  const existingSubmission = await ExamSubmission.findOne({ exam: examId, usn: usn.toUpperCase() });
  if (existingSubmission) {
    return res.status(400).json({
      success: false,
      message: 'You have already submitted this exam'
    });
  }

  const completionPercentage = ((watchTime / totalVideoDuration) * 100).toFixed(2);
  const timeTaken = Math.round((new Date(submittedAt) - new Date(startedAt)) / 60000); // in minutes

  const submission = await ExamSubmission.create({
    exam: examId,
    studentName,
    usn: usn.toUpperCase(),
    examType: 'video',
    watchTime,
    totalVideoDuration,
    completionPercentage,
    timeTaken,
    startedAt,
    submittedAt
  });

  res.status(201).json({
    success: true,
    data: {
      watchTime,
      totalVideoDuration,
      completionPercentage,
      timeTaken
    },
    message: 'Video watch data submitted successfully'
  });
});

// Get all exams (for admin)
exports.getAllExams = asyncHandler(async (req, res) => {
  const exams = await Exam.find().populate('createdBy', 'name email').sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: exams.length,
    data: exams
  });
});

// Get exam by ID (for admin with full details including correct answers)
exports.getExamById = asyncHandler(async (req, res) => {
  const { examId } = req.params;

  const exam = await Exam.findById(examId).populate('createdBy', 'name email');

  if (!exam) {
    return res.status(404).json({
      success: false,
      message: 'Exam not found'
    });
  }

  res.status(200).json({
    success: true,
    data: exam
  });
});

// Get live scoreboard for an exam
exports.getScoreboard = asyncHandler(async (req, res) => {
  const { examId } = req.params;

  const exam = await Exam.findById(examId);

  if (!exam) {
    return res.status(404).json({
      success: false,
      message: 'Exam not found'
    });
  }

  const submissions = await ExamSubmission.find({ exam: examId })
    .sort({ submittedAt: -1 })
    .lean();

  // Format scoreboard data
  const scoreboard = submissions.map(submission => {
    if (exam.examType === 'quiz') {
      return {
        studentName: submission.studentName,
        usn: submission.usn,
        score: submission.score,
        totalQuestions: submission.totalQuestions,
        percentage: ((submission.score / submission.totalQuestions) * 100).toFixed(2),
        timeTaken: submission.timeTaken,
        submittedAt: submission.submittedAt
      };
    } else {
      return {
        studentName: submission.studentName,
        usn: submission.usn,
        watchTime: submission.watchTime,
        totalVideoDuration: submission.totalVideoDuration,
        completionPercentage: submission.completionPercentage,
        timeTaken: submission.timeTaken,
        submittedAt: submission.submittedAt
      };
    }
  });

  res.status(200).json({
    success: true,
    examName: exam.examName,
    examCode: exam.examCode,
    examType: exam.examType,
    totalSubmissions: scoreboard.length,
    data: scoreboard
  });
});

// Delete an exam (with cascade delete of submissions)
exports.deleteExam = asyncHandler(async (req, res) => {
  const { examId } = req.params;

  const exam = await Exam.findById(examId);

  if (!exam) {
    return res.status(404).json({
      success: false,
      message: 'Exam not found'
    });
  }

  // Delete all submissions related to this exam
  const deletedSubmissions = await ExamSubmission.deleteMany({ exam: examId });
  
  // Delete the exam
  await exam.deleteOne();

  res.status(200).json({
    success: true,
    message: `Exam and ${deletedSubmissions.deletedCount} submission(s) deleted successfully`
  });
});

// Delete all exams and submissions
exports.deleteAllExams = asyncHandler(async (req, res) => {
  // Delete all submissions first
  const deletedSubmissions = await ExamSubmission.deleteMany({});
  
  // Delete all exams
  const deletedExams = await Exam.deleteMany({});

  res.status(200).json({
    success: true,
    message: `All exams cleared: ${deletedExams.deletedCount} exam(s) and ${deletedSubmissions.deletedCount} submission(s) deleted`,
    data: {
      examsDeleted: deletedExams.deletedCount,
      submissionsDeleted: deletedSubmissions.deletedCount
    }
  });
});

// Toggle exam active status
exports.toggleExamStatus = asyncHandler(async (req, res) => {
  const { examId } = req.params;

  const exam = await Exam.findById(examId);

  if (!exam) {
    return res.status(404).json({
      success: false,
      message: 'Exam not found'
    });
  }

  exam.isActive = !exam.isActive;
  await exam.save();

  res.status(200).json({
    success: true,
    data: exam,
    message: `Exam ${exam.isActive ? 'activated' : 'deactivated'} successfully`
  });
});
