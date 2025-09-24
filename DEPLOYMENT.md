# Deployment Guide for Render.com

## Memory Optimization Fixes Applied

This guide addresses the JavaScript heap out of memory error you encountered during deployment on Render.com.

### Changes Made

#### 1. Package.json Scripts Updated
- **start**: Now uses `node --max-old-space-size=2048 dist/main`
- **start:prod**: Now uses `node --max-old-space-size=2048 dist/main`
- **build**: Now uses `node --max-old-space-size=2048` for NestJS build
- **build:render**: Optimized build command for Render deployment

#### 2. Memory Management
- Added `NODE_OPTIONS=--max-old-space-size=2048` environment variable
- Created `.nvmrc` and `.node-version` files for Node.js version consistency
- Added memory monitoring script (`npm run memory:check`)

#### 3. Application Optimizations
- **Swagger disabled in production** by default (can be enabled with `ENABLE_SWAGGER=true`)
- **Reduced logging** in production to save memory
- **Garbage collection** triggers in data processing services
- **Batch processing** optimizations for large datasets

#### 4. Render.com Configuration
- Created `render.yaml` with optimized settings
- Health check endpoint: `/api/v1/health`
- Memory-optimized build and start commands

### Deployment Steps

1. **Commit all changes**:
   ```bash
   git add .
   git commit -m "Fix memory issues for Render deployment"
   git push origin main
   ```

2. **Deploy to Render**:
   - The `render.yaml` file will automatically configure your service
   - Build command: `npm install && npm run build:render`
   - Start command: `npm run start:prod`

3. **Environment Variables** (set in Render dashboard):
   ```
   NODE_ENV=production
   NODE_OPTIONS=--max-old-space-size=2048
   DATABASE_URL=your_database_url
   # ... other required env vars
   ```

### Memory Usage Monitoring

Use the memory check script locally:
```bash
npm run memory:check
```

### Troubleshooting

If you still encounter memory issues:

1. **Increase memory limit** in package.json scripts:
   ```json
   "start": "node --max-old-space-size=4096 dist/main"
   ```

2. **Enable Swagger only when needed**:
   Set `ENABLE_SWAGGER=true` in environment variables

3. **Monitor memory usage** in Render logs

4. **Consider upgrading Render plan** if memory issues persist

### Key Files Modified

- `package.json` - Memory-optimized scripts
- `src/main.ts` - Swagger conditional loading, reduced logging
- `src/modules/admin/bigquery-import/bigquery-import.service.ts` - Garbage collection
- `render.yaml` - Render deployment configuration
- `.nvmrc` - Node.js version specification

### Expected Results

- ✅ No more "JavaScript heap out of memory" errors
- ✅ Successful deployment on Render.com
- ✅ Optimized memory usage during build and runtime
- ✅ Health check endpoint working at `/api/v1/health`
