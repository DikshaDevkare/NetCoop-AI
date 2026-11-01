import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Network, Menu, X, ArrowUpRight } from 'lucide-react';

interface NavbarProps {
  onNavigate?: (sectionId: string) => void;
  activeSection?: string;
}

export function Navbar({ onNavigate, activeSection = 'hero' }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'hero', label: 'Home', isRoute: false },
    { id: 'features', label: 'Platform', isRoute: false },
    { id: 'agents', label: 'Agents', isRoute: false },
    { id: '/dashboard', label: 'Demo', isRoute: true },
    { id: '/dashboard/reports', label: 'Reports', isRoute: true },
  ];

  const handleItemClick = (item: (typeof navLinks)[0]) => {
    setMobileMenuOpen(false);
    if (item.isRoute) {
      navigate(item.id);
    } else {
      if (location.pathname !== '/') {
        navigate(`/#${item.id}`);
        return;
      }
      onNavigate?.(item.id);
      if (item.id === 'hero') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const el = document.getElementById(item.id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#05080D]/90 backdrop-blur-md border-b border-white/5 py-3 shadow-lg shadow-black/50'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: NetCoop AI Logo */}
        <button
          onClick={() => {
            if (location.pathname === '/') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              navigate('/');
            }
          }}
          className="flex items-center gap-3 group cursor-pointer focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF8A24] to-[#20D9FF] p-[1.5px] transition-transform duration-300 group-hover:scale-105">
            <div className="w-full h-full bg-[#05080D] rounded-[10px] flex items-center justify-center">
              <Network className="w-4 h-4 text-[#FF8A24] transition-colors group-hover:text-[#20D9FF]" />
            </div>
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-wider text-[#F4F6FA]">
                NETCOOP
              </span>
              <span className="text-xs font-black px-1.5 py-0.5 rounded bg-[#FF8A24]/20 border border-[#FF8A24]/40 text-[#FF8A24]">
                AI
              </span>
            </div>
            <span className="text-[10px] text-[#A2ACBA] font-mono block -mt-0.5">
              AUTONOMOUS DIAGNOSTICS
            </span>
          </div>
        </button>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 glass-panel px-3 py-1.5 rounded-full border border-white/5">
          {navLinks.map((item) => {
            const isActive = !item.isRoute && activeSection === item.id;
            return (
              <button
                key={item.label}
                onClick={() => handleItemClick(item)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#FF8A24]/15 text-[#FF8A24] border border-[#FF8A24]/30 shadow-sm font-semibold'
                    : 'text-[#A2ACBA] hover:text-[#F4F6FA] hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Operational Status Indicator & Get Started CTA */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#26D7A0]/10 border border-[#26D7A0]/30 text-[11px] font-mono text-[#26D7A0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#26D7A0] animate-pulse" />
            <span>OPERATIONAL</span>
          </div>

          <button
            onClick={() => navigate('/dashboard/diagnosis')}
            className="flex items-center gap-2 px-5 py-2 rounded-full border border-[#FF8A24] bg-[#FF8A24]/10 text-[#FF8A24] hover:bg-[#FF8A24] hover:text-[#05080D] text-xs font-mono font-bold tracking-wider hover:shadow-lg hover:shadow-[#FF8A24]/30 active:scale-95 transition-all cursor-pointer"
          >
            <span>Get Started</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile Hamburger Menu Toggle */}
        <div className="flex md:hidden items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#26D7A0]/10 text-[10px] font-mono text-[#26D7A0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#26D7A0] animate-pulse" />
            <span>LIVE</span>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg glass-panel text-[#F4F6FA] hover:text-[#FF8A24] focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-white/10 px-4 pt-3 pb-6 mt-2 space-y-2">
          {navLinks.map((item) => (
            <button
              key={item.label}
              onClick={() => handleItemClick(item)}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#F4F6FA] hover:bg-[#FF8A24]/10 hover:text-[#FF8A24] transition-colors"
            >
              {item.label}
            </button>
          ))}
          <div className="pt-3 border-t border-white/10">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/dashboard/diagnosis');
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#FF8A24] bg-[#FF8A24]/10 text-[#FF8A24] text-sm font-bold shadow-md shadow-[#FF8A24]/20 cursor-pointer"
            >
              <span>Get Started</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
