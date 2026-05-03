import { useEffect, useState, useCallback } from 'react'
import { getPendingTasks, completeTask } from '../api/onboardingApi'
import { useNavigate } from 'react-router-dom'
import { ClipboardCheck, CheckCircle2, XCircle, AlertTriangle, Loader2, RefreshCw } from 'lucide-react'
import clsx from 'clsx'

function RiskBadge({ band }) {
  const map = {
    HIGH:     'bg-red-900/60 text-red-300 border-red-800',
    MEDIUM:   'bg-amber-900/60 text-amber-300 border-amber-800',
    LOW:      'bg-emerald-900/60 text-emerald-300 border-emerald-800',
    CRITICAL: 'bg-purple-900/60 text-purple-300 border-purple-800',
  }
  return (
    <span className={clsx('text-xs font-bold px-2 py-0.5 rounded border', map[band] || map.LOW)}>
      {band || 'UNKNOWN'}
    </span>
  )
}

function ReviewModal({ task, onClose, onSubmit, loading }) {
  const [decision, setDecision] = useState('')
  const [reviewer, setReviewer] = useState('Compliance Officer')
  const [comments, setComments] = useState('')

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg">
        <div className="p-5 border-b border-gray-800">
          <h2 className="font-bold text-white">Manual Review — {task.companyName}</h2>
          <p className="text-xs text-gray-500 mt-1">Task ID: {task.taskId}</p>
        </div>

        <div className="p-5 space-y-4">
          {/* Screening summary */}
          <div className="bg-gray-800 rounded-lg p-4 space-y-2 text-sm">
            <div className="font-semibold text-gray-300 mb-2">Screening Summary</div>
            <div className="flex justify-between">
              <span className="text-gray-500">Fircosoft AML</span>
              <span className={task.fircosoftStatus === 'PASS' ? 'text-emerald-400' :
                               task.fircosoftStatus === 'FAIL' ? 'text-red-400' : 'text-amber-400'}>
                {task.fircosoftStatus}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">AECB Credit</span>
              <span className={task.aecbStatus === 'PASS' ? 'text-emerald-400' :
                               task.aecbStatus === 'FAIL' ? 'text-red-400' : 'text-amber-400'}>
                {task.aecbStatus}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Risk Score</span>
              <span className="text-white font-mono">{typeof task.riskScore === 'number'
                ? task.riskScore.toFixed(3) : task.riskScore}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Risk Band</span>
              <RiskBadge band={task.riskBand} />
            </div>
          </div>

          <div>
            <label className="label">Reviewed By</label>
            <input className="input" value={reviewer} onChange={e => setReviewer(e.target.value)} />
          </div>

          <div>
            <label className="label">Review Comments</label>
            <textarea className="input resize-none" rows={3}
              value={comments} onChange={e => setComments(e.target.value)}
              placeholder="Enter your review notes..." />
          </div>

          <div>
            <label className="label">Decision *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDecision('APPROVED')}
                className={clsx('py-3 rounded-lg border-2 font-semibold text-sm transition-all',
                  decision === 'APPROVED'
                    ? 'border-emerald-500 bg-emerald-900/40 text-emerald-300'
                    : 'border-gray-700 text-gray-500 hover:border-emerald-700')}
              >
                <CheckCircle2 size={16} className="mx-auto mb-1" />
                Approve
              </button>
              <button
                onClick={() => setDecision('REJECTED')}
                className={clsx('py-3 rounded-lg border-2 font-semibold text-sm transition-all',
                  decision === 'REJECTED'
                    ? 'border-red-500 bg-red-900/40 text-red-300'
                    : 'border-gray-700 text-gray-500 hover:border-red-700')}
              >
                <XCircle size={16} className="mx-auto mb-1" />
                Reject
              </button>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-gray-800 flex gap-3 justify-end">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className={decision === 'APPROVED' ? 'btn-success' : 'btn-danger'}
            disabled={!decision || loading}
            onClick={() => onSubmit({ taskId: task.taskId, reviewDecision: decision,
                                      reviewedBy: reviewer, comments })}
          >
            {loading ? <Loader2 size={14} className="animate-spin inline mr-1" /> : null}
            Submit {decision || 'Decision'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TaskInbox() {
  const [tasks, setTasks]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const refresh = useCallback(async () => {
    try {
      const res = await getPendingTasks()
      setTasks(res.data)
    } catch (e) {
      setTasks([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    const t = setInterval(refresh, 5000)
    return () => clearInterval(t)
  }, [refresh])

  const handleSubmit = async (req) => {
    setSubmitting(true)
    try {
      await completeTask(req)
      setSelected(null)
      refresh()
    } catch (e) {
      alert('Failed to complete task: ' + (e.response?.data?.message || e.message))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ClipboardCheck size={22} className="text-amber-400" />
            Task Inbox
          </h1>
          <p className="text-sm text-gray-500 mt-1">Pending manual review tasks — Flowable human task management</p>
        </div>
        <button onClick={refresh} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Capability callout */}
      <div className="p-4 bg-amber-900/10 border border-amber-900/30 rounded-xl text-sm text-amber-200/70">
        <strong className="text-amber-400">Flowable Human Task Management:</strong> Tasks are
        automatically routed to <code className="text-xs bg-gray-800 px-1 rounded">compliance</code> and{' '}
        <code className="text-xs bg-gray-800 px-1 rounded">relationship-manager</code> groups based on
        BPMN <code className="text-xs bg-gray-800 px-1 rounded">candidateGroups</code>. SLA timer escalates
        to Senior Manager after 4 hours — no code changes needed, just BPMN configuration.
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-600 py-10 justify-center">
          <Loader2 className="animate-spin" /> Loading tasks...
        </div>
      ) : tasks.length === 0 ? (
        <div className="card text-center py-12 text-gray-600">
          <CheckCircle2 size={36} className="mx-auto mb-3 text-gray-700" />
          <p>No pending review tasks.</p>
          <p className="text-sm mt-1">Run the <strong className="text-gray-400">High Risk</strong> scenario from Demo Controls to create one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => (
            <div key={task.taskId} className="card border border-amber-900/30">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={16} className="text-amber-400" />
                    <span className="font-semibold text-white">{task.companyName}</span>
                    <RiskBadge band={task.riskBand} />
                  </div>
                  <div className="mt-2 grid grid-cols-4 gap-4 text-xs text-gray-500">
                    <div>
                      <div className="text-gray-600">Task ID</div>
                      <div className="font-mono text-gray-400">{task.taskId}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Process</div>
                      <div className="font-mono text-gray-400 cursor-pointer hover:text-blue-400"
                           onClick={() => navigate(`/application/${task.processId}`)}>
                        {task.processId?.substring(0, 12)}...
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Created</div>
                      <div className="text-gray-400">{task.created}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Reason</div>
                      <div className="text-amber-400">{task.decision}</div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    className="btn-primary text-xs px-3 py-1.5"
                    onClick={() => setSelected(task)}
                  >
                    Review
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <ReviewModal
          task={selected}
          onClose={() => setSelected(null)}
          onSubmit={handleSubmit}
          loading={submitting}
        />
      )}
    </div>
  )
}
