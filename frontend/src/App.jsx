import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard    from './pages/Dashboard'
import TicketList   from './pages/TicketList'
import CreateTicket from './pages/CreateTicket'
import TicketDetail from './pages/TicketDetail'
import SearchPage   from './pages/SearchPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout><Dashboard /></Layout>}    path="/" />
        <Route element={<Layout><TicketList /></Layout>}   path="/tickets" />
        <Route element={<Layout><CreateTicket /></Layout>} path="/tickets/new" />
        <Route element={<Layout><TicketDetail /></Layout>} path="/tickets/:id" />
        <Route element={<Layout><SearchPage /></Layout>}   path="/search" />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
