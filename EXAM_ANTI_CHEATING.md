# Exam Anti-Cheating System Documentation

## Overview
This document describes the anti-cheating measures implemented in the exam system to ensure fair assessment.

---

## 🛡️ Anti-Cheating Features

### 1. Tab Change Detection

#### **Quiz Exams - Auto-Submit**
When a student switches tabs or minimizes the browser during a quiz:

- **Instant Detection**: `visibilitychange` and `blur` events
- **Warning Toast**: "Tab change detected! Auto-submitting quiz..."
- **Auto-Submit**: Quiz is automatically submitted after 1 second
- **Single Trigger**: Once detected, prevents multiple submissions
- **Scoring**: Unanswered questions marked as incorrect

#### **Video Exams - Auto-Pause**
When a student switches tabs or minimizes the browser during a video exam:

- **Instant Detection**: `visibilitychange` and `blur` events
- **Auto-Pause**: Video automatically pauses
- **Watch Time Stops**: Tracking is paused when video pauses
- **Warning Toast**: "Video paused - Tab change detected!"
- **Resume Notice**: When returning, reminds student to resume manually

---

## 🔍 Technical Implementation

### Frontend Detection

**Events Monitored:**
```javascript
document.addEventListener('visibilitychange', handleVisibilityChange);
window.addEventListener('blur', handleBlur);
```

**Quiz Auto-Submit Logic:**
```javascript
if (document.hidden && !tabChangeDetected && !loading) {
  setTabChangeDetected(true);
  setTimeout(() => handleSubmit(true), 1000);
}
```

**Video Auto-Pause Logic:**
```javascript
if (document.hidden) {
  if (playerRef.current.getPlayerState() === PLAYING) {
    playerRef.current.pauseVideo();
  }
}
```

### Backend Scoring Fix

**Issue Fixed:** Unanswered questions were defaulting to 'A' and getting marked correct

**Solution:**
- Frontend: Changed default from `'A'` to `null`
- Backend: Added null check in scoring logic
- Display: Shows "Not Answered" for null responses

**Code:**
```javascript
// Frontend (QuizExam.jsx)
selectedOption: answers[index] || null

// Backend (examController.js)
const isCorrect = answer.selectedOption && answer.selectedOption === correctAnswer;
selectedOption: answer.selectedOption || 'Not Answered'
```

---

## 📊 Scoring Rules

### Quiz Exams

1. **Answered Correctly**: +1 point
2. **Answered Incorrectly**: 0 points
3. **Not Answered**: 0 points
4. **Tab Change**: Auto-submit, unanswered questions = 0 points

### Video Exams

1. **Completion Required**: Must watch 80% to submit
2. **Tab Change**: Video pauses, watch time stops
3. **No Cheating Advantage**: Only actual watch time counts

---

## 🎨 Admin Scoreboard Visual Indicators

### Red Highlighted Rows
Auto-submitted exams are **visually highlighted in red** on the scoreboard:

- **Background**: Light red (bg-red-50)
- **Hover Effect**: Darker red (bg-red-100)
- **Left Border**: Bold red stripe (border-red-500)
- **Badge**: "AUTO-SUBMITTED" in red

### Status Column
Each submission shows its status:

**AUTO-SUBMITTED (Red Badge):**
- ⏱️ **Timeout**: Time limit exceeded
- ⚠️ **Tab Change**: Student switched tabs

**MANUAL (Green Badge):**
- Student submitted normally

### Statistics Dashboard
- **Total Submissions**: Total count
- **Auto-Submitted**: Count and percentage of auto-submissions
- **Average Score/Completion**: Performance metrics
- **Pass Rate**: Percentage of passing students

### Legend Alert
When auto-submissions exist, a yellow alert box appears explaining the red highlighting.

### CSV Export
Exported files include:
- Status column (AUTO-SUBMITTED or MANUAL)
- Auto-Submit Reason (timeout, tab_change, or N/A)

---

## ⚠️ Student Warnings

Students are notified via toast messages:

### Quiz:
- "Tab change detected! Auto-submitting quiz..."
- "Window focus lost! Auto-submitting quiz..."

### Video:
- "Video paused - Tab change detected!"
- "Video paused - Window minimized or focus lost!"
- "Tab active again - Please resume video manually"

---

## 🎯 Benefits

✅ **Prevents Cheating**: Students cannot look up answers in other tabs  
✅ **Fair Assessment**: All students evaluated under same conditions  
✅ **Accurate Tracking**: Video watch time only counts when actively watching  
✅ **Clear Communication**: Students know rules and consequences  
✅ **Automatic Enforcement**: No manual monitoring required  

---

## 🔧 Configuration

### Database Schema

**ExamSubmission Model Fields:**
```javascript
autoSubmitted: Boolean    // true if auto-submitted
autoSubmitReason: String  // 'timeout', 'tab_change', or 'manual'
```

### Detection Sensitivity

**Current Settings:**
- **Detection Delay**: Instant (0ms)
- **Auto-Submit Delay (Quiz)**: 1 second
- **Prevention**: Tab change flag prevents multiple triggers

### Adjustable Parameters

To modify behavior, edit these files:

**Quiz Auto-Submit Delay:**
```javascript
// client/src/components/QuizExam.jsx
setTimeout(() => handleSubmit(true), 1000); // Change 1000 to desired ms
```

**Video Pause Behavior:**
```javascript
// client/src/components/VideoExam.jsx
playerRef.current.pauseVideo(); // Or use stopVideo() for stricter control
```

---

## 📋 Testing Checklist

### Quiz Exam Testing:
- [ ] Open quiz exam
- [ ] Answer some questions (mix of correct/wrong)
- [ ] Leave some questions unanswered
- [ ] Switch to another tab
- [ ] Verify auto-submit occurs
- [ ] Check scoreboard shows correct score
- [ ] Verify unanswered questions marked as wrong

### Video Exam Testing:
- [ ] Open video exam
- [ ] Start playing video
- [ ] Switch to another tab
- [ ] Verify video pauses
- [ ] Verify toast notification appears
- [ ] Return to tab
- [ ] Verify watch time stopped during absence
- [ ] Resume video manually
- [ ] Complete video and submit

---

## 🚨 Known Limitations

1. **Browser Developer Tools**: Advanced users might bypass detection using dev tools
2. **Multiple Monitors**: Cannot detect if student uses second screen
3. **Mobile Devices**: Split-screen apps may not trigger detection
4. **Virtual Machines**: Some VM setups may not fire visibility events

### Recommended Additional Measures:
- Use webcam proctoring for high-stakes exams
- Time limits appropriate for exam difficulty
- Randomize question order
- Create larger question banks

---

## 📝 Changelog

### Version 1.0 (Current)
- ✅ Tab change detection for quiz (auto-submit)
- ✅ Tab change detection for video (auto-pause)
- ✅ Fixed unanswered questions defaulting to 'A'
- ✅ Backend scoring validation
- ✅ Toast notifications for all events
- ✅ Single-trigger protection
- ✅ **Red highlighting for auto-submitted exams**
- ✅ **Auto-submit tracking in database**
- ✅ **Visual status badges (AUTO-SUBMITTED/MANUAL)**
- ✅ **Statistics showing auto-submission count**
- ✅ **CSV export includes auto-submit status**

---

## 🔒 Security Notes

- All detection happens client-side (JavaScript events)
- Backend validates submissions server-side
- Timestamps recorded for audit trail
- Cannot be easily bypassed without advanced technical knowledge
- Provides sufficient protection for educational assessments

---

Last Updated: October 19, 2025
