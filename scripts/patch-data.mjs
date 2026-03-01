/**
 * INTEL·OS — Phase 3 Data Patch Script
 * Run: node scripts/patch-data.mjs
 *
 * Patches:
 *  1. tech-spine.json  — propagate real area names (fix "nan")
 *  2. questions.json   — add difficulty: 1/2/3 sequenced easy→hard
 *  3. skills.json      — fix \n artifacts in basic skills; add real book titles
 *  4. survival-areas.json — add urgency field; restructure resources
 *  5. courses.json     — full rebuild with real course names & areas
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');

function write(filename, data) {
    const dest = path.join(dataDir, filename);
    fs.writeFileSync(dest, JSON.stringify(data, null, 2), 'utf8');
    console.log(`✅ Patched: ${filename}`);
}

// ─────────────────────────────────────────────
// 1. PATCH tech-spine.json — fix "nan" areas
// ─────────────────────────────────────────────
{
    const raw = JSON.parse(fs.readFileSync(path.join(dataDir, 'tech-spine.json'), 'utf8'));
    let lastRealArea = '';
    const patched = raw.map(entry => {
        if (entry.area && entry.area !== 'nan') {
            lastRealArea = entry.area;
        }
        return { ...entry, area: lastRealArea || 'General Topic' };
    });
    write('tech-spine.json', patched);
}

// ─────────────────────────────────────────────
// 2. PATCH questions.json — add difficulty 1→2→3 sequenced
//    First 33% of questions = difficulty 1 (easy / foundational)
//    Middle 33%             = difficulty 2 (medium / applied)
//    Final 33%              = difficulty 3 (hard / advanced design)
// ─────────────────────────────────────────────
{
    const raw = JSON.parse(fs.readFileSync(path.join(dataDir, 'questions.json'), 'utf8'));
    const total = raw.length;
    const third = Math.floor(total / 3);
    const patched = raw.map((q, i) => {
        const difficulty = i < third ? 1 : i < third * 2 ? 2 : 3;
        return { ...q, difficulty };
    });
    write('questions.json', patched);
}

// ─────────────────────────────────────────────
// 3. PATCH skills.json — fix \n artifacts + real book titles
// ─────────────────────────────────────────────
{
    const raw = JSON.parse(fs.readFileSync(path.join(dataDir, 'skills.json'), 'utf8'));

    // Fix basic skill name formatting artifacts
    const fixedBasic = raw.basic.map(s =>
        s.replace(/\n\s*/g, ' ').replace(/\u2011/g, '-').trim()
    );

    // Real payable book titles
    const realPayables = [
        {
            name: "Sales Negotiation Mastery",
            dayStart: 1, dayEnd: 18,
            coreBooks: [
                "Never Split the Difference — Chris Voss",
                "Getting to Yes — Fisher & Ury"
            ],
            microPractice: "Practice one negotiation tactic in today's conversation — anchor first, then listen."
        },
        {
            name: "Human Nature",
            dayStart: 19, dayEnd: 36,
            coreBooks: [
                "The Laws of Human Nature — Robert Greene",
                "Thinking, Fast and Slow — Daniel Kahneman"
            ],
            microPractice: "Observe one person today and identify one cognitive bias they display."
        },
        {
            name: "Emotional Intelligence",
            dayStart: 37, dayEnd: 54,
            coreBooks: [
                "Emotional Intelligence 2.0 — Bradberry & Greaves",
                "The Emotional Brain — Joseph LeDoux"
            ],
            microPractice: "Name three emotions you felt today and what triggered each."
        },
        {
            name: "Critical Thinking",
            dayStart: 55, dayEnd: 72,
            coreBooks: [
                "Thinking in Systems — Donella Meadows",
                "The Art of Thinking Clearly — Rolf Dobelli"
            ],
            microPractice: "Take one assumption you hold and argue the opposite position for 3 minutes."
        },
        {
            name: "Effective Communication",
            dayStart: 73, dayEnd: 90,
            coreBooks: [
                "Crucial Conversations — Patterson, Grenny et al.",
                "Simply Said — Jay Sullivan"
            ],
            microPractice: "Before your next message, write one sentence on what you want the reader to DO after reading it."
        },
        {
            name: "Time Management",
            dayStart: 91, dayEnd: 108,
            coreBooks: [
                "Deep Work — Cal Newport",
                "The One Thing — Gary Keller"
            ],
            microPractice: "Write your top 3 outcomes for tomorrow before you sleep. Nothing else counts."
        },
        {
            name: "Problem Solving",
            dayStart: 109, dayEnd: 126,
            coreBooks: [
                "How to Solve It — George Pólya",
                "Algorithms to Live By — Brian Christian"
            ],
            microPractice: "Pick one open problem you have. Write the real root cause in one sentence — not the symptom."
        },
        {
            name: "Creativity and Innovation",
            dayStart: 127, dayEnd: 144,
            coreBooks: [
                "Steal Like an Artist — Austin Kleon",
                "A Technique for Producing Ideas — James Webb Young"
            ],
            microPractice: "Combine two unrelated concepts and write three ways they could intersect in your work."
        },
        {
            name: "Mental Resilience",
            dayStart: 145, dayEnd: 162,
            coreBooks: [
                "Can't Hurt Me — David Goggins",
                "The Obstacle Is the Way — Ryan Holiday"
            ],
            microPractice: "Deliberately do one uncomfortable thing today — cold exposure, a hard conversation, or a task you've been avoiding."
        },
        {
            name: "Money Management",
            dayStart: 163, dayEnd: 180,
            coreBooks: [
                "The Psychology of Money — Morgan Housel",
                "I Will Teach You to Be Rich — Ramit Sethi"
            ],
            microPractice: "Review last week's spending in 5 minutes. Identify one thing to cut and one to increase."
        }
    ];

    write('skills.json', { basic: fixedBasic, payable: realPayables });
}

