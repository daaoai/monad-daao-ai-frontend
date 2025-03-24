import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, Sprout, Users } from 'lucide-react';
import type { NavLink } from './types';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
}

const navLinks: NavLink[] = [
  {
    name: 'WhitePaper',
    href: 'https://docsend.com/view/z9eqsrurcmdky2dn',
    icon: <FileText className="w-5 h-5" />,
    external: true,
  },
  {
    name: 'Farms',
    href: '/dapp/farms',
    icon: <Sprout className="w-5 h-5" />,
  },
  {
    name: 'Launch DAO',
    href: 'https://t.me/arcanelabs',
    external: true,
    icon: <Users className="w-5 h-5" />,
  },
];

const menuVariants = {
  open: {
    opacity: 1,
    height: 'auto',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  closed: {
    opacity: 0,
    height: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
};

const MobileMenu = ({ isOpen, onClose, pathname }: MobileMenuProps) => {
  return (
    <motion.div
      initial="closed"
      animate={isOpen ? 'open' : 'closed'}
      variants={menuVariants}
      className="md:hidden overflow-hidden"
    >
      <div className="bg-black border-t border-gray-800">
        <div className="px-4 py-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href);

            const linkContent = (
              <div className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors">
                <span className={isActive ? 'text-teal-50' : 'text-white'}>{link.icon}</span>
                <span className="font-medium text-sm font-sora">{link.name}</span>
              </div>
            );

            return (
              <div key={link.name} className="mb-2">
                {link.external ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-white"
                    onClick={onClose}
                  >
                    {linkContent}
                  </a>
                ) : (
                  <Link
                    href={link.href}
                    className={`block ${isActive ? 'text-teal-50' : 'text-white'}`}
                    onClick={onClose}
                    prefetch
                    shallow
                  >
                    {linkContent}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default MobileMenu;
