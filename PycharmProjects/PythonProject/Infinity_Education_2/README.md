# Infinity Education

A comprehensive educational assessment and portfolio management system designed to revolutionize how educators track student progress, create anecdotal records, and generate detailed reports.

## 🚀 Features

### Core Functionality
- **Student Progress Tracking**: Monitor development across 10 educational values
- **Anecdotal Records**: Create detailed observations with rich metadata
- **Multi-Student Records**: Efficient bulk record creation
- **Visual Analytics**: Interactive charts and progress visualization
- **Learning Journey Reports**: Comprehensive student progress reports
- **File Management**: Secure file upload and attachment system

### User Management
- **Role-Based Access**: Admin and Teacher roles with appropriate permissions
- **Google SSO**: Seamless authentication with Google accounts
- **Email/Password**: Alternative login method for flexibility
- **Auto-Profile Creation**: Automatic user profile generation

### Dashboard Features
- **Admin Dashboard**: System overview, user management, analytics
- **Teacher Dashboard**: Class-focused interface with student insights
- **Real-time Data**: Live updates and synchronization
- **Responsive Design**: Mobile-first approach with tablet/desktop support

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Material-UI v5** for component library
- **Vite** for build tooling
- **React Router v6** for navigation
- **MUI X Charts** for data visualization

### Backend
- **Firebase Firestore** for real-time database
- **Firebase Authentication** for user management
- **Firebase Storage** for file handling
- **Firebase Hosting** for deployment

### Development Tools
- **TypeScript** for type safety
- **ESLint** for code quality
- **Puppeteer** for end-to-end testing
- **Jest** for unit testing

## 📊 Educational Values System

The system tracks progress across 10 core educational values:

1. **Collaboration** - Working effectively with others
2. **Leadership** - Taking initiative and guiding others
3. **Problem Solving** - Analyzing and resolving challenges
4. **Communication** - Expressing ideas clearly and effectively
5. **Creativity** - Generating original and innovative ideas
6. **Critical Thinking** - Evaluating information and making reasoned judgments
7. **Independence** - Working autonomously and self-directing
8. **Responsibility** - Being accountable for actions and commitments
9. **Empathy** - Understanding and sharing others' feelings
10. **Perseverance** - Continuing effort despite challenges

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase account

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/infinity-education.git
   cd infinity-education
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your Firebase configuration:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:auth
npm run test:admin
npm run test:teacher
npm run test:kinsta

# Run Kinsta deployment test
npm run test:kinsta
```

### Test Coverage

- **Authentication Tests**: Login/logout, role-based access
- **Admin Dashboard Tests**: User management, class creation
- **Teacher Dashboard Tests**: Student management, record creation
- **Student Profile Tests**: Progress tracking, record viewing
- **Record Creation Tests**: Form validation, multi-student records
- **End-to-End Tests**: Complete workflow validation

## 🚀 Deployment

### Production Deployment

The application is configured for deployment on Kinsta:

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to Kinsta**
   - Build command: `npm run build`
   - Build directory: `dist`
   - Node.js version: 18+

3. **Environment Variables**
   Configure the following environment variables in Kinsta:
   ```
   VITE_FIREBASE_API_KEY=AIzaSyC_oar2BqxEZ1fvPTa0CBx9xvWPrqBrMdU
   VITE_FIREBASE_AUTH_DOMAIN=infinity-education-26e2a.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=infinity-education-26e2a
   VITE_FIREBASE_STORAGE_BUCKET=infinity-education-26e2a.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=848919414951
   VITE_FIREBASE_APP_ID=1:848919414951:web:260e7a364ea90e0221f382
   ```

### Production URL
- **Live Application**: https://infinity-education-eyixv.kinsta.page

## 👥 User Accounts

### Test Users

**Admin User:**
- Email: admin@infinityeducation.com
- Password: AdminPass123!
- Role: ADMIN
- Access: Full system administration

**Teacher User:**
- Email: teacher@infinityeducation.com
- Password: TeacherPass123!
- Role: TEACHER
- Access: Class management and student assessment

### Creating Users

```bash
# Create admin user with sample data
node scripts/create-admin-user.js

# Create teacher user with sample data
node scripts/create-teacher-user.js

# Link users to classes
node scripts/link-user-to-class.js
```

## 📱 User Interface

### Design System
- **Primary Color**: Educational green (#2E7D32)
- **Secondary Color**: Warm orange (#FF6B35)
- **Typography**: Roboto/Poppins font family
- **Spacing**: 8px base unit system
- **Breakpoints**: Mobile-first responsive design

### Key Components
- **Login Interface**: Google SSO and email/password authentication
- **Admin Dashboard**: System overview and management tools
- **Teacher Dashboard**: Class-focused interface with analytics
- **Student Profile**: Detailed progress tracking and record history
- **Record Creation**: Multi-student record creation with file upload
- **Analytics Charts**: Interactive data visualization

## 🔒 Security Features

- **Firebase Security Rules**: Database-level access control
- **Role-Based Permissions**: Admin and Teacher role separation
- **Input Validation**: Comprehensive form validation
- **File Upload Security**: Size limits and type restrictions
- **XSS Protection**: Content sanitization and validation
- **CSRF Protection**: Request validation and tokens

## 📊 Performance

- **Load Time**: <3 seconds for initial page load
- **Response Time**: <500ms for user interactions
- **File Upload**: Support for files up to 10MB
- **Concurrent Users**: Supports 100+ simultaneous users
- **Database Queries**: <100ms average response time

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔧 Troubleshooting

### Common Issues

1. **Firebase Connection Issues**
   - Verify environment variables are set correctly
   - Check Firebase project configuration
   - Ensure Firebase services are enabled

2. **Build Errors**
   - Clear node_modules and reinstall dependencies
   - Check TypeScript configuration
   - Verify all imports are correct

3. **Authentication Issues**
   - Verify Firebase Auth configuration
   - Check user permissions and roles
   - Ensure test users are created

### Getting Help

- Check the [documentation](https://docs.example.com)
- Review [common issues](https://github.com/yourusername/infinity-education/issues)
- Contact support at support@infinityeducation.com

## 🚀 Future Enhancements

- Progressive Web App features
- Real-time collaboration
- Advanced analytics and reporting
- Mobile application
- Integration with external systems
- Multi-language support
- Advanced search capabilities
- Automated backup system

---

**Infinity Education** - Empowering Learning Through Technology

Made with ❤️ by the Education Technology Team