import { useState, useEffect } from 'react';
import { Network, Menu, X, ArrowUpRight, Cpu } from 'lucide-react';

interface NavbarProps {
  onNavigate?: (sectionId: string) => void;
  activeSection?: string;
}

export function Navbar({ onNavigate, activeSection = 'hero' }: NavbarProps) {
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
    { id: 'hero', label: 'Home' },
    { id: 'globe', label: 'Network 3D' },
    { id: 'features', label: 'Platform' },
    { id: 'agents', label: 'AI Agents' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'about', label: 'About' },
  ];

  const handleLinkClick = (id: string) => {
    setMobileMenuOpen(false);
    onNavigate?.(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#080B10]/80 backdrop-blur-md border-b border-white/5 py-3 shadow-lg shadow-black/40'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: NetCoop AI Logo */}
        <button
          onClick={() => handleLinkClick('hero')}
          className="flex items-center gap-3 group cursor-pointer focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF8A24] to-[#20D9FF] p-[1.5px] transition-transform duration-300 group-hover:scale-105">
            <div className="w-full h-full bg-[#080B10] rounded-[10px] flex items-center justify-center">
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
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#FF8A24]/15 text-[#FF8A24] border border-[#FF8A24]/30 shadow-sm'
                    : 'text-[#A2ACBA] hover:text-[#F4F6FA] hover:bg-white/5'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Operational Status Indicator & Launch Button */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#26D7A0]/10 border border-[#26D7A0]/30 text-[11px] font-mono text-[#26D7A0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#26D7A0] animate-pulse" />
            <span>OPERATIONAL</span>
          </div>

          <button
            onClick={() => handleLinkClick('globe')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#FF8A24] to-[#FFB45C] text-[#080B10] text-xs font-bold tracking-wide hover:brightness-110 active:scale-95 transition-all shadow-md shadow-[#FF8A24]/20 cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Launch Platform</span>
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
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleLinkClick(link.id)}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#F4F6FA] hover:bg-[#FF8A24]/10 hover:text-[#FF8A24] transition-colors"
            >
              {link.label}
            </button>
          ))}
          <div className="pt-3 border-t border-white/10">
            <button
              onClick={() => handleLinkClick('globe')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF8A24] text-[#080B10] text-sm font-bold shadow-md shadow-[#FF8A24]/20"
            >
              <Cpu className="w-4 h-4" />
              <span>Launch Platform</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
