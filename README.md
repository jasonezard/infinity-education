# Infinity Education MVP

A comprehensive web application for student assessment, portfolio management, and report generation designed for educators.

## Features

### For Administrators
- **Class Management**: Create and manage classes, assign teachers
- **Student Enrollment**: Add students to appropriate classes
- **User Management**: Oversee all teachers and students in the system
- **System Overview**: View high-level analytics across all classes

### For Teachers
- **Dashboard**: Visual analytics showing evidence volume by educational values
- **Student Portfolio Management**: Track individual student progress
- **Multi-Student Record Creation**: Efficiently record observations for multiple students
- **Learning Journey Reports**: AI-generated comprehensive student reports
- **PDF Export**: Create informal update PDFs for quick parent communication
- **Skill Deep Dive**: Detailed analysis of specific educational values per student

### Core Functionality
- **Anecdotal Records**: Text-based observations with file attachments
- **Educational Values Tracking**: Collaboration, Leadership, Problem Solving, etc.
- **Assessment Types**: Formative and Summative assessments
- **Report Flagging**: Mark important observations for formal reports
- **Interactive Charts**: Pie charts for evidence breakdown, bar charts for class analytics

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **UI Framework**: Material-UI (MUI) v5
- **Database**: Google Firebase Firestore (NoSQL)
- **Authentication**: Firebase Authentication
- **File Storage**: Firebase Storage
- **Charts**: MUI X Charts
- **PDF Generation**: jsPDF
- **Backend Functions**: Python (Firebase Cloud Functions)
- **AI Integration**: OpenAI API (GPT-3.5)

## Project Structure

```
infinity-education/
├── src/
│   ├── components/          # React components
│   │   ├── AdminDashboard.tsx
│   │   ├── TeacherDashboard.tsx
│   │   ├── StudentProfile.tsx
│   │   ├── AddAnecdotalRecord.tsx
│   │   ├── SkillDeepDive.tsx
│   │   ├── LearningJourneyReport.tsx
│   │   ├── Login.tsx
│   │   └── Layout.tsx
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx
│   ├── services/            # Firebase services
│   │   └── firestore.ts
│   ├── config/              # Configuration files
│   │   └── firebase.ts
│   ├── types/               # TypeScript interfaces
│   │   └── index.ts
│   └── App.tsx
├── functions/               # Firebase Cloud Functions
│   ├── generate-report.py
│   └── requirements.txt
├── firestore.rules          # Firestore security rules
└── .env.example            # Environment variables template
```

## Setup Instructions

### Prerequisites
- Node.js 16 or higher
- Firebase account
- OpenAI API key (optional, for AI-generated reports)

### 1. Installation

```bash
# Clone the repository
cd infinity-education
npm install
```

### 2. Firebase Configuration

1. Create a new Firebase project at https://console.firebase.google.com
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Enable Storage
5. Copy your Firebase config from Project Settings

### 3. Environment Setup

```bash
# Copy the environment template
cp .env.example .env

# Edit .env with your Firebase configuration
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### 4. Firestore Security Rules

Deploy the security rules to your Firestore database:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init firestore

# Deploy security rules
firebase deploy --only firestore:rules
```

### 5. Cloud Functions (Optional)

For AI-powered Learning Journey reports:

```bash
# Navigate to functions directory
cd functions

# Install Python dependencies
pip install -r requirements.txt

# Set OpenAI API key
firebase functions:config:set openai.key="your_openai_api_key"

# Deploy functions
firebase deploy --only functions
```

### 6. Initial Data Setup

Create your first admin user:

1. Run the application: `npm start`
2. Register with email/password
3. Manually update the user document in Firestore to set `role: "ADMIN"`

## Usage

### Getting Started

1. **Admin Setup**: 
   - Create classes and assign teachers
   - Enroll students in appropriate classes

2. **Teacher Workflow**:
   - Access the teacher dashboard to view class analytics
   - Click on students to view individual profiles
   - Use "Add Record" to create multi-student observations
   - Generate Learning Journey reports for formal communication
   - Export PDFs for informal parent updates

3. **Data Entry**:
   - Record observations with educational value tags
   - Attach files (images, documents) as evidence
   - Flag important observations for formal reports
   - Choose between formative and summative assessment types

## Data Models

### Users Collection
```typescript
{
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'TEACHER';
}
```

### Classes Collection
```typescript
{
  id: string;
  name: string;
  teacherId: string;
}
```

### Students Collection
```typescript
{
  id: string;
  fullName: string;
  classId: string;
}
```

### Anecdotal Records Collection
```typescript
{
  id: string;
  studentId: string;
  authorId: string;
  note: string;
  valueTag: string;
  assessmentType: 'FORMATIVE' | 'SUMMATIVE';
  isFlaggedForReport: boolean;
  createdAt: Timestamp;
  fileUrl?: string;
}
```

## Educational Values

The system tracks these educational values:
- Collaboration
- Leadership
- Problem Solving
- Communication
- Creativity
- Critical Thinking
- Independence
- Responsibility
- Empathy
- Perseverance

## Security

- **Authentication**: Firebase Authentication with email/password
- **Authorization**: Role-based access control (Admin/Teacher)
- **Data Access**: Firestore security rules ensure teachers only access their students
- **File Security**: Firebase Storage with secure upload/download URLs

## Deployment

### Development
```bash
npm start
```

### Production Build
```bash
npm run build
firebase deploy --only hosting
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For technical support or feature requests, please create an issue in the repository.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for educators and students**
