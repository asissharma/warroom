# Database Seed Setup

## API Endpoint
`POST /api/seed` - Wipes entire database and seeds all collections in one go
`GET /api/seed` - Check current database counts

## What It Does

### 1. Wipes All Collections
- Questions
- TechSpine
- Projects
- Skills (soft + payable)
- SurvivalAreas
- Sessions
- GapTracker
- Captures
- Settings

### 2. Seeds from JSON Files

| Collection | Source File | Count |
|------------|-------------|-------|
| Questions | `data/questions.json` | 1,510 |
| TechSpine | `data/daily-plan.json` (spineArea) | ~150 |
| Projects | `data/daily-plan.json` (project) | ~150 |
| Soft Skills | `data/skills.json` (basic) | ~35 |
| Payable Skills | `data/daily-plan.json` (payable) | ~150 |
| Survival Areas | `data/survival-areas.json` | 10 areas |
| Settings | Default | 1 |

### 3. Models Created/Updated

- `SurvivalArea.ts` - New model for survival areas with topics
- `Settings.ts` - Updated with full schema (program config, gap thresholds, AI providers)
- `index.ts` - Central export for all models

## Usage

```bash
# Check current counts
curl http://localhost:3000/api/seed

# Wipe and seed everything
curl -X POST http://localhost:3000/api/seed
```

Or use a tool like Postman/Thunder Client to POST to `/api/seed`

## Required Environment Variables

```env
MONGODB_URI=mongodb+srv://...
```

## Response Example

```json
{
  "success": true,
  "message": "Database wiped and seeded successfully",
  "summary": {
    "wiped": { "questions": 0, "techSpine": 0, ... },
    "seeded": {
      "questions": 1510,
      "techSpine": 150,
      "projects": 150,
      "softSkills": 35,
      "payableSkills": 150,
      "survivalAreas": 10,
      "settings": 1
    },
    "total": 2096
  }
}
```
