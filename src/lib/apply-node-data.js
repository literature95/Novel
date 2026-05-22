/** 将 AI 生成结果写入运行时模型 (v2.1) */

import { completeNode } from './progress-aggregator'
import { enrichProject } from './nodes'
import { syncChapterStats } from './project'

const CHAR_COLORS = ['cerulean', 'rose', 'crimson', 'olive', 'ochre', 'amber']

function normalizeCharacter(raw, index, existing = []) {
  const name = raw.name || `新角色${index + 1}`
  const dup = existing.find(c => c.name === name)
  return {
    ...(dup || {}),
    name,
    role: raw.role || dup?.role || '配角',
    status: raw.status || dup?.status || 'alive',
    color: raw.color || dup?.color || CHAR_COLORS[index % CHAR_COLORS.length],
    arc: raw.arc || raw.desc || dup?.arc || '',
    background: raw.background || raw.desc || dup?.background || '',
    progress: raw.progress ?? raw.arcProgress ?? dup?.progress ?? 0,
    relationships: raw.relationships || dup?.relationships || {},
  }
}

function normalizeLocation(raw, index) {
  return {
    id: raw.id || `L${String(index + 1).padStart(2, '0')}`,
    name: raw.name || '新地点',
    type: raw.type || 'building',
    era: raw.era || '现代',
    features: raw.features || raw.desc || '',
    connectedTo: raw.connectedTo || [],
    mood: raw.mood || '',
  }
}

function normalizeMagic(raw, index) {
  return {
    id: raw.id || `M${String(index + 1).padStart(2, '0')}`,
    name: raw.name || '新能力',
    type: raw.type || 'ability',
    source: raw.source || '',
    rules: raw.rules || '',
    cost: raw.cost || '',
    usage: raw.usage || '',
    note: raw.note || '',
  }
}

function normalizeTimeline(raw, index) {
  return {
    id: raw.id || `T${String(index + 1).padStart(2, '0')}`,
    year: raw.year || '',
    event: raw.event || '',
    era: raw.era || '',
    characters: raw.characters || [],
    locations: raw.locations || [],
    significance: raw.significance || '中',
  }
}

function normalizeConstraint(raw, index) {
  return {
    id: raw.id || `R-${String(index + 1).padStart(3, '0')}`,
    type: raw.type || 'soft',
    name: raw.name || '新规则',
    desc: raw.desc || raw.description || '',
  }
}

function normalizeForeshadow(raw, index, existing = []) {
  const id = raw.id || `F${String((existing.length + index + 1)).padStart(2, '0')}`
  return {
    id,
    title: raw.title || raw.hint || raw.name || '新伏笔',
    importance: raw.importance ?? 0.5,
    status: raw.status || 'drafted',
    planted: raw.planted || '-',
    deadline: raw.deadline || raw.expected_resolve_chapter || 'Ch30',
    desc: raw.desc || raw.description || raw.hint || '',
  }
}

function normalizeAct(raw, index) {
  const defaults = [
    { name: '第一幕', range: '0–25%', width: 25 },
    { name: '第二幕', range: '25–75%', width: 50 },
    { name: '第三幕', range: '75–100%', width: 25 },
  ]
  const d = defaults[index] || defaults[0]
  return {
    name: raw.name || d.name,
    range: raw.range || raw.range_percent?.join('–') || d.range,
    goal: raw.goal || '',
    curve: raw.curve || raw.emotional_curve || '',
    twist: raw.twist || raw.midpoint_twist || '',
    width: raw.width ?? d.width,
  }
}

function normalizePlotLine(raw, index, existing = []) {
  const ids = ['main_line', 'relationship_arc', 'antagonist_arc', 'world_arc', 'thematic_arc']
  const colors = ['cerulean', 'rose', 'crimson', 'olive', 'ochre']
  const id = raw.id || ids[index] || `line_${index}`
  const prev = existing.find(p => p.id === id)
  return {
    id,
    name: raw.name || prev?.name || id,
    color: raw.color || prev?.color || colors[index % colors.length],
    progress: raw.progress ?? raw.current_progress ?? prev?.progress ?? 0,
    milestone: raw.milestone || raw.key_milestones?.[0] || prev?.milestone || '',
    description: raw.description || raw.desc || prev?.description || '',
  }
}

function normalizeChapterPatch(raw, chapterId) {
  const id = Number(raw.id ?? raw.number ?? chapterId)
  return {
    id,
    title: raw.title || `第${id}章`,
    status: raw.status === 'done' ? 'done' : raw.status === 'writing' ? 'progress' : raw.status || 'locked',
    targetWords: raw.targetWords ?? raw.target_words ?? 3000,
    characters: raw.characters || [],
    locations: raw.locations || [],
    plotLines: raw.plot_lines_intersection || raw.plotLines || [],
    momentum: raw.momentum ?? raw.plot_momentum ?? 0.5,
    emotionPeak: raw.emotionPeak ?? raw.emotional_peak ?? 0.5,
    pov: raw.pov,
  }
}

