import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import HomePage from '@/pages/HomePage'
import BlogListPage from '@/pages/BlogListPage'
import BlogPostPage from '@/pages/BlogPostPage'
import CategoryPage from '@/pages/CategoryPage'
import ToolsPage from '@/pages/ToolsPage'
import CompoundInterestCalculator from '@/pages/tools/CompoundInterestCalculator'
import LoanCalculator from '@/pages/tools/LoanCalculator'
import CompanyPage from '@/pages/CompanyPage'
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage'
import TermsPage from '@/pages/TermsPage'
import AboutPage from '@/pages/AboutPage'
import ContactPage from '@/pages/ContactPage'
import NotFoundPage from '@/pages/NotFoundPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="blog" element={<BlogListPage />} />
          <Route path="blog/:slug" element={<BlogPostPage />} />
          <Route path="blog/category/:category" element={<CategoryPage />} />
          <Route path="company" element={<CompanyPage />} />
          <Route path="tools" element={<ToolsPage />} />
          <Route path="tools/compound-interest" element={<CompoundInterestCalculator />} />
          <Route path="tools/loan-interest" element={<LoanCalculator />} />
          <Route path="privacy" element={<PrivacyPolicyPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
