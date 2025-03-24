import Link from 'next/link';
import React, { useState } from 'react';
import { ConnectWalletButton } from '../connect-button';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import MobileMenu from './MobileMenu';

export const Navbar = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    // { name: 'Farms', href: '/dapp/farms' },
    {
      name: 'Launch DAO',
      href: 'https://docs.google.com/forms/d/e/1FAIpQLScbKuEH18VXPg29Ek4yeX3spXclZCXV6HHfDtmK9Vh8XMQigA/viewform?usp=header',
      external: true,
    },
    { name: 'WhitePaper', href: 'https://docsend.com/view/z9eqsrurcmdky2dn' },
  ];

  return (
    <div className="fixed z-50 w-full bg-black">
      <div className="flex justify-between items-center px-4 md:px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-start" prefetch shallow>
          <Image src="/assets/daao-logo.svg" alt="logo" width={150} height={150} />
        </Link>
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-12">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href);

            return link.external || link.name === 'WhitePaper' ? (
              <Link
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white font-medium text-sm font-sora"
              >
                {link.name}
              </Link>
            ) : (
              <Link
                key={link.name}
                href={link.href}
                className={`relative font-medium font-sora text-sm transition-all ${
                  isActive ? 'text-teal-50' : 'text-white'
                }`}
                prefetch
                shallow
              >
                {link.name}
                {isActive && (
                  <motion.div
                    layoutId="underline"
                    className="absolute left-0 bottom-0 h-[2px] bg-teal-50 w-full"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  />
                )}
              </Link>
            );
          })}

          <ConnectWalletButton icons={true} />
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-4">
          <ConnectWalletButton icons={true} />
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white p-2 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} pathname={pathname} />
    </div>
  );
};

export default Navbar;
