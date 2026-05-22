import { createContext, useContext, useReducer, useState, useCallback, useEffect, useRef, useMemo } from 'react'
import {
  createDefaultProject,
  normalizeProject,
  syncChapterStats,
  countWords,
  buildExportPayload,
  nextConstraintId,
  createBlankCharacter,
  isValidProject,
  resetSeedCache,
} from './lib/project'
import { computeStaleFromCharacterChange, enrichProject } from './lib/nodes'
import { validateCurrentScene, validateAllScenes } from './lib/constraints-engine'
import { calculateHealthScore } from './lib/progress-aggregator'
import { validateProject } from './lib/schema-validator'
import { aggregateProgress } from './lib/progress-aggregator'
import { createNodeExecutor } from './lib/node-executor'
import { createNodeRunner } from './lib/node-runner'
import { applyNodeGeneration } from './lib/apply-node-data'
import { canNodeAiGenerate } from './lib/node-ai-config'
import {
  createWriter,
  createHandover,
  createSyncLogEntry,
  ensureTeamSeed,
  normalizeCollaboration,
  upsertChapterAssignment,
} from './lib/collaboration'
import {
  getInitialProject,
  saveProject,
  clearStoredProject,
  downloadProjectJson,
  readProjectFromFile,
} from './lib/storage'

const NovelContext = createContext()

function initProjectState() {
  try {
    const loaded = getInitialProject()
    if (isValidProject(loaded)) return loaded
  } catch (e) {
    console.warn('[Novel] 加载失败', e)
  }
  console.warn('[Novel] 使用默认示例项目')
  clearStoredProject()
  resetSeedCache()
  return createDefaultProject()
}

function finalize(state) {
  const next = enrichProject(state)
  return isValidProject(next) ? next : state
}

