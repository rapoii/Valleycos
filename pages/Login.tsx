
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { PixelCard, PixelInput, PixelButton, SectionHeader } from '../components/ui/PixelComponents';
import { UserPlus, LogIn, Loader2 } from 'lucide-react';


const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const { login, signup } = useData();
  const navigate = useNavigate();

  // Form States
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    dob: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🖱️ Submit clicked. isSignUp:", isSignUp);
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!formData.username || !formData.email || !formData.password || !formData.dob) {
          setError("Please fill in all fields.");
          setLoading(false);
          return;
        }

        console.log("📝 Calling signup service...");
        const result = await signup({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          dob: formData.dob
        });
        console.log("✅ Signup service returned:", result);

        if (result.success) {
          console.log("🔄 Navigating to home...");
          navigate('/');
        } else {
          console.warn("⚠️ Signup result failed:", result.message);
          setError(result.message);
        }

      } else {
        if (!formData.username || !formData.password) {
          setError("Please enter username or email and password.");
          setLoading(false);
          return;
        }

        console.log("📝 Calling login service...");
        const result = await login(formData.username, formData.password);
        console.log("✅ Login service returned:", result);

        if (result.success) {
          navigate('/');
        } else {
          setError(result.message || "Invalid credentials.");
        }
      }
    } catch (err: any) {
      console.error("❌ Submit Error:", err);
      setError(err.message || 'Something went wrong.');
    } finally {
      console.log("🏁 Loading set to false");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 px-4 pb-20 flex items-center justify-center">
      <div className="w-full max-w-md">
        <SectionHeader
          title={isSignUp ? "New Player" : "Continue"}
          subtitle={isSignUp ? "Create your character" : "Load your save file"}
        />



        <PixelCard>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-2 font-pixel text-lg">
                {error}
              </div>
            )}

            <PixelInput
              name="username"
              label={isSignUp ? "Username" : "Username or Email"}
              value={formData.username}
              onChange={handleInputChange}
              placeholder={isSignUp ? "Choose unique name..." : "Enter username or email..."}
              disabled={loading}
            />
            {/* Conditional Email Field for Signup only */}
            {isSignUp && (
            <PixelInput
              name="email"
              type="email"
              label="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="email@example.com"
              disabled={loading}
            />
            )}

            {isSignUp && (
              <>
                <PixelInput
                  name="dob"
                  type="date"
                  label="Date of Birth"
                  value={formData.dob}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                <p className="font-pixel text-sm text-gray-500">Must be 18+ to join.</p>
              </>
            )}

            <PixelInput
              name="password"
              type="password"
              label="Password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              disabled={loading}
            />

            <PixelButton type="submit" className="w-full mt-4" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={20} /> Loading...
                </span>
              ) : isSignUp ? (
                <><UserPlus className="inline mr-2" /> Sign Up</>
              ) : (
                <><LogIn className="inline mr-2" /> Login</>
              )}
            </PixelButton>
          </form>

          <div className="mt-6 text-center border-t-2 border-dashed border-pixel-dark pt-4">
            <p className="font-pixel text-xl mb-2">
              {isSignUp ? "Already have an account?" : "Need an account?"}
            </p>
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(''); setFormData({ username: '', email: '', password: '', dob: '' }); }}
              className="text-pixel-pink font-pixel text-xl hover:underline"
              disabled={loading}
            >
              {isSignUp ? "Login Here" : "Create Account"}
            </button>

          </div>

        </PixelCard>
      </div >
    </div >
  );
};

export default Login;
