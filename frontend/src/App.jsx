import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import Layout        from './components/layout/Layout'
import Dashboard     from './pages/Dashboard'
import TicketList    from './pages/TicketList'
import CreateTicket  from './pages/CreateTicket'
import TicketDetail  from './pages/TicketDetail'
import SearchPage    from './pages/SearchPage'
import NotFound      from './pages/NotFound'

function Page({ children }) {
  return (
    <ErrorBoundary>
      <Layout>{children}</Layout>
    </ErrorBoundary>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"             element={<Page><Dashboard /></Page>} />
        <Route path="/tickets"      element={<Page><TicketList /></Page>} />
        <Route path="/tickets/new"  element={<Page><CreateTicket /></Page>} />
        <Route path="/tickets/:id"  element={<Page><TicketDetail /></Page>} />
        <Route path="/search"       element={<Page><SearchPage /></Page>} />
        <Route path="/404"          element={<Page><NotFound /></Page>} />
        <Route path="*"             element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
