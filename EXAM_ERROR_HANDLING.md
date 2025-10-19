# 📋 Exam System - Comprehensive Error Handling & User Messages

## Overview
This document details all error handling, user interactions, and feedback messages implemented in the exam system for both Quiz and Video exams.

---

## 🎯 Quiz Exam Error Handling

### 1. Timer Warnings

#### 5 Minutes Remaining
**Trigger:** When timer reaches 5:00  
**Message:** `⏰ 5 minutes remaining! Please check your answers.`  
**Type:** Warning (Yellow)  
**Purpose:** Give students advance notice to review

#### 1 Minute Remaining
**Trigger:** When timer reaches 1:00  
**Message:** `⚠️ Only 1 minute left! The quiz will auto-submit at 0:00.`  
**Type:** Error (Red)  
**Purpose:** Final urgent warning

#### Time Expired
**Trigger:** When timer reaches 0:00  
**Message:** `⏱️ Time is up! Auto-submitting your quiz now...`  
**Type:** Error (Red)  
**Action:** Auto-submit quiz with current answers  
**Banner:** Red banner shows "TIME'S UP! Auto-submitting..."

---

### 2. Tab Change Detection (Quiz)

#### Tab Switched
**Trigger:** `document.hidden` event (tab change)  
**Message:** `🚨 Tab Change Detected! Auto-submitting quiz immediately...`  
**Type:** Error (Red)  
**Banner:** Red animated banner with warning icon  
**Banner Text:** "⚠️ TAB CHANGE DETECTED! Your quiz is being auto-submitted due to policy violation."  
**Action:** Auto-submit after 1.5 seconds  
**Result:** Marked as auto-submitted with reason "tab_change"

#### Window Minimized/Focus Lost
**Trigger:** `blur` event (window minimized)  
**Message:** `🚨 Window Focus Lost! Auto-submitting quiz immediately...`  
**Type:** Error (Red)  
**Banner:** Red animated banner  
**Banner Text:** "⚠️ WINDOW MINIMIZED! Your quiz is being auto-submitted due to policy violation."  
**Action:** Auto-submit after 1.5 seconds

---

### 3. Answer Selection

#### Answer Selected Successfully
**Trigger:** Student clicks an option  
**Message:** `✓ Answer A selected for question 1`  
**Type:** Info (Blue)  
**Purpose:** Confirm selection

#### Selection During Auto-Submit
**Trigger:** Trying to select answer after tab change detected  
**Message:** `⚠️ Quiz is being submitted. Cannot change answers.`  
**Type:** Error (Red)  
**Purpose:** Prevent changes during submission process

---

### 4. Quiz Submission

#### Manual Submit with Unanswered Questions
**Trigger:** Clicking submit with incomplete quiz  
**Confirmation:** `⚠️ You have 3 unanswered question(s). Unanswered questions will be marked as incorrect. Submit anyway?`  
**Type:** Browser confirm dialog  
**Action:** Proceeds if confirmed

#### Successful Manual Submission
**Message:** `✅ Quiz submitted successfully! Score: 25/30 (83.33%)`  
**Type:** Success (Green)  
**Display:** Shows score immediately

#### Successful Auto-Submission
**Message:** `⚠️ Quiz auto-submitted! Score: 20/30 (66.67%)`  
**Type:** Warning (Yellow)  
**Display:** Shows score with warning styling

#### Double Submission Attempt
**Trigger:** Clicking submit while submission in progress  
**Message:** `⏳ Please wait, submission in progress...`  
**Type:** Warning (Yellow)

---

### 5. Network & Server Errors (Quiz)

#### 400 - Bad Request
**Message:** `❌ Failed to submit quiz. Invalid submission data.`  
**Action:** Allow retry, enable form

#### 404 - Exam Not Found
**Message:** `❌ Failed to submit quiz. Exam not found.`  
**Action:** Allow retry

#### 500 - Server Error
**Message:** `❌ Failed to submit quiz. Server error. Please try again.`  
**Action:** Allow retry

