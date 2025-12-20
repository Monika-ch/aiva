# Upload Endpoints - README

## 📁 File Upload System

The upload system handles three types of data uploads:

1. **Resume files** (PDF, DOCX, DOC)
2. **Multiple documents/images** (PDF, JPEG, PNG, GIF, WebP)
3. **LinkedIn data** (Profile URL or raw JSON data)

## 📂 Directory Structure

```
uploads/
└── {user_id}/
    ├── resumes/
    │   └── 20251218_143000_resume.pdf
    ├── documents/
    │   └── 20251218_143100_certificate.pdf
    ├── images/
    │   └── 20251218_143200_photo.jpg
    └── linkedin/
        └── linkedin_data_20251218_143300.json
```

## 🔒 Security Features

- ✅ Authentication required (all endpoints protected)
- ✅ File type validation
- ✅ File size limits (10MB resumes, 5MB images)
- ✅ User-specific directories (isolation)
- ✅ Unique filenames with timestamps

## 📋 Endpoints

### 1. Upload Resume

`POST /api/upload/resume`

**Request:**

- Form-data with `file` field
- Allowed: PDF, DOCX, DOC
- Max size: 10MB

**Response:**

```json
{
  "success": true,
  "message": "Resume uploaded successfully",
  "file_path": "uploads/1/resumes/20251218_143000_resume.pdf",
  "file_name": "resume.pdf",
  "file_type": "application/pdf",
  "file_size": 245678,
  "category": "resume"
}
```

### 2. Upload Documents/Images

`POST /api/upload/documents`

**Request:**

- Form-data with multiple `files` fields
- Allowed: PDF, DOCX, DOC, JPEG, PNG, GIF, WebP
- Max 10 files per request
- Max size: 10MB (docs), 5MB (images)

**Response:**

```json
[
  {
    "success": true,
    "message": "File uploaded successfully",
    "file_path": "uploads/1/images/20251218_143200_photo.jpg",
    "file_name": "photo.jpg",
    "file_type": "image/jpeg",
    "file_size": 123456,
    "category": "images"
  }
]
```

### 3. Upload LinkedIn Data

`POST /api/upload/linkedin`

**Request (URL):**

```json
{
  "profile_url": "https://www.linkedin.com/in/username"
}
```

**Request (Raw Data):**

```json
{
  "raw_data": "{\"name\": \"John Doe\", \"headline\": \"Software Engineer\"}"
}
```

**Response:**

```json
{
  "success": true,
  "message": "LinkedIn profile URL received. Will be processed by AI.",
  "profile_url": "https://www.linkedin.com/in/username",
  "data_source": "url"
}
```

### 4. List Uploads

`GET /api/upload/list?category=resumes`

**Response:**

```json
{
  "files": [
    {
      "file_name": "20251218_143000_resume.pdf",
      "category": "resumes",
      "file_size": 245678,
      "upload_date": "2025-12-18T14:30:00",
      "file_path": "uploads/1/resumes/20251218_143000_resume.pdf"
    }
  ],
  "total": 1,
  "user_id": 1
}
```

## 🧪 Testing in Swagger UI

1. **Authorize first** (use access token from login)

2. **Test Resume Upload:**
   - Go to `POST /api/upload/resume`
   - Click "Try it out"
   - Click "Choose File" and select a PDF/DOCX
   - Click "Execute"

3. **Test Multiple Files:**
   - Go to `POST /api/upload/documents`
   - Select multiple files
   - Click "Execute"

4. **Test LinkedIn:**
   - Go to `POST /api/upload/linkedin`
   - Paste LinkedIn URL in JSON body
   - Click "Execute"

5. **View Uploads:**
   - Go to `GET /api/upload/list`
   - Click "Execute" to see all files
   - Or add `?category=resumes` to filter

## ⚠️ Important Notes

- All endpoints require authentication
- Files are stored locally (in production, use cloud storage like S3)
- File parsing/AI processing will be implemented in next step
- LinkedIn URL validation is basic (full scraping needs external service)
- `.gitignore` already includes `uploads/` directory
