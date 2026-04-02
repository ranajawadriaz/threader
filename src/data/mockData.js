export const initialPosts = [
  {
    id: 'p1',
    authorId: 'u2',
    author: 'florenaux',
    username: 'florenaux',
    avatarColor: '#665cff',
    createdAt: '12h',
    topic: '3Dart',
    content:
      'Dear algorithm, show this to people who appreciate my art style. Crafted this scene with layered light and particles.',
    image:
      'https://images.unsplash.com/photo-1518600506278-4e8ef466b810?auto=format&fit=crop&w=1200&q=80',
    likes: ['u4', 'u5', 'u6'],
    commentCount: 18,
    repostCount: 7,
    shareCount: 4,
  },
  {
    id: 'p2',
    authorId: 'u3',
    author: 'mara.codes',
    username: 'mara_codes',
    avatarColor: '#2fa2ff',
    createdAt: '2h',
    topic: 'frontend',
    content:
      'Shipped a full design system tonight. The trick was reducing color tokens before touching components.',
    image: '',
    likes: ['u7'],
    commentCount: 9,
    repostCount: 3,
    shareCount: 2,
  },
  {
    id: 'p3',
    authorId: 'u4',
    author: 'studio.nora',
    username: 'studio_nora',
    avatarColor: '#03c08c',
    createdAt: '45m',
    topic: 'visuals',
    content:
      'Color grading experiments for a cyber-noir short. Which frame should become the key art?',
    image:
      'https://images.unsplash.com/photo-1520975922284-9b5f5844d99a?auto=format&fit=crop&w=1200&q=80',
    likes: ['u2', 'u3', 'u6', 'u8'],
    commentCount: 27,
    repostCount: 11,
    shareCount: 8,
  },
  {
    id: 'p4',
    authorId: 'u1',
    author: 'rana_jawad_riaz',
    username: 'rana_jawad_riaz',
    avatarColor: '#8892a6',
    createdAt: '10m',
    topic: 'build-in-public',
    content:
      'Building Threader in public. Tonight: responsive nav, better feed rhythm, and profile polish.',
    image: '',
    likes: ['u2'],
    commentCount: 3,
    repostCount: 1,
    shareCount: 0,
  },
]

export const activityItems = [
  {
    id: 'a1',
    type: 'all',
    username: 'originalwatchpakistan',
    displayName: 'originalwatchpakistan',
    action: 'Suggested thread',
    excerpt: 'Tissot PR50, price 23,500. 10/10 immaculate condition.',
    time: '3h',
    avatarColor: '#4b5563',
    previewImage:
      'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=280&q=80',
    verified: true,
  },
  {
    id: 'a2',
    type: 'follows',
    username: 'livvy.grows',
    displayName: 'livvy.grows',
    action: 'Follow suggestion',
    excerpt: 'Posts about growth systems and creator strategy.',
    time: '15h',
    avatarColor: '#8b5cf6',
    previewImage: '',
    verified: false,
  },
  {
    id: 'a3',
    type: 'all',
    username: 'zayyynab_',
    displayName: 'zayyynab_',
    action: 'Suggested thread',
    excerpt: 'Just smell nice, the rest we can blame your parents.',
    time: '2d',
    avatarColor: '#f59e0b',
    previewImage: '',
    verified: false,
  },
  {
    id: 'a4',
    type: 'conversations',
    username: 'stanleywangg',
    displayName: 'stanleywangg',
    action: 'Replied to your thread',
    excerpt: 'Can you share your brush stack for this style?',
    time: '2d',
    avatarColor: '#06b6d4',
    previewImage: '',
    verified: true,
  },
]

export const conversations = [
  {
    id: 'm1',
    name: 'Mara Codes',
    username: 'mara_codes',
    message: 'Can we collab on a launch thread this weekend?',
    time: '2m',
    unread: 2,
    request: false,
    avatarColor: '#2fa2ff',
  },
  {
    id: 'm2',
    name: 'Studio Nora',
    username: 'studio_nora',
    message: 'Draft is ready. Sending final export in 5.',
    time: '1h',
    unread: 0,
    request: false,
    avatarColor: '#03c08c',
  },
  {
    id: 'm3',
    name: 'kai.motion',
    username: 'kai_motion',
    message: 'Requested to message you',
    time: '5h',
    unread: 0,
    request: true,
    avatarColor: '#ef4444',
  },
]

export const trends = [
  { id: 't1', label: 'Design systems', volume: '14k threads' },
  { id: 't2', label: 'Build in public', volume: '9k threads' },
  { id: 't3', label: 'Cinematic 3D', volume: '22k threads' },
  { id: 't4', label: 'React + MUI', volume: '11k threads' },
]

export const suggestedProfiles = [
  { id: 's1', name: 'aimasteryhub_', handle: '@aimasteryhub_', color: '#f43f5e' },
  { id: 's2', name: 'memesofpakistan', handle: '@memesofpakistan', color: '#22c55e' },
  { id: 's3', name: 'anwar', handle: '@anwar', color: '#3b82f6' },
]

export const profileChecklist = [
  {
    id: 'c1',
    title: 'Create thread',
    subtitle: 'Say what is on your mind or share a recent highlight.',
    cta: 'Create',
  },
  {
    id: 'c2',
    title: 'Follow 10 profiles',
    subtitle: 'Fill your feed with threads that match your interests.',
    cta: 'Follow',
  },
  {
    id: 'c3',
    title: 'Add profile photo',
    subtitle: 'A profile picture helps people recognize you faster.',
    cta: 'Upload',
  },
]
