import json
import math

# Load all data files
with open('data/projects.json', 'r', encoding='utf-8') as f:
    projects = json.load(f)
with open('data/tech-spine.json', 'r', encoding='utf-8') as f:
    spine = json.load(f)
with open('data/skills.json', 'r', encoding='utf-8') as f:
    skills = json.load(f)
with open('data/questions.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

basic_skills = skills.get('basic', [])
payable_skills = skills.get('payable', [])

# Map spine areas to themes
theme_mapping = {
    "Python Mastery & Secure Coding": "Security",
    "Linux Internals & Scripting Mastery": "DevOps",
    "Computer Networks, Protocols & Security Patterns": "Networking",
    "Identity & Access Management (IAM) Deep Dive": "Security",
    "System Design & Microservices Architecture": "System Design",
    "Containerization & Orchestration Deep Dive": "DevOps",
    "Cloud Native Architecture & Scaling": "System Design",
    "Automation & Tooling Creation": "DevOps",
    "Performance Optimization & Debugging": "Performance",
    "High-Concurrency & Distributed Systems": "Concurrency",
    "Web Security & API Hardening": "API Design",
    "Databases & Data Engineering Deep Dive": "Databases",
    "Cryptography & Zero Trust Architecture": "Security",
    "Observability & SRE Fundamentals": "Debugging",
    "Applied Machine Learning & MLOps": "ML/AI",
    "Advanced Algorithms & Data Structures": "Performance",
    "Frontend Ecosystem & Advanced UI": "System Design",
    "Backend Frameworks Deep Dive": "API Design",
    "Software Architecture Patterns": "System Design",
    "Cloud Security & Compliance": "Security",
    "Advanced Data Engineering & Pipelines": "Databases",
    "Capstone Project Integration & Testing": "System Design"
}

# Distribute 180 days across 22 areas
# 180 / 22 = 8.18 days per area. We'll assign exactly 8 days to the first 21, and the rest to the last.
area_days = [8] * 21 + [180 - (8 * 21)]

daily_plan = []
theme_offsets = {theme: 0 for theme in set(theme_mapping.values())}

area_idx = 0
days_in_current_area = 0

for day in range(1, 181):
    day_idx = day - 1
    
    # 1. Project
    if day <= 150:
        proj = projects[day_idx] if day_idx < len(projects) else projects[-1]
        p_obj = {
            "name": proj["name"],
            "category": proj.get("category", ""),
            "doneMeans": proj.get("doneMeans", "A working implementation.")
        }
        phase = proj.get("phase", "Foundation")
    else:
        p_obj = None
        phase = "Integration"
        
    # 2. Spine Area
    if days_in_current_area >= area_days[area_idx]:
        area_idx = min(area_idx + 1, len(spine) - 1)
        days_in_current_area = 0
        
    current_area = spine[area_idx]
    days_in_current_area += 1
    
    theme = theme_mapping.get(current_area["area"], "System Design")
    
    # 4. Basic Skill
    b_skill = basic_skills[day_idx % len(basic_skills)] if basic_skills else ""
    
    # 5. Payable Skill
    p_skill = None
    for p in payable_skills:
        if p.get("dayStart", 0) <= day <= p.get("dayEnd", 180):
            p_skill = {
                "name": p.get("name", ""),
                "book": p.get("coreBooks", ["Industry standard book"])[0] if p.get("coreBooks") else "Standard book",
                "dailyTask": "Read 10 pages or practice one micro-exercise."
            }
            break
            
    is_review = (day % 7 == 0)
    is_checkpoint = (day % 30 == 0)
    
    day_obj = {
        "day": day,
        "phase": phase,
        "reviewDay": is_review,
        "checkpointDay": is_checkpoint
    }
    
    if is_review:
        day_obj["reviewNote"] = "Look at projects from this week. Fix the weakest one. Answer your 3 hardest questions cold. Write 3 honest sentences about what is stronger and what is still pretend."
        # Review days have null tasks
        day_obj["project"] = None
        day_obj["spineArea"] = None
        day_obj["questionTheme"] = None
        day_obj["questionOffset"] = None
        day_obj["basicSkill"] = None
        day_obj["payable"] = None
    else:
        day_obj["project"] = p_obj
        
        # Pick topic and microtask cyclically based on days in area
        topic_idx = (days_in_current_area - 1) % max(1, len(current_area.get("topics", ["Standard Topic"])))
        micro_idx = (days_in_current_area - 1) % max(1, len(current_area.get("microtasks", ["Implement feature"])))
        
        day_obj["spineArea"] = {
            "area": current_area["area"],
            "topicToday": current_area.get("topics", ["Standard Topic"])[topic_idx] if current_area.get("topics") else "Standard Topic",
            "microtaskToday": current_area.get("microtasks", ["Implement feature"])[micro_idx] if current_area.get("microtasks") else "Implement feature"
        }
        
        day_obj["questionTheme"] = theme
        day_obj["questionOffset"] = theme_offsets[theme]
        theme_offsets[theme] += 3
        
        day_obj["basicSkill"] = b_skill
        day_obj["payable"] = p_skill
        
    day_obj["checkpointNote"] = None
    if is_checkpoint:
        day_obj["checkpointNote"] = {
            "phaseCompleted": phase,
            "projectsRange": f"D{day - 29}–D{day}",
            "selfAssessQuestions": [
                "What can you build today that you couldn't 30 days ago?",
                "What still feels like theory with no hands-on proof?",
                "What did you compress or skip that will hurt you later?"
            ],
            "recoveryPath": {
                "cut": ["specific things that can be deferred"],
                "keepNomatterWhat": ["non-negotiable core items"],
                "minimumViable": "one sentence describing the compressed path"
            }
        }
        
    daily_plan.append(day_obj)

with open('data/daily-plan.json', 'w', encoding='utf-8') as f:
    json.dump(daily_plan, f, indent=2)

print(f"✓ daily-plan.json: {len(daily_plan)} days")
print("Theme mapping used:")
for area, theme in theme_mapping.items():
    print(f"  {area} -> {theme}")
print("PROMPT 2 COMPLETE. READY FOR PROMPT 3.")