#### Network Error
**Message:** `❌ Failed to submit quiz. Network error. Please check your internet connection.`  
**Action:** Allow retry

#### Unknown Error
**Message:** `❌ Failed to submit quiz. Unexpected error occurred.`  
**Action:** Allow retry

---

### 6. Security Features (Quiz)

#### Right-Click Disabled
**Trigger:** User tries to right-click  
**Message:** `⚠️ Right-click is disabled during the exam.`  
**Type:** Warning (Yellow)  
**Action:** Prevent context menu

#### Copy Disabled
**Trigger:** User tries to copy text (Ctrl+C)  
**Message:** `⚠️ Copying is disabled during the exam.`  
**Type:** Warning (Yellow)  
**Action:** Prevent copying

#### Page Leave Warning
**Trigger:** Trying to close/refresh page  
**Browser Dialog:** "Your quiz is in progress. Are you sure you want to leave? Your progress will be lost."  
**Action:** Requires confirmation

---

## 🎥 Video Exam Error Handling

### 1. Video Loading

#### Invalid Video Link
**Trigger:** YouTube video ID extraction fails  
**Message:** `❌ Invalid video link. Cannot load video.`  
**Type:** Error (Red)  
**Banner:** Red banner with error details  
**Action:** Cannot proceed with exam

#### Player Load Error
**Trigger:** YouTube IFrame API fails to load  
**Message:** `❌ Failed to load video player. Please refresh the page.`  
**Type:** Error (Red)  
**Banner:** Error banner with instructions

#### Player Initialization Error
**Trigger:** YouTube player constructor fails  
**Message:** `❌ Error initializing video player.`  
**Type:** Error (Red)

#### Successful Load
**Message:** `✓ Video loaded successfully! Duration: 5:22`  
**Type:** Success (Green)

---

### 2. YouTube Player Errors

#### Error Code 2
**Error:** Invalid video ID or parameters  
**Message:** `❌ Video playback error: Invalid video ID or parameters.`  
**Banner:** Red error banner

#### Error Code 5
**Error:** HTML5 player error  
**Message:** `❌ Video playback error: HTML5 player error.`  
**Banner:** Red error banner

#### Error Code 100
**Error:** Video not found or private  
**Message:** `❌ Video playback error: Video not found or private.`  
**Banner:** Red error banner

#### Error Code 101/150
**Error:** Embedding not allowed  
**Message:** `❌ Video playback error: Video owner does not allow embedding.`  
**Banner:** Red error banner

---

### 3. Tab Change Detection (Video)

#### Tab Switched (Video Playing)
**Trigger:** `document.hidden` with video playing  
**Message:** `⚠️ Video paused - Tab changed. Return to this tab to resume watching.`  
**Type:** Warning (Yellow)  
**Banner:** Yellow animated banner showing pause reason  
**Action:** Video automatically paused  
**Overlay:** Dark overlay on video with pause icon  
**Button:** "Resume Video" button appears

#### Tab Returned
**Message:** `👋 Welcome back! Click the play button to resume watching.`  
**Type:** Info (Blue)  
**Action:** Clear pause banner

#### Window Minimized (Video Playing)
**Trigger:** `blur` event with video playing  
**Message:** `⚠️ Video paused - Window minimized or focus lost!`  
**Type:** Warning (Yellow)  
**Banner:** Yellow pause banner  
**Action:** Video automatically paused  
**Overlay:** Shows pause overlay with resume button

#### Window Focused Again
**Message:** `✓ Window active. You can resume watching the video.`  
**Type:** Info (Blue)  
**Action:** Remove pause banner, show resume option

---

### 4. Video Playback States

#### Video Playing
**Message:** `▶️ Video resumed. Watch time tracking active.` (if was paused)  
**Type:** Success (Green)  
**Tracking:** Watch time tracking starts  
**Status Indicator:** Green "Tracking Active" badge

#### Video Paused Manually
**Message:** `⏸️ Video paused. Watch time tracking paused.`  
**Type:** Info (Blue)  
**Tracking:** Watch time tracking stops  
**Status Indicator:** Gray "Tracking Paused" badge

