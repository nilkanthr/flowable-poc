import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getApplication, getVariables } from '../api/onboardingApi'
import { CheckCircle2, XCircle, Clock, Loader2, AlertTriangle, ArrowLeft, GitBranch } from 'lucide-react'
import clsx from 'clsx'

const STEP_META = {
  uaePassVerification:  { label: 'UAE Pass Verification',        group: 'identity',  icon: '🪪' },
  screeningFork:        { label: 'Parallel Screening Start',     group: 'parallel',  icon: '⚡' },
  fircosoftScreening:   { label: 'Fircosoft AML Screening',      group: 'screening', icon: '🔍' },
  aecbCheck:            { label: 'AECB Credit Bureau',           group: 'screening', icon: '📊' },
  threatMatrixCheck:    { label: 'ThreatMetrix Fraud Check',     group: 'screening', icon: '🛡️' },
  screeningJoin:        { label: 'Screening Complete',           group: 'parallel',  icon: '✅' },
  riskAssessment:       { label: 'Risk Assessment',              group: 'decision',  icon: '⚖️' },
  decisionEngine:       { label: 'Decision Engine',              group: 'decision',  icon: '🤖' },
  manualReview:         { label: 'Manual Review (RM/Compliance)',group: 'human',     icon: '👤' },
  approvedMerge:        { label: 'Approved Path',                group: 'approval',  icon: '🔀' },
  efrCheck:             { label: 'EFR Regulatory Filing',        group: 'approval',  icon: '📋' },
  createAccount:        { label: 'Create Bank Account (T24)',    group: 'approval',  icon: '🏦' },
  sendWelcome:          { label: 'Welcome Notification',         group: 'approval',  icon: '📧' },
  sendRejection:        { label: 'Rejection Notification',       group: 'rejection', icon: '📧' },
  decisionGateway:      { label: 'Decision Gateway',             group: 'decision',  icon: '🔀' },
  reviewDecisionGateway:{ label: 'Review Decision',              group: 'human',     icon: '🔀' },
}

function StepIcon({ status }) {
  if (status === 'COMPLETED')  return <CheckCircle2 size={16} className="text-emerald-500" />
  if (status === 'IN_PROGRESS') return <Loader2 size={16} className="text-blue-500 animate-spin" />
  return <Clock size={16} className="text-gray-300" />
}

function VarRow({ k, v }) {
  const colorMap = {
    AUTO_APPROVE:  'text-emerald-600',
    MANUAL_REVIEW: 'text-amber-600',
    AUTO_REJECT:   'text-red-600',
    PASS:          'text-emerald-600',
    FAIL:          'text-red-600',
    REVIEW:        'text-amber-600',
    HIGH:          'text-red-600',
    MEDIUM:        'text-amber-600',
    LOW:           'text-emerald-600',
  }
  const display = v === null || v === undefined ? '—' : String(v)
  const color   = colorMap[display] || 'text-gray-700'
  return (
    <div className="flex justify-between items-start py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-500 font-mono">{k}</span>
      <span className={clsx('text-xs font-medium ml-4 text-right max-w-xs truncate', color)} title={display}>
        {display}
      </span>
    </div>
  )
}

function OutcomeBanner({ app }) {
  if (!app) return null
  if (app.status === 'APPROVED') {
    return (
      <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
        <CheckCircle2 size={24} className="text-emerald-500 shrink-0" />
        <div>
          <div className="font-semibold text-emerald-700">Account Successfully Opened</div>
          <div className="text-sm text-emerald-600">
            IBAN: {app.variables?.iban || '—'} &nbsp;|&nbsp; {app.endTime}
          </div>
        </div>
      </div>
    )
  }
  if (app.status === 'REJECTED') {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
        <XCircle size={24} className="text-red-500 shrink-0" />
        <div>
          <div className="font-semibold text-red-700">Application Rejected</div>
          <div className="text-sm text-red-600">{app.variables?.decisionRationale || '—'}</div>
        </div>
      </div>
    )
  }
  if (app.status === 'RUNNING') {
    return (
      <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <Loader2 size={20} className="text-blue-500 animate-spin shrink-0" />
        <div>
          <div className="font-semibold text-blue-700">Processing</div>
          <div className="text-sm text-blue-600">Current step: {app.currentStep}</div>
        </div>
      </div>
    )
  }
  return null
}