// ─────────────────────────────────────────────
// 4. PATCH survival-areas.json — add urgency, restructure resources
// ─────────────────────────────────────────────
{
    const patched = [
        {
            id: 1,
            area: "System Design",
            urgency: "CRITICAL",
            why: "AI can write a function — it cannot decide Kafka vs RabbitMQ for your throughput",
            topics: [
                "CAP theorem, consistency models, partitioning",
                "Message queues: Kafka, RabbitMQ, SQS decision criteria",
                "Database selection: SQL vs NoSQL vs time-series",
                "Caching: write-through, write-back, cache-aside, invalidation",
                "Load balancing, rate limiting, circuit breaker patterns"
            ],
            resources: [
                { name: "Designing Data-Intensive Applications", author: "Martin Kleppmann", free: false, url: "https://dataintensive.net" },
                { name: "System Design Primer", author: "donnemartin", free: true, url: "https://github.com/donnemartin/system-design-primer" },
                { name: "Google SRE Book", author: "Google", free: true, url: "https://sre.google/sre-book/table-of-contents/" }
            ],
            spineConnection: "Databases & Distributed Systems (D31–D50)"
        },
        {
            id: 2,
            area: "Model Training & Fine-Tuning Basics",
            urgency: "HIGH",
            why: "You don't need a PhD in ML, but you must know how to adapt existing models to new data.",
            topics: [
                "Transfer learning",
                "LoRA and QLoRA fine-tuning",
                "HuggingFace basics (datasets, trainers, tokenizers)",
                "Data preparation and quality evaluation"
            ],
            resources: [
                { name: "fast.ai Practical Deep Learning", author: "Jeremy Howard", free: true, url: "https://course.fast.ai" },
                { name: "HuggingFace NLP Course", author: "HuggingFace", free: true, url: "https://huggingface.co/learn/nlp-course" }
            ],
            spineConnection: "ML/AI Phase (D91–D110)"
        },
        {
            id: 3,
            area: "Distributed Tracing & Observability",
            urgency: "HIGH",
            why: "When a microservice fails in production, AI can't figure out which of 50 services caused it — you have to.",
            topics: [
                "OpenTelemetry: traces, metrics, logs",
                "Prometheus & Grafana — metric pipelines",
                "Log aggregation (ELK / Loki)",
                "Distributed tracing with Jaeger / Tempo"
            ],
            resources: [
                { name: "Datadog Learning Center", author: "Datadog", free: true, url: "https://learn.datadoghq.com" },
                { name: "OpenTelemetry Documentation", author: "CNCF", free: true, url: "https://opentelemetry.io/docs/" }
            ],
            spineConnection: "Observability (D36–D40)"
        },
        {
            id: 4,
            area: "Advanced Security & Cryptography",
            urgency: "CRITICAL",
            why: "AI writes insecure code constantly. You need to verify its outputs and architect secure systems.",
            topics: [
                "OAuth2 / OIDC — authorization flows",
                "JWTs and session management",
                "Encryption at rest and in transit",
                "Zero-trust architecture principles"
            ],
            resources: [
                { name: "OWASP Top 10", author: "OWASP", free: true, url: "https://owasp.org/www-project-top-ten/" },
                { name: "Crypto 101", author: "lvh", free: true, url: "https://www.crypto101.io" }
            ],
            spineConnection: "Security Phase (D71–D90)"
        },
        {
            id: 5,
            area: "Cloud Infrastructure & FinOps",
            urgency: "HIGH",
            why: "AI can deploy code but will happily spin up $10,000/month of resources. You need to optimize.",
            topics: [
                "Terraform / IaC — infrastructure as code",
                "AWS / GCP cost optimization patterns",
                "Serverless vs Containers — decision criteria",
                "Autoscaling policies and spot instance strategies"
            ],
            resources: [
                { name: "AWS Well-Architected Framework", author: "AWS", free: true, url: "https://aws.amazon.com/architecture/well-architected/" },
                { name: "HashiCorp Terraform Tutorials", author: "HashiCorp", free: true, url: "https://developer.hashicorp.com/terraform/tutorials" }
            ],
            spineConnection: "Cloud Phase (D51–D70)"
        },
        {
            id: 6,
            area: "High-Performance Data Engineering",
            urgency: "MEDIUM",
            why: "Data pipelines are the backbone of modern apps. You need to move TBs of data efficiently.",
            topics: [
                "Batch vs Stream processing trade-offs",
                "Apache Spark / Flink fundamentals",
                "Data warehouses: Snowflake, BigQuery, Redshift",
                "ETL / ELT pipeline design"
            ],
            resources: [
                { name: "The Data Engineering Cookbook", author: "Andreas Kretz", free: true, url: "https://github.com/andkret/Cookbook" }
            ],
            spineConnection: "Databases Phase (D51–D70)"
        },
        {
            id: 7,
            area: "Developer Productivity Automation",
            urgency: "HIGH",
            why: "You must build the tools that orchestrate AI agents for your team's workflow.",
            topics: [
                "CI/CD pipelines — GitHub Actions, ArgoCD",
                "Custom CLI tools and developer experience",
                "Agentic orchestration patterns",
                "Code review automation and quality gates"
            ],
            resources: [
                { name: "GitHub Actions Documentation", author: "GitHub", free: true, url: "https://docs.github.com/en/actions" }
            ],
            spineConnection: "CLI & Automation (D1–D10)"
        }
    ];
    write('survival-areas.json', patched);
}

