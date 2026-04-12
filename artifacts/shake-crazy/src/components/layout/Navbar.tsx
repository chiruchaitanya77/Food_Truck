import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Instagram, ChevronDown } from "lucide-react";

function smoothScrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const isHome = location === "/" || location === "";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (location.startsWith("/admin")) return null;

  const sectionLinks = [
    { id: "challenge", label: "10s Challenge" },
    { id: "gallery", label: "Love Gallery" },
    { id: "location", label: "Where are we?" },
  ];

  const handleSectionLink = (id: string) => {
    setMobileOpen(false);
    if (isHome) {
      smoothScrollTo(id);
    } else {
      window.location.href = `/#${id}`;
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/90 backdrop-blur-md shadow-md py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center transform group-hover:rotate-12 transition-transform shadow-lg shadow-primary/40">
            <span className="text-white font-display text-xl leading-none pt-1">SC</span>
          </div>
          <span className="font-display text-3xl tracking-wide text-foreground group-hover:text-primary transition-colors">
            Shake Crazy
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/menu"
            className="font-semibold text-foreground/80 hover:text-primary transition-colors relative after:content-[''] after:absolute after:w-full after:h-0.5 after:bg-primary after:left-0 after:-bottom-1 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left"
          >
            Menu
          </Link>

          {sectionLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleSectionLink(link.id)}
              className="font-semibold text-foreground/80 hover:text-primary transition-colors relative after:content-[''] after:absolute after:w-full after:h-0.5 after:bg-primary after:left-0 after:-bottom-1 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left"
            >
              {link.label}
            </button>
          ))}

          <a
            href="https://instagram.com/shakecrazyofficial"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            <Instagram className="w-6 h-6" />
          </a>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-foreground p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-lg border-b border-border p-4 flex flex-col gap-2 shadow-xl">
          <Link
            href="/menu"
            className="text-lg font-semibold px-4 py-2.5 hover:bg-muted rounded-xl transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Menu
          </Link>
          {sectionLinks.map((link) => (
            <button
              key={link.id}
              className="text-left text-lg font-semibold px-4 py-2.5 hover:bg-muted rounded-xl transition-colors"
              onClick={() => handleSectionLink(link.id)}
            >
              {link.label}
            </button>
          ))}
          <a
            href="https://instagram.com/shakecrazyofficial"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-lg font-semibold px-4 py-2.5 text-primary hover:bg-muted rounded-xl"
            onClick={() => setMobileOpen(false)}
          >
            <Instagram className="w-5 h-5" /> Follow Us
          </a>
        </div>
      )}
    </nav>
  );
}
