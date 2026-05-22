// src/components/structure/StructureView.jsx
import { useNovel } from '../../store'
import { getEffectiveNodeStatus, NODE_STATUS, isNodeCompleted } from '../../lib/nodes'
import CharacterPanel from './CharacterPanel'
import ConstraintPanel from './ConstraintPanel'
import LocationPanel from './LocationPanel'
import MagicPanel from './MagicPanel'
import TimelinePanel from './TimelinePanel'
import ForeshadowPanel from './ForeshadowPanel'
import VolumePanel from './VolumePanel'
import ChapterPanel from './ChapterPanel'
import ForeshadowBoard from './ForeshadowBoard'
import FinalReport from './FinalReport'
import CollaborationPanel from './CollaborationPanel'
import CollaborationSyncPanel from './CollaborationSyncPanel'
import ConstraintScanPanel from './ConstraintScanPanel'
import ActPlotPanel from './ActPlotPanel'
import NodeWorkflowPanel from './NodeWorkflowPanel'
import { canNodeAiGenerate } from '../../lib/node-ai-config'

function PhaseTabs() {
  const { phases, phase, setPhase } = useNovel()
  const phaseDot = { done: 'done', progress: 'progress', skip: 'skip', blocked: 'blocked', locked: 'locked' }
  return (
    <div className="struct-topbar">
      {phases.map((p, i) => (
        <div
          key={p.id}
          onClick={() => setPhase(i)}
          className={`phase-tab ${i === phase ? 'active' : ''}`}
        >
          <span className={`dot dot-${phaseDot[p.status] || 'progress'}`} />
          阶段{p.id}: {p.name}
        </div>
      ))}
    </div>
  )
}

function NodeWorkflowSection() {
  const { selectedNodeKey, workflowOpen, clearNodeWorkflow } = useNovel()
  if (!workflowOpen || !selectedNodeKey) return null
  return (
    <NodeWorkflowPanel
      nodeKey={selectedNodeKey}
      onClose={clearNodeWorkflow}
    />
  )
}

