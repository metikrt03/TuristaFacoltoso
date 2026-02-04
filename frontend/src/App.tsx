import { Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Dashboard from '@/pages/Dashboard'
import UtentiPage from '@/pages/UtentiPage'
import HostPage from '@/pages/HostPage'
import AbitazioniPage from '@/pages/AbitazioniPage'
import PrenotazioniPage from '@/pages/PrenotazioniPage'
import FeedbackPage from '@/pages/FeedbackPage'
import ReportPage from '@/pages/ReportPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="utenti" element={<UtentiPage />} />
        <Route path="host" element={<HostPage />} />
        <Route path="abitazioni" element={<AbitazioniPage />} />
        <Route path="prenotazioni" element={<PrenotazioniPage />} />
        <Route path="feedback" element={<FeedbackPage />} />
        <Route path="report" element={<ReportPage />} />
      </Route>
    </Routes>
  )
}
