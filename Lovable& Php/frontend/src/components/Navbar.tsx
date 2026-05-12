import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useWizard } from '@/contexts/WizardContext';
import { User, LogOut, Menu, X, ArrowRight, LogIn } from 'lucide-react';
import logo from '@/assets/padosi-agent-logo-new.png';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { openWizard } = useWizard();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isLoggedIn = !!user;
  const isRestrictedRole = user?.role === 'agent' || user?.role === 'distributor';

  const navLinks = [
    { name: 'About Us', path: '/about' },
    { name: 'Insurance Blogs', path: '/blog' },
    { name: 'Claim Assistance', path: '/claim-assistance' },
    { name: 'Contact Us', path: '/contact' },
  ];

  const isTransparent = isHomePage && !isScrolled && !mobileMenuOpen;
  const isCurrentPage = (path: string) => location.pathname === path;

  return (
    <>
      <nav
        style={{ top: 'var(--claims-bar-height)' }}
        className={`fixed left-0 right-0 z-50 transition-all duration-500 ${
          isTransparent
            ? 'bg-transparent'
            : 'bg-card/80 backdrop-blur-xl border-b border-border/30 shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-2 lg:h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center group flex-shrink-0">
            <img 
              src={logo} 
              alt="PadosiAgent" 
              className="h-9 sm:h-10 md:h-11 transition-all duration-300 hover:scale-105 mix-blend-multiply"
            />
          </Link>

          {/* Desktop Navigation */}
          {!isRestrictedRole && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 text-[13px] font-medium rounded-lg transition-all duration-200 relative ${
                    isCurrentPage(link.path)
                      ? 'text-primary bg-primary/8'
                      : isTransparent 
                        ? 'text-foreground/80 hover:text-primary hover:bg-card/40' 
                        : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  {link.name}
                  {isCurrentPage(link.path) && (
                    <span className="absolute bottom-0.5 left-4 right-4 h-[2px] bg-primary rounded-full" />
                  )}
                </Link>
              ))}
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Find Agent CTA */}
            {!isAuthPage && !isRestrictedRole && (
              <Button 
                size="sm"
                onClick={() => openWizard()}
                className="font-semibold bg-secondary text-secondary-foreground hover:bg-secondary-dark active:bg-accent transition-all duration-300 shadow-sm hover:shadow-md group text-[11px] px-2.5 py-2 h-auto max-w-[150px] md:max-w-none md:text-[13px] md:px-5 md:py-2.5 md:h-9 rounded-lg"
              >
                <span className="hidden sm:inline">Find My PadosiAgent</span>
                <span className="sm:hidden truncate">Find Agent</span>
                <ArrowRight className="ml-1 h-3.5 w-3.5 md:ml-1.5 md:h-4 md:w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Button>
            )}

            {/* Desktop: User menu or Login button */}
            {user ? (
              <div className="hidden md:flex items-center gap-1.5">
                <Link 
                  to={user.role === 'admin' ? '/admin' : user.role === 'user' ? '/client-dashboard' : `/${user.role}-dashboard`} 
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                    isTransparent 
                      ? 'text-foreground hover:bg-card/40 hover:text-primary' 
                      : 'text-foreground hover:bg-primary/5 hover:text-primary'
                  }`}
                >
                  <User size={15} />
                  <span>Dashboard</span>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={logout} 
                  className={`gap-2 text-[13px] ${
                    isTransparent 
                      ? 'hover:bg-card/40 hover:text-destructive' 
                      : 'hover:bg-destructive/5 hover:text-destructive'
                  }`}
                >
                  <LogOut size={15} />
                  Logout
                </Button>
              </div>
            ) : (
              !isAuthPage && (
                <Link to="/login" className="hidden md:inline-flex">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`gap-1.5 font-medium text-[13px] rounded-lg border-border/60 ${
                      isTransparent 
                        ? 'bg-card/30 backdrop-blur-sm hover:bg-card/60 border-border/30' 
                        : ''
                    }`}
                  >
                    <LogIn size={15} />
                    Login
                  </Button>
                </Link>
              )
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden shrink-0 p-2 rounded-lg transition-colors ${
                isTransparent 
                  ? 'hover:bg-card/40 text-foreground' 
                  : 'hover:bg-muted text-foreground'
              }`}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border/30 animate-fade-in bg-card/95 backdrop-blur-xl rounded-b-2xl shadow-lg">
              <div className="flex flex-col gap-0.5">
                {!isRestrictedRole && navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-4 py-3 text-sm font-medium rounded-xl transition-all flex items-center gap-2.5 ${
                      isCurrentPage(link.path)
                        ? 'text-primary bg-primary/5'
                        : 'text-foreground hover:bg-primary/5 hover:text-primary'
                    }`}
                  >
                    {isCurrentPage(link.path) && <span className="w-1 h-4 bg-primary rounded-full" />}
                    {link.name}
                  </Link>
                ))}

                {user ? (
                  <div className="border-t border-border/30 mt-2 pt-2">
                    <Link
                      to={user.role === 'admin' ? '/admin' : user.role === 'user' ? '/client-dashboard' : `/${user.role}-dashboard`}
                      className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-foreground hover:bg-primary/5 rounded-xl"
                    >
                      <User size={16} />
                      Dashboard
                    </Link>
                    <button
                      onClick={logout}
                      className="flex items-center gap-2.5 w-full px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/5 rounded-xl"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                ) : (
                  !isAuthPage && (
                    <div className="border-t border-border/30 mt-2 pt-2">
                      <Link
                        to="/login"
                        className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-primary hover:bg-primary/5 rounded-xl"
                      >
                        <LogIn size={16} />
                        Login / Register
                      </Link>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
      <div aria-hidden="true" className="h-[var(--page-top-offset)]" />
    </>
  );
};

export default Navbar;
