import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { PixelButton, PixelCard, SectionHeader } from '../components/ui/PixelComponents';
import { ArrowRight, Star } from 'lucide-react';

const Home = () => {
  const { cosplaySets } = useData();
  const featuredSets = cosplaySets.filter(s => s.featured).slice(0, 3);

  const scrollToFeatured = () => {
    const element = document.getElementById('featured');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="pt-24 min-h-screen">

      {/* Hero Section */}
      <section className="relative px-4 mb-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block bg-pixel-gold px-2 py-1 border-2 border-pixel-dark mb-4 transform -rotate-2">
              <span className="font-pixel text-xl uppercase">The Ultimate Portfolio</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-pixel leading-[0.9] mb-6 text-pixel-dark">
              LEVEL UP <br />
              <span className="text-pixel-pink drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">YOUR WORLD</span>
            </h1>
            <p className="font-pixel text-2xl text-gray-600 mb-8 max-w-md">
              Welcome to my digital sanctuary. High-quality cosplay, pixel-perfect aesthetics, and a touch of magic.
            </p>
            <div className="flex gap-4">
              <Link to="/gallery">
                <PixelButton size="lg">View Gallery</PixelButton>
              </Link>
              <PixelButton variant="secondary" size="lg" onClick={scrollToFeatured}>Latest Drops</PixelButton>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-[93%] mx-auto"
          >
            <div className="absolute inset-0 bg-pixel-pink translate-x-4 translate-y-4 border-2 border-pixel-dark"></div>
            <img
              src="/foto/foto-home.jpg"
              alt="Hero Cosplay"
              className="relative z-10 w-full h-auto border-2 border-pixel-dark object-cover aspect-square grayscale hover:grayscale-0 transition-all duration-500"
            />

          </motion.div>

        </div>
      </section>

      {/* Stats/Marquee Strip */}
      <div className="bg-pixel-dark py-4 overflow-hidden border-y-2 border-pixel-dark mb-20 transform -rotate-1 relative z-10">
        <div className="flex w-max animate-marquee">
          {/* First set */}
          <div className="flex gap-12 pr-12">
            {[...Array(6)].map((_, i) => (
              <span key={`a-${i}`} className="font-pixel text-2xl text-pixel-pink flex items-center gap-4 whitespace-nowrap">
                ★ COSPLAY ★ ART ★ PERFORMANCE ★ MODELING
              </span>
            ))}
          </div>
          {/* Duplicate set for seamless loop */}
          <div className="flex gap-12 pr-12">
            {[...Array(6)].map((_, i) => (
              <span key={`b-${i}`} className="font-pixel text-2xl text-pixel-pink flex items-center gap-4 whitespace-nowrap">
                ★ COSPLAY ★ ART ★ PERFORMANCE ★ MODELING
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Sets */}
      <section id="featured" className="max-w-7xl mx-auto px-4 pb-20">
        <SectionHeader title="Featured Works" subtitle="Hand-picked favorites from the collection" />

        <div className="grid md:grid-cols-3 gap-8">
          {featuredSets.map((set, idx) => (
            <motion.div
              key={set.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
            >
              <Link to={`/gallery/${set.id}`}>
                <PixelCard className="h-full group hover:-translate-y-2 transition-transform duration-300 cursor-pointer" noPadding>
                  <div className="relative overflow-hidden aspect-[3/4] border-b-2 border-pixel-dark">
                    <img src={set.coverImage} alt={set.character} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-2 right-2 bg-pixel-gold border-2 border-pixel-dark px-2 py-1 font-pixel uppercase text-sm">
                      {new Date(set.date).getFullYear()}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-3xl font-pixel mb-1">{set.character}</h3>
                    <p className="font-pixel text-xl text-pixel-pink mb-4">{set.series}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-pixel text-gray-500">{set.photos.length} Photos</span>
                      <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </PixelCard>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/gallery">
            <PixelButton variant="secondary" size="lg">Explore All Sets</PixelButton>
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Home;