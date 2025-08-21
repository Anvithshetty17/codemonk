import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-24 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}></div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-7xl text-white mb-4 tracking-wide animate-fade-in-up" style={{textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'}}>
            CODE MONK
          </h1>
          <h2 className="text-3xl md:text-4xl font-semibold mb-8 text-white/90 animate-fade-in-up animation-delay-200">
            Transforming Beginners into Experts!
          </h2>
          <p className="text-lg md:text-xl leading-relaxed mb-12 text-white/80 animate-fade-in-up animation-delay-400">
            Are you ready to embark on a coding journey like no other? At Code Monk, we believe that everyone has the potential to become a coding expert. Whether you're taking your first steps in programming or looking to refine your advanced skills, our tech club is designed to guide you every step of the way.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in-up animation-delay-600">
            <Link 
              to="/auth" 
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg min-w-[200px]"
            >
              Join Our Community
            </Link>
            <Link 
              to="/team" 
              className="bg-white/10 border-2 border-white/30 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg min-w-[200px]"
            >
              Meet Our Team
            </Link>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
        }
        
        .animation-delay-600 {
          animation-delay: 0.6s;
          opacity: 0;
        }
        
        @media (max-width: 768px) {
          .text-6xl {
            font-size: 2.5rem;
          }
          .text-3xl {
            font-size: 1.5rem;
          }
        }
        
        @media (max-width: 480px) {
          .text-6xl {
            font-size: 2rem;
          }
          .text-3xl {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