const PARALLEL_IDS = ['fircosoftScreening', 'aecbCheck', 'threatMatrixCheck']

export default function ApplicationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [app, setApp]       = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const res = await getApplication(id)
      setApp(res.data)
    } catch (e) {
      setApp(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    refresh()
    const t = setInterval(() => {
      if (app?.status === 'RUNNING' || !app) refresh()
    }, 2000)
    return () => clearInterval(t)
  }, [refresh, app?.status])

  if (loading) {
    return <div className="p-8 text-gray-400 flex items-center gap-2"><Loader2 className="animate-spin" size={18}/> Loading...</div>
  }
  if (!app) {
    return <div className="p-8 text-gray-400">Application not found.</div>
  }

  const steps = app.steps || []
  const seen   = new Set()
  const ordered = []
  for (const s of steps) {
    if (!seen.has(s.id)) {
      seen.add(s.id)
      ordered.push(s)
    }
  }

  const parallelSteps = ordered.filter(s => PARALLEL_IDS.includes(s.id))
  const otherSteps    = ordered.filter(s => !PARALLEL_IDS.includes(s.id))

  return (
    <div className="p-6 space-y-5 max-w-4xl">
      {/* Back */}
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft size={15} /> Back to Dashboard
      </button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{app.companyName}</h1>
          <div className="text-xs text-gray-400 mt-1 font-mono">{app.businessKey} · {app.applicationId}</div>
        </div>
        <div className="text-right text-xs text-gray-400">
          <div>Started: {app.startTime}</div>
          {app.endTime && <div>Ended: {app.endTime}</div>}
        </div>
      </div>

      <OutcomeBanner app={app} />

      <div className="grid grid-cols-3 gap-5">
        {/* Process Timeline */}
        <div className="col-span-2 card">
          <div className="flex items-center gap-2 mb-4">
            <GitBranch size={15} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-700">Process Timeline</h2>
          </div>

          <div className="space-y-1">
            {otherSteps.map(step => {
              const meta = STEP_META[step.id] || { label: step.name, icon: '▸' }
              const insertParallel = step.id === 'screeningFork' && parallelSteps.length > 0

              return (
                <div key={step.id}>
                  <div className={clsx(
                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                    step.status === 'IN_PROGRESS' ? 'bg-blue-50 border border-blue-200' :
                    step.status === 'COMPLETED'   ? 'hover:bg-gray-50' : 'opacity-40'
                  )}>
                    <StepIcon status={step.status} />
                    <span className="text-base">{meta.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-800">{meta.label || step.name}</div>
                      {step.durationMs && (
                        <div className="text-xs text-gray-400">{step.durationMs}ms</div>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 text-right shrink-0">
                      {step.startTime?.split(' ')[1]}
                    </div>
                  </div>

                  {insertParallel && (
                    <div className="ml-8 my-1 border-l-2 border-dashed border-gray-300 pl-4 space-y-1">
                      <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                        <span className="text-blue-500">⚡</span>
                        Parallel execution — all 3 run simultaneously
                      </div>
                      {parallelSteps.map(ps => {
                        const pm = STEP_META[ps.id] || { label: ps.name, icon: '▸' }
                        return (
                          <div key={ps.id} className={clsx(
                            'flex items-center gap-3 px-3 py-1.5 rounded-lg',
                            ps.status === 'IN_PROGRESS' ? 'bg-blue-50' :
                            ps.status === 'COMPLETED'   ? 'bg-gray-50' : 'opacity-40'
                          )}>
                            <StepIcon status={ps.status} />
                            <span className="text-base">{pm.icon}</span>
                            <div className="flex-1">
                              <div className="text-sm text-gray-800">{pm.label}</div>
                              {ps.durationMs && <div className="text-xs text-gray-400">{ps.durationMs}ms</div>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Variables Panel */}
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Process Variables</h2>
          <div className="space-y-0">
            {Object.entries(app.variables || {}).map(([k, v]) => (
              <VarRow key={k} k={k} v={v} />
            ))}
          </div>

          {app.status === 'RUNNING' && (
            <div className="mt-4 flex items-center gap-2 text-xs text-blue-500">
              <Loader2 size={12} className="animate-spin" /> Auto-refreshing every 2s
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
