
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Heart, Shield, Camera, User, Mail, LogIn, LogOut, AlertTriangle, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../contexts/DataContext';
import { PixelCard, PixelButton } from './ui/PixelComponents';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useData();

  const confirmLogout = async () => {
    await logout();
    setShowLogoutConfirm(false);
    setIsOpen(false);
    navigate('/');
  };

  const links = [
    { path: '/', label: 'Home', icon: <Heart className="w-5 h-5" /> },
    { path: '/gallery', label: 'Gallery', icon: <Camera className="w-5 h-5" /> },
    { path: '/about', label: 'About', icon: <User className="w-5 h-5" /> },
    { path: '/contact', label: 'Contact', icon: <Mail className="w-5 h-5" /> },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 px-4 py-4">
        <div className="max-w-7xl mx-auto bg-white/90 backdrop-blur-md border-2 border-pixel-dark shadow-pixel flex justify-between items-center p-3 md:px-6">

          {/* Logo */}
          <Link to="/" className="text-3xl font-pixel flex items-center gap-2 text-pixel-dark hover:text-pixel-pink transition-colors">
            <span className="text-pixel-pink text-4xl">♥</span>
            Valleycos_
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-8">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-pixel text-2xl flex items-center gap-2 uppercase hover:text-pixel-pink transition-colors ${location.pathname === link.path ? 'text-pixel-pink underline decoration-2 underline-offset-4' : 'text-pixel-dark'}`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}

            {/* Global Chat Link (Logged in only) */}
            {currentUser && (
              <Link
                to="/chat"
                className={`font-pixel text-2xl flex items-center gap-2 uppercase hover:text-pixel-pink transition-colors ${location.pathname === '/chat' ? 'text-pixel-pink underline decoration-2 underline-offset-4' : 'text-pixel-dark'}`}
              >
                <MessageSquare className="w-5 h-5" /> Chat
              </Link>
            )}

            {/* Admin Link (Only if Admin) */}
            {currentUser?.isAdmin && (
              <Link
                to="/admin"
                className={`font-pixel text-2xl flex items-center gap-2 uppercase hover:text-pixel-pink transition-colors ${location.pathname === '/admin' ? 'text-pixel-pink underline decoration-2 underline-offset-4' : 'text-pixel-dark'}`}
              >
                <Shield className="w-5 h-5" /> Admin
              </Link>
            )}

            {/* Login/Logout/Profile */}
            {currentUser ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/profile"
                  className={`font-pixel text-2xl flex items-center gap-2 uppercase hover:text-pixel-pink transition-colors ${location.pathname === '/profile' ? 'text-pixel-pink underline decoration-2 underline-offset-4' : 'text-pixel-dark'}`}
                >
                  <img src={currentUser.profilePicture || `https://ui-avatars.com/api/?name=${currentUser.username}&background=random`} className="w-6 h-6 rounded-full border border-pixel-dark" alt="av" /> Profile
                </Link>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="font-pixel text-2xl flex items-center gap-2 uppercase text-pixel-dark hover:text-red-500 transition-colors"
                >
                  <LogOut className="w-5 h-5" /> Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className={`font-pixel text-2xl flex items-center gap-2 uppercase hover:text-pixel-pink transition-colors ${location.pathname === '/login' ? 'text-pixel-pink underline decoration-2 underline-offset-4' : 'text-pixel-dark'}`}
              >
                <LogIn className="w-5 h-5" /> Login
              </Link>
            )}
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-pixel-dark" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden absolute top-20 left-4 right-4 bg-white border-2 border-pixel-dark shadow-pixel-lg p-6 flex flex-col gap-6 items-center"
            >
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="font-pixel text-3xl uppercase text-pixel-dark hover:text-pixel-pink"
                >
                  {link.label}
                </Link>
              ))}

              {currentUser && (
                <Link
                  to="/chat"
                  onClick={() => setIsOpen(false)}
                  className="font-pixel text-3xl uppercase text-pixel-dark hover:text-pixel-pink"
                >
                  Global Chat
                </Link>
              )}

              {currentUser?.isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="font-pixel text-3xl uppercase text-pixel-dark hover:text-pixel-pink"
                >
                  Admin Panel
                </Link>
              )}

              {currentUser ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="font-pixel text-3xl uppercase text-pixel-dark hover:text-pixel-pink"
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setShowLogoutConfirm(true);
                    }}
                    className="font-pixel text-3xl uppercase text-pixel-dark hover:text-red-500"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="font-pixel text-3xl uppercase text-pixel-dark hover:text-pixel-pink"
                >
                  Login / Sign Up
                </Link>
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm"
            >
              <PixelCard className="text-center border-2 border-pixel-dark shadow-pixel-lg">
                <div className="flex justify-center mb-4 text-pixel-pink">
                  <LogOut size={48} />
                </div>
                <h3 className="font-pixel text-3xl mb-2 text-pixel-dark">Logging Out?</h3>
                <p className="font-pixel text-xl text-gray-600 mb-6 leading-relaxed">
                  Are you sure you want to end your session?
                </p>
                <div className="flex flex-col gap-3">
                  <PixelButton onClick={confirmLogout} variant="danger">
                    <span className="flex items-center justify-center gap-2">
                      Yes, Logout
                    </span>
                  </PixelButton>
                  <PixelButton variant="secondary" onClick={() => setShowLogoutConfirm(false)}>
                    Cancel
                  </PixelButton>
                </div>
              </PixelCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
