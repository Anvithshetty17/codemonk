# Auto-Submit Tracking System

## 🎯 Overview
When students switch tabs or run out of time during exams, their submissions are automatically flagged and visually highlighted on the admin scoreboard for easy identification.

---

## 🔴 Visual Indicators on Scoreboard

### Red Highlighted Rows
Auto-submitted student records appear with:

```
┌─────────────────────────────────────────────────┐
│ 🔴│  #4   4NI21CS001   John Doe   15/30  50%   │  ← RED BACKGROUND
│   │  10 mins  | 2024-10-19 14:35              │  ← RED LEFT BORDER
│   │  [AUTO-SUBMITTED] ⚠️ Tab Change           │  ← RED BADGE
└─────────────────────────────────────────────────┘
```

**Visual Styling:**
- 🔴 **Background**: Light red (`bg-red-50`)
- 🔴 **Hover**: Darker red (`bg-red-100`)
- 🔴 **Left Border**: Bold red stripe 4px (`border-l-4 border-red-500`)
- 🔴 **Badge**: Red badge with "AUTO-SUBMITTED"
- ⚠️ **Icon + Reason**: Shows why it was auto-submitted

### Normal Manual Submissions
Regular submissions have white background with green "MANUAL" badge.

---

## 📊 Status Column

Each row in the scoreboard shows a status badge:

### 🔴 AUTO-SUBMITTED
- **Timeout**: ⏱️ Time limit exceeded
- **Tab Change**: ⚠️ Student switched tabs or minimized browser

### 🟢 MANUAL
- Student submitted normally by clicking submit button

---

## 📈 Statistics Dashboard

Admin sees at-a-glance statistics:

```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ Total           │ Auto-Submitted  │ Average Score   │ Pass Rate       │
│ Submissions     │                 │                 │                 │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│      45         │       7         │     72.3%       │      80%        │
│                 │    (15.6%)      │                 │                 │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

The "Auto-Submitted" card shows:
- Count of auto-submissions
- Percentage of total submissions
- Displayed in **bold red text**

---

## ⚠️ Warning Legend

When auto-submissions exist, a yellow alert appears at the top:

```
┌────────────────────────────────────────────────────────────┐
│ ⚠️  Auto-Submission Detected                              │
│                                                            │
│ Rows highlighted in RED indicate auto-submitted exams:    │
│  • ⏱️ Timeout: Time limit exceeded                       │
│  • ⚠️ Tab Change: Student switched tabs/minimized browser│
└────────────────────────────────────────────────────────────┘
```

---

## 📥 CSV Export Format

Exported CSV files include auto-submission data:

```csv
USN,Name,Score,Total,Percentage,Time,Submitted At,Status,Auto-Submit Reason
4NI21CS001,John Doe,15,30,50,10,2024-10-19 14:35,AUTO-SUBMITTED,tab_change
4NI21CS002,Jane Smith,28,30,93,8,2024-10-19 14:30,MANUAL,N/A
4NI21CS003,Bob Wilson,12,30,40,5,2024-10-19 14:40,AUTO-SUBMITTED,timeout
```

**Columns Added:**
- **Status**: AUTO-SUBMITTED or MANUAL
- **Auto-Submit Reason**: timeout, tab_change, or N/A

---

## 🗄️ Database Schema

### ExamSubmission Model

```javascript
{
  // ... existing fields ...
  
  autoSubmitted: {
    type: Boolean,
    default: false  // true if auto-submitted
  },
  
  autoSubmitReason: {
    type: String,
    enum: ['timeout', 'tab_change', 'manual'],
    default: 'manual'
  }
}
```

---

## 🔄 Data Flow

### 1. Student Takes Exam
```
Student → QuizExam/VideoExam Component
```

### 2. Tab Change Detected
```
Browser Event → setAutoSubmitReason('tab_change') → Auto Submit
```

### 3. Submission Sent
```javascript
POST /api/exams/submit-quiz
{
  // ... exam data ...
  autoSubmitted: true,
  autoSubmitReason: 'tab_change'
}
```

### 4. Stored in Database
```
MongoDB → ExamSubmission → { autoSubmitted: true, autoSubmitReason: 'tab_change' }
```

### 5. Displayed on Scoreboard
```
Admin Panel → GET /api/exams/:examId/scoreboard → Red Highlighted Row
```

---

## 🎨 UI Components Breakdown

### Scoreboard Table Row (Auto-Submit)
```jsx
<tr className="bg-red-50 hover:bg-red-100 border-l-4 border-red-500">
  <!-- Student data cells -->
  <td>
    <div>
      <span className="bg-red-100 text-red-700 border-red-300">
        AUTO-SUBMITTED
      </span>
      <span className="text-red-600">
        ⚠️ Tab Change
      </span>
    </div>
  </td>
