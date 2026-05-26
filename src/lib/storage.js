import {
  STORAGE_KEY,
  normalizeProject,
  createDefaultProject,
  isValidProject,
  resetSeedCache,
} from './project'

export function loadProject() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const project = normalizeProject(parsed)
    if (!isValidProject(project)) {
      console.warn('[Novel] localStorage 数据不完整，已丢弃缓存', {
        keys: Object.keys(parsed || {}),
        chapters: parsed?.chapters ?? parsed?.CHAPTERS,
      })
      clearStoredProject()
      resetSeedCache()
      return null
    }
    return project
  } catch (e) {
    console.warn('[Novel] localStorage 读取失败，已清除缓存', e)
    clearStoredProject()
    resetSeedCache()
    return null
  }
}

function stripApiKey(project) {
  return {
    ...project,
    settings: project.settings ? { ...project.settings, apiKey: '' } : project.settings,
  }
}

export function saveProject(project) {
  if (!isValidProject(project)) {
    console.error('[Novel] 拒绝保存无效项目数据', project)
    return false
  }
  try {
    const safe = stripApiKey(project)
    const payload = {
      ...safe,
      meta: {
        ...safe.meta,
        updatedAt: new Date().toISOString(),
      },
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    return true
  } catch (e) {
    console.error('[Novel] localStorage 保存失败', e)
    return false
  }
}

export function clearStoredProject() {
  localStorage.removeItem(STORAGE_KEY)
}

export function downloadProjectJson(project, filename) {
  const name = filename || `${project.meta?.title || 'snowflake'}_export.json`
  const safe = stripApiKey(project)
  const blob = new Blob([JSON.stringify(safe, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name.replace(/[/\\?%*:|"<>]/g, '_')
  a.click()
  URL.revokeObjectURL(url)
}

export function readProjectFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result)
        const project = normalizeProject(parsed)
        if (!isValidProject(project)) {
          reject(new Error('JSON 缺少必要字段（chapters / characters / scenes）'))
          return
        }
        resolve(project)
      } catch (e) {
        reject(new Error('JSON 格式无效'))
      }
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsText(file)
  })
}

export function getInitialProject() {
  try {
    return loadProject() ?? createDefaultProject()
  } catch (e) {
    console.error('[Novel] 初始化项目失败，使用默认数据', e)
    clearStoredProject()
    resetSeedCache()
    return createDefaultProject()
  }
}
