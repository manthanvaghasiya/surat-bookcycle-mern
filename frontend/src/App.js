import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Header from './components/Header';
import Footer from './components/Footer'; 
import AnnouncementBanner from './components/AnnouncementBanner'; // NEW
// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ListBook from './pages/ListBook';
import Home from './pages/Home';
import BookDetails from './pages/BookDetails';
import Profile from './pages/Profile'; // NEW
import MyOrders from './pages/MyOrders';
import AdminDashboard from './pages/AdminDashboard';
import EditBook from './pages/EditBook';
import Contact from './pages/Contact'; 

import NotFound from './pages/NotFound';

function App() {
  return (
    <div style={appLayoutStyle}> {/* Wrapper for Flex Layout */}
      <AnnouncementBanner />
      <Header />
     
      <div className="container" style={{ flex: 1 }}> {/* Main Content Grows */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/book/:id" element={<BookDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/list-book" element={<ListBook />} />
          <Route path="/edit-book/:id" element={<EditBook />} />
          <Route path="/myorders" element={<MyOrders />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      <Footer /> {/* <-- Footer at the bottom */}
      <ToastContainer position="bottom-right" />
    </div>
  );
}

// Layout to push footer down
const appLayoutStyle = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
};

export default App;