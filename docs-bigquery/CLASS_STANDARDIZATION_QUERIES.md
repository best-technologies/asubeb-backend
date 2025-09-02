# BigQuery Class Name Standardization

## Problem
Classes in BigQuery have inconsistent naming:
- "Primary 1", "primary 1", "PRI 1", "Primary1", etc.
- This creates duplicate classes when imported

## Solution
Standardize class names in BigQuery before import.

## Step 1: View Current Class Variations

```sql
-- See all class name variations
SELECT 
  Class,
  COUNT(*) as count,
  COUNT(DISTINCT `School Name`) as school_count
FROM `your-project.your-dataset.your-table`
WHERE Class IS NOT NULL
GROUP BY Class
ORDER BY Class;
```

## Step 2: Create Standardized Class Names

```sql
-- Create a view with standardized class names
CREATE OR REPLACE VIEW `your-project.your-dataset.standardized_classes` AS
SELECT 
  *,
  CASE 
    -- Handle Primary classes (1-6)
    WHEN REGEXP_CONTAINS(UPPER(Class), r'PRIMARY\s*1|PRI\s*1|P1') THEN 'primary-1'
    WHEN REGEXP_CONTAINS(UPPER(Class), r'PRIMARY\s*2|PRI\s*2|P2') THEN 'primary-2'
    WHEN REGEXP_CONTAINS(UPPER(Class), r'PRIMARY\s*3|PRI\s*3|P3') THEN 'primary-3'
    WHEN REGEXP_CONTAINS(UPPER(Class), r'PRIMARY\s*4|PRI\s*4|P4') THEN 'primary-4'
    WHEN REGEXP_CONTAINS(UPPER(Class), r'PRIMARY\s*5|PRI\s*5|P5') THEN 'primary-5'
    WHEN REGEXP_CONTAINS(UPPER(Class), r'PRIMARY\s*6|PRI\s*6|P6') THEN 'primary-6'
    
    -- Handle other variations
    WHEN REGEXP_CONTAINS(UPPER(Class), r'NURSERY|NUR') THEN 'nursery'
    WHEN REGEXP_CONTAINS(UPPER(Class), r'KG|KINDERGARTEN') THEN 'kindergarten'
    
    -- Keep original if no match
    ELSE LOWER(TRIM(Class))
  END as standardized_class
FROM `your-project.your-dataset.your-table`;
```

## Step 3: Preview Standardized Results

```sql
-- Preview the standardized classes
SELECT 
  Class as original_class,
  standardized_class,
  COUNT(*) as count
FROM `your-project.your-dataset.standardized_classes`
GROUP BY Class, standardized_class
ORDER BY standardized_class, Class;
```

## Step 4: Create Final Table with Standardized Classes

```sql
-- Create final table with standardized class names
CREATE OR REPLACE TABLE `your-project.your-dataset.clean_student_data` AS
SELECT 
  `School Name`,
  LGA,
  `Student Name`,
  standardized_class as Class,  -- Use standardized class name
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
FROM `your-project.your-dataset.standardized_classes`;
```

## Step 5: Verify Results

```sql
-- Check final standardized classes
SELECT 
  Class,
  COUNT(*) as student_count,
  COUNT(DISTINCT `School Name`) as school_count
FROM `your-project.your-dataset.clean_student_data`
GROUP BY Class
ORDER BY Class;
```

## Alternative: Update Original Table

If you prefer to update the original table:

```sql
-- Update the original table (be careful!)
UPDATE `your-project.your-dataset.your-table`
SET Class = CASE 
  WHEN REGEXP_CONTAINS(UPPER(Class), r'PRIMARY\s*1|PRI\s*1|P1') THEN 'primary-1'
  WHEN REGEXP_CONTAINS(UPPER(Class), r'PRIMARY\s*2|PRI\s*2|P2') THEN 'primary-2'
  WHEN REGEXP_CONTAINS(UPPER(Class), r'PRIMARY\s*3|PRI\s*3|P3') THEN 'primary-3'
  WHEN REGEXP_CONTAINS(UPPER(Class), r'PRIMARY\s*4|PRI\s*4|P4') THEN 'primary-4'
  WHEN REGEXP_CONTAINS(UPPER(Class), r'PRIMARY\s*5|PRI\s*5|P5') THEN 'primary-5'
  WHEN REGEXP_CONTAINS(UPPER(Class), r'PRIMARY\s*6|PRI\s*6|P6') THEN 'primary-6'
  ELSE LOWER(TRIM(Class))
END
WHERE Class IS NOT NULL;
```

## Usage Instructions

1. **Replace placeholders** in the queries:
   - `your-project` → Your Google Cloud Project ID
   - `your-dataset` → Your BigQuery dataset name
   - `your-table` → Your table name

2. **Run Step 1** to see current variations
3. **Run Step 2** to create the view
4. **Run Step 3** to preview results
5. **Run Step 4** to create clean data
6. **Run Step 5** to verify
7. **Import from the clean table** instead of the original

This approach ensures clean, consistent class names before import!