</tr>
```

### Scoreboard Table Row (Manual)
```jsx
<tr className="hover:bg-gray-50">
  <!-- Student data cells -->
  <td>
    <span className="bg-green-100 text-green-700">
      MANUAL
    </span>
  </td>
</tr>
```

---

## 📋 Admin Benefits

✅ **Instant Visual Identification**: Red rows stand out immediately  
✅ **Detailed Reason**: Know exactly why auto-submit happened  
✅ **Statistical Analysis**: Track auto-submission rates  
✅ **Export for Records**: CSV includes all auto-submit data  
✅ **Fair Evaluation**: Context for grading decisions  
✅ **Pattern Detection**: Identify students who frequently switch tabs  

---

## 🚨 Use Cases

### Academic Integrity Review
Admin can:
1. Sort by auto-submissions
2. Review scores of flagged students
3. Export data for further investigation
4. Compare auto-submit vs manual submission performance

### Course Improvement
Analyze:
- High auto-submit rate due to timeout → Exam too long?
- Many tab changes → Questions too difficult?
- Patterns by time of day → Technical issues?

### Student Counseling
- Identify students who struggle with time management
- Provide feedback about exam-taking strategies
- Address technical issues (browser compatibility, etc.)

---

## 🔍 Testing Scenarios

### Test Auto-Submit Detection:

**Scenario 1: Tab Change During Quiz**
1. Student takes quiz
2. Answers 3 questions
3. Switches to Google (opens new tab)
4. ✅ Auto-submit triggered
5. ✅ Admin sees red row with "⚠️ Tab Change"

**Scenario 2: Timeout During Quiz**
1. Student takes quiz
2. Answers slowly
3. Timer reaches 0:00
4. ✅ Auto-submit triggered
5. ✅ Admin sees red row with "⏱️ Timeout"

**Scenario 3: Manual Submit**
1. Student completes quiz normally
2. Clicks "Submit Quiz"
3. ✅ Normal submission
4. ✅ Admin sees white row with "🟢 MANUAL"

---

## 📊 Sample Scoreboard View

```
EXAM SCOREBOARD: Data Structures Quiz
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ Auto-Submission Detected
   Rows in RED indicate auto-submitted exams (timeout or tab change)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Rank  USN          Name          Score    %     Time   Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🥇    4NI21CS002   Jane Smith    28/30   93%    8m    🟢 MANUAL
🥈    4NI21CS005   Alice Brown   26/30   87%    9m    🟢 MANUAL
🥉    4NI21CS010   Mike Davis    24/30   80%   10m    🟢 MANUAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 #4  4NI21CS001   John Doe      15/30   50%   10m    🔴 AUTO-SUBMITTED
                                                        ⚠️ Tab Change
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#5    4NI21CS007   Sarah Lee     22/30   73%   11m    🟢 MANUAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 #6  4NI21CS003   Bob Wilson    12/30   40%    5m    🔴 AUTO-SUBMITTED
                                                        ⏱️ Timeout
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Statistics:
├─ Total Submissions: 45
├─ Auto-Submitted: 7 (15.6%)
├─ Average Score: 72.3%
└─ Pass Rate: 80%
```

---

## 🎓 Best Practices

### For Admins:
1. **Review Red Rows**: Check if pattern indicates systemic issue
2. **Context Matters**: Tab change ≠ automatic cheating (could be accident)
3. **Export Data**: Keep records for academic integrity reviews
4. **Communicate Policy**: Ensure students know tab switching = auto-submit

### For Students (Inform Them):
1. ⚠️ **Don't switch tabs** during exam
2. ⚠️ **Don't minimize browser**
3. ⚠️ **Watch the timer** to avoid timeout
4. ✅ **Stay focused** on exam tab only
5. ✅ **Submit before time runs out**

---

## 🔒 Security & Privacy

- Auto-submit data stored securely in database
- Only admins can view auto-submit status
- Students don't see auto-submit flags (prevents gaming the system)
- CSV exports are admin-only
- Audit trail maintained with timestamps

---

## 📝 Future Enhancements

Potential additions:
- [ ] Filter scoreboard by auto-submit status
- [ ] Email notifications to admins for high auto-submit rates
- [ ] Detailed analytics dashboard
- [ ] Tab change counter (how many times before auto-submit)
- [ ] Warning before first auto-submit (one-time grace period)
- [ ] Integration with webcam proctoring

---

Last Updated: October 19, 2025
