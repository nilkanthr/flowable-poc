import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMetrics, listApplications } from '../api/onboardingApi'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Activity, Clock, CheckCircle2, AlertTriangle, RefreshCw, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

function MetricCard({ label, value, sub, icon: Icon, color }) {
  return (
    <div className="card flex items-start gap-4">
      <div className={clsx('p-2.5 rounded-lg', color)}>
        <Icon size={20} />
      </div>
      <div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-sm text-gray-400 mt-0.5">{label}</div>
        {sub && <div className="text-xs text-gray-600 mt-1">{sub}</div>}
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    RUNNING:  'badge-running',
    APPROVED: 'badge-approved',
    REJECTED: 'badge-rejected',
    COMPLETED:'badge-approved',
  }
  const dots = {
    RUNNING:  'bg-blue-400',
    APPROVED: 'bg-emerald-400',
    REJECTED: 'bg-red-400',
    COMPLETED:'bg-emerald-400',
  }
  return (
    <span className={map[status] || 'badge-review'}>
      <span className={clsx('w-1.5 h-1.5 rounded-full inline-block', dots[status] || 'bg-amber-400')} />
      {status}
    </span>
  )
}

function DecisionBadge({ decision }) {
  if (!decision) return <span className="text-gray-600 text-xs">—</span>
  const map = {
    AUTO_APPROVE: 'text-emerald-400',
    MANUAL_REVIEW: 'text-amber-400',
    AUTO_REJECT: 'text-red-400',
  }
  return <span className={clsx('text-xs font-medium', map[decision] || 'text-gray-400')}>{decision}</span>
}

export default function Dashboard() {
  const [metrics, setMetrics]   = useState(null)
  const [apps, setApps]         = useState([])
  const [loading, setLoading]   = useState(true)
  const navigate = useNavigate()

  const refresh = useCallback(async () => {
    try {
      const [m, a] = await Promise.all([getMetrics(), listApplications()])
      setMetrics(m.data)
      setApps(a.data)
    } catch (e) {
      // backend may not be running yet
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    const t = setInterval(refresh, 3000)
    return () => clearInterval(t)
  }, [refresh])

  const chartData = metrics ? [
    { name: 'Running',      value: metrics.running,            color: '#3b82f6' },
    { name: 'Approved',     value: metrics.completed - (apps.filter(a => a.status === 'REJECTED').length), color: '#10b981' },
    { name: 'Rejected',     value: apps.filter(a => a.status === 'REJECTED').length, color: '#ef4444' },
    { name: 'Pending Review',value: metrics.pendingManualReview, color: '#f59e0b' },
  ] : []

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Onboarding Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time view of all business account applications</p>
        </div>
        <button onClick={refresh} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-4 gap-4">
          <MetricCard label="Total Applications" value={metrics.totalApplications}
            icon={Activity} color="bg-blue-900/50 text-blue-400" />
          <MetricCard label="In Progress" value={metrics.running}
            icon={Clock} color="bg-amber-900/50 text-amber-400" />
          <MetricCard label="Completed" value={metrics.completed}
            icon={CheckCircle2} color="bg-emerald-900/50 text-emerald-400" />
          <MetricCard label="Pending Review" value={metrics.pendingManualReview}
            sub={`Avg processing: ${metrics.avgProcessingTimeSec}s`}
            icon={AlertTriangle} color="bg-red-900/50 text-red-400" />
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Chart */}
        <div className="card col-span-1">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Application Status</h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} barSize={32}>
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Flowable highlights */}
        <div className="card col-span-2">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Flowable Engine Highlights</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Parallel Screening', desc: 'Fircosoft + AECB + ThreatMetrix run simultaneously', color: 'text-blue-400' },
              { label: 'Hot Deployment',     desc: 'Process changes deploy in <30s, zero downtime',        color: 'text-emerald-400' },
              { label: 'Async Resilience',   desc: 'Failed jobs auto-retry — persisted in DB',              color: 'text-amber-400'  },
              { label: 'Full Audit Trail',   desc: 'Every step, variable & decision timestamped',           color: 'text-purple-400' },
              { label: 'SLA Timers',         desc: 'Manual review escalates after 4 hours automatically',   color: 'text-pink-400'   },
              { label: 'BPMN 2.0 Standard',  desc: 'Open standard — no vendor lock-in',                     color: 'text-cyan-400'   },
            ].map(h => (
              <div key={h.label} className="bg-gray-800/50 rounded-lg p-3">
                <div className={clsx('text-xs font-semibold', h.color)}>{h.label}</div>
                <div className="text-xs text-gray-500 mt-1">{h.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Applications table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-300">Recent Applications</h2>
          <button onClick={() => navigate('/new')} className="btn-primary text-xs px-3 py-1.5">
            + New Application
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-600">Loading...</div>
        ) : apps.length === 0 ? (
          <div className="text-center py-10 text-gray-600">
            <p>No applications yet.</p>
            <p className="text-sm mt-1">Start one from <strong className="text-gray-400">Demo Controls</strong> or <strong className="text-gray-400">New Application</strong>.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-600 border-b border-gray-800">
                <th className="text-left pb-2 font-medium">Business Key</th>
                <th className="text-left pb-2 font-medium">Company</th>
                <th className="text-left pb-2 font-medium">Status</th>
                <th className="text-left pb-2 font-medium">Decision</th>
                <th className="text-left pb-2 font-medium">Current Step</th>
                <th className="text-left pb-2 font-medium">Started</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {apps.map(app => (
                <tr key={app.applicationId}
                    onClick={() => navigate(`/application/${app.applicationId}`)}
                    className="hover:bg-gray-800/40 cursor-pointer transition-colors">
                  <td className="py-2.5 pr-4 font-mono text-xs text-gray-500">{app.businessKey}</td>
                  <td className="py-2.5 pr-4 font-medium text-gray-200">{app.companyName}</td>
                  <td className="py-2.5 pr-4"><StatusBadge status={app.status} /></td>
                  <td className="py-2.5 pr-4"><DecisionBadge decision={app.decision} /></td>
                  <td className="py-2.5 pr-4 text-xs text-gray-500">{app.currentStep}</td>
                  <td className="py-2.5 pr-4 text-xs text-gray-600">{app.startTime}</td>
                  <td className="py-2.5 text-gray-600"><ChevronRight size={15} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
