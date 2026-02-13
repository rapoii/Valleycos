
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import Admin from './pages/Admin';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Profile from './pages/Profile';
import GlobalChat from './pages/GlobalChat';
import { DataProvider } from './contexts/DataContext';

const App = () => {
  return (
    <DataProvider>
      <Router>
        <div className="min-h-screen text-pixel-dark overflow-x-hidden selection:bg-pixel-pink selection:text-white">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/gallery/:id" element={<Gallery />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/chat" element={<GlobalChat />} />
            </Routes>
          </main>
          
          <footer className="bg-pixel-dark text-white py-8 text-center border-t-4 border-pixel-pink mt-auto">
            <div className="font-pixel text-xl">
              <p>&copy; {new Date().getFullYear()} Valleycos_</p>
              <p className="text-gray-500 text-lg mt-2">Designed with ♥</p>
            </div>
          </footer>
        </div>
      </Router>
    </DataProvider>
  );
};

export default App;
