'use client';

import { useState, useMemo, useEffect } from 'react';
import { useBrainStore } from '@/store/brainStore';
import { getPhaseFromDay, PHASE_NAMES, PHASE_COLORS } from '@/constants/phaseConfig';
import { X, Search, Filter, ChevronDown, BookOpen, Target, Zap, ChevronRight, Layers, Eye } from 'lucide-react';

// Categories from skills data
const CATEGORIES = [
  'All',
  'Cognition',
  'Communication',
  'Leadership',
  'Influence',
  'Management',
  'Research',
  'Creative',
  'Resilience',
];

// Map skills to phases based on day (1-180) - distribute roughly
function getSkillPhase(skillIndex: number, totalSkills: number): number {
  const day = ((skillIndex / totalSkills) * 180) + 1;
  return getPhaseFromDay(Math.floor(day));
}

// Sample skill network data - in production, this would come from skills.json
const SKILL_NETWORK = [
  // Phase 0: Foundation (Days 1-30) - Core cognitive & communication
  { id: 'critical-thinking', name: 'Critical thinking', category: 'Cognition', phase: 0, drill: 'Read one argument. Write 3 counterpoints.', goal: 'Spot one logical fallacy in the wild' },
  { id: 'analytical-thinking', name: 'Analytical thinking', category: 'Cognition', phase: 0, drill: 'Break one problem into smallest components.', goal: 'Produce one structured analysis with data' },
  { id: 'decision-making', name: 'Decision-making', category: 'Cognition', phase: 0, drill: 'Name one decision you\'ve been avoiding. Pick one.', goal: 'Make 5 decisions you would have postponed' },
  { id: 'communication', name: 'Communication', category: 'Communication', phase: 0, drill: 'Practice one structured message today.', goal: 'Deliver one 2-min pitch without notes' },
  { id: 'active-listening', name: 'Active listening', category: 'Communication', phase: 0, drill: 'Listen to someone for 3 min without interrupting.', goal: 'Summarize what you heard back to them' },
  { id: 'writing', name: 'Writing & Documentation', category: 'Communication', phase: 0, drill: 'Write one 200-word clear explanation.', goal: 'Write one concise email to a senior' },

  // Phase 1: Distributed (Days 31-50) - Team & collaboration
  { id: 'leadership', name: 'Leadership', category: 'Leadership', phase: 1, drill: 'Lead one small decision today.', goal: 'Lead one team meeting' },
  { id: 'delegation', name: 'Delegation & empowerment', category: 'Leadership', phase: 1, drill: 'Delegate one task completely.', goal: 'Coach someone on one task' },
  { id: 'conflict-resolution', name: 'Conflict resolution', category: 'Leadership', phase: 1, drill: 'Notice one conflict around you. Analyze it.', goal: 'Resolve one minor conflict constructively' },
  { id: 'networking', name: 'Networking', category: 'Influence', phase: 1, drill: 'One value-first outreach.', goal: 'One strategic introduction' },
  { id: 'emotional-intelligence', name: 'Emotional Intelligence', category: 'Resilience', phase: 1, drill: 'Name your emotion 3 times today.', goal: 'Navigate one high-EQ conversation' },
  { id: 'negotiation', name: 'Negotiation', category: 'Influence', phase: 1, drill: 'Practice one give-and-take.', goal: 'One real negotiation outcome' },

  // Phase 2: Cloud (Days 51-70) - Strategic thinking
  { id: 'strategic-thinking', name: 'Strategic thinking', category: 'Cognition', phase: 2, drill: 'Map one system you use.', goal: 'One strategy document for a project' },
  { id: 'problem-solving', name: 'Problem-solving', category: 'Cognition', phase: 2, drill: 'Apply one framework to a problem.', goal: 'Solve one problem using IDEAL/TRIZ' },
  { id: 'risk-assessment', name: 'Risk assessment', category: 'Management', phase: 2, drill: 'Identify one risk in your day.', goal: 'Complete one risk register entry' },
  { id: 'time-management', name: 'Time Management', category: 'Management', phase: 2, drill: 'Use one time-blocking session.', goal: 'Complete 5 deep-work Pomodoros' },
  { id: 'prioritization', name: 'Prioritization', category: 'Management', phase: 2, drill: 'Apply Eisenhower Matrix today.', goal: 'Complete your top 3 priorities' },
  { id: 'persuasion', name: 'Persuasion techniques', category: 'Influence', phase: 2, drill: 'Use one Cialdini principle.', goal: 'Persuade one person this week' },

  // Phase 3: Security (Days 71-90) - Accountability & rigor
  { id: 'accountability', name: 'Accountability enforcement', category: 'Leadership', phase: 3, drill: 'Own one mistake fully today.', goal: 'One accountability conversation' },
  { id: 'bias-detection', name: 'Bias detection', category: 'Cognition', phase: 3, drill: 'Notice one bias in your thinking.', goal: 'One de-biasing exercise' },
  { id: 'scenario-analysis', name: 'Scenario analysis', category: 'Cognition', phase: 3, drill: 'What if one thing goes wrong?', goal: 'One scenario plan' },
  { id: 'contingency-planning', name: 'Contingency planning', category: 'Management', phase: 3, drill: 'Plan one backup today.', goal: 'One contingency plan ready' },
  { id: 'data-interpretation', name: 'Data interpretation', category: 'Research', phase: 3, drill: 'Analyze one dataset snippet.', goal: 'One data-driven insight' },
  { id: 'hypothesis-testing', name: 'Hypothesis testing', category: 'Research', phase: 3, drill: 'Form one hypothesis today.', goal: 'One tested hypothesis with results' },

  // Phase 4: ML/AI (Days 91-110) - Learning & adaptation
  { id: 'learning-agility', name: 'Learning Agility', category: 'Cognition', phase: 4, drill: 'Learn one new concept.', goal: 'One new skill to basic proficiency' },
  { id: 'rapid-skill-acquisition', name: 'Rapid skill acquisition', category: 'Cognition', phase: 4, drill: 'Use Feynman technique.', goal: 'Teach one concept to someone' },
  { id: 'metacognition', name: 'Metacognitive reflection', category: 'Cognition', phase: 4, drill: 'Reflect on your learning today.', goal: 'One learning journal entry' },
  { id: 'feedback-integration', name: 'Feedback solicitation', category: 'Cognition', phase: 4, drill: 'Ask for one piece of feedback.', goal: 'Integrate one feedback into action' },
  { id: 'experimentation', name: 'Experimentation mindset', category: 'Creative', phase: 4, drill: 'Run one micro-experiment.', goal: 'One hypothesis tested' },
  { id: 'unlearning', name: 'Unlearning bad habits', category: 'Resilience', phase: 4, drill: 'Notice one bad habit trigger.', goal: 'One habit loop broken' },

  // Phase 5: Frontend (Days 111-130) - Execution & delivery
  { id: 'public-speaking', name: 'Public Speaking', category: 'Communication', phase: 5, drill: 'Speak for 2 minutes without notes.', goal: 'One presentation delivered' },
  { id: 'storytelling', name: 'Storytelling framework', category: 'Communication', phase: 5, drill: 'Tell one story with structure.', goal: 'One compelling story told' },
  { id: 'rapid-prototyping', name: 'Rapid prototyping', category: 'Creative', phase: 5, drill: 'Build one quick prototype.', goal: 'One working prototype in a day' },
  { id: 'divergent-thinking', name: 'Divergent thinking', category: 'Creative', phase: 5, drill: 'Generate 10 ideas in 5 min.', goal: 'One ideation session done' },
  { id: 'idea-synthesis', name: 'Idea synthesis', category: 'Creative', phase: 5, drill: 'Combine two ideas.', goal: 'One novel combination created' },
  { id: 'improvisation', name: '"Yes, and..." improvisation', category: 'Creative', phase: 5, drill: 'Say yes to one thing you\'d normally reject.', goal: 'One improv moment handled well' },

  // Phase 6: Mastery (Days 131-140) - Integration
  { id: 'self-awareness', name: 'Self-awareness', category: 'Resilience', phase: 6, drill: 'Name your current state precisely.', goal: 'One Johari window exercise' },
  { id: 'self-regulation', name: 'Self-regulation', category: 'Resilience', phase: 6, drill: 'Pause before reacting once.', goal: 'One trigger successfully managed' },
  { id: 'resilience', name: 'Resilience & Stress Management', category: 'Resilience', phase: 6, drill: 'One recovery ritual today.', goal: 'One stress response managed well' },
  { id: 'growth-mindset', name: 'Growth-mindset reinforcement', category: 'Resilience', phase: 6, drill: 'Reframe one failure as data.', goal: 'One growth moment captured' },
  { id: 'influence', name: 'Influence & Persuasion', category: 'Influence', phase: 6, drill: 'One influence attempt today.', goal: 'One person influenced meaningfully' },
  { id: 'vision-setting', name: 'Vision-setting', category: 'Leadership', phase: 6, drill: 'Write your one-year vision.', goal: 'One BHAG defined' },

  // Phase 7: Capstone (Days 141-180) - Legacy & delivery
  { id: 'thought-leadership', name: 'Thought-leadership content', category: 'Influence', phase: 7, drill: 'Write one insight.', goal: 'One piece of content published' },
  { id: 'personal-branding', name: 'Personal Branding', category: 'Influence', phase: 7, drill: 'Optimize one profile.', goal: 'One platform optimized' },
  { id: 'mentoring', name: 'Mentoring', category: 'Leadership', phase: 7, drill: 'Help one person today.', goal: 'One mentee guided' },
  { id: 'cross-cultural', name: 'Cross-cultural awareness', category: 'Research', phase: 7, drill: 'Notice one cultural difference.', goal: 'One cross-cultural interaction' },
  { id: 'inclusive-comm', name: 'Inclusive communication', category: 'Communication', phase: 7, drill: 'Use one inclusive phrase.', goal: 'One DEI moment enacted' },
  { id: 'adaptive-behavior', name: 'Adaptive behavior', category: 'Resilience', phase: 7, drill: 'Adapt to one change today.', goal: 'One change navigated well' },
];

