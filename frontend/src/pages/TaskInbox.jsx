import { useEffect, useState, useCallback } from 'react'
import { getPendingTasks, completeTask } from '../api/onboardingApi'
import { useNavigate } from 'react-router-dom'
import { ClipboardCheck, CheckCircle2, XCircle, AlertTriangle, Loader2, RefreshCw } from 'lucide-react'
import clsx from 'clsx'

function RiskBadge({ band }) {
  const map = {
    HIGH:     'bg-red-100 text-red-700 border-red-200',
    MEDIUM:   'bg-amber-100 text-amber-700 border-amber-200',
    LOW:      'bg-emerald-100 text-emerald-700 border-emerald-200',
    CRITICAL: 'bg-purple-100 text-purple-700 border-purple-200',
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-200 rounded-xl shadow-xl w-full max-w-lg">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Manual Review — {task.companyName}</h2>
          <p className="text-xs text-gray-400 mt-1">Task ID: {task.taskId}</p>
        </div>

        <div className="p-5 space-y-4">
          {/* Screening summary */}
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 space-y-2 text-sm">
            <div className="font-semibold text-gray-700 mb-2">Screening Summary</div>
            <div className="flex justify-between">
              <span className="text-gray-500">Fircosoft AML</span>
              <span className={task.fircosoftStatus === 'PASS' ? 'text-emerald-600' :
                               task.fircosoftStatus === 'FAIL' ? 'text-red-600' : 'text-amber-600'}>
                {task.fircosoftStatus}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">AECB Credit</span>
              <span className={task.aecbStatus === 'PASS' ? 'text-emerald-600' :
                               task.aecbStatus === 'FAIL' ? 'text-red-600' : 'text-amber-600'}>
                {task.aecbStatus}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Risk Score</span>
              <span className="text-gray-900 font-mono">{typeof task.riskScore === 'number'
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
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 text-gray-500 hover:border-emerald-400')}
              >
                <CheckCircle2 size={16} className="mx-auto mb-1" />
                Approve
              </button>
              <button
                onClick={() => setDecision('REJECTED')}
                className={clsx('py-3 rounded-lg border-2 font-semibold text-sm transition-all',
                  decision === 'REJECTED'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 text-gray-500 hover:border-red-400')}
              >
                <XCircle size={16} className="mx-auto mb-1" />
                Reject
              </button>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 flex gap-3 justify-end">
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
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardCheck size={22} className="text-amber-500" />
            Task Inbox
          </h1>
          <p className="text-sm text-gray-500 mt-1">Pending manual review tasks — Flowable human task management</p>
        </div>
        <button onClick={refresh} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Capability callout */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
        <strong className="text-amber-700">Flowable Human Task Management:</strong> Tasks are
        automatically routed to <code className="text-xs bg-amber-100 px-1 rounded">compliance</code> and{' '}
        <code className="text-xs bg-amber-100 px-1 rounded">relationship-manager</code> groups based on
        BPMN <code className="text-xs bg-amber-100 px-1 rounded">candidateGroups</code>. SLA timer escalates
        to Senior Manager after 4 hours — no code changes needed, just BPMN configuration.
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-400 py-10 justify-center">
          <Loader2 className="animate-spin" /> Loading tasks...
        </div>
      ) : tasks.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <CheckCircle2 size={36} className="mx-auto mb-3 text-gray-200" />
          <p>No pending review tasks.</p>
          <p className="text-sm mt-1">Run the <strong className="text-gray-600">High Risk</strong> scenario from Demo Controls to create one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => (
            <div key={task.taskId} className="card border border-amber-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={16} className="text-amber-500" />
                    <span className="font-semibold text-gray-900">{task.companyName}</span>
                    <RiskBadge band={task.riskBand} />
                  </div>
                  <div className="mt-2 grid grid-cols-4 gap-4 text-xs text-gray-500">
                    <div>
                      <div className="text-gray-400">Task ID</div>
                      <div className="font-mono text-gray-600">{task.taskId}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Process</div>
                      <div className="font-mono text-gray-600 cursor-pointer hover:text-blue-600"
                           onClick={() => navigate(`/application/${task.processId}`)}>
                        {task.processId?.substring(0, 12)}...
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400">Created</div>
                      <div className="text-gray-600">{task.created}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Reason</div>
                      <div className="text-amber-600">{task.decision}</div>
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
