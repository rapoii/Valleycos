
import React from 'react';
import { motion } from 'framer-motion';
import { PixelCard, SectionHeader, PixelButton } from '../components/ui/PixelComponents';
import { Instagram, Mail, Music, Heart, Sparkles, Scissors, Palette, Camera, User } from 'lucide-react';
import { useData } from '../contexts/DataContext';

const SkillBar = ({ label, level, icon }: { label: string, level: number, icon: React.ReactNode }) => (
  <div>
    <div className="flex justify-between font-pixel text-xl mb-1">
      <span className="flex items-center gap-2 text-pixel-dark">{icon} {label}</span>
      <span className="text-pixel-pink">{level}%</span>
    </div>
    <div className="h-6 w-full border-2 border-pixel-dark bg-white p-[2px] shadow-pixel-sm">
      <motion.div 
        initial={{ width: 0 }}
        whileInView={{ width: `${level}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="h-full bg-pixel-pink relative group"
      >
        {/* Shine effect */}
        <div className="absolute top-0 right-0 bottom-0 w-1 bg-white/50"></div>
      </motion.div>
    </div>
  </div>
);

const About = () => {
  const { cosplaySets, socialLinks } = useData();
  const level = cosplaySets.reduce((acc, set) => acc + set.photos.length, 0);

  return (
    <div className="pt-32 min-h-screen px-4 pb-20 max-w-7xl mx-auto">
       {/* Hero / Bio Section */}
       <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="order-2 md:order-1"
          >
             <h1 className="text-6xl md:text-8xl font-pixel mb-4 text-pixel-dark leading-none">
                HI, I'M <br/>
                <span className="text-pixel-pink drop-shadow-[4px_4px_0_rgba(45,27,46,1)]">VANIOLA</span>
             </h1>
             <PixelCard className="mb-8 bg-pixel-cream">
                <p className="font-pixel text-xl md:text-2xl leading-relaxed text-pixel-dark">
                   I'm a passionate cosplayer, crafter, and dream-weaver based in the digital realm.
                   I've been bringing 2D characters into the 3D world since 2025.
                   <br/><br/>
                   For me, cosplay is the ultimate form of magic—combining engineering, art, fashion, and performance to create something unforgettable.
                   When I'm not covered in EVA foam dust, I'm usually gaming or hunting for the perfect bubble tea.
                </p>
             </PixelCard>
             <div className="flex flex-wrap gap-4">
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                    <PixelButton variant="primary" size="md">
                       <Instagram className="inline mr-2" size={24}/> Instagram
                    </PixelButton>
                </a>
                <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer">
                    <PixelButton variant="secondary" size="md">
                       <Music className="inline mr-2" size={24}/> TikTok
                    </PixelButton>
                </a>
                <a href={`mailto:${socialLinks.email}`}>
                    <PixelButton variant="secondary" size="md">
                       <Mail className="inline mr-2" size={24}/> Email
                    </PixelButton>
                </a>
             </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="order-1 md:order-2 relative flex justify-center"
          >
             <div className="relative w-full max-w-md aspect-[3/4]">
                <div className="absolute inset-0 bg-pixel-pink translate-x-4 translate-y-4 border-2 border-pixel-dark"></div>
                <img
                  src="/foto/foto-about.jpg"
                  alt="Profile"
                  className="relative z-10 w-full h-full border-2 border-pixel-dark object-cover grayscale hover:grayscale-0 transition-all duration-500"
                />
                <div className="absolute -bottom-6 -left-6 bg-white border-2 border-pixel-dark p-4 shadow-pixel z-20">
                    <p className="font-pixel text-2xl">Lvl. {level} Cosplayer</p>
                </div>
             </div>
          </motion.div>
       </div>

       {/* Stats / Skills Section */}
       <SectionHeader title="Character Stats" subtitle="Attributes & Inventory" />
       
       <div className="grid md:grid-cols-2 gap-8 mb-20">
          <motion.div
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
          >
            <PixelCard className="h-full">
                <h3 className="font-pixel text-3xl mb-6 border-b-2 border-pixel-dark pb-2 flex items-center gap-2">
                    <Sparkles className="text-pixel-gold" /> Skill Tree
                </h3>
                <div className="space-y-8">
                    <SkillBar label="Sewing & Textiles" level={92} icon={<Scissors size={20} />} />
                    <SkillBar label="Prop Crafting (EVA)" level={85} icon={<Sparkles size={20} />} />
                    <SkillBar label="Wig Styling" level={78} icon={<User size={20} />} />
                    <SkillBar label="Makeup FX" level={88} icon={<Palette size={20} />} />
                    <SkillBar label="Photography" level={70} icon={<Camera size={20} />} />
                </div>
            </PixelCard>
          </motion.div>

          <motion.div
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.2 }}
          >
            <PixelCard className="h-full">
                <h3 className="font-pixel text-3xl mb-6 border-b-2 border-pixel-dark pb-2 flex items-center gap-2">
                    <Heart className="text-pixel-pink" /> Achievements
                </h3>
                <ul className="space-y-6">
                    <li className="flex items-start gap-4 font-pixel text-xl group">
                        <div className="bg-pixel-gold border-2 border-pixel-dark p-1 group-hover:scale-110 transition-transform">
                            <Sparkles size={16} className="text-pixel-dark"/>
                        </div>
                        <div>
                            <span className="block font-bold">Convention Rookie</span>
                            <span className="text-gray-500 text-lg">Local Event 2025</span>
                        </div>
                    </li>
                    <li className="flex items-start gap-4 font-pixel text-xl group">
                        <div className="bg-pixel-pink border-2 border-pixel-dark p-1 group-hover:scale-110 transition-transform">
                            <Scissors size={16} className="text-pixel-dark"/>
                        </div>
                        <div>
                            <span className="block font-bold">Crafting Novice</span>
                            <span className="text-gray-500 text-lg">First Prop Completed</span>
                        </div>
                    </li>
                    <li className="flex items-start gap-4 font-pixel text-xl group">
                        <div className="bg-blue-300 border-2 border-pixel-dark p-1 group-hover:scale-110 transition-transform">
                            <Camera size={16} className="text-pixel-dark"/>
                        </div>
                        <div>
                            <span className="block font-bold">Debut Photoshoot</span>
                            <span className="text-gray-500 text-lg">Home Studio</span>
                        </div>
                    </li>
                </ul>

                <div className="mt-8 border-t-2 border-pixel-dark pt-6">
                    <h4 className="font-pixel text-2xl mb-4">Equipment</h4>
                    <div className="flex flex-wrap gap-2">
                        {['Juki Sewing Machine', 'Heat Gun', 'Dremel 4000', 'Sony A7III', 'Glue Gun'].map(item => (
                            <span key={item} className="bg-gray-100 border-2 border-pixel-dark px-3 py-1 font-pixel text-lg hover:bg-pixel-pink hover:text-white transition-colors cursor-default">
                                {item}
                            </span>
                        ))}
                    </div>
                </div>
            </PixelCard>
          </motion.div>
       </div>
    </div>
  );
};

export default About;