function NodeCard({ node, project, selectedNodeKey, onSelect, onComplete, onSetProgress, onRefine }) {
  const effective = getEffectiveNodeStatus(node, project)
  const meta = NODE_STATUS[effective] || NODE_STATUS.unlocked
  const isSelected = selectedNodeKey === node.nodeKey
  const blockedDeps = (node.dependsOn || []).filter(dep => !isNodeCompleted(dep, project))
  const canComplete = ['unlocked', 'progress', 'stale_review', 'stale_rewrite'].includes(effective)

  return (
    <div
      className={`struct-card node-card node-${effective} ${isSelected ? 'node-selected' : ''}`}
      onClick={() => onSelect?.(isSelected ? null : node.nodeKey)}
    >
      <div className="card-header">
        <span className="card-title">{node.name}</span>
        <span className={`card-status badge-${meta.badge}`}>{meta.label}</span>
      </div>
      <div className="card-desc">{node.desc}</div>
      {effective === 'blocked' && blockedDeps.length > 0 && (
        <div className="card-blocked-hint">等待完成：{blockedDeps.join('、')}</div>
      )}
      <div className="card-meta">
        <span>{node.nodeKey}</span>
        <span>{node.count} 条目</span>
        {node.dependsOn?.length > 0 && (
          <span title={node.dependsOn.join(', ')}>依赖 {node.dependsOn.length}</span>
        )}
      </div>
      {((canNodeAiGenerate(node.nodeKey) && onRefine) ||
        ((canComplete || effective === 'completed') && onComplete)) && (
        <div className="node-card-actions" onClick={e => e.stopPropagation()}>
          {canNodeAiGenerate(node.nodeKey) && onRefine && (
            <button type="button" className="btn btn-primary btn-sm" onClick={() => onRefine(node.nodeKey)}>
              ✦ 完善模型
            </button>
          )}
          {canComplete && onComplete && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onComplete(node.nodeKey)}>
              ✓ 标记完成
            </button>
          )}
          {effective === 'completed' && onSetProgress && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onSetProgress(node.nodeKey)}>
              重新编辑
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function StaleBanner() {
  const { staleMarkers, staleCount, clearStaleMarkers } = useNovel()
  if (staleCount === 0) return null

  const items = Object.entries(staleMarkers).map(([key, level]) => {
    const label = level === 'rewrite' ? '待重写' : '待审查'
    const sceneMatch = key.match(/^N-5\.1:(.+)$/)
    const chMatch = key.match(/^N-4\.2:ch(\d+)$/)
    let detail = key
    if (sceneMatch) detail = `场景 ${sceneMatch[1]}`
    if (chMatch) detail = `第 ${chMatch[1]} 章大纲`
    return { key, level, label, detail }
  })

  return (
    <div className="stale-banner">
      <div className="stale-banner-header">
        <strong>回溯提醒</strong> · 上游数据已变更，以下节点需处理（{staleCount}）
        <button type="button" className="btn btn-ghost btn-sm" onClick={clearStaleMarkers}>清除标记</button>
      </div>
      <ul className="stale-list">
        {items.map(({ key, level, label, detail }) => (
          <li key={key} className={level === 'rewrite' ? 'stale-rewrite' : 'stale-review'}>
            <span className="stale-tag">{label}</span>
            <span className="stale-key">{key}</span>
            <span className="stale-detail">{detail}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function useNodeActions() {
  const { completeNode, setNodeStatus, openNodeWorkflow } = useNovel()
  return {
    onComplete: completeNode,
    onSetProgress: nodeKey => setNodeStatus(nodeKey, 'progress'),
    onRefine: openNodeWorkflow,
  }
}

function Phase1() {
  const { phases, project, selectedNodeKey, setSelectedNodeKey } = useNovel()
  const nodeActions = useNodeActions()
  const phase = phases[0]

  const getPanelByNodeKey = (key) => {
    switch (key) {
      case 'N-1.1': return <CharacterPanel />
      case 'N-1.2': return <LocationPanel />
      case 'N-1.3': return <MagicPanel />
      case 'N-1.4': return <TimelinePanel />
      case 'N-1.5': return <ConstraintPanel />
      default: return null
    }
  }

  const selectedPanel = getPanelByNodeKey(selectedNodeKey)

  return (
    <div className="struct-content fade-up">
      <StaleBanner />
      <div className="struct-grid">
        {phase.nodes.map(n => (
          <NodeCard
            key={n.nodeKey}
            node={n}
            project={project}
            selectedNodeKey={selectedNodeKey}
            onSelect={setSelectedNodeKey}
            {...nodeActions}
          />
        ))}
      </div>
      
      {selectedPanel && (
        <div className="selected-panel">
          {selectedPanel}
        </div>
      )}
      
      {!selectedPanel && (
        <>
          <CharacterPanel />
          <LocationPanel />
          <MagicPanel />
          <TimelinePanel />
          <ConstraintPanel />
          <p className="phase-hint">
            试用：将「林渊」设为 <strong>死亡</strong>，再到「内容创作」点校验，可见 R-001 规则生效。
          </p>
        </>
      )}
    </div>
  )
}

function Phase2() {
  const { project, selectedNodeKey, setSelectedNodeKey, phases } = useNovel()
  const nodeActions = useNodeActions()
  const phase = phases[1]

  return (
    <div className="struct-content fade-up">
      <StaleBanner />
      <div className="struct-grid">
        {phase.nodes.map(n => (
          <NodeCard
            key={n.nodeKey}
            node={n}
            project={project}
            selectedNodeKey={selectedNodeKey}
            onSelect={setSelectedNodeKey}
            {...nodeActions}
          />
        ))}
      </div>
      <ActPlotPanel />
      <ForeshadowPanel />
    </div>
  )
}

function Phase4() {
  const { project, phases, selectedNodeKey, setSelectedNodeKey } = useNovel()
  const nodeActions = useNodeActions()
  const phase = phases[3]

  return (
    <div className="struct-content fade-up">
      <StaleBanner />
      <div className="struct-grid">
        {phase.nodes.map(n => (
          <NodeCard
            key={n.nodeKey}
            node={n}
            project={project}
            selectedNodeKey={selectedNodeKey}
            onSelect={setSelectedNodeKey}
            {...nodeActions}
          />
        ))}
      </div>
      <VolumePanel />
      <ChapterPanel />
    </div>
  )
}

function Phase5() {
  const { project, phases, setView, selectedNodeKey, setSelectedNodeKey } = useNovel()
  const nodeActions = useNodeActions()
  const phase = phases[4]

  return (
    <div className="struct-content fade-up">
      <StaleBanner />
      <div className="struct-grid">
        {phase.nodes.map(n => (
          <NodeCard
            key={n.nodeKey}
            node={n}
            project={project}
            selectedNodeKey={selectedNodeKey}
            onSelect={setSelectedNodeKey}
            {...nodeActions}
          />
        ))}
      </div>
      <div className="empty-state">
        <div className="empty-icon">✏️</div>
        <h3>场景迭代写作 · N-5.1</h3>
        <p>生成 → 校验 → 人工确认 → 锁定写入</p>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setView('content')}>→ 进入内容创作</button>
      </div>
    </div>
  )
}

function Phase3() {
  const { project, phases, selectedNodeKey, setSelectedNodeKey } = useNovel()
  const nodeActions = useNodeActions()
  const phase = phases[2]

  return (
    <div className="struct-content fade-up">
      <StaleBanner />
      <div className="struct-grid">
        {phase.nodes.map(n => (
          <NodeCard
            key={n.nodeKey}
            node={n}
            project={project}
            selectedNodeKey={selectedNodeKey}
            onSelect={setSelectedNodeKey}
            {...nodeActions}
          />
        ))}
      </div>
      <CollaborationPanel />
    </div>
  )
}

function Phase6() {
  const { project, selectedNodeKey, setSelectedNodeKey } = useNovel()
  const nodeActions = useNodeActions()
  const phase = project.phases[5]

  return (
    <div className="struct-content fade-up">
      <StaleBanner />
      <div className="struct-grid">
        {phase.nodes.map(n => (
          <NodeCard
            key={n.nodeKey}
            node={n}
            project={project}
            selectedNodeKey={selectedNodeKey}
            onSelect={setSelectedNodeKey}
            {...nodeActions}
          />
        ))}
      </div>
      <ForeshadowBoard />
      <ConstraintScanPanel />
      <CollaborationSyncPanel />
    </div>
  )
}

function Phase7() {
  const { project, selectedNodeKey, setSelectedNodeKey } = useNovel()
  const nodeActions = useNodeActions()
  const phase = project.phases[6]

  return (
    <div className="struct-content fade-up">
      <StaleBanner />
      <div className="struct-grid">
        {phase.nodes.map(n => (
          <NodeCard
            key={n.nodeKey}
            node={n}
            project={project}
            selectedNodeKey={selectedNodeKey}
            onSelect={setSelectedNodeKey}
            {...nodeActions}
          />
        ))}
      </div>
      <FinalReport />
    </div>
  )
}

export default function StructureView() {
  const { phase, phases } = useNovel()
  const renderers = [
    Phase1, Phase2, Phase3, Phase4, Phase5, Phase6, Phase7,
  ]

  return (
    <>
      <PhaseTabs />
      <div className="struct-body">
        <NodeWorkflowSection />
        {renderers[phase]?.()}
      </div>
    </>
  )
}
