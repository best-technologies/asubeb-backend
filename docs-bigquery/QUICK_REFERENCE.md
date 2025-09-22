# BigQuery Import - Quick Reference

## 🚀 Your Endpoints

**Base URL:** `http://localhost:4000/api/v1/admin/bigquery-import`

### 1. Test Connection ✅
```
GET /test-connection
```

### 2. Import All Data (Your Main Endpoint)
```
POST /import-from-table
Content-Type: application/json

{
  "datasetId": "asubeb_datasets",
  "tableId": "Asubeb_Primary_Data"
}
```

### 3. Import with Limit
```
POST /import-from-table
Content-Type: application/json

{
  "datasetId": "asubeb_datasets",
  "tableId": "Asubeb_Primary_Data",
  "limit": 1000
}
```

### 4. Custom Query
```
POST /import-with-query
Content-Type: application/json

{
  "query": "SELECT * FROM `asubeb.asubeb_datasets.Asubeb_Primary_Data`"
}
```

## 🎯 For Postman

**Method:** POST  
**URL:** `http://localhost:4000/api/v1/admin/bigquery-import/import-from-table`  
**Headers:** `Content-Type: application/json`  
**Body:**
```json
{
  "datasetId": "asubeb_datasets",
  "tableId": "Asubeb_Primary_Data"
}
```

## ✅ What Gets Created
- LGAs, Schools, Classes, Students
- Session (2024/2025), Term (SECOND_TERM)
- Subjects, Assessments for each score

