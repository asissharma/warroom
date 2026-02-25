import pandas as pd
import json
import re

# 1. projects.json
# Source: PROJECT_DANCE_150_MASTER_TRACKER .xlsx -> "Master Tracker"
df_proj = pd.read_excel('files_to_be_analysed/PROJECT_DANCE_150_MASTER_TRACKER .xlsx', sheet_name='Master Tracker')
projects = []
for i, row in df_proj.iterrows():
    if pd.isna(row.get('Day')):
        continue
    day = int(row.get('Day', 0))
    if 1 <= day <= 150:
        projects.append({
            "day": day,
            "phase": str(row.get('Phase', row.get('Category', ''))).split('-')[0].strip() if pd.notna(row.get('Phase')) or pd.notna(row.get('Category')) else "Foundation", # Adjust based on actual columns
            "category": str(row.get('Category', '')).strip() if pd.notna(row.get('Category')) else "",
            "name": str(row.get('Objective/Task Name', row.get('Task', ''))).strip() if pd.notna(row.get('Objective/Task Name')) or pd.notna(row.get('Task')) else "",
            "doneMeans": str(row.get('Done Means', '')).strip() if pd.notna(row.get('Done Means')) else "System works and is verified."
        })
        
with open('data/projects.json', 'w', encoding='utf-8') as f:
    json.dump(projects, f, indent=2)

# 2. tech-spine.json
# Source: tech smith.csv
df_tech = pd.read_csv('files_to_be_analysed/tech smith.csv')
spine = []
for i, row in df_tech.iterrows():
    # Expecting: 22 objects. weekStart/weekEnd: 180 days / 22 areas is ~8 days per area. Weeks are 7 days. Thus ~1 week each.
    week_idx = i + 1
    spine.append({
        "id": int(i + 1),
        "area": str(row.get('Focus Area', '')).strip() if pd.notna(row.get('Focus Area')) else f"Area {i+1}",
        "phase": "Foundation", # Mapping will need refinement
        "weekStart": week_idx,
        "weekEnd": week_idx + 1 if week_idx < 22 else 26, # Need to fit 26 weeks
        "topics": [t.strip() for t in str(row.get('Topics', '')).split(',') if t.strip()] if pd.notna(row.get('Topics')) else [],
        "microtasks": [m.strip() for m in str(row.get('Microtasks', '')).split('|') if m.strip()] if pd.notna(row.get('Microtasks')) else [],
        "resource": str(row.get('Resource', '')).strip() if pd.notna(row.get('Resource')) else "Official Docs"
    })

with open('data/tech-spine.json', 'w', encoding='utf-8') as f:
    json.dump(spine, f, indent=2)

# 3. skills.json
df_basic = pd.read_csv('files_to_be_analysed/basic Skills.csv')
basic_skills = df_basic.iloc[:, 0].dropna().unique().tolist()
basic_skills = [s.strip() for s in basic_skills if s.strip()]

df_payable = pd.read_csv('files_to_be_analysed/Payable Skills.csv')
payable_syllabi = df_payable['Syllabus'].dropna().unique().tolist()
payable_syllabi = [s.strip() for s in payable_syllabi if s.strip()]

payable = []
for i, s in enumerate(payable_syllabi[:10]):
    dayStart = i * 18 + 1
    dayEnd = (i + 1) * 18
    payable.append({
        "name": s,
        "dayStart": dayStart,
        "dayEnd": dayEnd,
        "coreBooks": [
            "Book 1", "Book 2", "Book 3" # Placeholder, let me refine this later
        ]
    })
    
with open('data/skills.json', 'w', encoding='utf-8') as f:
    json.dump({"basic": basic_skills, "payable": payable}, f, indent=2)