function projectReducer(state, action) {
  switch (action.type) {
    case 'SET_PROJECT': {
      const p = action.payload
      if (isValidProject(p)) return p
      return normalizeProject(p ?? {})
    }

    case 'UPDATE_META':
      return finalize({ ...state, meta: { ...state.meta, ...action.payload } })

    case 'UPDATE_SETTINGS':
      return finalize({ ...state, settings: { ...state.settings, ...action.payload } })

    case 'UPDATE_SCENE_CONTENT': {
      const { chapterId, sceneIndex, content } = action.payload
      const scenes = { ...state.scenes }
      const list = [...(scenes[chapterId] || [])]
      if (!list[sceneIndex]) return state
      list[sceneIndex] = { ...list[sceneIndex], content }
      scenes[chapterId] = list
      const chapters = syncChapterStats(state.chapters, scenes)
      return finalize({ ...state, scenes, chapters })
    }

    case 'UPDATE_CHAPTER': {
      const { chapterId, patch } = action.payload
      return finalize({
        ...state,
        chapters: state.chapters.map(ch =>
          ch.id === chapterId ? { ...ch, ...patch } : ch
        ),
      })
    }

    case 'ADD_CHARACTER':
      return finalize({
        ...state,
        characters: [...state.characters, action.payload],
      })

    case 'UPDATE_CHARACTER': {
      const { index, patch, markStale } = action.payload
      const prev = state.characters[index]
      const characters = state.characters.map((c, i) =>
        i === index ? { ...c, ...patch } : c
      )
      let staleMarkers = state.staleMarkers
      if (markStale && prev) {
        const name = patch.name ?? prev.name
        staleMarkers = computeStaleFromCharacterChange(name, { ...state, characters })
      }
      return finalize({ ...state, characters, staleMarkers })
    }

    case 'DELETE_CHARACTER': {
      const name = state.characters[action.payload]?.name
      const characters = state.characters.filter((_, i) => i !== action.payload)
      const staleMarkers = name
        ? computeStaleFromCharacterChange(name, { ...state, characters })
        : state.staleMarkers
      return finalize({ ...state, characters, staleMarkers })
    }

    case 'ADD_CONSTRAINT':
      return finalize({
        ...state,
        constraints: [...state.constraints, action.payload],
      })

    case 'UPDATE_CONSTRAINT': {
      const { index, patch } = action.payload
      return finalize({
        ...state,
        constraints: state.constraints.map((r, i) =>
          i === index ? { ...r, ...patch } : r
        ),
      })
    }

    case 'DELETE_CONSTRAINT':
      return finalize({
        ...state,
        constraints: state.constraints.filter((_, i) => i !== action.payload),
      })

    case 'ADD_LOCATION':
      return finalize({
        ...state,
        locations: [...(state.locations || []), action.payload],
      })

    case 'UPDATE_LOCATION': {
      const { index, patch } = action.payload
      return finalize({
        ...state,
        locations: (state.locations || []).map((l, i) =>
          i === index ? { ...l, ...patch } : l
        ),
      })
    }

    case 'DELETE_LOCATION':
      return finalize({
        ...state,
        locations: (state.locations || []).filter((_, i) => i !== action.payload),
      })

    case 'ADD_MAGIC':
      return finalize({
        ...state,
        magicSystem: [...(state.magicSystem || []), action.payload],
      })

    case 'UPDATE_MAGIC': {
      const { index, patch } = action.payload
      return finalize({
        ...state,
        magicSystem: (state.magicSystem || []).map((m, i) =>
          i === index ? { ...m, ...patch } : m
        ),
      })
    }

    case 'DELETE_MAGIC':
      return finalize({
        ...state,
        magicSystem: (state.magicSystem || []).filter((_, i) => i !== action.payload),
      })

    case 'ADD_TIMELINE':
      return finalize({
        ...state,
        timeline: [...(state.timeline || []), action.payload],
      })

    case 'UPDATE_TIMELINE': {
      const { index, patch } = action.payload
      return finalize({
        ...state,
        timeline: (state.timeline || []).map((t, i) =>
          i === index ? { ...t, ...patch } : t
        ),
      })
    }

    case 'DELETE_TIMELINE':
      return finalize({
        ...state,
        timeline: (state.timeline || []).filter((_, i) => i !== action.payload),
      })

    case 'ADD_FORESHADOW':
      return finalize({
        ...state,
        foreshadows: [...state.foreshadows, action.payload],
      })

    case 'UPDATE_FORESHADOW': {
      const { index, patch } = action.payload
      return finalize({
        ...state,
        foreshadows: state.foreshadows.map((f, i) =>
          i === index ? { ...f, ...patch } : f
        ),
      })
    }

    case 'DELETE_FORESHADOW':
      return finalize({
        ...state,
        foreshadows: state.foreshadows.filter((_, i) => i !== action.payload),
      })

    case 'ADD_VOLUME':
      return finalize({
        ...state,
        volumes: [...state.volumes, action.payload],
      })

    case 'UPDATE_VOLUME': {
      const { index, patch } = action.payload
      return finalize({
        ...state,
        volumes: state.volumes.map((v, i) =>
          i === index ? { ...v, ...patch } : v
        ),
      })
    }

    case 'DELETE_VOLUME':
      return finalize({
        ...state,
        volumes: state.volumes.filter((_, i) => i !== action.payload),
      })

    case 'ADD_CHAPTER':
      return finalize({
        ...state,
        chapters: [...state.chapters, action.payload],
      })

    case 'UPDATE_CHAPTER': {
      const { index, patch } = action.payload
      return finalize({
        ...state,
        chapters: state.chapters.map((c, i) =>
          i === index ? { ...c, ...patch } : c
        ),
      })
    }

    case 'DELETE_CHAPTER':
      return finalize({
        ...state,
        chapters: state.chapters.filter((_, i) => i !== action.payload),
      })

    case 'ADD_SCENE': {
      const { chapterId, scene } = action.payload
      const scenes = { ...state.scenes }
      const list = [...(scenes[chapterId] || [])]
      list.push(scene)
      scenes[chapterId] = list
      const chapters = syncChapterStats(state.chapters, scenes)
      return finalize({ ...state, scenes, chapters })
    }

    case 'UPDATE_SCENE': {
      const { chapterId, sceneIndex, patch } = action.payload
      const scenes = { ...state.scenes }
      const list = [...(scenes[chapterId] || [])]
      if (!list[sceneIndex]) return state
      list[sceneIndex] = { ...list[sceneIndex], ...patch }
      scenes[chapterId] = list
      const chapters = syncChapterStats(state.chapters, scenes)
      return finalize({ ...state, scenes, chapters })
    }

    case 'DELETE_SCENE': {
      const { chapterId, sceneIndex } = action.payload
      const scenes = { ...state.scenes }
      const list = [...(scenes[chapterId] || [])]
      list.splice(sceneIndex, 1)
      scenes[chapterId] = list
      const chapters = syncChapterStats(state.chapters, scenes)
      return finalize({ ...state, scenes, chapters })
    }

    case 'UPDATE_ACT': {
      const { index, patch } = action.payload
      return finalize({
        ...state,
        acts: (state.acts || []).map((a, i) => (i === index ? { ...a, ...patch } : a)),
      })
    }

    case 'UPDATE_PLOT_LINE': {
      const { index, patch } = action.payload
      return finalize({
        ...state,
        plotLines: state.plotLines.map((l, i) => (i === index ? { ...l, ...patch } : l)),
      })
    }

    case 'UPDATE_COLLABORATION': {
      let collab = normalizeCollaboration({
        ...(state.collaboration || {}),
        ...action.payload,
      })
      if (collab.mode === 'team' && collab.writers.length === 0) {
        collab = ensureTeamSeed(collab, state.chapters)
      }
      return finalize({ ...state, collaboration: collab })
    }

    case 'ADD_WRITER': {
      const collab = normalizeCollaboration(state.collaboration)
      return finalize({
        ...state,
        collaboration: { ...collab, writers: [...collab.writers, action.payload] },
      })
    }

    case 'UPDATE_WRITER': {
      const { index, patch } = action.payload
      const collab = normalizeCollaboration(state.collaboration)
      return finalize({
        ...state,
        collaboration: {
          ...collab,
          writers: collab.writers.map((w, i) => (i === index ? { ...w, ...patch } : w)),
        },
      })
    }

    case 'DELETE_WRITER': {
      const collab = normalizeCollaboration(state.collaboration)
      const removedId = collab.writers[action.payload]?.id
      const writers = collab.writers.filter((_, i) => i !== action.payload)
      const chapterAssignments = collab.chapterAssignments.map(a => ({
        ...a,
        primaryWriterId: a.primaryWriterId === removedId ? '' : a.primaryWriterId,
        collaboratorIds: (a.collaboratorIds || []).filter(id => id !== removedId),
      }))
      const handoverNotes = collab.handoverNotes.filter(
        h => h.fromWriterId !== removedId && h.toWriterId !== removedId
      )
      return finalize({
        ...state,
        collaboration: { ...collab, writers, chapterAssignments, handoverNotes },
      })
    }

    case 'SET_CHAPTER_ASSIGNMENT': {
      const collab = normalizeCollaboration(state.collaboration)
      const { chapterId, patch } = action.payload
      return finalize({
        ...state,
        collaboration: {
          ...collab,
          chapterAssignments: upsertChapterAssignment(collab.chapterAssignments, chapterId, patch),
        },
      })
    }

    case 'REMOVE_CHAPTER_ASSIGNMENT': {
      const collab = normalizeCollaboration(state.collaboration)
      return finalize({
        ...state,
        collaboration: {
          ...collab,
          chapterAssignments: collab.chapterAssignments.filter(
            a => a.chapterId !== action.payload
          ),
        },
      })
    }

    case 'ADD_HANDOVER': {
      const collab = normalizeCollaboration(state.collaboration)
      return finalize({
        ...state,
        collaboration: { ...collab, handoverNotes: [...collab.handoverNotes, action.payload] },
      })
    }

    case 'UPDATE_HANDOVER': {
      const { index, patch } = action.payload
      const collab = normalizeCollaboration(state.collaboration)
      return finalize({
        ...state,
        collaboration: {
          ...collab,
          handoverNotes: collab.handoverNotes.map((h, i) =>
            i === index ? { ...h, ...patch } : h
          ),
        },
      })
    }

    case 'DELETE_HANDOVER': {
      const collab = normalizeCollaboration(state.collaboration)
      return finalize({
        ...state,
        collaboration: {
          ...collab,
          handoverNotes: collab.handoverNotes.filter((_, i) => i !== action.payload),
        },
      })
    }

    case 'ADD_SYNC_LOG': {
      const collab = normalizeCollaboration(state.collaboration)
      return finalize({
        ...state,
        collaboration: { ...collab, syncLog: [...collab.syncLog, action.payload] },
      })
    }

    case 'UPDATE_SYNC_LOG': {
      const { index, patch } = action.payload
      const collab = normalizeCollaboration(state.collaboration)
      return finalize({
        ...state,
        collaboration: {
          ...collab,
          syncLog: collab.syncLog.map((s, i) => (i === index ? { ...s, ...patch } : s)),
        },
      })
    }

    case 'DELETE_SYNC_LOG': {
      const collab = normalizeCollaboration(state.collaboration)
      return finalize({
        ...state,
        collaboration: {
          ...collab,
          syncLog: collab.syncLog.filter((_, i) => i !== action.payload),
        },
      })
    }

    case 'CLEAR_STALE':
      return finalize({ ...state, staleMarkers: {} })

    case 'SET_NODE_STATUS': {
      const { nodeKey, status } = action.payload
      const phases = state.phases.map(phase => ({
        ...phase,
        nodes: phase.nodes.map(n =>
          n.nodeKey === nodeKey ? { ...n, status } : n
        ),
      }))
      return finalize({ ...state, phases })
    }

    case 'COMPLETE_NODE': {
      const { nodeKey } = action.payload
      // 标记节点为完成
      let phases = state.phases.map(phase => ({
        ...phase,
        nodes: phase.nodes.map(n =>
          n.nodeKey === nodeKey ? { ...n, status: 'completed' } : n
        ),
      }))
      
      // 解锁下游节点
      const updatedState = { ...state, phases }
      phases = phases.map(phase => ({
        ...phase,
        nodes: phase.nodes.map(node => {
          if (node.dependsOn?.includes(nodeKey)) {
            const allDepsMet = node.dependsOn?.every(dep => {
              for (const p of updatedState.phases) {
                const depNode = p.nodes?.find(n => n.nodeKey === dep)
                if (depNode && depNode.status === 'completed') return true
              }
              return dep === 'N-0'
            })
            if (allDepsMet) {
              return { ...node, status: 'unlocked' }
            }
          }
          return node
        })
      }))
      
      // 重新计算进度
      const progress = aggregateProgress({ ...state, phases })
      return finalize({ ...state, phases, progress })
    }

    case 'UPDATE_PROGRESS': {
      const progress = aggregateProgress(state)
      return finalize({ ...state, progress })
    }

    case 'VALIDATE_PROJECT': {
      const result = validateProject(state)
      return finalize({ ...state, validationResult: result })
    }

    case 'APPLY_NODE_GENERATION': {
      const { nodeKey, data, mode, chapterId, sceneChapterId } = action.payload
      return finalize(applyNodeGeneration(state, nodeKey, data, { mode, chapterId, sceneChapterId }))
    }

    case 'EXECUTE_NODE': {
      const { nodeKey, data } = action.payload
      // 根据节点类型写入数据
      let updated = { ...state }
      
      switch (nodeKey) {
        case 'N-1.1':
          updated.characters = [...(updated.characters || []), ...data]
          break
        case 'N-1.2':
          updated.locations = [...(updated.locations || []), ...data]
          break
        case 'N-1.3':
          updated.magicSystem = [...(updated.magicSystem || []), ...data]
          break
        case 'N-1.4':
          updated.timeline = [...(updated.timeline || []), ...data]
          break
        case 'N-1.5':
          updated.constraints = [...(updated.constraints || []), ...data]
          break
        case 'N-5.1': {
          const currentChapterId = updated.chapters?.[0]?.id || 1
          if (!updated.scenes) updated.scenes = {}
          if (!updated.scenes[currentChapterId]) updated.scenes[currentChapterId] = []
          updated.scenes[currentChapterId].push(data)
          updated.chapters = syncChapterStats(updated.chapters, updated.scenes)
          break
        }
      }
      
      // 标记节点完成
      updated.phases = updated.phases.map(phase => ({
        ...phase,
        nodes: phase.nodes.map(n =>
          n.nodeKey === nodeKey ? { ...n, status: 'completed' } : n
        ),
      }))
      
      // 更新进度
      const progress = aggregateProgress(updated)
      return finalize({ ...updated, progress })
    }

    default:
      return state
  }
}

