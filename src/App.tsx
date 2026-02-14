import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import HomePage from '@/pages/HomePage'
import BlogListPage from '@/pages/BlogListPage'
import BlogPostPage from '@/pages/BlogPostPage'
import CategoryPage from '@/pages/CategoryPage'
import ToolsPage from '@/pages/ToolsPage'
import CompoundInterestCalculator from '@/pages/tools/CompoundInterestCalculator'
import LoanCalculator from '@/pages/tools/LoanCalculator'
import SalaryCalculator from '@/pages/tools/SalaryCalculator'
import SavingsCalculator from '@/pages/tools/SavingsCalculator'
import SeveranceCalculator from '@/pages/tools/SeveranceCalculator'
import PensionCalculator from '@/pages/tools/PensionCalculator'
import RealEstateCalculator from '@/pages/tools/RealEstateCalculator'
import BmiCalculator from '@/pages/tools/BmiCalculator'
import AgeCalculator from '@/pages/tools/AgeCalculator'
import ExchangeRateCalculator from '@/pages/tools/ExchangeRateCalculator'
import JeonseWolseCalculator from '@/pages/tools/JeonseWolseCalculator'
import StockReturnCalculator from '@/pages/tools/StockReturnCalculator'
import LoanRefinanceCalculator from '@/pages/tools/LoanRefinanceCalculator'
import ElectricityCalculator from '@/pages/tools/ElectricityCalculator'
import HourlyWageCalculator from '@/pages/tools/HourlyWageCalculator'
import IncomeTaxCalculator from '@/pages/tools/IncomeTaxCalculator'
import CarCostCalculator from '@/pages/tools/CarCostCalculator'
import RetirementCalculator from '@/pages/tools/RetirementCalculator'
import ChildCostCalculator from '@/pages/tools/ChildCostCalculator'
import VatCalculator from '@/pages/tools/VatCalculator'
import ChessGame from '@/pages/tools/ChessGame'
import PegSolitaireGame from '@/pages/tools/PegSolitaireGame'
import JanggiGame from '@/pages/tools/JanggiGame'
import GomokuGame from '@/pages/tools/GomokuGame'
import SudokuGame from '@/pages/tools/SudokuGame'
import BadukGame from '@/pages/tools/BadukGame'

import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage'
import TermsPage from '@/pages/TermsPage'
import AboutPage from '@/pages/AboutPage'
import ContactPage from '@/pages/ContactPage'
import UnsubscribePage from '@/pages/UnsubscribePage'
import AdminPage from '@/pages/admin/AdminPage'
import SubscribersPage from '@/pages/admin/SubscribersPage'
import EditPostPage from '@/pages/admin/EditPostPage'
import PostsManagePage from '@/pages/admin/PostsManagePage'
import NotFoundPage from '@/pages/NotFoundPage'
import { AdminProvider } from '@/contexts/AdminContext'

function App() {
  return (
    <AdminProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="blog" element={<BlogListPage />} />
          <Route path="blog/:slug" element={<BlogPostPage />} />
          <Route path="blog/category/:category" element={<CategoryPage />} />
          <Route path="company" element={<Navigate to="/about" replace />} />
          <Route path="tools" element={<ToolsPage />} />
          <Route path="tools/compound-interest" element={<CompoundInterestCalculator />} />
          <Route path="tools/loan-interest" element={<LoanCalculator />} />
          <Route path="tools/salary" element={<SalaryCalculator />} />
          <Route path="tools/savings" element={<SavingsCalculator />} />
          <Route path="tools/severance" element={<SeveranceCalculator />} />
          <Route path="tools/pension" element={<PensionCalculator />} />
          <Route path="tools/real-estate" element={<RealEstateCalculator />} />
          <Route path="tools/bmi" element={<BmiCalculator />} />
          <Route path="tools/age" element={<AgeCalculator />} />
          <Route path="tools/exchange-rate" element={<ExchangeRateCalculator />} />
          <Route path="tools/jeonse-wolse" element={<JeonseWolseCalculator />} />
          <Route path="tools/stock-return" element={<StockReturnCalculator />} />
          <Route path="tools/loan-refinance" element={<LoanRefinanceCalculator />} />
          <Route path="tools/electricity" element={<ElectricityCalculator />} />
          <Route path="tools/hourly-wage" element={<HourlyWageCalculator />} />
          <Route path="tools/income-tax" element={<IncomeTaxCalculator />} />
          <Route path="tools/car-cost" element={<CarCostCalculator />} />
          <Route path="tools/retirement" element={<RetirementCalculator />} />
          <Route path="tools/child-cost" element={<ChildCostCalculator />} />
          <Route path="tools/vat" element={<VatCalculator />} />
<Route path="tools/chess" element={<ChessGame />} />
          <Route path="tools/peg-solitaire" element={<PegSolitaireGame />} />
          <Route path="tools/janggi" element={<JanggiGame />} />
          <Route path="tools/gomoku" element={<GomokuGame />} />
          <Route path="tools/sudoku" element={<SudokuGame />} />
          <Route path="tools/baduk" element={<BadukGame />} />

          <Route path="privacy" element={<PrivacyPolicyPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="unsubscribe" element={<UnsubscribePage />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="admin/subscribers" element={<SubscribersPage />} />
          <Route path="admin/posts" element={<PostsManagePage />} />
          <Route path="admin/edit/:slug" element={<EditPostPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </AdminProvider>
  )
}

export default App
