import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { startOnboarding } from '../api/onboardingApi'
import { CheckCircle2, ArrowRight, Loader2 } from 'lucide-react'

const STEPS = ['Company Details', 'Signatory', 'Contact & Submit']

const LICENSE_TYPES = ['MAINLAND', 'FREEZONE', 'OFFSHORE']
const LICENSE_AUTHORITIES = ['DED', 'ADGM', 'DIFC', 'JAFZA', 'DAFZA', 'Ajman Free Zone', 'Other']
const BUSINESS_ACTIVITIES = [
  'GENERAL_TRADING', 'RETAIL', 'MANUFACTURING', 'FINANCIAL_SERVICES',
  'REAL_ESTATE', 'MONEY_EXCHANGE', 'TECHNOLOGY', 'HEALTHCARE',
  'FOOD_AND_BEVERAGE', 'LOGISTICS', 'CONSULTING', 'JEWELLERY', 'CRYPTO'
]
const EMIRATES = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain']

const INIT = {
  companyName: '', tradeNameEn: '', tradeNameAr: '',
  licenseNumber: '', licenseType: 'MAINLAND', licenseAuthority: 'DED',
  licenseExpiryDate: '', businessActivity: 'GENERAL_TRADING', annualTurnover: '',
  signatoryName: '', signatoryEmirates: '', signatoryPassport: '',
  signatoryNationality: '', signatoryUaePassId: '',
  email: '', phone: '', address: '', emirate: 'Dubai',
  scenario: 'HAPPY_PATH'
}

function Field({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  )
}

