export const SYLLABUSES = [
  {
    slug: 'system-design-questions',
    name: 'System Design Questions',
    itemType: 'question',
    daily: {
      enabled: true,
      weight: 10,
      strategy: 'sm2',
      maxPerSession: 10
    }
  },
  {
    slug: 'tech-spine',
    name: 'Tech Spine',
    itemType: 'topic',
    daily: {
      enabled: true,
      weight: 5,
      strategy: 'sequential',
      maxPerSession: 5
    }
  },
  {
    slug: 'projects',
    name: 'Projects',
    itemType: 'project',
    daily: {
      enabled: true,
      weight: 5,
      strategy: 'sequential',
      maxPerSession: 5
    }
  },
  {
    slug: 'soft-skills',
    name: 'Soft Skills',
    itemType: 'skill',
    daily: {
      enabled: true,
      weight: 3,
      strategy: 'random',
      maxPerSession: 3
    }
  },
  {
    slug: 'payable-skills',
    name: 'Payable Skills',
    itemType: 'skill',
    daily: {
      enabled: true,
      weight: 3,
      strategy: 'sequential',
      maxPerSession: 3
    }
  },
  {
    slug: 'survival-gaps',
    name: 'Survival Gaps',
    itemType: 'gap',
    daily: {
      enabled: true,
      weight: 8,
      strategy: 'priority',
      maxPerSession: 5
    }
  },
  {
    slug: 'courses',
    name: 'Courses',
    itemType: 'resource',
    daily: {
      enabled: true,
      weight: 4,
      strategy: 'sequential',
      maxPerSession: 3
    }
  }
];
