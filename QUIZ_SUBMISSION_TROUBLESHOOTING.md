# Quiz Submission Error (400 Bad Request) - Troubleshooting Guide

## Error Message
```
POST http://localhost:5000/api/exams/submit-quiz 400 (Bad Request)
AxiosError {message: 'Request failed with status code 400', ...}
```

## Most Common Causes

### 1. **Duplicate Submission (Most Likely)**
**Issue:** Backend prevents the same student (USN) from submitting the same exam twice.

**Backend Code:**
```javascript
const existingSubmission = await ExamSubmission.findOne({ 
  exam: examId, 
  usn: usn.toUpperCase() 
});
if (existingSubmission) {
  return res.status(400).json({
    success: false,
    message: 'You have already submitted this exam'
  });
}
```

**Solution:**
1. Use a different USN for each test
2. Clear the database submissions for testing:
   ```javascript
   // In MongoDB or using backend route
   db.examsubmissions.deleteMany({ usn: "TEST123" })
   ```
3. OR create a new exam with a different exam code

### 2. **Exam Not Found**
**Issue:** `exam._id` might be undefined or incorrect.

**Check:**
- Console log the exam object when quiz starts
- Verify exam has `_id` field
- Check if exam was loaded correctly from `/exams/code/:examCode`

### 3. **Invalid Exam Type**
**Issue:** Exam is not a 'quiz' type.

**Backend Check:**
```javascript
if (exam.examType !== 'quiz') {
  return res.status(400).json({
    success: false,
    message: 'This endpoint is only for quiz submissions'
  });
}
```

**Solution:** Verify exam was created as type 'quiz'

### 4. **Missing Required Fields**
**Issue:** Some required fields are missing from the request.

**Required Fields:**
- `examId` (string)
- `studentName` (string)
- `usn` (string)
- `answers` (array of objects with `selectedOption`)
- `startedAt` (ISO string)
- `submittedAt` (ISO string)

## Debug Steps

### Step 1: Check Console Logs
With the updated code, you'll now see:
```javascript
console.log('Submitting quiz with data:', submissionData);
console.error('Error response:', error.response?.data);
```

**Look for:**
- Is `examId` valid?
- Is `answers` array properly formatted?
- What does the error response say?

### Step 2: Check Submission Data Format
Should look like:
```javascript
{
  examId: "507f1f77bcf86cd799439011",
  studentName: "John Doe",
  usn: "1MS21CS001",
  answers: [
    { selectedOption: "A" },
    { selectedOption: null },  // Unanswered
    { selectedOption: "C" }
  ],
  startedAt: "2025-10-19T10:30:00.000Z",
  submittedAt: "2025-10-19T10:35:00.000Z",
  autoSubmitted: true,
  autoSubmitReason: "tab_change"
}
```

### Step 3: Test Manually
1. Open browser console
2. Try submission with different USN:
   ```javascript
   // In browser console
   fetch('http://localhost:5000/api/exams/submit-quiz', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       examId: "YOUR_EXAM_ID",
       studentName: "Test Student",
       usn: "UNIQUE_USN_123",
       answers: [{ selectedOption: "A" }],
       startedAt: new Date().toISOString(),
       submittedAt: new Date().toISOString(),
       autoSubmitted: false,
       autoSubmitReason: "manual"
     })
   }).then(r => r.json()).then(console.log)
   ```

### Step 4: Check Database
Query MongoDB to see existing submissions:
```javascript
db.examsubmissions.find({ usn: "YOUR_USN" })
```

If submissions exist, delete them for testing:
```javascript
db.examsubmissions.deleteOne({ usn: "YOUR_USN", exam: ObjectId("EXAM_ID") })
```

## Quick Fixes

### Fix 1: Use Different USN Each Time (Testing)
```javascript
// In TakeExam.jsx, modify the form:
const [studentInfo, setStudentInfo] = useState({
  usn: `TEST${Date.now()}`, // Auto-generate unique USN
  studentName: 'Test Student',
  examCode: 'Q1'
});
```

### Fix 2: Add Backend Route to Clear Submissions (Development Only)
```javascript
// In server/routes/exams.js
router.delete('/submissions/:usn', async (req, res) => {
  await ExamSubmission.deleteMany({ usn: req.params.usn.toUpperCase() });
  res.json({ message: 'Submissions cleared' });
});
```

### Fix 3: Backend - Allow Resubmissions (Development Only)
Comment out the duplicate check temporarily:
```javascript
// const existingSubmission = await ExamSubmission.findOne({ exam: examId, usn: usn.toUpperCase() });
// if (existingSubmission) {
//   return res.status(400).json({
//     success: false,
//     message: 'You have already submitted this exam'
//   });
// }
```

## Updated Code Changes

### Added Logging
```javascript
// Now logs submission data
console.log('Submitting quiz with data:', submissionData);

// Now logs error response
console.error('Error response:', error.response?.data);
```

### Added Auto-Submit Error Handling
```javascript
// Even if submission fails during auto-submit, redirect after 3 seconds
if (autoSubmit) {
  setTimeout(() => {
    navigate('/take-exam');
  }, 3000);
}
```

## Testing Procedure

1. **Start Fresh:**
   - Use a new USN you haven't used before
   - OR clear database submissions
   - OR create a new exam

2. **Test Manual Submit:**
   - Take quiz normally
   - Click Submit button
   - Check console for data and errors

3. **Test Tab Change Auto-Submit:**
   - Start quiz with NEW USN
   - Switch tabs immediately
   - Check if submission happens
   - Should redirect after 2-3 seconds

4. **Test Timer Auto-Submit:**
   - Create a quiz with 1-minute duration
   - Start quiz with NEW USN
   - Wait for timer to expire
   - Should auto-submit and redirect

## Expected Console Output

### Successful Submission:
```
Submitting quiz with data: {examId: "...", studentName: "...", ...}
Quiz submitted successfully
```

### Failed Submission:
```
Submitting quiz with data: {examId: "...", studentName: "...", ...}
Submission error: AxiosError {...}
Error response: {success: false, message: "You have already submitted this exam"}
```

## Next Steps

1. **Check console logs** - What error message appears?
2. **Try different USN** - Does it work with new USN?
3. **Check database** - Are there existing submissions?
4. **Verify exam data** - Is examId valid?

If the error message is "You have already submitted this exam", that's the issue - just use a different USN or clear the database.

## Date
October 19, 2025
