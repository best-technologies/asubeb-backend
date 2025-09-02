# BigQuery Import API Documentation

## Base URL
```
http://localhost:4000/api/v1/admin/bigquery-import
```

## Endpoints

### 1. Test Connection
**GET** `/test-connection`

Tests the BigQuery connection.

**Response:**
```json
{
  "success": true,
  "message": "BigQuery connection successful",
  "connected": true
}
```

### 2. Import from BigQuery Table
**POST** `/import-from-table`

Imports data directly from a BigQuery table.

**Request Body:**
```json
{
  "datasetId": "asubeb_datasets",
  "tableId": "Asubeb_Primary_Data",
  "limit": 1000
}
```

**Response:**
```json
{
  "success": true,
  "message": "BigQuery data imported successfully",
  "data": {
    "totalRows": 1000,
    "processedRows": 1000,
    "createdSchools": 25,
    "createdLgas": 5,
    "createdStudents": 1000,
    "createdAssessments": 13000,
    "errors": []
  }
}
```

### 3. Import with Custom Query
**POST** `/import-with-query`

Imports data using a custom BigQuery SQL query.

**Request Body:**
```json
{
  "query": "SELECT LGA, `School Name`, `Student Name`, Class, Gender, `English Language`, Mathematics FROM `asubeb.asubeb_datasets.Asubeb_Primary_Data` LIMIT 100"
}
```

### 4. Import Raw Data
**POST** `/import`

Imports data from a manually provided array.

**Request Body:**
```json
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

### 5. Batch Import
**POST** `/import-batch`

Imports data in batches for large datasets.

**Request Body:**
```json
{
  "data": [...your data array...],
  "batchSize": 100
}
```

## Postman Examples

### Import All Data (No Limit)
```bash
POST http://localhost:4000/api/v1/admin/bigquery-import/import-from-table
Content-Type: application/json

{
  "datasetId": "asubeb_datasets",
  "tableId": "Asubeb_Primary_Data"
}
```

### Import with Limit
```bash
POST http://localhost:4000/api/v1/admin/bigquery-import/import-from-table
Content-Type: application/json

{
  "datasetId": "asubeb_datasets",
  "tableId": "Asubeb_Primary_Data",
  "limit": 1000
}
```

### Custom Query Example
```bash
POST http://localhost:4000/api/v1/admin/bigquery-import/import-with-query
Content-Type: application/json

{
  "query": "SELECT * FROM `asubeb.asubeb_datasets.Asubeb_Primary_Data` WHERE LGA = 'umuahia north'"
}
```

## Column Name Support

The API automatically handles both formats:
- `School Name` (with spaces)
- `school_name` (with underscores)
- `LGA` or `lga`
- `Student Name` or `student_name`
- `Class` or `class`
- `Gender` or `gender`

## What Gets Created

For each row imported:
- ✅ LGA (if not exists)
- ✅ School (if not exists)
- ✅ Class (if not exists)
- ✅ Student (if not exists)
- ✅ Session (2024/2025 - if not exists)
- ✅ Term (SECOND_TERM - if not exists)
- ✅ Subjects (if not exist)
- ✅ Assessments (for each subject score)
