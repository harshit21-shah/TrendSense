import { Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { Dashboard } from './pages/Dashboard'
import { Timeline } from './pages/Timeline'
import { Brief } from './pages/Brief'
import { Chat } from './pages/Chat'
import { Bookmarks } from './pages/Bookmarks'

export default function App() {
  return (
    <div className="min-h-screen bg-[#080b10] text-white">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/brief" element={<Brief />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
        </Routes>
      </main>
    </div>
  )
}
