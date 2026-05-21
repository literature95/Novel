// src/components/settings/SettingsView.jsx
import { useState } from 'react'
import { Btn } from '../ui'
import { Bot, Sliders, PenLine, Link } from 'lucide-react'

function Slider({ label, min, max, step = 1, defaultVal, id }) {
  const [val, setVal] = useState(defaultVal)
  const display = id === 'temp' || id === 'topp' ? (val / 100).toFixed(1) : val
  return (
    <div className="slider-row">
      <label>{label}</label>
      <input type="range" min={min} max={max} step={step} value={val}
        onChange={e => setVal(Number(e.target.value))}
        className="range-input"
      />
      <span className="slider-value">{display}</span>
    </div>
  )
}

function Select({ label, options, defaultIdx = 0 }) {
  return (
    <div className="form-row">
      <label>{label}</label>
      <select defaultValue={options[defaultIdx]} className="select-input">
        {options.map(o => <option key={o}>{o}</option>)}
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
  return (
    <div className="view-settings fade-up">
      <Section icon={Bot} title="AI 模型配置">
        <Select label="模型选择" options={['GPT-4o', 'Claude 3.5 Sonnet', 'DeepSeek-R1', 'Qwen-Max', 'Gemini 2.5 Pro']} />
        <div className="form-row">
          <label>API 端点</label>
          <input type="text" defaultValue="https://api.openai.com/v1" className="text-input" />
        </div>
        <div className="form-row">
          <label>API Key</label>
          <input type="password" placeholder="sk-..." className="text-input" />
        </div>
        <Hint>密钥仅存储在本地浏览器，不会上传至任何服务器</Hint>
      </Section>

      <Section icon={Sliders} title="生成参数">
        <Slider label="Temperature" min={0} max={100} defaultVal={70} id="temp" />
        <Slider label="Top-P" min={0} max={100} defaultVal={90} id="topp" />
        <Slider label="Max Tokens" min={512} max={8192} step={512} defaultVal={4096} id="token" />
        <Select label="上下文策略" options={['智能裁剪（推荐）', '仅当前章节', '当前+前一章', '全文载入（不推荐）']} />
        <Hint>智能裁剪会自动加载角色卡片、活跃伏笔、前一场景摘要等，控制在 8KB 以内</Hint>
      </Section>

      <Section icon={PenLine} title="写作风格">
        <Select label="叙事风格" options={['文学性细腻', '简洁明快', '悬疑紧凑', '古典优雅', '口语化生动']} />
        <Select label="语言" options={['简体中文', '繁体中文', 'English']} />
        <Select label="每场景字数" options={['800-1200 字（精炼）', '1200-2000 字（标准）', '2000-3000 字（详尽）', '自定义']} defaultIdx={1} />
        <Select label="人称" options={['第三人称有限', '第一人称', '第三人称全知', '第二人称']} />
      </Section>

      <Section icon={Link} title="结构对接">
        <div className="form-row">
          <label>Schema 文件</label>
          <span className="schema-file">snowflake_v2.json</span>
        </div>
        <Select label="自动校验" options={['每次生成后自动校验', '手动触发校验', '仅校验绝对规则']} />
        <Select label="伏笔超期提醒" options={['超过2章提醒', '超过5章提醒', '关闭']} />
      </Section>
    </div>
  )
}
