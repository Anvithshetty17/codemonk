# Exam Management System - Documentation

## Overview
A comprehensive exam management system that supports two types of exams:
1. **Quiz Exams** - Multiple choice questions with automatic scoring
2. **Video Exams** - YouTube video watching with time tracking

## Features

### For Admin
- Create quiz or video exams with exam name, code, and duration
- Add questions manually or upload via CSV
- Manage questions (add, edit, delete)
- View live scoreboard with real-time updates
- Export scoreboard data to CSV
- Activate/Deactivate exams
- Delete exams

### For Students
- Enter USN, name, and exam code to start
- Take quiz with timer and question navigation
- Watch videos with tracking
- Auto-submit when time runs out (quiz)
- View results immediately after submission

## Database Models

### Exam Model
```javascript
{
  examName: String,          // Name of the exam
  examCode: String,          // Unique code (uppercase)
  examType: String,          // 'quiz' or 'video'
  duration: Number,          // Duration in minutes
  questions: [Question],     // Array of questions (for quiz)
  videoLink: String,         // YouTube URL (for video)
  createdBy: ObjectId,       // Admin who created
  isActive: Boolean,         // Active status
  createdAt: Date,
  updatedAt: Date
}
```

### Question Schema (embedded in Exam)
```javascript
{
  question: String,
  optionA: String,
  optionB: String,
  optionC: String,
  optionD: String,
  correctOption: String      // 'A', 'B', 'C', or 'D'
}
```

### ExamSubmission Model
```javascript
{
  exam: ObjectId,            // Reference to Exam
  studentName: String,
  usn: String,               // Unique per exam
  examType: String,          // 'quiz' or 'video'
  
  // For quiz
  answers: [Answer],
  score: Number,
  totalQuestions: Number,
  
  // For video
  watchTime: Number,         // Seconds watched
  totalVideoDuration: Number,
  completionPercentage: Number,
  
  timeTaken: Number,         // Minutes taken
  startedAt: Date,
  submittedAt: Date,
  isCompleted: Boolean
}
```

## API Endpoints

### Public Endpoints (Students)

#### Get Exam by Code
```
GET /api/exams/code/:examCode
```
Returns exam details without correct answers (for quiz).

#### Submit Quiz
```
POST /api/exams/submit-quiz
Body: {
  examId: String,
  studentName: String,
  usn: String,
  answers: [{ selectedOption: String }],
  startedAt: ISO Date,
  submittedAt: ISO Date
}
```

#### Submit Video Watch
```
POST /api/exams/submit-video
Body: {
  examId: String,
  studentName: String,
  usn: String,
  watchTime: Number,
  totalVideoDuration: Number,
  startedAt: ISO Date,
  submittedAt: ISO Date
}
```

### Admin Endpoints (Require Authentication)

#### Create Exam
```
POST /api/exams
Headers: { Authorization: Bearer <token> }
Body: {
  examName: String,
  examCode: String,
  examType: 'quiz' | 'video',
  duration: Number,
  videoLink: String (if video type)
}
```

#### Get All Exams
```
GET /api/exams
Headers: { Authorization: Bearer <token> }
```

#### Get Exam by ID
```
GET /api/exams/:examId
Headers: { Authorization: Bearer <token> }
```
Returns full exam details including correct answers.

#### Add Questions
```
POST /api/exams/:examId/questions
Headers: { Authorization: Bearer <token> }
Body: {
  questions: [{
    question: String,
    optionA: String,
    optionB: String,
    optionC: String,
    optionD: String,
    correctOption: String
  }]
}
```

#### Update Questions
```
PUT /api/exams/:examId/questions
Headers: { Authorization: Bearer <token> }
Body: {
  questions: [...]  // Replaces all questions
}
```

#### Get Scoreboard
```
GET /api/exams/:examId/scoreboard
Headers: { Authorization: Bearer <token> }
```

#### Toggle Exam Status
```
PATCH /api/exams/:examId/toggle-status
Headers: { Authorization: Bearer <token> }
```

#### Delete Exam
```
DELETE /api/exams/:examId
Headers: { Authorization: Bearer <token> }
```

## Admin Workflow

### Creating a Quiz Exam

1. Navigate to Admin Panel → Exam Management
2. Click "Create Exam"
3. Select "Quiz" as exam type
4. Enter:
   - Quiz Name: "JavaScript Basics Test"
   - Quiz Code: "JS101"
   - Duration: 30 (minutes)
5. Click "Create"
6. **Question Management Page Opens**
7. Add questions manually OR upload CSV
8. Click "Save Quiz"

### Adding Questions Manually

For each question:
1. Enter question text
2. Enter options A, B, C, D
3. Select correct answer
4. Click "Add Question"
5. Repeat for all questions
6. Click "Save Quiz"

### CSV Upload Format

Create a CSV file with this format:
```csv
question,optionA,optionB,optionC,optionD,correctOption
"What is 2+2?","3","4","5","6","B"
"What is the capital of France?","London","Berlin","Paris","Rome","C"
```

**Important:**
- First row is header (will be skipped)
- Enclose text in quotes if it contains commas
- correctOption must be A, B, C, or D

### Creating a Video Exam