// Connections between skills (simulated relationships)
const SKILL_CONNECTIONS = [
  ['critical-thinking', 'analytical-thinking'],
  ['analytical-thinking', 'problem-solving'],
  ['problem-solving', 'decision-making'],
  ['decision-making', 'risk-assessment'],
  ['communication', 'active-listening'],
  ['active-listening', 'emotional-intelligence'],
  ['emotional-intelligence', 'conflict-resolution'],
  ['leadership', 'delegation'],
  ['delegation', 'accountability'],
  ['negotiation', 'persuasion'],
  ['persuasion', 'influence'],
  ['learning-agility', 'metacognition'],
  ['metacognition', 'feedback-integration'],
  ['feedback-integration', 'experimentation'],
  ['divergent-thinking', 'idea-synthesis'],
  ['idea-synthesis', 'rapid-prototyping'],
  ['self-awareness', 'self-regulation'],
  ['self-regulation', 'resilience'],
  ['resilience', 'growth-mindset'],
  ['networking', 'relationship-nurturing'],
];

interface SkillNode {
  id: string;
  name: string;
  category: string;
  phase: number;
  drill: string;
  goal: string;
  status?: 'completed' | 'in-progress' | 'upcoming';
}

export function SyllabusExplorer() {
  const { renderMode, setRenderMode } = useBrainStore();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<SkillNode | null>(null);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  // Filter skills
  const filteredSkills = useMemo(() => {
    return SKILL_NETWORK.filter(skill => {
      const matchesCategory = selectedCategory === 'All' || skill.category === selectedCategory;
      const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           skill.drill.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Group by phase for display
  const skillsByPhase = useMemo(() => {
    const grouped: Record<number, SkillNode[]> = {};
    filteredSkills.forEach(skill => {
      if (!grouped[skill.phase]) grouped[skill.phase] = [];
      grouped[skill.phase].push(skill);
    });
    return grouped;
  }, [filteredSkills]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedSkill) {
          setSelectedSkill(null);
        } else {
          setRenderMode('work');
        }
      }
      if (e.key === 's' && !e.ctrlKey && !(e.target as HTMLElement).closest('input')) {
        setRenderMode(renderMode === 'syllabus' ? 'work' : 'syllabus');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSkill, renderMode, setRenderMode]);

  if (renderMode !== 'syllabus') return null;

  return (
    <div className="absolute inset-0 z-50 bg-bg/98 backdrop-blur-xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-borderLo bg-surface/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center">
            <Layers className="w-5 h-5 text-bg" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text">Syllabus Explorer</h1>
            <p className="text-xs text-muted">Your 180-day skill journey as a network</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search skills, drills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-surface2 border border-borderLo rounded-lg text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent/50 w-64"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2 bg-surface2 border border-borderLo rounded-lg text-sm text-text focus:outline-none focus:border-accent/50 cursor-pointer"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
          </div>

          <button
            onClick={() => setRenderMode('work')}
            className="p-2 hover:bg-surface2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Object.entries(skillsByPhase).map(([phaseIdx, skills]) => {
            const phase = parseInt(phaseIdx);
            return (
              <div key={phase} className="bg-surface/50 rounded-2xl border border-borderLo overflow-hidden">
                {/* Phase Header */}
                <div
                  className="p-4 border-b border-borderLo"
                  style={{ backgroundColor: `${PHASE_COLORS[phase]}15` }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: PHASE_COLORS[phase] }}
                    >
                      {phase + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-text">{PHASE_NAMES[phase]}</h3>
                      <p className="text-xs text-muted">
                        {skills.length} skills • Days {phase * 22.5 + 1}-{Math.min(180, (phase + 1) * 22.5)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Skills Grid */}
                <div className="p-3 grid grid-cols-1 gap-2 max-h-96 overflow-auto">
                  {skills.map((skill, idx) => (
                    <button
                      key={skill.id}
                      onClick={() => setSelectedSkill(skill)}
                      className={`p-3 rounded-xl border text-left transition-all duration-200 group
                        ${selectedSkill?.id === skill.id
                          ? 'border-accent bg-accent/10'
                          : 'border-borderLo hover:border-accent/50 hover:bg-surface2'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-text text-sm truncate">{skill.name}</h4>
                          <p className="text-xs text-muted mt-1 line-clamp-2">{skill.drill}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                      </div>

                      {/* Category Badge */}
                      <div className="mt-2 flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-surface2 rounded text-xs text-muted">
                          {skill.category}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Skill Detail Panel */}
      {selectedSkill && (
        <div className="fixed inset-y-0 right-0 w-[480px] bg-surface border-l border-borderLo shadow-2xl z-[60] transform transition-transform duration-300">
          <div className="flex flex-col h-full">
            {/* Panel Header */}
            <div className="p-6 border-b border-borderLo">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: PHASE_COLORS[selectedSkill.phase] }}
                  >
                    {selectedSkill.phase + 1}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-text">{selectedSkill.name}</h2>
                    <p className="text-sm text-muted">{PHASE_NAMES[selectedSkill.phase]} • {selectedSkill.category}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSkill(null)}
                  className="p-2 hover:bg-surface2 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-muted" />
                </button>
              </div>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-auto p-6 space-y-6">
              {/* Daily Drill */}
              <div className="bg-surface2 rounded-xl p-5 border border-borderLo">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <h3 className="font-bold text-text">Daily Drill</h3>
                </div>
                <p className="text-muted leading-relaxed">{selectedSkill.drill}</p>
              </div>

              {/* Weekly Goal */}
              <div className="bg-surface2 rounded-xl p-5 border border-borderLo">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-green-500" />
                  <h3 className="font-bold text-text">Weekly Goal</h3>
                </div>
                <p className="text-muted leading-relaxed">{selectedSkill.goal}</p>
              </div>

              {/* Phase Context */}
              <div className="bg-gradient-to-br from-accent/10 to-transparent rounded-xl p-5 border border-accent/20">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="w-5 h-5 text-accent" />
                  <h3 className="font-bold text-text">Phase Context</h3>
                </div>
                <p className="text-muted text-sm leading-relaxed">
                  This skill belongs to <strong className="text-accent">{PHASE_NAMES[selectedSkill.phase]}</strong> phase.
                  It's part of your journey from day {selectedSkill.phase * 22.5 + 1} to day {Math.min(180, (selectedSkill.phase + 1) * 22.5)}.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 pt-4">
                <button className="w-full py-3 bg-accent text-bg font-bold rounded-xl hover:bg-accent/90 transition-colors flex items-center justify-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Start Drill
                </button>
                <button className="w-full py-3 border border-borderLo text-text rounded-xl hover:bg-surface2 transition-colors">
                  Mark as Complete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Footer */}
      <div className="p-3 border-t border-borderLo bg-surface/50 text-center">
        <p className="text-xs text-muted2">
          <kbd className="px-1.5 py-0.5 bg-surface2 rounded text-muted mx-1">S</kbd> Toggle Syllabus
          <span className="mx-3">•</span>
          <kbd className="px-1.5 py-0.5 bg-surface2 rounded text-muted mx-1">Esc</kbd> Close
          <span className="mx-3">•</span>
          <kbd className="px-1.5 py-0.5 bg-surface2 rounded text-muted mx-1">Click</kbd> View Details
        </p>
      </div>
    </div>
  );
}