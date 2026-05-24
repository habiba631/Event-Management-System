import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Events from './pages/Events';
import CustomerProfile from './pages/CustomerProfile';
import OrganizerProfile from './pages/OrganizerProfile';
import CreateEvent from './pages/CreateEvent';
import MyEvents from './pages/MyEvents';
import Attendees from './pages/Attendees';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/events" element={<Events />} />

              <Route path="/profile" element={
                <ProtectedRoute roles={['Customer']}>
                  <CustomerProfile />
                </ProtectedRoute>
              } />

              <Route path="/organizer/profile" element={
                <ProtectedRoute roles={['EventOrganizer']}>
                  <OrganizerProfile />
                </ProtectedRoute>
              } />

              <Route path="/organizer/create" element={
                <ProtectedRoute roles={['EventOrganizer', 'Admin']}>
                  <CreateEvent />
                </ProtectedRoute>
              } />

              <Route path="/organizer/my-events" element={
                <ProtectedRoute roles={['EventOrganizer', 'Admin']}>
                  <MyEvents />
                </ProtectedRoute>
              } />

              <Route path="/organizer/attendees" element={
                <ProtectedRoute roles={['EventOrganizer', 'Admin']}>
                  <Attendees />
                </ProtectedRoute>
              } />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
