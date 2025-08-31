# Image Upload Feature

## Overview
The admin can now upload team member images directly through the admin panel. Images are stored in the `client/public/uploads` directory and automatically served by the frontend.

## Features
- **Direct Upload**: Admin can select and upload image files directly
- **Image Preview**: Real-time preview of uploaded images before saving
- **File Validation**: Only image files (JPG, PNG, GIF, WebP) allowed with 5MB size limit
- **URL Alternative**: Option to use image URLs if preferred
- **Automatic Storage**: Images stored in `client/public/uploads` directory
- **Responsive Display**: Images display properly on the team page with fallback

## Usage

### For Admins:
1. Go to Admin Panel → Manage Team Members
2. Click "Add New Member" or edit an existing member
3. In the "Profile Image" section:
   - Either upload a file using "Upload New Image"
   - Or enter an image URL in the "Or use Image URL" field
4. See live preview of the selected image
5. Complete the form and save

### File Requirements:
- **Format**: JPG, PNG, GIF, WebP
- **Size**: Maximum 5MB
- **Storage**: Files automatically saved to `/client/public/uploads/`
- **Naming**: Auto-generated unique filenames to prevent conflicts

## Technical Details

### Backend:
- **Multer**: Handles file uploads
- **Storage**: Files stored in `client/public/uploads`
- **Validation**: File type and size validation
- **API Endpoint**: `POST /api/members/upload-image`

### Frontend:
- **File Input**: HTML5 file input with image preview
- **Upload Status**: Shows upload progress and states
- **Error Handling**: User-friendly error messages
- **Responsive Design**: Works on all screen sizes

### File Structure:
```
client/
  public/
    uploads/           # Uploaded images stored here
      .gitkeep        # Ensures directory is tracked
      image-123...jpg # Auto-generated filenames
```

## Error Handling:
- File size exceeding 5MB
- Non-image file types
- Upload failures
- Network errors
- Automatic fallback to placeholder images