#### Video Ended
**Message:** `✅ Video completed! You can now submit the exam.`  
**Type:** Success (Green)  
**Action:** Enable submit button automatically  
**Button:** Submit button turns green

#### Video Buffering
**Message:** `⏳ Video buffering... Please wait.`  
**Type:** Info (Blue)  
**Purpose:** Inform user about loading state

---

### 5. Video Submission

#### Submit Before 80% Completion
**Trigger:** Clicking submit with < 80% watched  
**Message:** `⚠️ Please watch at least 80% of the video. Current: 45.2%`  
**Type:** Warning (Yellow)  
**Action:** Prevent submission

#### Successful Submission
**Message:** `✅ Video exam submitted! Completion: 95.5%`  
**Type:** Success (Green)  
**Action:** Navigate to results

#### Submission Confirmation
**Dialog:** "✓ Are you sure you want to submit? Your watch time will be recorded."  
**Type:** Browser confirm  
**Action:** Submit if confirmed

---

### 6. Network & Server Errors (Video)

#### 400 - Bad Request
**Message:** `❌ Failed to submit video exam. Invalid submission data.`  
**Action:** Allow retry

#### 404 - Exam Not Found
**Message:** `❌ Failed to submit video exam. Exam not found.`  
**Action:** Allow retry

#### 500 - Server Error
**Message:** `❌ Failed to submit video exam. Server error. Please try again.`  
**Action:** Allow retry

#### Network Error
**Message:** `❌ Failed to submit video exam. Network error. Please check your internet connection.`  
**Action:** Allow retry

#### Unknown Error
**Message:** `❌ Failed to submit video exam. Unexpected error occurred.`  
**Action:** Allow retry

---

### 7. Video Page Leave Warning

**Trigger:** Trying to close/refresh page during video exam  
**Browser Dialog:** "Video exam is in progress. Your watch time will be saved, but you will need to start over."  
**Action:** Requires confirmation

---

## 🎨 Visual Indicators

### Quiz Exam Banners

#### Red Warning Banner (Tab Change)
```
┌────────────────────────────────────────────────────┐
│ ⚠️  TAB CHANGE DETECTED!                          │
│     Your quiz is being auto-submitted due to      │
│     policy violation.                             │
│     Your answers are being saved automatically.   │
└────────────────────────────────────────────────────┘
```
- Background: Red (`bg-red-600`)
- Text: White
- Animation: Pulse
- Icon: Warning triangle

---

### Video Exam Banners

#### Yellow Pause Banner
```
┌────────────────────────────────────────────────────┐
│ ⏸️  Video Paused                                   │
│     Reason: Tab change detected                   │
│     Click play button to resume. Tracking paused. │
└────────────────────────────────────────────────────┘
```
- Background: Yellow (`bg-yellow-100`)
- Border: Yellow stripe (`border-l-4 border-yellow-500`)
- Animation: Pulse
- Icon: Pause symbol

#### Red Error Banner
```
┌────────────────────────────────────────────────────┐
│ ❌ Video Error                                     │
│     Video not found or private.                   │
│     Please contact administrator or refresh page. │
└────────────────────────────────────────────────────┘
```
- Background: Red (`bg-red-100`)
- Border: Red stripe (`border-l-4 border-red-500`)
- Icon: X circle

#### Video Pause Overlay
```
┌────────────────────────────────────────────────────┐
│                                                    │
│              [Pause Icon - Animated]              │
│                                                    │
│              Video Paused                         │
│              Tab change detected                  │
│                                                    │
│          [▶️ Resume Video Button]                 │
│                                                    │
└────────────────────────────────────────────────────┘
```
- Background: Black with 70% opacity
- Text: White
- Button: Green with play icon
- Overlay: Covers entire video player
- Z-index: 10 (above video)

---

## 📊 Toast Notification System

### Toast Types

| Type | Color | Icon | Use Case |
|------|-------|------|----------|
| Success | Green | ✅ | Successful actions, completion |
| Error | Red | ❌ | Errors, failures, critical issues |
| Warning | Yellow | ⚠️ | Cautions, auto-submits, policy violations |
| Info | Blue | ℹ️ | Information, status updates |

