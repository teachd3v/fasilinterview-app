import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { OnboardingScreen } from './pages/OnboardingScreen'
import { EvaluationStepper } from './pages/EvaluationStepper'
import { SubmissionScreen } from './pages/SubmissionScreen'
import { AdminDashboard } from './pages/AdminDashboard'
import { CandidateDetail } from './pages/CandidateDetail'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<OnboardingScreen />} />
        <Route path="/evaluate" element={<EvaluationStepper />} />
        <Route path="/submission" element={<SubmissionScreen />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/detail/:id" element={<CandidateDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
