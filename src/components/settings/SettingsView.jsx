// src/components/settings/SettingsView.jsx
import { useNovel } from '../../store'
import { Btn } from '../ui'
import { Bot, Sliders, PenLine, Link } from 'lucide-react'

function Slider({ label, min, max, step = 1, value, onChange, display }) {
  return (
    <div className="slider-row">
      <label>{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="range-input"
      />
      <span className="slider-value">{display}</span>
    </div>
  )
}

function Select({ label, options, value, onChange }) {
  return (
    <div className="form-row">
      <label>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className="select-input">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

function Hint({ children }) {
  return <div className="form-hint">{children}</div>
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="settings-section">
      <h3><Icon size={18} /> {title}</h3>
      {children}
    </div>
  )
}

export default function SettingsView() {
  const { settings, updateSettings } = useNovel()
  const set = (patch) => updateSettings(patch)

  return (
    <div className="view-settings fade-up">
      <Section icon={Bot} title="AI 模型配置">
        <Select
          label="模型选择"
          options={['GPT-4o', 'Claude 3.5 Sonnet', 'DeepSeek-R1', 'Qwen-Max', 'Gemini 2.5 Pro']}
          value={settings.model}
          onChange={v => set({ model: v })}
        />
        <div className="form-row">
          <label>API 端点</label>
          <input
            type="text"
            value={settings.apiEndpoint}
            onChange={e => set({ apiEndpoint: e.target.value })}
            className="text-input"
          />
        </div>
        <div className="form-row">
          <label>API Key</label>
          <input
            type="password"
            value={settings.apiKey}
            onChange={e => set({ apiKey: e.target.value })}
            placeholder="sk-..."
            className="text-input"
          />
        </div>
        <Hint>密钥仅存储在本地浏览器（localStorage），不会上传至任何服务器</Hint>
      </Section>

      <Section icon={Sliders} title="生成参数">
        <Slider
          label="Temperature"
          min={0}
          max={100}
          value={Math.round(settings.temperature * 100)}
          onChange={v => set({ temperature: v / 100 })}
          display={settings.temperature.toFixed(1)}
        />
        <Slider
          label="Top-P"
          min={0}
          max={100}
          value={Math.round(settings.topP * 100)}
          onChange={v => set({ topP: v / 100 })}
          display={settings.topP.toFixed(1)}
        />
        <Slider
          label="Max Tokens"
          min={512}
          max={8192}
          step={512}
          value={settings.maxTokens}
          onChange={v => set({ maxTokens: v })}
          display={String(settings.maxTokens)}
        />
        <Select
          label="上下文策略"
          options={['智能裁剪（推荐）', '仅当前章节', '当前+前一章', '全文载入（不推荐）']}
          value={settings.contextStrategy}
          onChange={v => set({ contextStrategy: v })}
        />
        <Hint>智能裁剪会自动加载角色卡片、活跃伏笔、前一场景摘要等，控制在 8KB 以内</Hint>
      </Section>

      <Section icon={PenLine} title="写作风格">
        <Select
          label="叙事风格"
          options={['文学性细腻', '简洁明快', '悬疑紧凑', '古典优雅', '口语化生动']}
          value={settings.style}
          onChange={v => set({ style: v })}
        />
        <Select
          label="语言"
          options={['简体中文', '繁体中文', 'English']}
          value={settings.language}
          onChange={v => set({ language: v })}
        />
        <Select
          label="每场景字数"
          options={['800-1200 字（精炼）', '1200-2000 字（标准）', '2000-3000 字（详尽）', '自定义']}
          value={settings.sceneLength}
          onChange={v => set({ sceneLength: v })}
        />
        <Select
          label="人称"
          options={['第三人称有限', '第一人称', '第三人称全知', '第二人称']}
          value={settings.pov}
          onChange={v => set({ pov: v })}
        />
      </Section>

      <Section icon={Link} title="结构对接">
        <div className="form-row">
          <label>Schema 文件</label>
          <span className="schema-file">snowflake_v2.json</span>
        </div>
        <Select
          label="自动校验"
          options={['每次生成后自动校验', '手动触发校验', '仅校验绝对规则']}
          value={settings.autoValidate}
          onChange={v => set({ autoValidate: v })}
        />
        <Select
          label="伏笔超期提醒"
          options={['超过2章提醒', '超过5章提醒', '关闭']}
          value={settings.foreshadowAlert}
          onChange={v => set({ foreshadowAlert: v })}
        />
      </Section>
    </div>
  )
}
