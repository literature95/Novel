// src/App.jsx
import { NovelProvider, useNovel } from './store'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import HomeView from './components/home/HomeView'
import StructureView from './components/structure/StructureView'
import ContentView from './components/content/ContentView'
import SettingsView from './components/settings/SettingsView'

function MainContent() {
  const { view } = useNovel()
  return (
    <div className="main">
      <Header />
      <div className="main-body">
        <div className={`view view-home ${view === 'home' ? 'active' : ''}`}>
          <HomeView />
        </div>
        <div className={`view view-structure ${view === 'structure' ? 'active' : ''}`}>
          <StructureView />
        </div>
        <div className={`view view-content ${view === 'content' ? 'active' : ''}`}>
          <ContentView />
        </div>
        <div className={`view view-settings ${view === 'settings' ? 'active' : ''}`}>
          <SettingsView />
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <NovelProvider>
      <div className="app">
        <Sidebar />
        <MainContent />
      </div>
    </NovelProvider>
  )
}
