// src/components/content/ContentView.jsx
import { useNovel } from '../../store'
import { CHAPTERS, PLOT_LINES, CHARACTERS, FORESHADOWS } from '../../data'
import { Badge, Btn, ProgressItem, ConflictBadge, ForeshadowTag, clsx } from '../ui'
import { Check, Sparkles } from 'lucide-react'

// ─── Chapter List ───
function ChapterList() {
  const { chapterIdx, selectChapter } = useNovel()

  return (
    <div className="content-chapters">
      <div className="chapters-header">
        <span>章节列表</span>
        <div className="vol-tabs">
          {['卷一', '卷二', '卷三'].map((v, i) => (
            <span key={v} className={`vol-tab ${i === 0 ? 'active' : ''}`}>{v}</span>
          ))}
        </div>
      </div>
      <div className="chapters-list">
        {CHAPTERS.map((ch, i) => {
          const statusColor = { done: 'bg-verdant', progress: 'bg-ochre', locked: 'bg-faded/40' }
          const pct = ch.words > 0 ? Math.round(ch.words / ch.targetWords * 100) + '%' : '—'
          return (
            <div
              key={ch.id}
              onClick={() => selectChapter(i)}
              className={`chapter-item ${i === chapterIdx ? 'active' : ''}`}
            >
              <span className="ch-num">Ch{ch.id}</span>
              <span className="ch-title">{ch.title}</span>
              <span className={`ch-status ${statusColor[ch.status]}`} />
              <span className="ch-progress">{pct}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Scene Tabs ───
function SceneTabs() {
  const { scenes, scene, sceneIdx, setSceneIdx, generating, generateScene, chapter } = useNovel()

  return (
    <div className="scene-toolbar">
      <div className="scene-tabs">
        {scenes.length === 0
          ? <span className="scene-tab active">暂无场景</span>
          : scenes.map((s, i) => (
            <span key={s.id} onClick={() => setSceneIdx(i)}
              className={`scene-tab ${i === sceneIdx ? 'active' : ''}`}>
              场景{i + 1}
            </span>
          ))
        }
      </div>
      <div className="toolbar-right">
        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
          {scene ? scene.content.replace(/\s/g, '').length : 0} 字
        </span>
        <button className="btn btn-ghost btn-sm" onClick={() => alert('校验结果：\n\n✓ POV角色存在且存活\n✓ 地点在知识图谱中\n✓ 冲突类型已声明\n✓ 五线进度单调递增\n✓ 伏笔状态转换合法\n\n全部通过 · 0错误 · 0警告')}>
          ✓ 校验
        </button>
        <button className="btn btn-primary btn-sm" onClick={generateScene} disabled={generating}>
          {generating ? '生成中...' : '✦ AI 生成场景'}
        </button>
      </div>
    </div>
  )
}

// ─── Scene Content ───
function SceneContent() {
  const { scene, scenes } = useNovel()

  if (!scene) {
    return (
      <div className="editor-writing">
        <div className="scene-placeholder">
          <div className="text-4xl mb-4 opacity-40">✍️</div>
          <p>本章尚无场景内容</p>
        </div>
      </div>
    )
  }

  const paragraphs = scene.content.split('\n\n')

  return (
    <div className="editor-writing">
      <div className="scene-content">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  )
}

// ─── Meta Panel ───
function MetaPanel() {
  const { scene, chapter, scenes } = useNovel()

  if (!scene) return (
    <div className="editor-meta" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>选择章节后生成场景</span>
    </div>
  )

  return (
    <div className="editor-meta">
      {/* Plot Progress */}
      <MetaSection title="五线进度">
        {PLOT_LINES.map(l => (
          <div key={l.id} className="progress-item">
            <span className="prog-label" style={{ color: `var(--color-${l.color})` }}>{l.name}</span>
            <div className="prog-bar">
              <div className="prog-fill" style={{ width: `${l.progress * 100}%`, backgroundColor: `var(--color-${l.color})` }} />
            </div>
            <span className="prog-value">{Math.round(l.progress * 100)}%</span>
          </div>
        ))}
      </MetaSection>

      {/* Conflict */}
      <MetaSection title="冲突">
        <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '10px' }}>
          {scene.conflict.type.map(t => <ConflictBadge key={t} type={t} />)}
        </div>
        <div className="progress-item">
          <span className="prog-label">强度</span>
          <div className="prog-bar">
            <div className="prog-fill" style={{
              width: `${scene.conflict.intensity * 100}%`,
              backgroundColor: scene.conflict.intensity > 0.7 ? 'var(--color-error)' : scene.conflict.intensity > 0.4 ? 'var(--color-warning)' : 'var(--color-info)'
            }} />
          </div>
          <span className="prog-value">{scene.conflict.intensity}</span>
        </div>
        {scene.conflict.turningPoint && <div style={{ fontSize: '0.72rem', color: 'var(--color-warning)', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>⚡ 转折点</div>}
        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>{scene.conflict.resolution}</div>
      </MetaSection>

      {/* Beats */}
      <MetaSection title="节拍" count={scene.beats.length}>
        <div className="beats-list">
          {scene.beats.map((b, i) => (
            <div key={i} className="beat-item">
              <span className="beat-num">{i + 1}</span>
              <span>{b}</span>
            </div>
          ))}
        </div>
      </MetaSection>

      {/* Foreshadowing */}
      <MetaSection title="伏笔">
        {scene.foreshadow.planted.length > 0 && (
          <div className="mb-3">
            <div style={{ fontSize: '0.68rem', color: 'var(--color-info)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>种植 ↓</div>
            {scene.foreshadow.planted.map(fid => {
              const f = FORESHADOWS.find(x => x.id === fid)
              return f ? <ForeshadowTag key={fid} item={{ ...f, status: 'planted' }} size="sm" /> : null
            })}
          </div>
        )}
        {scene.foreshadow.triggered.length > 0 && (
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--color-warning)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>触发 ⟫</div>
            {scene.foreshadow.triggered.map(fid => {
              const f = FORESHADOWS.find(x => x.id === fid)
              return f ? <ForeshadowTag key={fid} item={{ ...f, status: 'reinforced' }} size="sm" /> : null
            })}
          </div>
        )}
        {scene.foreshadow.planted.length === 0 && scene.foreshadow.triggered.length === 0 && (
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>本场景无伏笔活动</div>
        )}
      </MetaSection>

      {/* Characters */}
      <MetaSection title="出场角色" count={chapter.characters.length}>
        {chapter.characters.map(name => {
          const c = CHARACTERS.find(x => x.name === name)
          return c ? (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: `var(--color-${c.color})` }} />
              <span style={{ fontSize: '0.82rem', color: 'var(--color-text-primary)' }}>{c.name}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginLeft: 'auto' }}>{c.role}</span>
            </div>
          ) : null
        })}
      </MetaSection>

      {/* Validation */}
      <MetaSection title="校验状态">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {['POV 角色存在且存活', '地点在知识图谱中', '冲突类型已声明', '五线进度单调递增', '伏笔状态转换合法'].map(rule => (
            <div key={rule} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
              <span style={{ color: 'var(--color-success)' }}>✓</span>
              <span style={{ color: 'var(--color-text-secondary)' }}>{rule}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '12px', padding: '8px 12px', background: 'rgba(122, 184, 122, 0.08)', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--color-success)', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
          ✓ 全部通过 · 0 错误 · 0 警告
        </div>
      </MetaSection>
    </div>
  )
}

function MetaSection({ title, count, children }) {
  return (
    <div className="meta-section">
      <div className="meta-section-title">
        <span>{title}</span>
        {count !== undefined && <span className="count">{count}</span>}
      </div>
      {children}
    </div>
  )
}

// ─── Main View ───
export default function ContentView() {
  const { scene } = useNovel()

  return (
    <>
      <ChapterList />
      <div className="content-main">
        <SceneTabs />
        <div className="editor-area">
          <SceneContent />
          <MetaPanel />
        </div>
      </div>
    </>
  )
}
