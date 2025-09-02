# BigQuery Integration Setup Guide

## 🔧 **Answer to Your Concerns:**

### **1. BigQuery Connection Setup**

You have **3 options** to connect to BigQuery:

#### **Option A: Service Account Key File (Recommended for Development)**
1. Download your service account JSON key from Google Cloud Console
2. Place it in your project root (e.g., `service-account-key.json`)
3. Update your `.env` file:
```env
GOOGLE_CLOUD_KEY_FILENAME=service-account-key.json
GOOGLE_CLOUD_PROJECT_ID=your-project-id
```

#### **Option B: Environment Variables (Recommended for Production)**
Add to your `.env` file:
```env
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
BIGQUERY_LOCATION=US
```

#### **Option C: Default Credentials (If running on Google Cloud)**
No additional setup needed if running on Google Cloud Platform.

### **2. Column Name Handling**

**✅ NO PROBLEM!** Your column names like:
- `LGA`
- `School Name` 
- `Student Name`
- `Class`
- `Gender`

Are **fully supported**! The service automatically handles:
- **Case variations** (LGA, lga, Lga)
- **Space vs underscore** (School Name vs school_name)
- **Mixed formats** in the same dataset

## 🚀 **Available API Endpoints:**

### **1. Test Connection**
```bash
GET /api/v1/admin/bigquery-import/test-connection
```

### **2. Import from BigQuery Table**
```bash
POST /api/v1/admin/bigquery-import/import-from-table
Content-Type: application/json

{
  "datasetId": "your_dataset",
  "tableId": "your_table",
  "limit": 1000
}
```

### **3. Import with Custom Query**
```bash
POST /api/v1/admin/bigquery-import/import-with-query
Content-Type: application/json

{
  "query": "SELECT LGA, `School Name`, `Student Name`, Class, Gender, `English Language`, Mathematics FROM `project.dataset.table` WHERE LGA = 'umuahia north'"
}
```

### **4. Import Raw Data (Manual)**
```bash
POST /api/v1/admin/bigquery-import/import
Content-Type: application/json

[
  {
    "LGA": "umuahia north",
    "School Name": "Central Primary School",
    "Student Name": "John Doe",
    "Class": "Primary 5",
    "Gender": "Male",
    "English Language": 85,
    "Mathematics": 92
  }
]
```

## 📋 **Example BigQuery Queries:**

### **Basic Import**
```sql
SELECT 
  LGA,
  `School Name`,
  `Student Name`,
  Class,
  Gender,
  `English Language`,
  Mathematics,
  `Number work`,
  `General norms`,
  `Letter work`,
  Rhyme,
  `National values`,
  Prevocational,
  CRS,
  History,
  `Igbo Language`,
  CCA,
  `Basic science and technology`,
  `Total Score`
FROM `your-project.your-dataset.your-table`
LIMIT 1000
```

### **Filtered Import**
```sql
SELECT *
FROM `your-project.your-dataset.your-table`
WHERE LGA IN ('umuahia north', 'umuahia south')
  AND `School Name` LIKE '%Primary%'
ORDER BY `Total Score` DESC
```

### **Aggregated Data**
```sql
SELECT 
  LGA,
  `School Name`,
  Class,
  COUNT(*) as student_count,
  AVG(`Total Score`) as avg_score
FROM `your-project.your-dataset.your-table`
GROUP BY LGA, `School Name`, Class
```

## 🔐 **Security Notes:**

1. **Never commit** your service account key to version control
2. Use **environment variables** in production
3. **Restrict** service account permissions to only BigQuery access
4. **Rotate** keys regularly

## 🎯 **Next Steps:**

1. **Set up BigQuery credentials** using one of the options above
2. **Test connection**: `GET /api/v1/admin/bigquery-import/test-connection`
3. **Import your data**: Use any of the import endpoints
4. **Monitor logs** for import progress and any errors

## 📊 **What Gets Created:**

For each row in your BigQuery data:
- ✅ **LGA** (if not exists)
- ✅ **School** (if not exists) 
- ✅ **Class** (if not exists)
- ✅ **Student** (if not exists)
- ✅ **Session** (2024/2025 - if not exists)
- ✅ **Term** (SECOND_TERM - if not exists)
- ✅ **Subjects** (if not exist)
- ✅ **Assessments** (for each subject score)

**Your column name format is perfect and will work seamlessly!** 🎉
