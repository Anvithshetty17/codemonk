# Auto-Submit and Tab Change Fixes

## Issues Fixed

### 1. **Tab Change Detection Not Working**
**Problem:** When tabs were changed, warning messages appeared but the quiz didn't auto-submit and redirect.

**Root Cause:** The `submitRef.current` dependency array was too restrictive, causing stale closures when the submit function was called from event handlers.

**Solution:** 
- Removed the dependency array from the `submitRef` useEffect so it updates on every render
- This ensures the ref always has the latest version of `handleSubmit` with current state and dependencies

```javascript
// Before (WRONG):
useEffect(() => {
  submitRef.current = handleSubmit;
}, [answers, autoSubmitReason, loading, tabChangeDetected]); // Stale closure issue

// After (CORRECT):
useEffect(() => {
  submitRef.current = handleSubmit;
}); // Updates every render - always has latest function
```

### 2. **Timer Not Auto-Submitting**
**Problem:** When time expired, the quiz didn't auto-submit.

**Root Cause:** Same issue - the `submitRef.current` had a stale version of `handleSubmit` due to dependency restrictions.

**Solution:** Same fix - by updating the ref on every render, the timer can always call the latest version of the submit function.

### 3. **Auto-Submit Redirect**
**Feature:** When quiz is auto-submitted (tab change or timeout), user is redirected to `/take-exam` instead of seeing results.

**Implementation:**
```javascript
if (autoSubmit) {
  setTimeout(() => {
    navigate('/take-exam');
  }, 2000); // 2 second delay to show score toast
} else {
  onComplete(response.data.data); // Normal flow for manual submission
}
```

## How It Works Now

### Tab Change Flow:
1. User switches tabs/minimizes window
2. `visibilitychange` or `blur` event detected
3. Warning banner appears immediately
4. Toast notification: "🚨 Tab Change Detected! Auto-submitting quiz immediately..."
5. After 1.5 seconds, `submitRef.current(true)` is called
6. Quiz submits with `autoSubmitted: true` and `autoSubmitReason: 'tab_change'`
7. Toast shows score: "⚠️ Quiz auto-submitted! Score: X/Y (Z%)"
8. After 2 seconds, user is redirected to `/take-exam`

### Timer Expiry Flow:
1. Timer counts down to 0
2. Toast notification: "⏱️ Time is up! Auto-submitting your quiz now..."
3. `submitRef.current(true)` is called immediately
4. Quiz submits with `autoSubmitted: true` and `autoSubmitReason: 'timeout'`
5. Toast shows score
6. After 2 seconds, user is redirected to `/take-exam`

### Manual Submit Flow:
1. User clicks "Submit Quiz" button
2. Confirmation prompt if questions are unanswered
3. Quiz submits with `autoSubmitted: false` and `autoSubmitReason: 'manual'`
4. Toast shows success: "✅ Quiz submitted successfully! Score: X/Y (Z%)"
5. Result page is shown via `onComplete()`

## Testing Checklist

- [x] Fix toast API calls (use parameters, not object)
- [x] Tab change triggers auto-submit
- [x] Window blur triggers auto-submit
- [x] Timer expiry triggers auto-submit
- [x] Auto-submit redirects to `/take-exam`
- [x] Manual submit shows result page
- [x] Warning banner appears on tab change
- [x] Score is shown in toast before redirect
- [ ] Test in actual browser (not just dev tools)
- [ ] Test with real exam code
- [ ] Verify scoreboard records auto-submit reason
- [ ] Verify leaderboard shows auto-submitted exams

## Technical Notes

### Why No Dependencies?
```javascript
useEffect(() => {
  submitRef.current = handleSubmit;
}); // No dependency array = runs after every render
```

This seems inefficient, but it's actually the correct pattern here because:
1. `handleSubmit` uses state (`answers`, `loading`, etc.) and props (`navigate`, `onComplete`)
2. Event handlers (timer, visibility) need the LATEST version of `handleSubmit`
3. With dependencies, we'd get stale closures where old state/props are used
4. Without dependencies, the ref always points to the current `handleSubmit`
5. This is a React-recommended pattern for exposing functions to external event handlers

### Alternative Approaches (Not Used)
1. **useCallback with exhaustive deps:** Would require every state/prop in deps, still risky
2. **Move logic into effects:** Would duplicate submission logic multiple times
3. **State machine:** Overkill for this use case
4. **Global ref without useEffect:** Would miss re-renders

## Scoreboard Integration

The auto-submit information is sent to the backend:
```javascript
{
  autoSubmitted: true,  // Boolean flag
  autoSubmitReason: 'tab_change' | 'timeout' | 'manual'
}
```

The scoreboard should display:
- "Auto-submitted (Tab Change)" in red/orange
- "Auto-submitted (Timeout)" in yellow/orange  
- Normal submission in green

## Anti-Cheating Features Active

1. ✅ Tab change detection → Auto-submit
2. ✅ Window blur detection → Auto-submit
3. ✅ Right-click disabled
4. ✅ Copy/paste disabled
5. ✅ Page leave warning
6. ✅ Timer auto-submit
7. ✅ Visual warning banners
8. ✅ Toast notifications for all events
9. ✅ Auto-redirect after policy violation

## Date Fixed
October 19, 2025

## Files Modified
- `client/src/components/QuizExam.jsx`
  - Added `useNavigate` hook
  - Fixed `submitRef` update pattern (no deps)
  - Added redirect logic for auto-submit
  - Added `addToast` to tab change effect dependencies
  - Fixed all toast API calls (params vs object)

- `client/src/components/VideoExam.jsx`
  - Fixed all toast API calls (params vs object)