function normalizeScene(raw) {
  const beats = (raw.beats || []).map(b =>
    typeof b === 'string' ? b : (b.text || b.type || '')
  ).filter(Boolean)

  return {
    id: raw.id || `ch_s_${Date.now()}`,
    title: raw.title || '新场景',
    pov: raw.pov || '',
    setting: raw.setting || '',
    content: raw.content || '',
    beats,
    conflict: {
      type: raw.conflict?.type || ['内心冲突'],
      intensity: raw.conflict?.intensity ?? 0.5,
      turningPoint: raw.conflict?.turningPoint ?? false,
      resolution: raw.conflict?.resolution || '',
    },
    foreshadow: {
      planted: raw.foreshadow?.planted || [],
      triggered: raw.foreshadow?.triggered || [],
      resolved: raw.foreshadow?.resolved || [],
    },
  }
}

function mergeByKey(existing, incoming, keyFn) {
  const map = new Map(existing.map(item => [keyFn(item), item]))
  for (const item of incoming) {
    map.set(keyFn(item), { ...map.get(keyFn(item)), ...item })
  }
  return [...map.values()]
}

/**
 * @param {Object} project
 * @param {string} nodeKey
 * @param {*} data - AI 输出
 * @param {{ mode?: 'merge'|'replace', chapterId?: number, sceneChapterId?: number }} options
 */
export function applyNodeGeneration(project, nodeKey, data, options = {}) {
  const mode = options.mode || 'merge'
  let next = { ...project }

  switch (nodeKey) {
    case 'N-1.1': {
      const items = (Array.isArray(data) ? data : []).map((c, i) =>
        normalizeCharacter(c, i, next.characters)
      )
      next.characters = mode === 'replace' ? items : mergeByKey(next.characters || [], items, c => c.name)
      break
    }
    case 'N-1.2': {
      const items = (Array.isArray(data) ? data : []).map((l, i) => normalizeLocation(l, i))
      next.locations = mode === 'replace' ? items : [...(next.locations || []), ...items]
      break
    }
    case 'N-1.3': {
      const items = (Array.isArray(data) ? data : []).map((m, i) => normalizeMagic(m, i))
      next.magicSystem = mode === 'replace' ? items : [...(next.magicSystem || []), ...items]
      break
    }
    case 'N-1.4': {
      const items = (Array.isArray(data) ? data : []).map((t, i) => normalizeTimeline(t, i))
      next.timeline = mode === 'replace' ? items : [...(next.timeline || []), ...items]
      break
    }
    case 'N-1.5': {
      const items = (Array.isArray(data) ? data : []).map((r, i) => normalizeConstraint(r, i))
      next.constraints = mode === 'replace' ? items : mergeByKey(next.constraints || [], items, r => r.id)
      break
    }
    case 'N-2.1': {
      const items = (Array.isArray(data) ? data : [data]).map((a, i) => normalizeAct(a, i))
      next.acts = items.length ? items : next.acts
      break
    }
    case 'N-2.2': {
      const items = (Array.isArray(data) ? data : []).map((p, i) =>
        normalizePlotLine(p, i, next.plotLines)
      )
      next.plotLines = items.length >= 5 ? items : next.plotLines.map((p, i) => ({
        ...p,
        ...(items.find(x => x.id === p.id) || items[i] || {}),
      }))
      break
    }
    case 'N-2.3': {
      const items = (Array.isArray(data) ? data : []).map((f, i) =>
        normalizeForeshadow(f, i, next.foreshadows)
      )
      next.foreshadows = mode === 'replace' ? items : mergeByKey(next.foreshadows || [], items, f => f.id)
      break
    }
    case 'N-4.2': {
      const chId = options.chapterId ?? data?.id ?? data?.number
      const patch = normalizeChapterPatch(data?.chapter || data, chId)
      next.chapters = (next.chapters || []).map(ch =>
        ch.id === patch.id ? { ...ch, ...patch, words: ch.words, scenes: ch.scenes } : ch
      )
      break
    }
    case 'N-5.1': {
      const scene = normalizeScene(data?.scene || data)
      const chapterId = options.sceneChapterId ?? next.chapters?.[0]?.id ?? 1
      const scenes = { ...(next.scenes || {}) }
      const list = [...(scenes[chapterId] || [])]
      list.push(scene)
      scenes[chapterId] = list
      next.scenes = scenes
      next.chapters = syncChapterStats(next.chapters, scenes)
      break
    }
    default:
      break
  }

  next = completeNode(nodeKey, next)
  return enrichProject(next)
}
