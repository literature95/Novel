import { getEffectiveNodeStatus } from './nodes'

/** 汇总七阶段节点实现进度（对齐 状态节点.md） */
export function summarizeNodeProgress(project) {
  const items = []
  const counts = {
    completed: 0,
    progress: 0,
    unlocked: 0,
    blocked: 0,
    skip: 0,
    stale: 0,
    total: 0,
  }

  for (const phase of project.phases || []) {
    for (const node of phase.nodes || []) {
      const effective = getEffectiveNodeStatus(node, project)
      items.push({
        phaseId: phase.id,
        phaseName: phase.name,
        nodeKey: node.nodeKey,
        name: node.name,
        rawStatus: node.status,
        effective,
        dependsOn: node.dependsOn || [],
        count: node.count ?? 0,
      })
      counts.total += 1
      if (effective === 'completed' || effective === 'skip') {
        if (effective === 'skip') counts.skip += 1
        else counts.completed += 1
      } else if (effective === 'progress') counts.progress += 1
      else if (effective === 'unlocked') counts.unlocked += 1
      else if (effective === 'blocked') counts.blocked += 1
      else if (effective.startsWith('stale_')) counts.stale += 1
    }
  }

  const done = counts.completed + counts.skip
  const percent = counts.total > 0 ? Math.round((done / counts.total) * 100) : 0

  return { items, counts, percent, done }
}