export default function NewApplication() {
  const [step, setStep]     = useState(0)
  const [form, setForm]     = useState(INIT)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState(null)
  const navigate = useNavigate()

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await startOnboarding(form)
      navigate(`/application/${res.data.processInstanceId}`)
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to start onboarding. Is the backend running?')
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">New Business Account Application</h1>
      <p className="text-sm text-gray-500 mb-6">RAKBANK Business Banking — Account Onboarding</p>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <button
              onClick={() => i < step && setStep(i)}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                i === step ? 'text-white' : i < step ? 'text-emerald-400 cursor-pointer' : 'text-gray-600'
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${
                i === step
                  ? 'border-rakbank-red bg-rakbank-red text-white'
                  : i < step
                  ? 'border-emerald-500 bg-emerald-900/40 text-emerald-400'
                  : 'border-gray-700 text-gray-600'
              }`}>
                {i < step ? <CheckCircle2 size={12} /> : i + 1}
              </span>
              {s}
            </button>
            {i < STEPS.length - 1 && (
              <div className={`h-px w-8 ${i < step ? 'bg-emerald-700' : 'bg-gray-800'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="card space-y-4">
        {step === 0 && (
          <>
            <h2 className="font-semibold text-gray-200 mb-2">Company Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Company Name *">
                <input className="input" value={form.companyName} onChange={set('companyName')}
                       placeholder="Al Noor Trading LLC" />
              </Field>
              <Field label="Trade Name (English)">
                <input className="input" value={form.tradeNameEn} onChange={set('tradeNameEn')}
                       placeholder="Al Noor Trading" />
              </Field>
              <Field label="License Number *">
                <input className="input" value={form.licenseNumber} onChange={set('licenseNumber')}
                       placeholder="DED-123456" />
              </Field>
              <Field label="License Type">
                <select className="input" value={form.licenseType} onChange={set('licenseType')}>
                  {LICENSE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="License Authority">
                <select className="input" value={form.licenseAuthority} onChange={set('licenseAuthority')}>
                  {LICENSE_AUTHORITIES.map(a => <option key={a}>{a}</option>)}
                </select>
              </Field>
              <Field label="License Expiry Date">
                <input type="date" className="input" value={form.licenseExpiryDate} onChange={set('licenseExpiryDate')} />
              </Field>
              <Field label="Business Activity">
                <select className="input" value={form.businessActivity} onChange={set('businessActivity')}>
                  {BUSINESS_ACTIVITIES.map(a => <option key={a}>{a}</option>)}
                </select>
              </Field>
              <Field label="Annual Turnover">
                <select className="input" value={form.annualTurnover} onChange={set('annualTurnover')}>
                  <option value="">Select range</option>
                  <option>Under AED 1,000,000</option>
                  <option>AED 1M - 5M</option>
                  <option>AED 5,000,000 - 25,000,000</option>
                  <option>AED 25M - 100M</option>
                  <option>Over AED 100M</option>
                </select>
              </Field>
            </div>
            {/* Demo scenario selector */}
            <div className="mt-4 p-3 bg-amber-900/20 border border-amber-900/40 rounded-lg">
              <label className="label text-amber-400">Demo Scenario (for CTO demo)</label>
              <select className="input" value={form.scenario} onChange={set('scenario')}>
                <option value="HAPPY_PATH">Happy Path — Auto Approve</option>
                <option value="SANCTIONS_HIT">Sanctions Hit — Auto Reject (Fircosoft)</option>
                <option value="HIGH_RISK">High Risk — Manual Review Required</option>
                <option value="CREDIT_FAIL">Credit Fail — Auto Reject (AECB)</option>
              </select>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2 className="font-semibold text-gray-200 mb-2">Authorized Signatory</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Full Name *">
                <input className="input" value={form.signatoryName} onChange={set('signatoryName')}
                       placeholder="Mohammed Al Rashidi" />
              </Field>
              <Field label="Nationality">
                <input className="input" value={form.signatoryNationality} onChange={set('signatoryNationality')}
                       placeholder="UAE" />
              </Field>
              <Field label="Emirates ID">
                <input className="input" value={form.signatoryEmirates} onChange={set('signatoryEmirates')}
                       placeholder="784-1985-1234567-1" />
              </Field>
              <Field label="Passport Number">
                <input className="input" value={form.signatoryPassport} onChange={set('signatoryPassport')}
                       placeholder="A1234567" />
              </Field>
              <Field label="UAE Pass ID" >
                <input className="input" value={form.signatoryUaePassId} onChange={set('signatoryUaePassId')}
                       placeholder="UAE-7891234" />
              </Field>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="font-semibold text-gray-200 mb-2">Contact Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Email Address *">
                <input type="email" className="input" value={form.email} onChange={set('email')}
                       placeholder="info@company.ae" />
              </Field>
              <Field label="Phone Number">
                <input className="input" value={form.phone} onChange={set('phone')}
                       placeholder="+971-50-1234567" />
              </Field>
              <Field label="Emirate">
                <select className="input" value={form.emirate} onChange={set('emirate')}>
                  {EMIRATES.map(e => <option key={e}>{e}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Business Address">
              <input className="input" value={form.address} onChange={set('address')}
                     placeholder="Office 1204, Business Bay, Dubai" />
            </Field>

            {/* Summary */}
            <div className="mt-4 p-4 bg-gray-800 rounded-lg text-xs space-y-1 text-gray-400">
              <div className="font-semibold text-gray-300 mb-2">Application Summary</div>
              <div><span className="text-gray-500">Company:</span> {form.companyName || '—'}</div>
              <div><span className="text-gray-500">License:</span> {form.licenseNumber} ({form.licenseType})</div>
              <div><span className="text-gray-500">Activity:</span> {form.businessActivity}</div>
              <div><span className="text-gray-500">Signatory:</span> {form.signatoryName || '—'}</div>
              <div><span className="text-gray-500 text-amber-400">Scenario:</span> <span className="text-amber-300">{form.scenario}</span></div>
            </div>

            {error && (
              <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-sm">{error}</div>
            )}
          </>
        )}
      </div>

      <div className="flex justify-between mt-4">
        <button
          className="btn-secondary"
          onClick={() => setStep(s => s - 1)}
          disabled={step === 0}
        >
          Back
        </button>
        {step < STEPS.length - 1 ? (
          <button className="btn-primary flex items-center gap-2"
                  onClick={() => setStep(s => s + 1)}
                  disabled={step === 0 && !form.companyName}>
            Next <ArrowRight size={15} />
          </button>
        ) : (
          <button className="btn-primary flex items-center gap-2 min-w-36 justify-center"
                  onClick={submit} disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? 'Starting...' : 'Submit Application'}
          </button>
        )}
      </div>
    </div>
  )
}
