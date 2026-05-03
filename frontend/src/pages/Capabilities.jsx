import { useEffect, useState } from 'react'
import { getCapabilities, getProcessDef } from '../api/onboardingApi'
import { CheckCircle2, XCircle, MinusCircle, GitBranch, Loader2 } from 'lucide-react'
import clsx from 'clsx'

function WinnerIcon({ winner }) {
  if (winner === 'flowable') return <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
  if (winner === 'newgen')   return <CheckCircle2 size={15} className="text-blue-500 shrink-0 mt-0.5" />
  return <MinusCircle size={15} className="text-gray-400 shrink-0 mt-0.5" />
}

function CapRow({ cap, idx }) {
  return (
    <tr className={clsx('border-b border-gray-100', idx % 2 === 0 ? 'bg-gray-50/50' : 'bg-white')}>
      <td className="py-3 px-4">
        <div className="font-medium text-gray-800 text-sm">{cap.feature}</div>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-start gap-2">
          {cap.winner === 'flowable'
            ? <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
            : cap.winner === 'both'
            ? <MinusCircle size={14} className="text-gray-400 shrink-0 mt-0.5" />
            : <XCircle size={14} className="text-red-400 shrink-0 mt-0.5" />}
          <span className={clsx('text-xs', cap.winner === 'flowable' ? 'text-emerald-700' : 'text-gray-500')}>
            {cap.flowable}
          </span>
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-start gap-2">
          {cap.winner === 'newgen'
            ? <CheckCircle2 size={14} className="text-blue-500 shrink-0 mt-0.5" />
            : cap.winner === 'both'
            ? <MinusCircle size={14} className="text-gray-400 shrink-0 mt-0.5" />
            : <XCircle size={14} className="text-red-400 shrink-0 mt-0.5" />}
          <span className={clsx('text-xs', cap.winner === 'newgen' ? 'text-blue-700' : 'text-gray-500')}>
            {cap.newgen}
          </span>
        </div>
      </td>
      <td className="py-3 px-4 text-center">
        {cap.winner === 'flowable' && <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Flowable</span>}
        {cap.winner === 'newgen'   && <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">Newgen</span>}
        {cap.winner === 'both'     && <span className="text-xs text-gray-400">Equal</span>}
      </td>
    </tr>
  )
}

const ARCHITECTURE_POINTS = [
  {
    title: 'Embedded Engine',
    desc:  'Flowable runs inside the Spring Boot process — no BPM server to provision, patch, or scale separately. Compare: Newgen iBPS requires a dedicated application server (JBoss/WAS).',
    icon:  '📦',
  },
  {
    title: 'Process Versioning',
    desc:  'Deploy v2 of the onboarding process — all in-flight applications continue on v1, new applications start on v2. Both coexist in the same DB. Zero migration scripts.',
    icon:  '🔢',
  },
  {
    title: 'Async Job Executor',
    desc:  'Service tasks marked async="true" are persisted to the ACT_RU_JOB table before execution. Cluster nodes pick up jobs independently — natural horizontal scaling.',
    icon:  '⚡',
  },
  {
    title: 'Event-Driven Hooks',
    desc:  'Execution listeners and task listeners let you react to process events (start, end, create, complete) with plain Java code — no proprietary event bus configuration.',
    icon:  '🎯',
  },
  {
    title: 'Full History API',
    desc:  'Flowable\'s HistoryService records every activity instance, variable change, task assignment, and form value. Queryable via REST or Java API — built-in compliance audit trail.',
    icon:  '📋',
  },
  {
    title: 'BPMN + DMN + CMMN',
    desc:  'Flowable supports all three OMG standards. BPMN for processes, DMN for business rules (decision tables business users can edit), CMMN for adaptive case management.',
    icon:  '🗂️',
  },
]

export default function Capabilities() {
  const [caps, setCaps]     = useState([])
  const [procDef, setProcDef] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getCapabilities().catch(() => ({ data: { capabilities: [] } })),
      getProcessDef().catch(() => ({ data: null })),
    ]).then(([c, p]) => {
      setCaps(c.data.capabilities || [])
      setProcDef(p.data)
    }).finally(() => setLoading(false))
  }, [])

  const flowableWins = caps.filter(c => c.winner === 'flowable').length
  const newgenWins   = caps.filter(c => c.winner === 'newgen').length
  const both         = caps.filter(c => c.winner === 'both').length

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <GitBranch size={22} className="text-blue-500" />
          Flowable vs Newgen iBPS
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Feature-by-feature comparison for RAKBANK BPM platform evaluation
        </p>
      </div>

      {/* Score summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center border-emerald-200 border-2">
          <div className="text-3xl font-bold text-emerald-600">{flowableWins}</div>
          <div className="text-sm text-gray-500 mt-1">Flowable Advantages</div>
        </div>
        <div className="card text-center border-gray-200 border-2">
          <div className="text-3xl font-bold text-gray-400">{both}</div>
          <div className="text-sm text-gray-500 mt-1">Equal / Both Good</div>
        </div>
        <div className="card text-center border-blue-200 border-2">
          <div className="text-3xl font-bold text-blue-500">{newgenWins}</div>
          <div className="text-sm text-gray-500 mt-1">Newgen Advantages</div>
        </div>
      </div>

      {/* Process definition info */}
      {procDef && !procDef.error && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm">
          <div className="font-semibold text-emerald-700 mb-1">Live Process Definition</div>
          <div className="grid grid-cols-4 gap-4 text-xs text-gray-600">
            <div><span className="text-gray-400">Name: </span>{procDef.name}</div>
            <div><span className="text-gray-400">Version: </span><span className="text-gray-900 font-bold">v{procDef.version}</span></div>
            <div><span className="text-gray-400">Deployment: </span>{procDef.deploymentId}</div>
            <div><span className="text-gray-400">Resource: </span>{procDef.resourceName}</div>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            To demo hot-deploy: edit account-onboarding.bpmn20.xml and restart. Version counter increments automatically — in-flight processes continue on v{procDef.version}.
          </div>
        </div>
      )}

      {/* Comparison table */}
      {loading ? (
        <div className="flex items-center gap-2 text-gray-400 py-10 justify-center">
          <Loader2 className="animate-spin" /> Loading from backend...
        </div>
      ) : caps.length > 0 ? (
        <div className="card p-0 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-600 border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold w-1/4">Feature</th>
                <th className="text-left py-3 px-4 font-semibold w-[37%]">
                  <span className="text-emerald-600">Flowable BPM</span>
                </th>
                <th className="text-left py-3 px-4 font-semibold w-[37%]">
                  <span className="text-blue-500">Newgen iBPS</span>
                </th>
                <th className="text-left py-3 px-4 font-semibold">Winner</th>
              </tr>
            </thead>
            <tbody>
              {caps.map((cap, i) => <CapRow key={i} cap={cap} idx={i} />)}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card">
          <p className="text-gray-500 text-sm text-center py-4">
            Start the backend to load the live comparison from the API.
          </p>
          <p className="text-xs text-gray-400 text-center">
            <code>cd backend &amp;&amp; mvn spring-boot:run</code>
          </p>
        </div>
      )}

      {/* Architecture deep dive */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Architecture Highlights</h2>
        <div className="grid grid-cols-2 gap-4">
          {ARCHITECTURE_POINTS.map(p => (
            <div key={p.title} className="card">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{p.icon}</span>
                <span className="font-semibold text-gray-800">{p.title}</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="p-5 bg-gradient-to-r from-red-50 to-transparent border border-rakbank-red/20 rounded-xl">
        <div className="font-bold text-gray-900 text-lg mb-1">Why Flowable for RAKBANK?</div>
        <p className="text-gray-600 text-sm mb-3">
          Flowable offers enterprise-grade BPM capabilities with zero licensing cost, cloud-native deployment,
          and developer-friendly architecture. The open BPMN 2.0 standard protects RAKBANK from vendor lock-in
          while the Spring Boot embedding fits naturally into RAKBANK's existing Java microservices architecture.
        </p>
        <div className="flex flex-wrap gap-2">
          {['Zero License Cost', 'BPMN 2.0 Standard', 'Hot Deployment', 'Embedded in Spring Boot',
            'Parallel Processing', 'Full Audit Trail', 'Active Community', 'Enterprise Support Available'].map(t => (
            <span key={t} className="text-xs bg-white text-gray-700 px-2.5 py-1 rounded-full border border-gray-200 shadow-sm">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
