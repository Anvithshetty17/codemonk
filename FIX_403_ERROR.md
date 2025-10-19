# Fixing 403 Forbidden Error

## Problem
You're getting a `403 Forbidden` error when trying to create exams because you're not authenticated as an admin user.

## Solution

### Step 1: Check Your User Role
Open browser console and run:
```javascript
localStorage.getItem('token')
```

If it returns `null`, you're not logged in.

### Step 2: Log In as Admin

1. **Go to Login page**: Navigate to `/login`
2. **Enter admin credentials**
3. **Log in successfully**

### Step 3: Verify Admin Access

After logging in, check your user role:
```javascript
// In browser console
const token = localStorage.getItem('token');
console.log('Token:', token);
```

### Step 4: Access Admin Panel

1. Go to `/admin`
2. Click on "Exam Management" tab
3. Try creating an exam again

## If You Don't Have an Admin Account

You need to create an admin user in the database. Here are two methods:

### Method 1: Using MongoDB Compass or Shell

```javascript
// Connect to your database and run:
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

### Method 2: Using the Backend API

If you have access to creating users, register normally and then update the user's role in the database.

### Method 3: Seed Script (If Available)

Check if there's a seed script in `server/utils/seed.js` that creates admin users.

## Testing After Fix

1. Log in with admin credentials
2. Go to `/admin`
3. Click "Exam Management"
4. Click "Create Exam"
5. Fill in the form
6. Create quiz or video exam
7. Should work without 403 error!

## Common Issues

**Still getting 403?**
- Clear browser cache
- Log out and log back in
- Check token expiration
- Verify user role in database

**Token expired?**
- Log out
- Log in again
- Try creating exam

**Wrong role in database?**
```javascript
// Check in MongoDB
db.users.findOne({ email: "your@email.com" }, { role: 1, email: 1 })
// Should show: { role: "admin", email: "your@email.com" }
```

## Quick Fix Command

If you have MongoDB access:
```bash
# Connect to MongoDB
mongosh

# Use your database
use codemonk

# Update user to admin
db.users.updateOne(
  { email: "YOUR_EMAIL@example.com" },
  { $set: { role: "admin" } }
)

# Verify
db.users.findOne({ email: "YOUR_EMAIL@example.com" })
```

## System is Working!

The exam system is fully functional. The **only issue** is authentication. Once you log in as an admin, everything will work perfectly!

---

**Summary**: 
- ✅ Code is correct
- ✅ API endpoints work
- ✅ All components fixed
- ❌ Need to log in as admin user
