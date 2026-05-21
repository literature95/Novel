// src/store.jsx
import { createContext, useContext, useState, useCallback } from 'react'
import { CHAPTERS, SCENES, FORESHADOWS } from './data'

const NovelContext = createContext()

export function NovelProvider({ children }) {
  const [view, setView] = useState('structure')
  const [phase, setPhase] = useState(0)
  const [chapterIdx, setChapterIdx] = useState(0)
  const [sceneIdx, setSceneIdx] = useState(0)
  const [generating, setGenerating] = useState(false)

  const chapter = CHAPTERS[chapterIdx]
  const scenes = SCENES[chapter.id] || []
  const scene = scenes[sceneIdx] || null

  const totalWords = CHAPTERS.reduce((s, c) => s + c.words, 0)
  const totalTarget = CHAPTERS.reduce((s, c) => s + c.targetWords, 0)
  const doneChapters = CHAPTERS.filter(c => c.status === 'done').length
  const resolvedFs = FORESHADOWS.filter(f => f.status === 'resolved').length
  const plantedFs = FORESHADOWS.filter(f => f.status === 'planted').length
  const totalFs = FORESHADOWS.length

  const selectChapter = useCallback((idx) => {
    setChapterIdx(idx)
    setSceneIdx(0)
  }, [])

  const generateScene = useCallback(async () => {
    setGenerating(true)
    await new Promise(r => setTimeout(r, 2000))
    setGenerating(false)
    alert('场景生成完成！实际应用中会调用 AI API 并自动校验。')
  }, [])

  const value = {
    view, setView,
    phase, setPhase,
    chapterIdx, selectChapter,
    sceneIdx, setSceneIdx,
    chapter, scenes, scene,
    totalWords, totalTarget,
    doneChapters, resolvedFs, plantedFs, totalFs,
    generating, generateScene
  }

  return <NovelContext.Provider value={value}>{children}</NovelContext.Provider>
}

export const useNovel = () => useContext(NovelContext)
