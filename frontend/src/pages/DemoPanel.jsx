import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { runScenario } from '../api/onboardingApi'
import { Zap, Play, Loader2, CheckCircle2, AlertTriangle, XCircle, Users, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

const SCENARIOS = [
  {
    id:          'happy-path',
    title:       'Happy Path — Auto Approve',
    icon:        '✅',
    color:       'border-emerald-800 hover:border-emerald-600',
    badge:       'badge-approved',
    badgeLabel:  'AUTO_APPROVE',
    description: 'Low-risk mainland trading company. All 3 parallel screenings pass. Decision engine auto-approves. Account created in core banking.',
    highlights:  ['Parallel processing: Fircosoft + AECB + ThreatMetrix run simultaneously', 'Total time ~8-10 seconds end-to-end', 'Zero human intervention needed'],
    expectedOutcome: 'AUTO_APPROVE → EFR Filing → Account Created',
  },
  {
    id:          'sanctions-hit',
    title:       'Sanctions Hit — Instant Reject',
    icon:        '🚫',
    color:       'border-red-800 hover:border-red-600',
    badge:       'badge-rejected',
    badgeLabel:  'AUTO_REJECT',
    description: 'Fircosoft flags an exact OFAC SDN list match during parallel screening. Hard-stop rule fires immediately.',
    highlights:  ['Fircosoft FAIL triggers Rule R-003 unconditionally', 'No further processing — immediate rejection', 'Full audit trail of why rejection occurred'],
    expectedOutcome: 'AUTO_REJECT → Rejection Notification',
  },
  {
    id:          'manual-review',
    title:       'Manual Review — PEP Detected',
    icon:        '👤',
    color:       'border-amber-800 hover:border-amber-600',
    badge:       'badge-review',
    badgeLabel:  'MANUAL_REVIEW',
    description: 'Fircosoft flags signatory as PEP Level-2. Risk band HIGH. Process pauses at human task — RM/Compliance must review.',
    highlights:  ['Task routed to compliance + relationship-manager groups', 'SLA timer: escalates to Senior Manager after 4 hours', 'Check Task Inbox to approve/reject'],
    expectedOutcome: 'MANUAL_REVIEW → Awaits human decision',
  },
  {
    id:          'credit-fail',
    title:       'Credit Fail — AECB Reject',
    icon:        '📉',
    color:       'border-orange-800 hover:border-orange-600',
    badge:       'badge-rejected',
    badgeLabel:  'AUTO_REJECT',
    description: 'AECB returns active defaults of AED 2.4M. AECB FAIL triggers credit policy rule — auto rejected.',
    highlights:  ['Credit score 320 — well below 650 threshold', 'Fircosoft and ThreatMetrix still run in parallel', 'Decision engine applies Rule R-003'],
    expectedOutcome: 'AUTO_REJECT → Rejection Notification',
  },
  {
    id:          'bulk',
    title:       'Bulk Launch — 5 Concurrent Applications',
    icon:        '⚡',
    color:       'border-purple-800 hover:border-purple-600',
    badge:       'badge-running',
    badgeLabel:  'CONCURRENT',
    description: 'Launches 5 applications simultaneously. Demonstrates Flowable\'s async executor and distributed processing — 15 external calls running in parallel.',
    highlights:  ['5 processes × 3 parallel screenings = 15 concurrent API calls', 'Flowable async executor manages thread pool automatically', 'All complete independently — no bottleneck'],
    expectedOutcome: 'Mixed: some APPROVE, some REJECT, one MANUAL_REVIEW',
  },
]

function ScenarioCard({ scenario, onRun, loading }) {
  return (
    <div className={clsx('card border-2 cursor-pointer transition-all', scenario.color)}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{scenario.icon}</span>
          <div>
            <div className="font-semibold text-white">{scenario.title}</div>
            <span className={scenario.badge}>{scenario.badgeLabel}</span>
          </div>
        </div>
        <button
          onClick={() => onRun(scenario.id)}
          disabled={loading === scenario.id}
          className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5 shrink-0 ml-3"
        >
          {loading === scenario.id
            ? <Loader2 size={13} className="animate-spin" />
            : <Play size={13} />}
          Run
        </button>
      </div>

      <p className="text-sm text-gray-400 mb-3">{scenario.description}</p>

      <div className="space-y-1">
        {scenario.highlights.map((h, i) => (
          <div key={i} className="flex items-start gap-2 text-xs text-gray-500">
            <ChevronRight size={12} className="mt-0.5 text-gray-600 shrink-0" />
            {h}
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-800 text-xs text-gray-600">
        Expected: <span className="text-gray-400">{scenario.expectedOutcome}</span>
      </div>
    </div>
  )
}

export default function DemoPanel() {
  const [loading, setLoading]   = useState(null)
  const [results, setResults]   = useState([])
  const navigate = useNavigate()

  const run = async (scenarioId) => {
    setLoading(scenarioId)
    try {
      const res = await runScenario(scenarioId)
      const data = res.data
      const ids = data.processInstanceIds || (data.processInstanceId ? [data.processInstanceId] : [])
      setResults(prev => [{
        scenarioId,
        timestamp: new Date().toLocaleTimeString(),
        processIds: ids,
        description: data.description,
        expectedDuration: data.expectedDurationSec,
      }, ...prev].slice(0, 20))

      // Navigate to first process
      if (ids.length === 1) {
        navigate(`/application/${ids[0]}`)
      }
    } catch (e) {
      alert('Backend not running. Start the Spring Boot app first.\n\ncd backend && mvn spring-boot:run')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Zap size={22} className="text-amber-400" />
          Demo Controls
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Pre-built scenarios for CTO presentation — each demonstrates a key Flowable capability
        </p>
      </div>

      {/* Backend warning */}
      <div className="p-3 bg-blue-900/20 border border-blue-900/40 rounded-lg text-xs text-blue-300 flex items-center gap-2">
        <AlertTriangle size={14} className="shrink-0" />
        Ensure Spring Boot backend is running: <code className="bg-gray-800 px-1.5 py-0.5 rounded ml-1">cd backend && mvn spring-boot:run</code>
      </div>

      {/* Scenario cards */}
      <div className="grid grid-cols-2 gap-4">
        {SCENARIOS.map(s => (
          <ScenarioCard key={s.id} scenario={s} onRun={run} loading={loading} />
        ))}
      </div>

      {/* Results log */}
      {results.length > 0 && (
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Run History</h2>
          <div className="space-y-2">
            {results.map((r, i) => (
              <div key={i} className="bg-gray-800/50 rounded-lg p-3 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-200">{r.scenarioId}</span>
                  <span className="text-gray-600">{r.timestamp}</span>
                </div>
                <div className="text-gray-500 mb-1">{r.description}</div>
                <div className="flex flex-wrap gap-2">
                  {r.processIds.map(pid => (
                    <button
                      key={pid}
                      onClick={() => navigate(`/application/${pid}`)}
                      className="font-mono text-blue-400 hover:text-blue-300 bg-blue-900/20 px-2 py-0.5 rounded"
                    >
                      {pid.substring(0, 16)}...
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTO talking points */}
      <div className="card border-rakbank-red/30 border">
        <h2 className="text-sm font-semibold text-rakbank-red mb-4">CTO Presentation Talking Points</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              point: '1. Speed of Change',
              detail: 'Show a simple routing change (e.g. adding a new screening step). Edit the BPMN XML, redeploy — running instances continue on old version, new ones pick up v2. Total time: < 2 minutes.',
              icon: '⚡'
            },
            {
              point: '2. Parallel Processing',
              detail: 'Run Happy Path and watch the timeline. Fircosoft, AECB, ThreatMetrix all complete in parallel — total screening time is max(2.5s, 2.2s, 1.8s) = 2.5s, not 6.5s sequential.',
              icon: '⚙️'
            },
            {
              point: '3. Zero Vendor Lock-in',
              detail: 'The BPMN XML is ISO standard — readable in any BPMN 2.0 tool (Camunda Modeler, draw.io, etc.). Flowable itself is Apache 2.0 licensed. No per-seat, per-process, or runtime licensing.',
              icon: '🔓'
            },
            {
              point: '4. Resilience & Recovery',
              detail: 'Async service tasks are persisted to the database before execution. If the server crashes mid-process, the async executor automatically retries on restart — no lost applications.',
              icon: '🛡️'
            },
            {
              point: '5. Developer Velocity',
              detail: 'Any Java/Spring developer can contribute. No proprietary IDE. Process logic is plain Java classes (JavaDelegate). Time to onboard a new developer: 1 day vs weeks for iBPS Studio.',
              icon: '🚀'
            },
            {
              point: '6. Cloud Native',
              detail: 'Flowable embeds directly in your Spring Boot microservice — no separate BPM server to manage. One Docker image, one deployment, one ops team. Perfect for RAKBANK\'s cloud strategy.',
              icon: '☁️'
            },
          ].map(p => (
            <div key={p.point} className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span>{p.icon}</span>
                <span className="font-semibold text-gray-200 text-sm">{p.point}</span>
              </div>
              <p className="text-xs text-gray-500">{p.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
