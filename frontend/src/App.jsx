import { Link, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import DesignsPage from './pages/DesignsPage.jsx'

function NotFound() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Page not found</h2>
      <Link to="/">Back to Home</Link>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/designs" element={<DesignsPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App