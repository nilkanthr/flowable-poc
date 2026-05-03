import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export const startOnboarding  = (req)  => api.post('/onboarding/start', req)
export const listApplications = ()     => api.get('/onboarding')
export const getApplication   = (id)   => api.get(`/onboarding/${id}`)
export const getVariables     = (id)   => api.get(`/onboarding/${id}/variables`)
export const getMetrics       = ()     => api.get('/onboarding/metrics')
export const getProcessDef    = ()     => api.get('/onboarding/process-definition')

export const getPendingTasks  = ()     => api.get('/tasks/pending')
export const completeTask     = (req)  => api.post('/tasks/complete', req)

export const runScenario      = (name) => api.post(`/demo/scenario/${name}`)
export const getCapabilities  = ()     => api.get('/demo/capabilities')
