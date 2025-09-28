# Cheatsheets Directory

This directory is for storing PDF cheatsheets that will be accessible through the External Study Materials section.

## How to add new cheatsheets:

1. **Add PDF files** to this directory with descriptive names (e.g., `javascript-cheatsheet.pdf`, `react-cheatsheet.pdf`)

2. **Update the JSON file** at `/client/src/data/cheatsheets.json` to add new entries:
   ```json
   {
     "id": 7,
     "title": "Your Cheatsheet Title",
     "description": "Brief description of what this cheatsheet covers",
     "category": "Category Name",
     "pdfPath": "/cheatsheets/your-file-name.pdf",
     "color": "from-blue-500 to-purple-500",
     "icon": "javascript" // Available icons: javascript, react, css, git, node, database
   }
   ```

3. **PDF Path Format**: Always use `/cheatsheets/filename.pdf` as the path format

## Current placeholder files:
- All PDF files mentioned in the cheatsheets.json are placeholders
- Replace these with actual PDF files as needed

## Categories:
- Programming Languages
- Frameworks
- CSS
- Version Control
- Backend
- Database
- (Add new categories as needed)

## Available Icons:
- javascript (FaJsSquare)
- react (FaReact) 
- css (FaCss3Alt)
- git (FaGitAlt)
- node (FaNodeJs)
- database (FaDatabase)

To add new icons, update the `iconMap` in `/client/src/pages/Cheatsheets.jsx`