# ResumeRAG - Resume Search & Job Matching System

A full-stack application for uploading, parsing, and matching resumes with job descriptions using AI-powered search.

## 🚀 Features

- **Resume Upload**: Upload PDF/DOCX files with automatic text extraction
- **AI-Powered Search**: Natural language queries to find candidates
- **Job Matching**: Automatic candidate-job matching with scoring
- **RESTful API**: Complete API with pagination, rate limiting, and authentication
- **Modern UI**: React frontend with Tailwind CSS

## 📋 Tech Stack

### Backend
- Django 5.2.7 + Django REST Framework
- SQLite database
- JWT authentication
- PDF/DOCX text extraction (pdfplumber, python-docx)
- Fuzzy text matching (rapidfuzz)
- Rate limiting & CORS support

### Frontend  
- React 18
- Tailwind CSS
- Axios for API calls
- React Router for navigation

## 🛠️ Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run migrations**
   ```bash
   python manage.py migrate
   ```

5. **Create superuser (admin/admin123)**
   ```bash
   python manage.py shell -c "from django.contrib.auth.models import User; User.objects.create_superuser('admin', 'admin@mail.com', 'admin123')"
   ```

6. **Start development server**
   ```bash
   python manage.py runserver 8000
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

The frontend will run on http://localhost:3000 and backend on http://localhost:8000.

## 🔑 Demo Credentials

- **Username**: `admin`
- **Password**: `admin123`
- **Email**: `admin@mail.com`

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login/` - Login with username/password
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/token/refresh/` - Refresh JWT token

### Resume Endpoints
- `GET /api/resumes/` - List resumes with pagination & search (?q=, ?limit=, ?offset=)
- `POST /api/resumes/` - Upload resume file (multipart/form-data)
- `GET /api/resumes/{id}/` - Get resume details

### Job Endpoints  
- `GET /api/jobs/` - List jobs with pagination
- `POST /api/jobs/` - Create new job
- `GET /api/jobs/{id}/` - Get job details
- `POST /api/jobs/{id}/match/` - Match candidates to job

### Query Endpoints
- `POST /api/ask/` - Natural language resume search

### Example Requests

**Login**
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

**Upload Resume**
```bash
curl -X POST http://localhost:8000/api/resumes/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@resume.pdf" \
  -F "name=John Doe" \
  -F "email=john@example.com"
```

**Search Resumes**
```bash
curl -X POST http://localhost:8000/api/ask/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "Python developers with machine learning experience", "k": 5}'
```

## 🧪 Testing

### API Testing
Visit http://localhost:3000/api-test to run connection tests.

### Manual Testing
1. Upload some resume files (PDF/DOCX)
2. Create job postings
3. Use natural language search: "Find React developers"
4. Test job matching functionality

## 🚨 Troubleshooting

### Common Issues

1. **Login failing**
   - Ensure Django backend is running on port 8000
   - Check browser console for CORS errors
   - Verify credentials: admin/admin123

2. **CORS errors**
   - Backend has CORS_ALLOW_ALL_ORIGINS = True for development
   - Make sure both servers are running

3. **File upload issues**
   - Check file size (should be < 10MB)
   - Ensure file format is PDF or DOCX
   - Verify media directory permissions

4. **Search not working**
   - Upload some resumes first
   - Try both "AI-Powered Query" and "Basic Filter" modes
   - Check if text extraction worked properly

### Debug Steps

1. **Check backend status**
   ```bash
   curl http://localhost:8000/
   ```

2. **Test login endpoint**
   ```bash
   curl -X POST http://localhost:8000/api/auth/login/ \
     -H "Content-Type: application/json" \
     -d '{"username": "admin", "password": "admin123"}'
   ```

3. **Check Django logs** in the terminal running the backend

4. **Use browser dev tools** to inspect network requests

## 🚀 Deployment

### Backend (Render)
1. Create new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `python manage.py migrate && python manage.py collectstatic --noinput && gunicorn resumerag_project.wsgi:application`
5. Add environment variables:
   - `PYTHON_VERSION=3.11.0`
   - `DEBUG=False`

### Frontend (Vercel)
1. Connect repository to Vercel
2. Set build command: `npm run build` 
3. Set output directory: `build`
4. Update API URL in `src/services/api.js` to your Render backend URL

## 🎯 Hackathon Features Implemented

✅ **POST /api/resumes** - Upload multiple resumes (multipart upload)  
✅ **GET /api/resumes** - Search resumes with pagination and ?q=  
✅ **GET /api/resumes/:id** - Get resume details  
✅ **POST /api/ask** - Natural language query with evidence snippets  
✅ **POST /api/jobs** - Create job descriptions  
✅ **GET /api/jobs/:id** - View job details  
✅ **POST /api/jobs/:id/match** - Find top matching resumes  

### Additional Features
✅ **Authentication** - JWT-based auth with refresh tokens  
✅ **Rate Limiting** - 60 requests/minute per user  
✅ **Idempotency** - Idempotency-Key header support  
✅ **Error Handling** - Uniform error format  
✅ **CORS** - Enabled for development  
✅ **Pagination** - ?limit= & ?offset= support  
✅ **File Processing** - PDF/DOCX text extraction  
✅ **Skills Extraction** - Automatic skill detection  
✅ **Job Matching** - Evidence-based candidate matching  

## 📊 Project Structure

```
ResumeRag/
├── backend/                 # Django REST API
│   ├── resumerag_project/  # Django project settings
│   ├── api/                # Main API app
│   │   ├── models.py       # Resume, Job, JobMatch models
│   │   ├── views.py        # API endpoints
│   │   ├── serializers.py  # DRF serializers
│   │   ├── utils.py        # Text extraction & matching
│   │   └── middleware.py   # Rate limiting
│   ├── requirements.txt    # Python dependencies
│   └── manage.py          # Django CLI
├── frontend/               # React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API service layer
│   │   └── App.js        # Main app component
│   ├── package.json      # Node dependencies
│   └── tailwind.config.js # Tailwind setup
└── README.md             # This file
```

## 🏆 Winning the Hackathon

This project demonstrates:
- **Full-stack development** with Django + React
- **AI-powered features** using text similarity
- **Production-ready code** with proper error handling
- **Modern UI/UX** with Tailwind CSS
- **Complete API** following REST principles
- **Deployment ready** for Render + Vercel

Perfect for showcasing technical skills in the Skillion Hackathon! 🎉

---

**Built for Skillion Full-Stack Hackathon 2025**  
*Resume Search & Job Matching Made Easy*