const initialProjectRef = { current: null }
function getInitialReducerState() {
  if (!initialProjectRef.current) {
    initialProjectRef.current = initProjectState()
  }
  return initialProjectRef.current
}

export function NovelProvider({ children }) {
  const [project, dispatch] = useReducer(projectReducer, null, getInitialReducerState)
  const [view, setView] = useState('home')
  const [phase, setPhase] = useState(0)
  const [chapterIdx, setChapterIdx] = useState(0)
  const [sceneIdx, setSceneIdx] = useState(0)
  const [generating, setGenerating] = useState(false)
  const [saveStatus, setSaveStatus] = useState('saved')
  const [editingCharIdx, setEditingCharIdx] = useState(0)
  const [editingRuleIdx, setEditingRuleIdx] = useState(0)
  const [editingLocIdx, setEditingLocIdx] = useState(0)
  const [editingMagicIdx, setEditingMagicIdx] = useState(0)
  const [editingTimelineIdx, setEditingTimelineIdx] = useState(0)
  const [editingFsIdx, setEditingFsIdx] = useState(0)
  const [editingVolumeIdx, setEditingVolumeIdx] = useState(0)
  const [editingChapterIdx, setEditingChapterIdx] = useState(0)
  const [selectedNodeKey, setSelectedNodeKey] = useState(null)
  const [nodeWorkflow, setNodeWorkflow] = useState(null)
  const [workflowOpen, setWorkflowOpen] = useState(false)
  const nodeRunnerRef = useRef(null)
  const importInputRef = useRef(null)
  const saveTimerRef = useRef(null)
  const repairedRef = useRef(false)

  // 仅修复一次，避免与 SET_PROJECT 形成死循环
  useEffect(() => {
    if (isValidProject(project)) {
      repairedRef.current = false
      return
    }
    if (repairedRef.current) return
    repairedRef.current = true
    console.warn('[Novel] 运行时检测到无效 project，正在恢复默认数据')
    clearStoredProject()
    resetSeedCache()
    dispatch({ type: 'SET_PROJECT', payload: createDefaultProject() })
  }, [project])

  if (!isValidProject(project)) {
    return (
      <div style={{ padding: 40, color: '#e8e0d4', fontFamily: 'serif', background: '#0b0a09', minHeight: '100vh' }}>
        正在恢复项目数据…
      </div>
    )
  }

  const { chapters, scenes, foreshadows, characters, constraints, staleMarkers, volumes = [] } = project
  const chapter = chapters[chapterIdx] ?? null
  const chapterScenes = chapter ? (scenes[chapter.id] || []) : []
  const scene = chapterScenes[sceneIdx] ?? null

  const validation = useMemo(
    () => validateCurrentScene(project, chapter, sceneIdx),
    [project, chapter, sceneIdx]
  )

  const globalScan = useMemo(() => validateAllScenes(project), [project])

  const healthScore = useMemo(() => calculateHealthScore(project), [project])

  const totalWords = chapters.reduce((s, c) => s + c.words, 0)
  const totalTarget = chapters.reduce((s, c) => s + c.targetWords, 0)
  const doneChapters = chapters.filter(c => c.status === 'done').length
  const resolvedFs = foreshadows.filter(f => f.status === 'resolved').length
  const plantedFs = foreshadows.filter(f => f.status === 'planted').length
  const totalFs = foreshadows.length
  const staleCount = Object.keys(staleMarkers || {}).length

  useEffect(() => {
    setSaveStatus('saving')
    clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      const ok = saveProject(project)
      setSaveStatus(ok ? 'saved' : 'error')
    }, 400)
    return () => clearTimeout(saveTimerRef.current)
  }, [project])

  const selectChapter = useCallback((idx) => {
    setChapterIdx(idx)
    setSceneIdx(0)
  }, [])

  const updateSceneContent = useCallback((content) => {
    if (!chapter) return
    dispatch({
      type: 'UPDATE_SCENE_CONTENT',
      payload: { chapterId: chapter.id, sceneIndex: sceneIdx, content },
    })
  }, [chapter, sceneIdx])

  const updateSettings = useCallback((patch) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: patch })
  }, [])

  const updateMeta = useCallback((patch) => {
    dispatch({ type: 'UPDATE_META', payload: patch })
  }, [])

  const addCharacter = useCallback(() => {
    const c = createBlankCharacter(project.characters)
    dispatch({ type: 'ADD_CHARACTER', payload: c })
    setEditingCharIdx(project.characters.length)
  }, [project.characters])

  const updateCharacter = useCallback((index, patch, { markStale = true } = {}) => {
    dispatch({ type: 'UPDATE_CHARACTER', payload: { index, patch, markStale } })
  }, [])

  const deleteCharacter = useCallback((index) => {
    if (!confirm('确定删除该角色？')) return
    dispatch({ type: 'DELETE_CHARACTER', payload: index })
    setEditingCharIdx(i => Math.max(0, i >= index ? i - 1 : i))
  }, [])

  const addConstraint = useCallback(() => {
    const id = nextConstraintId(project.constraints)
    const rule = { id, type: 'soft', name: '新规则', desc: '' }
    dispatch({ type: 'ADD_CONSTRAINT', payload: rule })
    setEditingRuleIdx(project.constraints.length)
  }, [project.constraints])

  const updateConstraint = useCallback((index, patch) => {
    dispatch({ type: 'UPDATE_CONSTRAINT', payload: { index, patch } })
  }, [])

  const deleteConstraint = useCallback((index) => {
    if (!confirm('确定删除该规则？')) return
    dispatch({ type: 'DELETE_CONSTRAINT', payload: index })
    setEditingRuleIdx(i => Math.max(0, i >= index ? i - 1 : i))
  }, [])

  // --- Locations ---
  const addLocation = useCallback(() => {
    const id = `L${String((project.locations || []).length + 1).padStart(2, '0')}`
    const loc = { id, name: '新地点', type: 'building', era: '', features: '', connectedTo: [], mood: '' }
    dispatch({ type: 'ADD_LOCATION', payload: loc })
    setEditingLocIdx((project.locations || []).length)
  }, [project.locations])

  const updateLocation = useCallback((index, patch) => {
    dispatch({ type: 'UPDATE_LOCATION', payload: { index, patch } })
  }, [])

  const deleteLocation = useCallback((index) => {
    if (!confirm('确定删除该地点？')) return
    dispatch({ type: 'DELETE_LOCATION', payload: index })
    setEditingLocIdx(i => Math.max(0, i >= index ? i - 1 : i))
  }, [])

  // --- Magic System ---
  const addMagic = useCallback(() => {
    const id = `M${String((project.magicSystem || []).length + 1).padStart(2, '0')}`
    const m = { id, name: '新设定', type: 'ability', source: '', rules: '', cost: '', usage: '', note: '' }
    dispatch({ type: 'ADD_MAGIC', payload: m })
    setEditingMagicIdx((project.magicSystem || []).length)
  }, [project.magicSystem])

  const updateMagic = useCallback((index, patch) => {
    dispatch({ type: 'UPDATE_MAGIC', payload: { index, patch } })
  }, [])

  const deleteMagic = useCallback((index) => {
    if (!confirm('确定删除该设定？')) return
    dispatch({ type: 'DELETE_MAGIC', payload: index })
    setEditingMagicIdx(i => Math.max(0, i >= index ? i - 1 : i))
  }, [])

  // --- Timeline ---
  const addTimelineEvent = useCallback(() => {
    const id = `T${String((project.timeline || []).length + 1).padStart(2, '0')}`
    const t = { id, year: '', event: '新事件', era: '', characters: [], locations: [], significance: '中' }
    dispatch({ type: 'ADD_TIMELINE', payload: t })
    setEditingTimelineIdx((project.timeline || []).length)
  }, [project.timeline])

  const updateTimelineEvent = useCallback((index, patch) => {
    dispatch({ type: 'UPDATE_TIMELINE', payload: { index, patch } })
  }, [])

  const deleteTimelineEvent = useCallback((index) => {
    if (!confirm('确定删除该事件？')) return
    dispatch({ type: 'DELETE_TIMELINE', payload: index })
    setEditingTimelineIdx(i => Math.max(0, i >= index ? i - 1 : i))
  }, [])

  const nextForeshadowId = useCallback(() => {
    const max = foreshadows.reduce((m, f) => {
      const n = parseInt(f.id.replace('F', ''))
      return isNaN(n) ? m : Math.max(m, n)
    }, 0)
    return `F${String(max + 1).padStart(2, '0')}`
  }, [foreshadows])

  const addForeshadow = useCallback(() => {
    const id = nextForeshadowId()
    const fs = { id, title: '新伏笔', importance: 0.5, status: 'drafted', planted: '-', deadline: 'Ch30', desc: '' }
    dispatch({ type: 'ADD_FORESHADOW', payload: fs })
    setEditingFsIdx(foreshadows.length)
  }, [foreshadows, nextForeshadowId])

  const updateForeshadow = useCallback((index, patch) => {
    dispatch({ type: 'UPDATE_FORESHADOW', payload: { index, patch } })
  }, [])

  const deleteForeshadow = useCallback((index) => {
    if (!confirm('确定删除该伏笔？')) return
    dispatch({ type: 'DELETE_FORESHADOW', payload: index })
    setEditingFsIdx(i => Math.max(0, i >= index ? i - 1 : i))
  }, [])

  const nextVolumeId = useCallback(() => {
    const max = (volumes || []).reduce((m, v) => {
      const n = parseInt(v.id.replace('v', ''))
      return isNaN(n) ? m : Math.max(m, n)
    }, 0)
    return `v${max + 1}`
  }, [volumes])

  const addVolume = useCallback(() => {
    const id = nextVolumeId()
    const vol = { id, name: '新分册', range: 'Ch1–Ch10', chapters: [], hook: '', midpoint: '', climax: '', desc: '' }
    dispatch({ type: 'ADD_VOLUME', payload: vol })
    setEditingVolumeIdx((volumes || []).length)
  }, [volumes, nextVolumeId])

  const updateVolume = useCallback((index, patch) => {
    dispatch({ type: 'UPDATE_VOLUME', payload: { index, patch } })
  }, [])

  const deleteVolume = useCallback((index) => {
    if (!confirm('确定删除该分册？')) return
    dispatch({ type: 'DELETE_VOLUME', payload: index })
    setEditingVolumeIdx(i => Math.max(0, i >= index ? i - 1 : i))
  }, [])

  const nextChapterId = useCallback(() => {
    const max = chapters.reduce((m, c) => Math.max(m, c.id), 0)
    return max + 1
  }, [chapters])

  const addChapter = useCallback(() => {
    const id = nextChapterId()
    const ch = {
      id,
      title: `第${id}章`,
      status: 'locked',
      words: 0,
      targetWords: 3000,
      scenes: 0,
      characters: [],
      locations: [],
      plotLines: [],
      momentum: 0.5,
      emotionPeak: 0.5,
    }
    dispatch({ type: 'ADD_CHAPTER', payload: ch })
    setEditingChapterIdx(chapters.length)
  }, [chapters, nextChapterId])

  const updateChapter = useCallback((index, patch) => {
    dispatch({ type: 'UPDATE_CHAPTER', payload: { index, patch } })
  }, [])

  const deleteChapter = useCallback((index) => {
    if (!confirm('确定删除该章节？')) return
    dispatch({ type: 'DELETE_CHAPTER', payload: index })
    setEditingChapterIdx(i => Math.max(0, i >= index ? i - 1 : i))
  }, [])

  const addScene = useCallback((chapterId) => {
    const sceneNum = (scenes[chapterId] || []).length + 1
    const scene = {
      id: `ch${chapterId}_s${sceneNum}`,
      title: `场景${sceneNum}`,
      pov: '',
      setting: '',
      content: '',
      beats: [],
      conflict: { type: [], intensity: 0.3, turningPoint: false, resolution: '' },
      foreshadow: { planted: [], triggered: [], resolved: [] },
    }
    dispatch({ type: 'ADD_SCENE', payload: { chapterId, scene } })
    setSceneIdx((scenes[chapterId] || []).length)
  }, [scenes])

  const updateScene = useCallback((chapterId, sceneIndex, patch) => {
    dispatch({ type: 'UPDATE_SCENE', payload: { chapterId, sceneIndex, patch } })
  }, [])

  const deleteScene = useCallback((chapterId, sceneIndex) => {
    if (!confirm('确定删除该场景？')) return
    dispatch({ type: 'DELETE_SCENE', payload: { chapterId, sceneIndex } })
    setSceneIdx(i => Math.max(0, i >= sceneIndex ? i - 1 : i))
  }, [])

  const clearStaleMarkers = useCallback(() => {
    dispatch({ type: 'CLEAR_STALE' })
  }, [])

  const runValidation = useCallback(() => validation, [validation])

  const exportProject = useCallback(() => {
    downloadProjectJson(buildExportPayload(project))
  }, [project])

  const importProject = useCallback(async (file) => {
    try {
      const imported = await readProjectFromFile(file)
      dispatch({ type: 'SET_PROJECT', payload: imported })
      setChapterIdx(0)
      setSceneIdx(0)
      setEditingCharIdx(0)
      setEditingRuleIdx(0)
      return true
    } catch (e) {
      alert(e.message || '导入失败')
      return false
    }
  }, [])

  const triggerImport = useCallback(() => {
    importInputRef.current?.click()
  }, [])

  const handleImportFile = useCallback(async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    await importProject(file)
  }, [importProject])

  const resetProject = useCallback(() => {
    if (!confirm('确定恢复为默认示例数据？当前未导出的修改将丢失。')) return
    clearStoredProject()
    resetSeedCache()
    dispatch({ type: 'SET_PROJECT', payload: createDefaultProject() })
    setChapterIdx(0)
    setSceneIdx(0)
    setEditingCharIdx(0)
    setEditingRuleIdx(0)
  }, [])

  const generateScene = useCallback(async () => {
    setGenerating(true)
    await new Promise(r => setTimeout(r, 2000))
    setGenerating(false)
    alert('场景生成完成！实际应用中会调用 AI API 并自动校验。')
  }, [])

  const getRunner = useCallback((nodeKey) => {
    if (!nodeRunnerRef.current || nodeRunnerRef.current.nodeKey !== nodeKey) {
      nodeRunnerRef.current = createNodeRunner(project, nodeKey)
    }
    return nodeRunnerRef.current
  }, [project])

  const clearNodeWorkflow = useCallback(() => {
    setNodeWorkflow(null)
    setWorkflowOpen(false)
    nodeRunnerRef.current = null
  }, [])

  const openNodeWorkflow = useCallback((nodeKey) => {
    setSelectedNodeKey(nodeKey)
    setWorkflowOpen(true)
    setNodeWorkflow({ nodeKey, step: 0, logs: [], errors: [], warnings: [], busy: false })
    nodeRunnerRef.current = createNodeRunner(project, nodeKey)
  }, [project])

  const runNodeRefineStep = useCallback(async (nodeKey, step, options = {}) => {
    if (!canNodeAiGenerate(nodeKey)) {
      return { success: false, errors: ['该节点不支持 AI 完善'] }
    }
    setNodeWorkflow(prev => ({ ...prev, nodeKey, busy: true, errors: [], warnings: [] }))
    setGenerating(true)
    const runner = getRunner(nodeKey)
    const logs = [...(nodeWorkflow?.logs || [])]

    try {
      if (step === 'load') {
        const r = await runner.loadContext()
        logs.push(`① 已加载上下文 ${r.meta?.size ?? 0} bytes`)
        setNodeWorkflow({
          nodeKey, step: 1, busy: false, logs,
          contextMeta: r.meta, generatedData: null,
          errors: runner.errors, warnings: runner.warnings,
        })
        return { success: true, contextMeta: r.meta, context: r.context }
      }

      if (step === 'generate') {
        if (!runner.context) await runner.loadContext()
        const r = await runner.generate(options)
        logs.push(`② 已生成（${r.source === 'ai' ? 'AI' : '模拟'}）`)
        setNodeWorkflow({
          nodeKey, step: 2, busy: false, logs,
          contextMeta: runner.contextMeta,
          generatedData: r.data,
          errors: runner.errors,
          warnings: [...runner.warnings, ...(r.warnings || [])],
        })
        return r
      }

      if (step === 'validate') {
        if (options.data !== undefined) runner.generatedData = options.data
        const r = runner.validate()
        logs.push(r.success ? '③ 校验通过' : `③ 校验失败：${r.errors.join('; ')}`)
        setNodeWorkflow({
          nodeKey, step: r.success ? 3 : 2, busy: false, logs,
          contextMeta: runner.contextMeta,
          generatedData: runner.generatedData,
          errors: r.errors,
          warnings: runner.warnings,
          validation: r.validation,
        })
        return r
      }

      return { success: false }
    } catch (e) {
      const err = [e.message || String(e)]
      setNodeWorkflow(prev => ({ ...prev, nodeKey, busy: false, errors: err, logs }))
      return { success: false, errors: err }
    } finally {
      setGenerating(false)
    }
  }, [getRunner, nodeWorkflow?.logs])

  const commitNodeRefine = useCallback((nodeKey, data, options = {}) => {
    dispatch({
      type: 'APPLY_NODE_GENERATION',
      payload: {
        nodeKey,
        data,
        mode: options.mode || 'merge',
        chapterId: options.chapterId,
        sceneChapterId: options.sceneChapterId ?? chapters[chapterIdx]?.id,
      },
    })
    clearNodeWorkflow()
    return { success: true }
  }, [chapterIdx, chapters, clearNodeWorkflow])

  const executeNode = useCallback(async (nodeKey, options = {}) => {
    setGenerating(true)
    try {
      openNodeWorkflow(nodeKey)
      await runNodeRefineStep(nodeKey, 'load')
      const gen = await runNodeRefineStep(nodeKey, 'generate', options)
      if (!gen?.success) return { success: false, logs: nodeWorkflow?.logs }
      const val = await runNodeRefineStep(nodeKey, 'validate', { data: gen.data })
      if (!val?.success) return { success: false, logs: nodeWorkflow?.logs }
      commitNodeRefine(nodeKey, gen.data, options)
      return { success: true }
    } finally {
      setGenerating(false)
    }
  }, [openNodeWorkflow, runNodeRefineStep, commitNodeRefine, nodeWorkflow?.logs])

  const completeNode = useCallback((nodeKey) => {
    dispatch({ type: 'COMPLETE_NODE', payload: { nodeKey } })
  }, [])

  const setNodeStatus = useCallback((nodeKey, status) => {
    dispatch({ type: 'SET_NODE_STATUS', payload: { nodeKey, status } })
  }, [])

  const updateAct = useCallback((index, patch) => {
    dispatch({ type: 'UPDATE_ACT', payload: { index, patch } })
  }, [])

  const updatePlotLine = useCallback((index, patch) => {
    dispatch({ type: 'UPDATE_PLOT_LINE', payload: { index, patch } })
  }, [])

  const updateCollaboration = useCallback((patch) => {
    dispatch({ type: 'UPDATE_COLLABORATION', payload: patch })
    if (patch.mode === 'solo') {
      dispatch({ type: 'SET_NODE_STATUS', payload: { nodeKey: 'N-3.1', status: 'skip' } })
      dispatch({ type: 'SET_NODE_STATUS', payload: { nodeKey: 'N-6.3', status: 'skip' } })
    } else if (patch.mode === 'team') {
      dispatch({ type: 'SET_NODE_STATUS', payload: { nodeKey: 'N-3.1', status: 'progress' } })
      dispatch({ type: 'SET_NODE_STATUS', payload: { nodeKey: 'N-6.3', status: 'unlocked' } })
    }
  }, [])

  const collab = normalizeCollaboration(project.collaboration)

  const addWriter = useCallback(() => {
    dispatch({ type: 'ADD_WRITER', payload: createWriter(collab.writers) })
  }, [collab.writers])

  const updateWriter = useCallback((index, patch) => {
    dispatch({ type: 'UPDATE_WRITER', payload: { index, patch } })
  }, [])

  const deleteWriter = useCallback((index) => {
    if (!confirm('确定删除该作者？相关章节归属将清空。')) return
    dispatch({ type: 'DELETE_WRITER', payload: index })
  }, [])

  const setChapterAssignment = useCallback((chapterId, patch) => {
    dispatch({ type: 'SET_CHAPTER_ASSIGNMENT', payload: { chapterId, patch } })
  }, [])

  const removeChapterAssignment = useCallback((chapterId) => {
    dispatch({ type: 'REMOVE_CHAPTER_ASSIGNMENT', payload: chapterId })
  }, [])

  const addHandover = useCallback(() => {
    dispatch({ type: 'ADD_HANDOVER', payload: createHandover(collab.handoverNotes) })
  }, [collab.handoverNotes])

  const updateHandover = useCallback((index, patch) => {
    dispatch({ type: 'UPDATE_HANDOVER', payload: { index, patch } })
  }, [])

  const deleteHandover = useCallback((index) => {
    if (!confirm('确定删除该交接记录？')) return
    dispatch({ type: 'DELETE_HANDOVER', payload: index })
  }, [])

  const addSyncLog = useCallback(() => {
    dispatch({ type: 'ADD_SYNC_LOG', payload: createSyncLogEntry(collab.syncLog) })
  }, [collab.syncLog])

  const updateSyncLog = useCallback((index, patch) => {
    dispatch({ type: 'UPDATE_SYNC_LOG', payload: { index, patch } })
  }, [])

  const deleteSyncLog = useCallback((index) => {
    if (!confirm('确定删除该同步记录？')) return
    dispatch({ type: 'DELETE_SYNC_LOG', payload: index })
  }, [])

  const updateProgress = useCallback(() => {
    dispatch({ type: 'UPDATE_PROGRESS' })
  }, [])

  const validateProjectData = useCallback(() => {
    const result = validateProject(project)
    dispatch({ type: 'VALIDATE_PROJECT', payload: result })
    return result
  }, [project])

  const value = {
    project,
    ...project,
    view, setView,
    phase, setPhase,
    chapterIdx, selectChapter,
    sceneIdx, setSceneIdx,
    chapter, scenes: chapterScenes, scene,
    totalWords, totalTarget,
    doneChapters, resolvedFs, plantedFs, totalFs,
    generating, generateScene,
    updateSceneContent,
    updateSettings,
    updateMeta,
    exportProject,
    importProject,
    triggerImport,
    resetProject,
    saveStatus,
    importInputRef,
    handleImportFile,
    countWords,
    dispatch,
    validation,
    runValidation,
    addCharacter,
    updateCharacter,
    deleteCharacter,
    editingCharIdx,
    setEditingCharIdx,
    addConstraint,
    updateConstraint,
    deleteConstraint,
    editingRuleIdx,
    setEditingRuleIdx,
    addLocation,
    updateLocation,
    deleteLocation,
    editingLocIdx,
    setEditingLocIdx,
    addMagic,
    updateMagic,
    deleteMagic,
    editingMagicIdx,
    setEditingMagicIdx,
    addTimelineEvent,
    updateTimelineEvent,
    deleteTimelineEvent,
    editingTimelineIdx,
    setEditingTimelineIdx,
    addForeshadow,
    updateForeshadow,
    deleteForeshadow,
    editingFsIdx,
    setEditingFsIdx,
    addVolume,
    updateVolume,
    deleteVolume,
    editingVolumeIdx,
    setEditingVolumeIdx,
    addChapter,
    updateChapter,
    deleteChapter,
    editingChapterIdx,
    setEditingChapterIdx,
    addScene,
    updateScene,
    deleteScene,
    clearStaleMarkers,
    staleCount,
    executeNode,
    nodeWorkflow,
    workflowOpen,
    openNodeWorkflow,
    runNodeRefineStep,
    commitNodeRefine,
    clearNodeWorkflow,
    completeNode,
    setNodeStatus,
    updateAct,
    updatePlotLine,
    updateCollaboration,
    collaboration: collab,
    addWriter,
    updateWriter,
    deleteWriter,
    setChapterAssignment,
    removeChapterAssignment,
    addHandover,
    updateHandover,
    deleteHandover,
    addSyncLog,
    updateSyncLog,
    deleteSyncLog,
    globalScan,
    healthScore,
    updateProgress,
    validateProjectData,
    selectedNodeKey,
    setSelectedNodeKey,
  }

  return (
    <NovelContext.Provider value={value}>
      <input
        ref={importInputRef}
        type="file"
        accept=".json,application/json"
        style={{ display: 'none' }}
        onChange={handleImportFile}
      />
      {children}
    </NovelContext.Provider>
  )
}

export const useNovel = () => useContext(NovelContext)