1. Navigate to Admin Panel → Exam Management
2. Click "Create Exam"
3. Select "Video Watching" as exam type
4. Enter:
   - Video Name: "React Tutorial"
   - Video Code: "REACT101"
   - Duration: 60 (minutes)
   - Video Link: "https://www.youtube.com/watch?v=..."
5. Click "Create"
6. Video exam is created (no questions needed)

### Viewing Live Scoreboard

1. In Exam Management, find your exam
2. Click "Scoreboard" button
3. View real-time submissions
4. Toggle auto-refresh (updates every 5 seconds)
5. Export to CSV if needed

## Student Workflow

### Taking an Exam

1. Navigate to `/take-exam`
2. Enter:
   - USN/Roll Number
   - Full Name
   - Exam Code
3. Click "Start Exam"

### Quiz Exam Flow

1. **Timer starts** - Shows remaining time
2. **Question Navigation**:
   - Answer current question (A/B/C/D)
   - Use Previous/Next buttons
   - Click question numbers to jump
3. **Question Status**:
   - Blue: Current question
   - Green: Answered
   - Gray: Not answered
4. **Submit**:
   - Click "Submit Quiz" on last question
   - OR wait for auto-submit when time runs out
5. **View Results**:
   - Score (e.g., 8/10)
   - Percentage (80%)
   - Time taken

### Video Exam Flow

1. **YouTube Player** - Watch the video
2. **Tracking**:
   - Watch time is tracked automatically
   - Only counts when video is playing
   - Pausing stops tracking
3. **Progress Bar**:
   - Shows completion percentage
   - Must reach 80% to submit
4. **Submit**:
   - Button enables at 80% completion
   - Click "Submit Exam"
5. **View Results**:
   - Watch time
   - Completion percentage
   - Time spent

## Frontend Components

### Admin Components

#### `ExamManager.jsx`
Main admin interface for exam management.
- Create exam modal
- Question management modal
- Exam list with actions
- CSV upload support

#### `ExamScoreboard.jsx`
Live scoreboard page.
- Real-time updates
- Sorting and ranking
- Export to CSV
- Statistics dashboard

### Student Components

#### `TakeExam.jsx`
Entry page for students.
- Student info form
- Exam code validation
- Routes to quiz or video component

#### `QuizExam.jsx`
Quiz taking interface.
- Timer with auto-submit
- Question navigation
- Answer selection
- Progress tracking

#### `VideoExam.jsx`
Video watching interface.
- YouTube player integration
- Watch time tracking
- Completion percentage
- Submit control

## Routes

### Frontend Routes
```
/take-exam                    - Student exam entry
/admin/scoreboard/:examId     - Admin scoreboard view
```

### Backend Routes
```
/api/exams/*                  - All exam endpoints
```

## Environment Variables

No new environment variables required. Uses existing:
- `JWT_SECRET` - For authentication
- `MONGODB_URI` - Database connection

## Security Features

1. **Admin Authentication** - All admin endpoints require JWT token
2. **Exam Code Validation** - Unique exam codes
3. **Single Submission** - Students can only submit once per exam (USN + Exam combination)
4. **Answer Protection** - Correct answers not sent to students during quiz
5. **Time Tracking** - Server validates submission times

## Best Practices

### For Admins

1. **Exam Codes** - Use memorable but unique codes (e.g., JS101, REACT01)
2. **Duration** - Set realistic time limits (1 min per question for quiz)
3. **Video Length** - Ensure duration matches video length
4. **Testing** - Create test exams before real ones
5. **Deactivate** - Deactivate exams after completion instead of deleting

### For Students

1. **Stable Connection** - Ensure good internet before starting
2. **No Refresh** - Don't refresh the page during exam
3. **Save Often** - For quiz, answer as you go
4. **Watch Time** - For video, watch at least 80% before submitting

## Troubleshooting

### Common Issues

**Issue: "Exam code already exists"**
- Solution: Use a different, unique exam code

**Issue: "You have already submitted this exam"**
- Solution: Each student can only submit once per exam. Check with admin if needed.

**Issue: YouTube video not loading**
- Solution: Check video link format. Should be full YouTube URL.

**Issue: Timer not working**
- Solution: Ensure JavaScript is enabled. Check browser console for errors.

**Issue: Scoreboard not updating**
- Solution: Check if auto-refresh is enabled. Click manual refresh button.

## CSV Export Format

### Quiz Exam CSV
```
USN,Name,Score,Total Questions,Percentage,Time Taken (mins),Submitted At
1MS21CS001,"John Doe",8,10,80.00,25,"2025-10-19 10:30:00"
```

### Video Exam CSV
```
USN,Name,Watch Time,Total Duration,Completion %,Time Spent (mins),Submitted At
1MS21CS001,"John Doe",15:30,18:45,82.67,20,"2025-10-19 10:30:00"
```

## Future Enhancements

Potential improvements:
- [ ] Multiple correct answers support
- [ ] Question randomization
- [ ] Time limit per question
- [ ] Video pause limit
- [ ] Detailed analytics
- [ ] Student feedback collection
- [ ] Question bank management
- [ ] Automated grading reports
- [ ] Email notifications
- [ ] Practice mode

## Support

For issues or questions:
1. Check this documentation
2. Review error messages in browser console
3. Check server logs for API errors
4. Contact system administrator

---

**Version:** 1.0.0  
**Last Updated:** October 19, 2025  
**Developed by:** Code Monk Team
