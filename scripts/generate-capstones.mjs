/**
 * INTEL·OS — Phase 4: Capstone Projects Generator
 * Run: node scripts/generate-capstones.mjs
 * Appends 30 high-value projects to projects.json for Days 151–180
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dest = path.join(__dirname, '..', 'data', 'projects.json');

const current = JSON.parse(fs.readFileSync(dest, 'utf8'));

// Verify we are at Day 150
if (current.length !== 150) {
    console.error(`Expected 150 projects, found ${current.length}. Aborting.`);
    process.exit(1);
}

const masteryProjects = [
    { day: 151, phase: "Mastery", category: "Integration", name: "End-to-end Tracing Setup", doneMeans: "Jaeger/Zipkin integrated into 3 existing services with correlated logs" },
    { day: 152, phase: "Mastery", category: "Performance", name: "Query Optimization Pass", doneMeans: "Identify top 3 slowest DB queries and rewrite with correct indexes" },
    { day: 153, phase: "Mastery", category: "Security", name: "OAuth2 Provider Integration", doneMeans: "Login flow works with Google/GitHub, issues JWTs, handles refresh" },
    { day: 154, phase: "Mastery", category: "Architecture", name: "Service Extraction", doneMeans: "Pull one monolithic component into a standalone gRPC service" },
    { day: 155, phase: "Mastery", category: "Infrastructure", name: "Terraform State Migration", doneMeans: "Move local Terraform state to S3 backend with DynamoDB locking" },
    { day: 156, phase: "Mastery", category: "Reliability", name: "Idempotency Implementation", doneMeans: "Critical payment/action endpoint deduplicates requests using Redis" },
    { day: 157, phase: "Mastery", category: "Performance", name: "Cache Stampede Prevention", doneMeans: "Implement cache aside with jitter or probabilistic early expiration" },
    { day: 158, phase: "Mastery", category: "Architecture", name: "Event-Driven Refactor", doneMeans: "Replace synchronous REST call with Kafka/RabbitMQ asynchronous event" },
    { day: 159, phase: "Mastery", category: "Frontend", name: "WebSocket Realtime Feed", doneMeans: "Live dashboard updates without polling when backend state changes" },
    { day: 160, phase: "Mastery", category: "Data Engineering", name: "OLAP synchronization", doneMeans: "CDC (Change Data Capture) pipeline moves OLTP changes to analytical DB" },
];

const capstoneProjects = [
    { day: 161, phase: "Capstone", category: "System Design", name: "Capstone System Architecture", doneMeans: "Write a 2-page spec detailing components, data flow, and failure modes" },
    { day: 162, phase: "Capstone", category: "Infrastructure", name: "VPC & Security Groups Setup", doneMeans: "AWS/GCP network configured with private subnets and bastion host" },
    { day: 163, phase: "Capstone", category: "Databases", name: "Schema Definition & Migrations", doneMeans: "Initial schema deployed via code (Flyway/Alembic) with rollback plans" },
    { day: 164, phase: "Capstone", category: "Backend Core", name: "Auth & User Service", doneMeans: "Users can register, login, and verify email via background job" },
    { day: 165, phase: "Capstone", category: "Backend Core", name: "Primary Domain Logic (Part 1)", doneMeans: "Core entities can be created and mutated via REST/GraphQL API" },
    { day: 166, phase: "Capstone", category: "Backend Core", name: "Primary Domain Logic (Part 2)", doneMeans: "Complex business transactions are implemented with acid guarantees" },
    { day: 167, phase: "Capstone", category: "Messaging", name: "Async Task Worker", doneMeans: "Celery/BullMQ worker consumes and processes long-running jobs" },
    { day: 168, phase: "Capstone", category: "Storage", name: "S3 Object Uploads", doneMeans: "Secure presigned URLs handle direct-to-S3 uploads from frontend" },
    { day: 169, phase: "Capstone", category: "Observability", name: "Instrumentation", doneMeans: "Prometheus metrics exposed for request latency, error rate, and active users" },
    { day: 170, phase: "Capstone", category: "API Gateway", name: "Rate Limiting & Routing", doneMeans: "Gateway proxy enforces rate limits and routes to correct internal services" },
    { day: 171, phase: "Capstone", category: "Frontend", name: "App Shell & Routing", doneMeans: "React/Next.js shell deployed with protected routes and state management" },
    { day: 172, phase: "Capstone", category: "Frontend", name: "Core User Flow Implementation", doneMeans: "Primary user journey is fully clickable and connected to real API" },
    { day: 173, phase: "Capstone", category: "Performance", name: "Load Testing", doneMeans: "K6/Locust scripts written and initial bottleneck identified at 1k RPS" },
    { day: 174, phase: "Capstone", category: "Performance", name: "Bottleneck Mitigation", doneMeans: "Identified bottleneck resolved via caching, indexing, or scaling" },
    { day: 175, phase: "Capstone", category: "Reliability", name: "Chaos Injection Test", doneMeans: "Kill random instances and verify the system self-heals without data loss" },
    { day: 176, phase: "Capstone", category: "Security", name: "Pen-Testing & Audit", doneMeans: "Scan for OWASP top 10 vulnerabilities and patch any findings" },
    { day: 177, phase: "Capstone", category: "CI/CD", name: "Zero-Downtime Deployment", doneMeans: "Pipeline deploys new version via blue/green or rolling update automatically" },
    { day: 178, phase: "Capstone", category: "Documentation", name: "API & Runbook Documentation", doneMeans: "OpenAPI spec generated and operational runbook written for incidents" },
    { day: 179, phase: "Capstone", category: "Final Polish", name: "UX Edge Cases", doneMeans: "Loading states, error toasts, and empty states implemented on frontend" },
    { day: 180, phase: "Capstone", category: "Launch", name: "Production Release & Retrospective", doneMeans: "System is publicly accessible. Write 1-page reflection on what went wrong." },
];

const updated = [...current, ...masteryProjects, ...capstoneProjects];

fs.writeFileSync(dest, JSON.stringify(updated, null, 2), 'utf8');
console.log(`✅ Appended 30 projects. New total: ${updated.length} entries.`);
