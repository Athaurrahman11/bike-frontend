import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Home from './pages/Home';
import Bikes from './pages/Bikes';
import BikeDetails from './pages/BikeDetails';
import About from './pages/About';
import Contact from './pages/Contact';
import { Login, Register, ForgotPassword, ResetPassword } from './pages/Auth';
import PaymentResult from './pages/PaymentResult';
import NotFound from './pages/NotFound';
import BookingDetails from './dashboard/BookingDetails';
import Profile from './dashboard/Profile';
import CustomerOverview from './dashboard/customer/Overview';
import MyBookings from './dashboard/customer/MyBookings';
import PaymentHistory from './dashboard/customer/PaymentHistory';
import Invoice from './dashboard/customer/Invoice';
import AdminOverview from './dashboard/admin/Overview';
import ManageBikes from './dashboard/admin/ManageBikes';
import BikeForm from './dashboard/admin/BikeForm';
import ManageBookings from './dashboard/admin/ManageBookings';
import ManageCustomers from './dashboard/admin/ManageCustomers';
import ManagePayments from './dashboard/admin/ManagePayments';
import ManageCategories from './dashboard/admin/ManageCategories';
import Reports from './dashboard/admin/Reports';

function ScrollToTop() {
  const { pathname } = useLocation();
  // braces matter: scrollTo returns a Promise in newer browsers, and React would treat a returned value as a cleanup function
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="bikes" element={<Bikes />} />
          <Route path="bikes/:id" element={<BikeDetails />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password/:token" element={<ResetPassword />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="payment/result" element={<PaymentResult />} />
          <Route path="invoice/:id" element={<Invoice />} />
        </Route>

        <Route element={<ProtectedRoute role="customer" />}>
          <Route path="dashboard" element={<DashboardLayout />}>
            <Route index element={<CustomerOverview />} />
            <Route path="bookings" element={<MyBookings />} />
            <Route path="bookings/:id" element={<BookingDetails />} />
            <Route path="payments" element={<PaymentHistory />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute role="admin" />}>
          <Route path="admin" element={<DashboardLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="bikes" element={<ManageBikes />} />
            <Route path="bikes/new" element={<BikeForm />} />
            <Route path="bikes/:id/edit" element={<BikeForm />} />
            <Route path="bookings" element={<ManageBookings />} />
            <Route path="bookings/:id" element={<BookingDetails />} />
            <Route path="customers" element={<ManageCustomers />} />
            <Route path="payments" element={<ManagePayments />} />
            <Route path="categories" element={<ManageCategories />} />
            <Route path="reports" element={<Reports />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}
