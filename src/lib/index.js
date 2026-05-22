/** Snowflake Novel Engine - 核心模块导出 */

// 项目管理
export { 
  createDefaultProject,
  normalizeProject,
  syncChapterStats,
  countWords,
  buildExportPayload,
  nextConstraintId,
  createBlankCharacter,
  isValidProject,
  resetSeedCache,
} from './project'

// 节点系统
export { 
  NODE_STATUS,
  getEffectiveNodeStatus,
  isNodeCompleted,
  enrichProject,
  computeStaleFromCharacterChange,
} from './nodes'

// 约束引擎
export { 
  validateCurrentScene,
  validateScene,
  CHECKS,
} from './constraints-engine'

// 上下文编排器
export { 
  CONTEXT_SLICE,
  NODE_CONTEXT_MAP,
  loadContextForNode,
  getContextSize,
  isContextSizeValid,
  trimContextToLimit,
  getNodeContext,
  formatContextForPrompt,
} from './context-orchestrator'

// AI 客户端
export { 
  AI_MODEL,
  AIClient,
  getAIClient,
} from './ai-client'

// Schema 校验器
export { 
  validateSchema,
  validateArray,
  validateProject,
  formatValidationErrors,
} from './schema-validator'

// 进度聚合器
export { 
  calculateCharacterArcProgress,
  calculatePlotLineProgress,
  calculateChapterProgress,
  calculateForeshadowStats,
  calculateSceneStats,
  calculateFiveLineProgress,
  calculateHealthScore,
  aggregateProgress,
  syncChapterStats as syncChapterStatsProgress,
  isNodeUnlocked,
  isNodeCompleted as checkNodeCompleted,
  unlockDownstreamNodes,
  completeNode,
} from './progress-aggregator'

// 伏笔状态机
export { 
  FORESHADOW_STATUS,
  STATUS_LABELS,
  validateTransition,
  transitionStatus,
  checkOverdue,
  checkAllOverdue,
  calculateRecoveryRate,
  validateForeshadow,
  validateForeshadows,
  generateForeshadowId,
  getStatusHistory,
  getAvailableTransitions,
} from './foreshadow-engine'

// 节点执行器
export { 
  EXECUTION_STATUS,
  NodeExecutor,
  createNodeExecutor,
} from './node-executor'

// 存储模块
export { 
  getInitialProject,
  saveProject,
  clearStoredProject,
  downloadProjectJson,
  readProjectFromFile,
} from './storage'