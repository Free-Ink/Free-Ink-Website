import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import HomePage from './pages/HomePage.jsx'
import DocsLayout from './docs/DocsLayout.jsx'
import DocPage from './docs/DocPage.jsx'
import { DOC_PAGES, FIRST_DOC_SLUG } from './docs/registry.js'

// On every route change start at the top, unless the URL carries a hash anchor
// (in-page links handle their own scroll).
function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) return
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export default function App() {
  return (
    <div className="isolate min-h-dvh bg-stone-50 text-stone-900 antialiased dark:bg-stone-950 dark:text-stone-100">
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/docs" element={<DocsLayout />}>
          <Route index element={<Navigate to={FIRST_DOC_SLUG} replace />} />
          {DOC_PAGES.map((page) => (
            <Route key={page.slug} path={page.slug} element={<DocPage page={page} />} />
          ))}
          <Route path="*" element={<Navigate to={FIRST_DOC_SLUG} replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