// ─────────────────────────────────────────────
// 5. REBUILD courses.json — real course names, real areas
// ─────────────────────────────────────────────
{
    const courses = [
        // System Design & Architecture
        { id: 1, name: "System Design Primer", provider: "donnemartin (GitHub)", area: "System Design", url: "https://github.com/donnemartin/system-design-primer", weekRecommended: 5 },
        { id: 2, name: "Grokking the System Design Interview", provider: "Educative", area: "System Design", url: "https://www.educative.io/courses/grokking-the-system-design-interview", weekRecommended: 6 },
        { id: 3, name: "MIT 6.824 Distributed Systems (Lectures)", provider: "MIT OpenCourseWare", area: "System Design", url: "https://pdos.csail.mit.edu/6.824/", weekRecommended: 7 },

        // Python & Secure Coding
        { id: 4, name: "Python for Everybody", provider: "University of Michigan / Coursera", area: "Python", url: "https://www.coursera.org/specializations/python", weekRecommended: 1 },
        { id: 5, name: "Real Python — Async IO in Python", provider: "Real Python", area: "Python", url: "https://realpython.com/async-io-python/", weekRecommended: 2 },
        { id: 6, name: "Python Security (OWASP)", provider: "OWASP", area: "Python", url: "https://owasp.org/www-project-python-security/", weekRecommended: 3 },

        // Data Structures & Algorithms
        { id: 7, name: "Algorithms Specialization", provider: "Stanford / Coursera", area: "Algorithms", url: "https://www.coursera.org/specializations/algorithms", weekRecommended: 9 },
        { id: 8, name: "LeetCode Study Plan — Algorithm I", provider: "LeetCode", area: "Algorithms", url: "https://leetcode.com/study-plan/algorithm/", weekRecommended: 10 },
        { id: 9, name: "Data Structures (UC San Diego)", provider: "UCSD / Coursera", area: "Algorithms", url: "https://www.coursera.org/learn/data-structures", weekRecommended: 9 },

        // Databases
        { id: 10, name: "CMU 15-445 Database Systems (Lectures)", provider: "Carnegie Mellon", area: "Databases", url: "https://15445.courses.cs.cmu.edu/", weekRecommended: 20 },
        { id: 11, name: "MongoDB University — M101JS", provider: "MongoDB", area: "Databases", url: "https://learn.mongodb.com/", weekRecommended: 21 },
        { id: 12, name: "Redis University — RU101", provider: "Redis", area: "Databases", url: "https://university.redis.com/courses/ru101/", weekRecommended: 22 },
        { id: 13, name: "Intro to SQL (Mode Analytics)", provider: "Mode", area: "Databases", url: "https://mode.com/sql-tutorial/", weekRecommended: 19 },

        // Distributed Systems
        { id: 14, name: "Designing Data-Intensive Applications (Summary)", provider: "Book companion site", area: "Distributed Systems", url: "https://dataintensive.net/", weekRecommended: 5 },
        { id: 15, name: "Kafka Fundamentals", provider: "Confluent", area: "Distributed Systems", url: "https://developer.confluent.io/courses/apache-kafka/events/", weekRecommended: 19 },
        { id: 16, name: "Patterns of Distributed Systems", provider: "Martin Fowler Blog", area: "Distributed Systems", url: "https://martinfowler.com/articles/patterns-of-distributed-systems/", weekRecommended: 6 },

        // Cloud & DevOps
        { id: 17, name: "AWS Cloud Practitioner Essentials", provider: "AWS Skill Builder", area: "Cloud", url: "https://explore.skillbuilder.aws/learn/course/134/aws-cloud-practitioner-essentials", weekRecommended: 8 },
        { id: 18, name: "Google Cloud Associate Cloud Engineer Path", provider: "Google Cloud Skills Boost", area: "Cloud", url: "https://www.cloudskillsboost.google/paths/118", weekRecommended: 9 },
        { id: 19, name: "HashiCorp Terraform Tutorials", provider: "HashiCorp", area: "Cloud", url: "https://developer.hashicorp.com/terraform/tutorials", weekRecommended: 10 },
        { id: 20, name: "Docker & Kubernetes: The Practical Guide", provider: "Academind / Udemy", area: "Cloud", url: "https://www.udemy.com/course/docker-kubernetes-the-practical-guide/", weekRecommended: 8 },
        { id: 21, name: "Introduction to Kubernetes (LFS158)", provider: "Linux Foundation", area: "Cloud", url: "https://training.linuxfoundation.org/training/introduction-to-kubernetes/", weekRecommended: 9 },
        { id: 22, name: "GitHub Actions — Official Docs", provider: "GitHub", area: "Cloud", url: "https://docs.github.com/en/actions", weekRecommended: 2 },

        // Security
        { id: 23, name: "OWASP Top 10 — Official Training", provider: "OWASP", area: "Security", url: "https://owasp.org/www-project-top-ten/", weekRecommended: 11 },
        { id: 24, name: "web.dev — Security Module", provider: "Google", area: "Security", url: "https://web.dev/secure/", weekRecommended: 11 },
        { id: 25, name: "Snyk Learn — Developer Security", provider: "Snyk", area: "Security", url: "https://learn.snyk.io/", weekRecommended: 12 },
        { id: 26, name: "Cryptography I (Stanford)", provider: "Stanford / Coursera", area: "Security", url: "https://www.coursera.org/learn/crypto", weekRecommended: 13 },
        { id: 27, name: "Developing Secure Software (LFD121)", provider: "Linux Foundation", area: "Security", url: "https://training.linuxfoundation.org/training/developing-secure-software-lfd121/", weekRecommended: 12 },

        // Observability & Performance
        { id: 28, name: "Datadog Learning Center", provider: "Datadog", area: "Observability", url: "https://learn.datadoghq.com/", weekRecommended: 6 },
        { id: 29, name: "OpenTelemetry — Official Docs", provider: "CNCF", area: "Observability", url: "https://opentelemetry.io/docs/", weekRecommended: 6 },
        { id: 30, name: "Grafana & Prometheus Fundamentals", provider: "Grafana Labs", area: "Observability", url: "https://grafana.com/tutorials/", weekRecommended: 7 },

        // ML / AI
        { id: 31, name: "fast.ai Practical Deep Learning (Part 1)", provider: "fast.ai", area: "ML/AI", url: "https://course.fast.ai/", weekRecommended: 14 },
        { id: 32, name: "HuggingFace NLP Course", provider: "HuggingFace", area: "ML/AI", url: "https://huggingface.co/learn/nlp-course", weekRecommended: 15 },
        { id: 33, name: "MLflow Quickstart & Tutorials", provider: "Databricks / MLflow", area: "ML/AI", url: "https://mlflow.org/docs/latest/quickstart.html", weekRecommended: 14 },
        { id: 34, name: "Machine Learning with Python (freeCodeCamp)", provider: "freeCodeCamp", area: "ML/AI", url: "https://www.freecodecamp.org/learn/machine-learning-with-python/", weekRecommended: 13 },
        { id: 35, name: "Generative AI Fundamentals", provider: "Databricks", area: "ML/AI", url: "https://www.databricks.com/resources/learn/training/generative-ai-fundamentals", weekRecommended: 15 },
        { id: 36, name: "Deep RL Course", provider: "HuggingFace", area: "ML/AI", url: "https://huggingface.co/learn/deep-rl-course", weekRecommended: 16 },

        // JavaScript / Node.js
        { id: 37, name: "JavaScript.info — The Modern JavaScript Tutorial", provider: "javascript.info", area: "JavaScript", url: "https://javascript.info/", weekRecommended: 2 },
        { id: 38, name: "Node.js Best Practices (GitHub)", provider: "goldbergyoni", area: "JavaScript", url: "https://github.com/goldbergyoni/nodebestpractices", weekRecommended: 3 },
        { id: 39, name: "The Odin Project — Full Stack JavaScript", provider: "The Odin Project", area: "JavaScript", url: "https://www.theodinproject.com/paths/full-stack-javascript", weekRecommended: 3 },

        // Frontend / React
        { id: 40, name: "React — Official Tutorial & Docs", provider: "React", area: "Frontend", url: "https://react.dev/learn", weekRecommended: 17 },
        { id: 41, name: "Next.js Learn (App Router)", provider: "Vercel", area: "Frontend", url: "https://nextjs.org/learn", weekRecommended: 17 },
        { id: 42, name: "web.dev — Core Web Vitals", provider: "Google", area: "Frontend", url: "https://web.dev/learn-core-web-vitals/", weekRecommended: 18 },

        // API Design
        { id: 43, name: "Postman API Fundamentals Student Expert", provider: "Postman", area: "API Design", url: "https://academy.postman.com/path/postman-api-fundamentals-student-expert", weekRecommended: 4 },
        { id: 44, name: "Google API Design Guide", provider: "Google", area: "API Design", url: "https://cloud.google.com/apis/design", weekRecommended: 4 },

        // Data Engineering
        { id: 45, name: "Data Engineering Zoomcamp", provider: "DataTalks.Club", area: "Data Engineering", url: "https://github.com/DataTalks-Club/data-engineering-zoomcamp", weekRecommended: 22 },
        { id: 46, name: "Apache Spark with Python — Big Data (Udemy Free)", provider: "Udemy", area: "Data Engineering", url: "https://www.udemy.com/course/apache-spark-with-python-big-data-with-pyspark-and-spark/", weekRecommended: 22 },

        // Go Language
        { id: 47, name: "Go by Example", provider: "gobyexample.com", area: "Go", url: "https://gobyexample.com/", weekRecommended: 20 },
        { id: 48, name: "Tour of Go — Official", provider: "golang.org", area: "Go", url: "https://go.dev/tour/welcome/1", weekRecommended: 20 },

        // Networking
        { id: 49, name: "Beej's Guide to Network Programming", provider: "Beej", area: "Networking", url: "https://beej.us/guide/bgnet/", weekRecommended: 5 },
        { id: 50, name: "Computer Networking — Tanenbaum Lecture Notes", provider: "Various", area: "Networking", url: "https://gaia.cs.umass.edu/kurose_ross/interactive/", weekRecommended: 5 },

        // Git & Collaboration
        { id: 51, name: "Git Immersion", provider: "Neo / EdgeCase", area: "Git", url: "https://gitimmersion.com/", weekRecommended: 1 },
        { id: 52, name: "GitHub Skills", provider: "GitHub", area: "Git", url: "https://skills.github.com/", weekRecommended: 1 },
        { id: 53, name: "Conventional Commits Spec", provider: "conventionalcommits.org", area: "Git", url: "https://www.conventionalcommits.org/", weekRecommended: 1 },

        // Soft Skills & Leadership
        { id: 54, name: "Science of Well-Being (Yale)", provider: "Yale / Coursera", area: "Soft Skills", url: "https://www.coursera.org/learn/the-science-of-well-being", weekRecommended: 16 },
        { id: 55, name: "Negotiation Skills (Yale School of Management)", provider: "Yale / Coursera", area: "Soft Skills", url: "https://www.coursera.org/learn/negotiation", weekRecommended: 1 },
        { id: 56, name: "Inspiring and Motivating Individuals (Michigan)", provider: "University of Michigan / Coursera", area: "Soft Skills", url: "https://www.coursera.org/learn/motivating-people", weekRecommended: 4 },

        // Free Certifications worth collecting
        { id: 57, name: "Cisco Introduction to Cybersecurity", provider: "Cisco NetAcad", area: "Security", url: "https://www.netacad.com/courses/cybersecurity/introduction-cybersecurity", weekRecommended: 12 },
        { id: 58, name: "IBM DevOps and Software Engineering (Coursera Audit)", provider: "IBM / Coursera", area: "Cloud", url: "https://www.coursera.org/professional-certificates/devops-and-software-engineering", weekRecommended: 8 },
        { id: 59, name: "Oracle Cloud Infrastructure Foundations Associate", provider: "Oracle", area: "Cloud", url: "https://education.oracle.com/oracle-cloud-infrastructure-2023-foundations-associate/pexam_1Z0-1085-23", weekRecommended: 10 },
        { id: 60, name: "Elastic Observability Fundamentals", provider: "Elastic", area: "Observability", url: "https://www.elastic.co/training/free", weekRecommended: 7 },

        // Testing & Quality
        { id: 61, name: "Test Automation University", provider: "Applitools", area: "Testing", url: "https://testautomationu.applitools.com/", weekRecommended: 4 },
        { id: 62, name: "Property-Based Testing", provider: "HypothesisWorks", area: "Testing", url: "https://hypothesis.works/articles/", weekRecommended: 4 },

        // Rust (emerging skill)
        { id: 63, name: "The Rust Programming Language (The Book)", provider: "rust-lang.org", area: "Rust", url: "https://doc.rust-lang.org/book/", weekRecommended: 23 },
        { id: 64, name: "Rustlings (hands-on exercises)", provider: "rust-lang.org", area: "Rust", url: "https://github.com/rust-lang/rustlings", weekRecommended: 23 },

        // Web Assembly
        { id: 65, name: "WebAssembly.org — Official Docs", provider: "WebAssembly", area: "Frontend", url: "https://webassembly.org/getting-started/developers-guide/", weekRecommended: 19 },

        // Productivity & Second Brain
        { id: 66, name: "Building a Second Brain (Summary)", provider: "Tiago Forte / YouTube", area: "Productivity", url: "https://www.youtube.com/watch?v=SjZSy8s2VEE", weekRecommended: 1 },
        { id: 67, name: "Obsidian Community Docs", provider: "Obsidian", area: "Productivity", url: "https://help.obsidian.md/", weekRecommended: 1 },

        // Interview Prep
        { id: 68, name: "Neetcode.io — Roadmap & Solutions", provider: "NeetCode", area: "Interview Prep", url: "https://neetcode.io/roadmap", weekRecommended: 9 },
        { id: 69, name: "Tech Interview Handbook", provider: "yangshun", area: "Interview Prep", url: "https://www.techinterviewhandbook.org/", weekRecommended: 10 },
        { id: 70, name: "High Scalability Blog (Architecture case studies)", provider: "Todd Hoff", area: "System Design", url: "http://highscalability.com/", weekRecommended: 7 },

        // Additional free certs
        { id: 71, name: "Microsoft Azure Fundamentals (AZ-900) Free Path", provider: "Microsoft Learn", area: "Cloud", url: "https://learn.microsoft.com/en-us/training/paths/az-900-describe-cloud-concepts/", weekRecommended: 9 },
        { id: 72, name: "Google IT Support Certificate (Audit Free)", provider: "Google / Coursera", area: "Cloud", url: "https://www.coursera.org/professional-certificates/google-it-support", weekRecommended: 11 },
        { id: 73, name: "CloudBees Core CI/CD (Free Tier)", provider: "CloudBees", area: "Cloud", url: "https://standard.cbu.cloudbees.com/", weekRecommended: 8 },
        { id: 74, name: "JetBrains Academy — Free Tracks", provider: "JetBrains", area: "Python", url: "https://www.jetbrains.com/academy/", weekRecommended: 2 },
        { id: 75, name: "freeCodeCamp Data Visualization Certification", provider: "freeCodeCamp", area: "Frontend", url: "https://www.freecodecamp.org/learn/data-visualization/", weekRecommended: 18 }
    ];
    write('courses.json', courses);
}

console.log('\n✅ All data patches complete.');
console.log('   Run `npm run dev` to verify the changes look correct.\n');
