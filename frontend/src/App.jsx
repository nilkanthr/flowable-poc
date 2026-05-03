import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, FilePlus, ListChecks, ClipboardCheck, Zap, GitBranch } from 'lucide-react'
import Dashboard      from './pages/Dashboard'
import NewApplication from './pages/NewApplication'
import ApplicationDetail from './pages/ApplicationDetail'
import TaskInbox      from './pages/TaskInbox'
import DemoPanel      from './pages/DemoPanel'
import Capabilities   from './pages/Capabilities'

const NAV = [
  { to: '/',             icon: LayoutDashboard, label: 'Dashboard'       },
  { to: '/new',          icon: FilePlus,        label: 'New Application' },
  { to: '/tasks',        icon: ClipboardCheck,  label: 'Task Inbox'      },
  { to: '/demo',         icon: Zap,             label: 'Demo Controls'   },
  { to: '/capabilities', icon: GitBranch,       label: 'Capabilities'    },
]

function Sidebar() {
  return (
    <aside className="w-60 shrink-0 bg-white border-r border-gray-200 shadow-sm flex flex-col">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-rakbank-red rounded-lg flex items-center justify-center font-bold text-sm text-white">
            RAK
          </div>
          <div>
            <div className="font-bold text-sm text-gray-900 leading-tight">RAKBANK</div>
            <div className="text-xs text-gray-400 leading-tight">Business Onboarding</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
               ${isActive
                 ? 'bg-rakbank-red text-white shadow-sm'
                 : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer badge */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="text-[11px] text-gray-400">Powered by</div>
        <div className="text-xs font-bold text-gray-700 mt-0.5">Flowable BPM 7.0</div>
        <div className="text-[11px] text-gray-400 mt-1">Spring Boot 3.2 · React 18</div>
      </div>
    </aside>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Routes>
            <Route path="/"                     element={<Dashboard />} />
            <Route path="/new"                  element={<NewApplication />} />
            <Route path="/application/:id"      element={<ApplicationDetail />} />
            <Route path="/tasks"                element={<TaskInbox />} />
            <Route path="/demo"                 element={<DemoPanel />} />
            <Route path="/capabilities"         element={<Capabilities />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
