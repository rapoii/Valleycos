
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PixelCard, PixelInput, PixelButton, SectionHeader } from '../components/ui/PixelComponents';
import { Mail, MapPin, Send, Instagram, Music, HelpCircle } from 'lucide-react';
import { useData } from '../contexts/DataContext';

const Contact = () => {
  const { socialLinks } = useData();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Message sent via carrier pigeon! (Not really, this is a demo)");
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="pt-32 min-h-screen px-4 pb-20 max-w-7xl mx-auto">
      <SectionHeader title="Contact Quest" subtitle="Send a missive to PixelHeart" />
      
      <div className="grid md:grid-cols-2 gap-12 items-stretch">
        {/* Form Section */}
        <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="h-full">
           <PixelCard className="h-full flex flex-col justify-between">
             <div>
               <h3 className="font-pixel text-3xl mb-6 flex items-center gap-2 border-b-2 border-pixel-dark pb-2">
                 <Send className="text-pixel-pink"/> Send a Message
               </h3>
               <form onSubmit={handleSubmit} className="space-y-4">
                 <PixelInput 
                   label="Your Name" 
                   value={form.name}
                   onChange={e => setForm({...form, name: e.target.value})}
                   placeholder="Adventurer Name"
                 />
                 <PixelInput 
                   label="Email Address" 
                   type="email"
                   value={form.email}
                   onChange={e => setForm({...form, email: e.target.value})}
                   placeholder="adventurer@guild.com"
                 />
                 <PixelInput 
                   label="Subject" 
                   value={form.subject}
                   onChange={e => setForm({...form, subject: e.target.value})}
                   placeholder="Commission Inquiry / Collab"
                 />
                 <div className="flex flex-col gap-2">
                    <label className="font-pixel text-xl text-pixel-dark">Message</label>
                    <textarea 
                      className="bg-white text-pixel-dark border-2 border-pixel-dark p-2 font-pixel text-xl focus:outline-none focus:ring-2 focus:ring-pixel-pink shadow-pixel-sm h-32"
                      value={form.message}
                      onChange={e => setForm({...form, message: e.target.value})}
                      placeholder="Write your scroll here..."
                    />
                 </div>
                 <PixelButton type="submit" className="w-full mt-2">
                   Send Message
                 </PixelButton>
               </form>
             </div>

             <div className="mt-8 pt-6 border-t-2 border-dashed border-pixel-dark text-center">
                 <p className="font-pixel text-xl text-gray-500">
                    Average response time: <span className="text-pixel-pink font-bold">2-3 days</span>.
                    <br/>
                    (I might be busy crafting new armor!)
                 </p>
             </div>
           </PixelCard>
        </motion.div>

        {/* Info Section */}
        <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="h-full">
            <div className="space-y-8 h-full flex flex-col">
                <PixelCard>
                    <h3 className="font-pixel text-3xl mb-6 border-b-2 border-pixel-dark pb-2">Guild Location</h3>
                    <div className="space-y-6 font-pixel text-xl">
                        <div className="flex items-center gap-4">
                            <div className="bg-pixel-pink p-3 border-2 border-pixel-dark shadow-pixel-sm">
                                <MapPin className="text-pixel-dark" size={24} />
                            </div>
                            <div>
                                <p className="font-bold text-2xl">Adalah</p>
                                <p className="text-gray-500">Tangerang, Banten</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-4">
                            <div className="bg-blue-300 p-3 border-2 border-pixel-dark shadow-pixel-sm">
                                <MapPin className="text-pixel-dark" size={24} />
                            </div>
                            <div>
                                <p className="font-bold text-2xl">Pokoknya</p>
                                <p className="text-gray-500">Serang, Banten</p>
                            </div>
                        </div>
                    </div>
                </PixelCard>

                {/* FAQ Section (Moved Up) */}
                 <PixelCard className="flex-1">
                    <h3 className="font-pixel text-3xl mb-4 border-b-2 border-pixel-dark pb-2 flex items-center gap-2">
                        <HelpCircle className="text-pixel-gold"/> Mini FAQ
                    </h3>
                    <div className="space-y-4 font-pixel text-xl">
                        <div>
                            <p className="text-pixel-pink font-bold">Q: Do you accept commissions?</p>
                            <p className="text-gray-600">A: Currently closed for new costume commissions.</p>
                        </div>
                        <div>
                            <p className="text-pixel-pink font-bold">Q: Can I repost your work?</p>
                            <p className="text-gray-600">A: Yes, but please tag/credit me properly!</p>
                        </div>
                         <div>
                            <p className="text-pixel-pink font-bold">Q: Collabs?</p>
                            <p className="text-gray-600">A: Currently not open.</p>
                        </div>
                    </div>
                </PixelCard>

                {/* Social Buttons (Moved Down) */}
                <div className="grid grid-cols-3 gap-4">
                    <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="group">
                        <PixelCard className="flex flex-col items-center justify-center p-4 hover:bg-pixel-pink transition-colors group-hover:text-white h-full" noPadding>
                            <div className="p-4">
                                <Instagram size={32} />
                            </div>
                        </PixelCard>
                    </a>
                    <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="group">
                        <PixelCard className="flex flex-col items-center justify-center p-4 hover:bg-black hover:text-white transition-colors h-full" noPadding>
                             <div className="p-4">
                                <Music size={32} />
                            </div>
                        </PixelCard>
                    </a>
                    <a href={`mailto:${socialLinks.email}`} className="group">
                         <PixelCard className="flex flex-col items-center justify-center p-4 hover:bg-blue-500 hover:text-white transition-colors h-full" noPadding>
                             <div className="p-4">
                                <Mail size={32} />
                            </div>
                        </PixelCard>
                    </a>
                </div>
            </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
