import { BrowserRouter, Route, Routes } from "react-router-dom"
import BrowsePage from "./pages/BrowsePage"
import DetailsPage from "./pages/DetailsPage"
import CategoryPage from "./pages/CategoryPage"
import MyCartPage from "./pages/MyCartPage"
import BillingPage from "./pages/BillingPage"
import PaymentPage from "./pages/PaymentPage"
import BillingFinishedPage from "./pages/BillingFinished"
import MyOrdersPage from "./pages/MyOrdersPage"
import MyBillingDetailsPage from "./pages/MyBillingDetailsPage"

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BrowsePage />} />
        <Route path="/item/:slug" element={<DetailsPage />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/brand/:slug" element={<CategoryPage />} />
        <Route path="/cart" element={<MyCartPage />} />
        <Route path="/billing" element={<BillingPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/billing-finished" element={<BillingFinishedPage />} />
        <Route path="/check-transaction" element={<MyOrdersPage />} />
        <Route path="/my-transaction" element={<MyBillingDetailsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
