# 🎯 Quick Reference: Auto-Submit Visual Indicators

## Scoreboard Display

### 🔴 Auto-Submitted Exam (Red Row)
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🔴 #4  4NI21CS001  John Doe  15/30  50%  10m      ┃ ← RED BACKGROUND
┃     2024-10-19 14:35                               ┃ ← RED LEFT BORDER
┃     [AUTO-SUBMITTED] ⚠️ Tab Change                ┃ ← RED BADGE + REASON
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

### 🟢 Manual Submission (Normal Row)
```
┌──────────────────────────────────────────────────┐
│ #3  4NI21CS002  Jane Smith  28/30  93%  8m      │ ← WHITE BACKGROUND
│     2024-10-19 14:30                             │
│     [MANUAL] ✓                                   │ ← GREEN BADGE
└──────────────────────────────────────────────────┘
```

---

## Status Badges

| Badge | Meaning | Visual |
|-------|---------|--------|
| 🔴 **AUTO-SUBMITTED** | Exam auto-submitted | Red badge, red text |
| ⏱️ **Timeout** | Time limit exceeded | Small text below badge |
| ⚠️ **Tab Change** | Student switched tabs | Small text below badge |
| 🟢 **MANUAL** | Normal submission | Green badge, green text |

---

## Statistics Dashboard

```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ Total           │ Auto-Submitted  │ Average Score   │ Pass Rate       │
│ Submissions     │                 │                 │                 │
│                 │                 │                 │                 │
│      45         │  7 (15.6%) 🔴  │     72.3%       │      80%        │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

---

## Color Code

| Element | Color | CSS Class |
|---------|-------|-----------|
| Auto-submit row background | Light red | `bg-red-50` |
| Auto-submit row hover | Darker red | `bg-red-100` |
| Auto-submit left border | Bold red | `border-l-4 border-red-500` |
| Auto-submit badge | Red | `bg-red-100 text-red-700` |
| Manual row background | White | Default |
| Manual badge | Green | `bg-green-100 text-green-700` |

---

## CSV Export Format

```csv
USN,Name,Score,Total,Percentage,Time,Submitted At,Status,Auto-Submit Reason
4NI21CS001,John Doe,15,30,50,10,2024-10-19 14:35,AUTO-SUBMITTED,tab_change
4NI21CS002,Jane Smith,28,30,93,8,2024-10-19 14:30,MANUAL,N/A
```

---

## Legend (Appears when auto-submits exist)

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ ⚠️  Auto-Submission Detected                     ┃
┃                                                   ┃
┃ Rows in RED indicate auto-submitted exams:       ┃
┃  • ⏱️ Timeout: Time limit exceeded              ┃
┃  • ⚠️ Tab Change: Student switched tabs/browser ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

---

## At-a-Glance

✅ **Red Row** = Auto-Submitted  
✅ **Red Badge** = Status "AUTO-SUBMITTED"  
✅ **Icon + Text** = Reason (Timeout or Tab Change)  
✅ **Statistics** = Count and percentage of auto-submits  
✅ **CSV** = Includes status and reason columns  

---

## What Triggers Auto-Submit?

| Event | Result | Badge Shown |
|-------|--------|-------------|
| Timer reaches 0:00 | Auto-submit | ⏱️ Timeout |
| Student switches browser tab | Auto-submit | ⚠️ Tab Change |
| Student minimizes browser | Auto-submit | ⚠️ Tab Change |
| Student loses window focus | Auto-submit | ⚠️ Tab Change |
| Student clicks "Submit Quiz" | Normal submit | 🟢 Manual |

---

## Admin Actions

1. **Review red rows** - Check auto-submitted exams
2. **Export CSV** - Get complete data with status
3. **Check statistics** - Monitor auto-submit rates
4. **Identify patterns** - Multiple auto-submits per student?
5. **Make decisions** - Context for grading

---

## Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| No red rows showing | Restart backend server (schema update) |
| All rows show as manual | Check frontend sends `autoSubmitted` field |
| Status column missing | Verify table header added |
| CSV missing columns | Update export function |

---

**Version:** 1.0  
**Last Updated:** October 19, 2025
