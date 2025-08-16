# Code Monk - Coding Club Web Application

🚀 **Transforming Beginners into Experts!**

A comprehensive MERN stack web application for Code Monk, the MCA coding club at NMAM Institute of Technology. This platform serves as a central hub for student engagement, team management, announcements, and study materials.

## 🌟 Features

### 🏠 Public Features
- **Landing Page**: Engaging home page with club information, goals, and benefits
- **Team Section**: Meet the club leadership and core team members
- **User Authentication**: Secure login/register system with JWT cookies
- **Responsive Design**: Mobile-first approach with modern CSS

### 👨‍🎓 Student Dashboard
- **Personal Profile**: View and edit profile information
- **Announcements**: Stay updated with club announcements (priority-based)
- **Study Materials**: Access categorized learning resources
- **Password Management**: Secure password update functionality

### 🛡️ Admin Panel
- **Student Management**: View and filter registered students
- **Team Member CRUD**: Add, edit, and remove team members with social links
- **Announcement Management**: Create, edit, and delete announcements with priority levels
- **Study Materials Management**: Organize learning resources by category
- **Advanced Filtering**: Filter students by areas of interest, materials by category

### 🔒 Security Features
- JWT authentication with httpOnly secure cookies
- Role-based access control (Student/Admin)
- Input validation and sanitization
- Rate limiting on authentication endpoints
- CORS protection and security headers

### 📱 Progressive Web App (PWA)
- Offline functionality with service worker
- App-like experience on mobile devices
- Custom icons and splash screens
- Installable on mobile devices

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing with protected routes
- **Context API** - State management for auth and notifications
- **Axios** - HTTP client for API calls
- **CSS3** - Custom styles with CSS variables and responsive design

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **helmet** - Security headers
- **express-rate-limit** - API rate limiting

### Database Models
- **User**: Authentication, profile, and role management
- **Member**: Team member information with social links
- **Announcement**: Club announcements with priority levels
- **Material**: Study materials categorized by technology

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "code monk"
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Setup**
   
   Create `.env` file in the server directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/codemonk
   
   # JWT Secret (generate a strong secret)
   JWT_SECRET=your-super-secret-jwt-key-here
   
   # Environment
   NODE_ENV=development
   
   # Server Port
   PORT=5000
   ```

5. **Start the application**
   
   **Development mode (both client and server):**
   ```bash
   # Terminal 1 - Start backend server
   cd server
   npm run dev
   
   # Terminal 2 - Start frontend client
   cd client
   npm run dev
   ```
   
   **Production build:**
   ```bash
   # Build client
   cd client
   npm run build
   
   # Start production server
   cd ../server
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:5173 (development)
   - Backend API: http://localhost:5000
   - Production: http://localhost:5000 (serves built frontend)

## 📁 Project Structure

```
code monk/
├── client/                     # React frontend
│   ├── public/                # Static assets and PWA icons
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   │   ├── admin/         # Admin panel components
│   │   │   └── dashboard/     # Dashboard components
│   │   ├── contexts/          # React contexts (Auth, Toast)
│   │   ├── pages/             # Main page components
│   │   ├── utils/             # Utility functions and API client
│   │   ├── App.jsx            # Main app component
│   │   ├── main.jsx           # React entry point
│   │   └── index.css          # Global styles
│   ├── vite.config.js         # Vite configuration with PWA
│   └── package.json
├── server/                     # Node.js backend
│   ├── config/                # Database configuration
│   ├── controllers/           # Route controllers
│   ├── middleware/            # Custom middleware
│   ├── models/                # Mongoose models
│   ├── routes/                # API routes
│   ├── utils/                 # Utility functions
│   ├── server.js              # Express server setup
│   └── package.json
└── README.md                   # Project documentation
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Users (Admin only)
- `GET /api/users` - Get paginated users with filtering

### Team Members
- `GET /api/members` - Get all team members
- `POST /api/members` - Create team member (admin)
- `PUT /api/members/:id` - Update team member (admin)
- `DELETE /api/members/:id` - Delete team member (admin)

### Announcements
- `GET /api/announcements` - Get all announcements
- `POST /api/announcements` - Create announcement (admin)
- `PUT /api/announcements/:id` - Update announcement (admin)
- `DELETE /api/announcements/:id` - Delete announcement (admin)

### Study Materials
- `GET /api/materials` - Get all study materials
- `POST /api/materials` - Create material (admin)
- `PUT /api/materials/:id` - Update material (admin)
- `DELETE /api/materials/:id` - Delete material (admin)

## 🎨 Key Features Implemented

### Authentication Flow
- **No auto-login after registration** (as specifically requested)
- Secure JWT cookies with httpOnly flag
- Protected routes with role-based access
- Persistent login state management

### Responsive Design
- Mobile-first CSS approach
- Flexible grid layouts
- Touch-friendly interface
- Optimized for various screen sizes

### Admin Panel Features
- **Student Management**: Pagination, filtering by interests
- **Team Management**: Full CRUD with social media links
- **Content Management**: Announcements with priority levels
- **Resource Management**: Categorized study materials

### User Experience
- Toast notifications for user feedback
- Loading states and error handling
- Intuitive navigation with clear visual hierarchy
- Smooth animations and transitions

## 🔧 Development Commands

### Server Commands
```bash
npm run dev          # Start development server with nodemon
npm start           # Start production server
npm run seed        # Seed database with sample data
```

### Client Commands
```bash
npm run dev         # Start Vite development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run ESLint
```

## 🚀 Deployment

### Production Build
1. Build the client: `cd client && npm run build`
2. The server automatically serves the built frontend from `/dist`
3. Set environment variables for production
4. Start the server: `cd server && npm start`

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
PORT=5000
```

## 👥 Team Roles

### Student Role
- View announcements and study materials
- Manage personal profile
- Access dashboard features

### Admin Role
- All student permissions
- Manage team members
- Create/edit/delete announcements
- Manage study materials
- View student analytics

## 🛡️ Security Considerations

- Passwords hashed with bcryptjs
- JWT tokens stored in httpOnly cookies
- CORS configured for security
- Input validation on all endpoints
- Rate limiting on auth endpoints
- XSS protection with helmet
- SQL injection prevention with Mongoose

## 📱 PWA Features

- Service worker for offline functionality
- Web app manifest for installation
- Custom icons for different devices
- Splash screen configuration
- Cache strategies for API calls

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For any issues or questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Code Monk** - *Transforming Beginners into Experts!* 🚀

Built with ❤️ for the MCA coding community at NMAM Institute of Technology.
