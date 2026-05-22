/** 协同模块 (N-3.1 / N-6.3) — 对齐 collaboration_board v2.0 */

export const ASSIGNMENT_STATUS = [
  { value: 'draft', label: '草稿' },
  { value: 'review', label: '审阅中' },
  { value: 'done', label: '已完成' },
]

export const PLOT_LINE_KEYS = [
  { id: 'main_line', name: '主线' },
  { id: 'relationship_arc', name: '感情线' },
  { id: 'antagonist_arc', name: '反派线' },
  { id: 'world_arc', name: '世界观' },
  { id: 'thematic_arc', name: '主题线' },
]

const WRITER_COLORS = ['cerulean', 'rose', 'olive', 'ochre', 'amber']

export function defaultCollaboration() {
  return {
    mode: 'solo',
    notes: '',
    writers: [],
    chapterAssignments: [],
    handoverNotes: [],
    syncLog: [],
  }
}

export function normalizeCollaboration(raw) {
  const base = defaultCollaboration()
  if (!raw || typeof raw !== 'object') return base
  return {
    ...base,
    ...raw,
    writers: Array.isArray(raw.writers) ? raw.writers : [],
    chapterAssignments: Array.isArray(raw.chapterAssignments) ? raw.chapterAssignments : [],
    handoverNotes: Array.isArray(raw.handoverNotes) ? raw.handoverNotes : [],
    syncLog: Array.isArray(raw.syncLog) ? raw.syncLog : [],
  }
}

export function nextWriterId(writers = []) {
  const nums = writers
    .map(w => /^w(\d+)$/.exec(w.id))
    .filter(Boolean)
    .map(m => Number(m[1]))
  const n = nums.length ? Math.max(...nums) + 1 : 1
  return `w${n}`
}

export function createWriter(existing = []) {
  const id = nextWriterId(existing)
  return {
    id,
    name: `作者${id.replace('w', '')}`,
    responsibleLines: ['main_line'],
    color: WRITER_COLORS[existing.length % WRITER_COLORS.length],
  }
}

export function nextHandoverId(notes = []) {
  const nums = notes
    .map(n => /^h(\d+)$/.exec(n.id))
    .filter(Boolean)
    .map(m => Number(m[1]))
  const n = nums.length ? Math.max(...nums) + 1 : 1
  return `h${String(n).padStart(2, '0')}`
}

export function createHandover(existing = []) {
  return {
    id: nextHandoverId(existing),
    fromWriterId: '',
    toWriterId: '',
    chapterId: null,
    content: '',
    date: new Date().toISOString().slice(0, 10),
  }
}

export function nextSyncLogId(logs = []) {
  const nums = logs
    .map(l => /^s(\d+)$/.exec(l.id))
    .filter(Boolean)
    .map(m => Number(m[1]))
  const n = nums.length ? Math.max(...nums) + 1 : 1
  return `s${String(n).padStart(2, '0')}`
}

export function createSyncLogEntry(existing = []) {
  return {
    id: nextSyncLogId(existing),
    date: new Date().toISOString().slice(0, 10),
    syncedLines: ['main_line'],
    conflictNotes: '',
  }
}

export function upsertChapterAssignment(assignments, chapterId, patch) {
  const list = [...assignments]
  const idx = list.findIndex(a => a.chapterId === chapterId)
  const base = idx >= 0 ? list[idx] : { chapterId, primaryWriterId: '', collaboratorIds: [], status: 'draft' }
  const next = { ...base, ...patch, chapterId }
  if (idx >= 0) list[idx] = next
  else list.push(next)
  return list
}

/** 切换多人模式时填充示例协同数据 */
export function ensureTeamSeed(collaboration, chapters) {
  const collab = normalizeCollaboration(collaboration)
  if (collab.writers.length > 0) return collab

  const w1 = { id: 'w1', name: '主笔', responsibleLines: ['main_line', 'thematic_arc'], color: 'cerulean' }
  const w2 = { id: 'w2', name: '协作者', responsibleLines: ['relationship_arc', 'world_arc'], color: 'rose' }

  return {
    ...collab,
    writers: [w1, w2],
    chapterAssignments: (chapters || []).slice(0, 6).map(ch => ({
      chapterId: ch.id,
      primaryWriterId: ch.id % 2 === 0 ? 'w2' : 'w1',
      collaboratorIds: ch.id % 2 === 0 ? ['w1'] : [],
      status: ch.status === 'done' ? 'done' : ch.status === 'progress' ? 'review' : 'draft',
    })),
    handoverNotes: [
      {
        id: 'h01',
        fromWriterId: 'w1',
        toWriterId: 'w2',
        chapterId: 3,
        content: 'Ch3 法医线请接苏婉 POV，注意 F03 伤疤伏笔。',
        date: new Date().toISOString().slice(0, 10),
      },
    ],
    syncLog: [
      {
        id: 's01',
        date: new Date().toISOString().slice(0, 10),
        syncedLines: ['main_line', 'relationship_arc'],
        conflictNotes: '',
      },
    ],
  }
}

/** 检测章节归属冲突（同章多主笔 / 无主笔） */
export function detectCollaborationConflicts(project) {
  const issues = []
  const collab = normalizeCollaboration(project.collaboration)
  const byChapter = new Map()

  for (const a of collab.chapterAssignments) {
    if (!a.primaryWriterId) {
      issues.push({ type: 'warning', message: `Ch${a.chapterId} 未指定主笔` })
      continue
    }
    const prev = byChapter.get(a.chapterId)
    if (prev && prev !== a.primaryWriterId) {
      issues.push({
        type: 'error',
        message: `Ch${a.chapterId} 存在多个主笔归属冲突`,
      })
    }
    byChapter.set(a.chapterId, a.primaryWriterId)
  }

  for (const log of collab.syncLog) {
    if (log.conflictNotes?.trim()) {
      issues.push({ type: 'warning', message: `同步 ${log.id}: ${log.conflictNotes}` })
    }
  }

  return issues
}

export function writerName(writers, id) {
  return writers.find(w => w.id === id)?.name || id || '—'
}
