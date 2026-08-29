import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { FaBrain, FaRobot, FaEye, FaComments, FaArrowRight, FaCalendarAlt, FaCode, FaNetworkWired } from 'react-icons/fa';
import Button from '../../components/common/Button.jsx';
import { motion, useScroll, useTransform } from 'framer-motion';

// Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 }
  }
};

const FeatureCard = ({ icon, title, description }) => (
  <motion.div
    variants={fadeInUp}
    whileHover={{ y: -10, rotateX: 5, rotateY: 5, scale: 1.02 }}
    className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative group [perspective:1000px] [transform-style:preserve-3d]"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl -z-10"></div>
    <div className="w-14 h-14 bg-brand-100 text-brand-600 rounded-xl flex items-center justify-center mb-6 transform group-hover:translate-z-12 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3 text-gray-900 transform group-hover:translate-z-8 transition-transform duration-300">{title}</h3>
    <p className="text-gray-600 text-sm leading-relaxed transform group-hover:translate-z-4 transition-transform duration-300">{description}</p>
  </motion.div>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [leadership, setLeadership] = useState([]);

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('/api/v1/events/public?limit=3');
        setEvents(response.data?.data || []);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoadingEvents(false);
      }
    };
    const fetchLeadership = async () => {
      try {
        const response = await axios.get('/api/v1/leadership');
        setLeadership(response.data?.data || []);
      } catch (error) {
        console.error('Failed to fetch leadership:', error);
      }
    };
    fetchEvents();
    fetchLeadership();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 overflow-hidden">
      {/* 3D Hero Section */}
      <section id="home" className="relative min-h-[90vh] flex items-center justify-center bg-brand-950 text-white overflow-hidden [perspective:1000px]">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(24,31,76,1)_0%,_rgba(10,14,39,1)_100%)]"></div>
          
          <motion.div 
            animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/30 rounded-full blur-[100px]"
          />
          <motion.div 
            animate={{ rotate: [360, 0], scale: [1, 1.5, 1] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute top-40 right-20 w-[30rem] h-[30rem] bg-indigo-500/20 rounded-full blur-[120px]"
          />
        </div>

        {/* Hero Content */}
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-16 pt-20 w-full"
        >
          <div className="w-full md:w-3/5 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight text-white drop-shadow-lg">
                Explore the Future <br className="hidden md:block"/> of Technology
              </h1>
              <p className="text-xl md:text-2xl text-brand-100 mb-10 max-w-2xl font-light">
                Join the most dynamic tech community at CIT Kokrajhar. We build, learn, and innovate in AI, ML, and Data Science.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" onClick={() => navigate('/signup/member')} className="!bg-white !text-brand-900 hover:!bg-gray-100 font-bold px-8 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                    Join as Member
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" variant="ghost" onClick={() => document.getElementById('about').scrollIntoView({ behavior: 'smooth' })} className="!text-white border-2 border-white/30 hover:bg-white/10 px-8">
                    Learn More
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* 3D Floating Elements */}
          <div className="w-full md:w-2/5 relative hidden md:block h-[450px] [transform-style:preserve-3d]">
            {/* Top floating card */}
            <motion.div
              animate={{ y: [-15, 15, -15], rotateY: [-5, 10, -5], rotateX: [5, -5, 5] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-12 right-12 bg-white/10 backdrop-blur-md border border-white/30 p-6 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-72 [transform:translateZ(50px)]"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-cyan-400/20 flex items-center justify-center border border-cyan-400/50">
                  <FaRobot className="text-2xl text-cyan-300" />
                </div>
                <div>
                  <div className="h-3 w-24 bg-white/40 rounded-full mb-2"></div>
                  <div className="h-2 w-16 bg-white/20 rounded-full"></div>
                </div>
              </div>
              <div className="space-y-2 mt-6">
                <div className="h-2 w-full bg-white/20 rounded-full"></div>
                <div className="h-2 w-5/6 bg-white/20 rounded-full"></div>
                <div className="h-2 w-4/6 bg-white/20 rounded-full"></div>
              </div>
            </motion.div>
            
            {/* Bottom floating card */}
            <motion.div
              animate={{ y: [15, -15, 15], rotateY: [5, -10, 5], rotateX: [-5, 5, -5] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-12 left-4 bg-gradient-to-br from-indigo-600/40 to-brand-700/40 backdrop-blur-md border border-white/30 p-6 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-72 [transform:translateZ(100px)]"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center border border-white/50">
                  <FaBrain className="text-2xl text-white" />
                </div>
                <div>
                  <div className="h-3 w-20 bg-white/60 rounded-full mb-2"></div>
                  <div className="h-2 w-28 bg-white/30 rounded-full"></div>
                </div>
              </div>
              <div className="space-y-2 mt-6">
                <div className="h-2 w-full bg-white/30 rounded-full"></div>
                <div className="h-2 w-3/4 bg-white/30 rounded-full"></div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* About Section - 3D Cards */}
      <section id="about" className="py-24 bg-gray-50 relative z-20 -mt-10 rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-20"
          >
            <h2 className="text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">Discover Our Domains</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
              We explore the cutting edge of technology through hands-on projects, workshops, and collaborative learning.
            </p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            <FeatureCard 
              icon={<FaBrain className="text-2xl" />}
              title="Machine Learning"
              description="Build predictive models, dive into data patterns, and deploy real-world ML applications."
            />
            <FeatureCard 
              icon={<FaNetworkWired className="text-2xl text-purple-600" />}
              title="Deep Learning"
              description="Explore complex neural networks, transformers, and generative AI architectures."
            />
            <FeatureCard 
              icon={<FaEye className="text-2xl text-green-600" />}
              title="Computer Vision"
              description="Teach machines to interpret, understand, and process the visual world around us."
            />
            <FeatureCard 
              icon={<FaComments className="text-2xl text-orange-600" />}
              title="Natural Language"
              description="Process and analyze text data to build chatbots, summarizers, and LLM applications."
            />
          </motion.div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Our Leadership</h2>
            <p className="text-xl text-gray-600 font-light">The visionaries driving the AI Club forward.</p>
          </motion.div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12"
          >
            {leadership.length > 0 ? leadership.map((leader) => (
              <motion.div 
                variants={fadeInUp}
                key={leader.id} 
                className="text-center group"
              >
                <div className="w-40 h-40 mx-auto bg-gray-100 rounded-full mb-6 relative shadow-lg transform group-hover:scale-105 transition-transform duration-300 border-4 border-white overflow-hidden">
                  {leader.photoUrl ? (
                    <img src={leader.photoUrl} alt={leader.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-100 to-brand-50 text-brand-400">
                      Photo
                    </div>
                  )}
                  <div className="absolute inset-0 bg-brand-900/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <h4 className="font-bold text-xl text-gray-900 mb-1">{leader.name}</h4>
                <p className="text-brand-600 font-medium">{leader.role.replace(/_/g, ' ')}</p>
              </motion.div>
            )) : (
              <div className="col-span-1 sm:col-span-2 lg:col-span-4 text-center text-gray-500 py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                Leadership profiles are being updated.
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeInUp}
            className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6"
          >
            <div>
              <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Upcoming Events</h2>
              <p className="text-xl text-gray-600 font-light">Catch up on our latest workshops and hackathons.</p>
            </div>
            <motion.button 
              whileHover={{ x: 5 }}
              className="hidden md:flex items-center text-brand-600 font-bold hover:text-brand-700 bg-brand-50 px-6 py-3 rounded-full transition-colors" 
              onClick={() => navigate('/dashboard/events')}
            >
              View All <FaArrowRight className="ml-2" />
            </motion.button>
          </motion.div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {loadingEvents ? (
              <div className="col-span-3 text-center text-gray-500 py-10">Loading events...</div>
            ) : events.length > 0 ? (
              events.map((event) => (
                <motion.div 
                  variants={fadeInUp}
                  whileHover={{ y: -8 }}
                  key={event._id || event.id} 
                  className="bg-white rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col group cursor-pointer"
                  onClick={() => navigate('/dashboard/events')}
                >
                  <div className="h-40 bg-gradient-to-br from-brand-100 to-indigo-50 flex items-center justify-center text-brand-400 w-full relative overflow-hidden">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <FaCalendarAlt size={48} className="opacity-40 transform group-hover:scale-110 transition-transform duration-500" />
                    </motion.div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col relative bg-white">
                    <div className="text-xs text-brand-600 font-bold mb-2 tracking-wide uppercase">
                      {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <h3 className="font-bold text-xl mb-2 text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-1">{event.title}</h3>
                    <p className="text-gray-600 mb-5 flex-1 line-clamp-2 text-sm leading-relaxed">{event.description || 'Join us for this exciting event!'}</p>
                    <div className="text-brand-600 font-semibold text-sm flex items-center group-hover:gap-2 transition-all">
                      View Details <FaArrowRight className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div variants={fadeInUp} className="col-span-3 text-center text-gray-500 py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                No upcoming events scheduled at the moment.
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Join CTA Section */}
      <section className="relative py-32 bg-brand-950 text-white text-center overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,1)_0%,_transparent_100%)] opacity-10"></div>
          {/* Abstract floating shapes for background */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute top-10 left-10 w-48 h-48 border border-white/10 rounded-full"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-10 right-10 w-64 h-64 border border-white/5 rounded-full"
          />
        </div>
        
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="max-w-4xl mx-auto px-4 relative z-10"
        >
          <h2 className="text-5xl font-extrabold mb-6 tracking-tight drop-shadow-lg">Ready to join the revolution?</h2>
          <p className="text-xl text-brand-100 mb-12 font-light">
            Become a part of CIT Kokrajhar's most active and innovative tech community.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" onClick={() => navigate('/signup/member')} className="!bg-white !text-brand-900 hover:!bg-gray-100 font-bold px-10 py-4 shadow-xl">
                Register as Member
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" variant="ghost" onClick={() => navigate('/signup/coordinator')} className="border-2 border-white/30 !text-white hover:bg-white/10 px-10 py-4">
                Apply for Coordinator
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default LandingPage;