### Toast Duration
- **Default:** 3 seconds
- **Error:** 5 seconds (longer for user to read)
- **Critical:** 7 seconds (auto-submit warnings)

---

## 🔄 State Management

### Quiz States
- `loading` - Submission in progress
- `tabChangeDetected` - Tab switch detected, auto-submit triggered
- `autoSubmitReason` - 'manual', 'timeout', or 'tab_change'
- `showWarningBanner` - Display red warning banner
- `warningMessage` - Custom warning text

### Video States
- `loading` - Submission in progress
- `isPlaying` - Video currently playing
- `videoPaused` - Video paused due to tab change
- `pauseReason` - Why video was paused
- `videoError` - Error message if video fails
- `wasPlayingBeforeHidden` - Track if video was playing before tab switch
- `canSubmit` - Whether 80% completion reached

---

## 🚨 Priority Levels

### Critical (Immediate Action Required)
1. Tab change during quiz → Auto-submit
2. Timer expires → Auto-submit
3. Video player error → Cannot proceed
4. Network error during submission → Retry needed

### Warning (User Should Know)
1. 5 minutes remaining
2. 1 minute remaining
3. Tab change during video → Pause
4. Unanswered questions warning
5. Incomplete video submission attempt

### Info (FYI, No Action Needed)
1. Answer selected confirmation
2. Video buffering
3. Tab returned
4. Video paused manually

---

## 🎯 User Experience Goals

### Clarity
- ✅ Every action has feedback
- ✅ Error messages explain what happened
- ✅ Instructions tell users what to do next

### Prevention
- ✅ Warnings before destructive actions
- ✅ Confirmations for submissions
- ✅ Disabled features show why they're disabled

### Recovery
- ✅ Network errors allow retry
- ✅ Video can be resumed after pause
- ✅ Clear error messages for troubleshooting

### Fairness
- ✅ Auto-submit clearly flagged
- ✅ Unanswered questions = incorrect (not random)
- ✅ Video pause stops tracking (no free time)

---

## 📱 Responsive Behavior

All error messages and banners:
- ✅ Mobile-friendly sizes
- ✅ Touch-friendly buttons
- ✅ Readable on small screens
- ✅ No horizontal scroll
- ✅ Accessible color contrast

---

## ♿ Accessibility

- ✅ ARIA labels on interactive elements
- ✅ Keyboard navigation support
- ✅ High contrast colors
- ✅ Screen reader friendly messages
- ✅ Focus indicators on buttons

---

## 🧪 Testing Scenarios

### Quiz Testing

1. **Happy Path:** Complete quiz normally
2. **Timer Expire:** Wait for auto-submit
3. **Tab Switch:** Switch tab, verify auto-submit
4. **Network Error:** Disconnect, try submit, reconnect, retry
5. **Unanswered Questions:** Submit with empty answers
6. **Right-Click:** Try to right-click
7. **Copy Text:** Try to copy questions
8. **Page Leave:** Try to close tab

### Video Testing

1. **Happy Path:** Watch video, submit at 80%
2. **Tab Switch:** Switch tab, verify pause & resume
3. **Window Minimize:** Minimize browser, verify pause
4. **Invalid Video:** Use bad YouTube link
5. **Network Error:** Disconnect during video load
6. **Early Submit:** Try to submit before 80%
7. **Video Complete:** Watch to 100%, verify auto-enable
8. **Player Error:** Use restricted/private video

---

## 📝 Future Improvements

Potential enhancements:
- [ ] Grace period for accidental tab switches (first time warning)
- [ ] Progress save/resume for interrupted sessions
- [ ] Offline mode with sync when back online
- [ ] Screen recording for high-stakes exams
- [ ] Multi-language error messages
- [ ] Voice announcements for visually impaired
- [ ] Admin dashboard for real-time error monitoring

---

**Version:** 2.0  
**Last Updated:** October 19, 2025  
**Status:** ✅ Production Ready with Comprehensive Error Handling
