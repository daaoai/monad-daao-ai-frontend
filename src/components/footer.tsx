import Link from 'next/link';
import Image from 'next/image';

import { socialLinks } from '@/constants/links';
import React from 'react';

export interface FooterData {
  label: string;
  href: string;
  children: React.ReactNode;
}

type FooterProps = {
  app?: boolean;
};

const footerLinks: FooterData[] = [];

export const Footer: React.FC<FooterProps> = ({ app }) => {
  return (
    <FooterContainer>
      <div className={`text-sm flex flex-col justify-center items-center gap-4 w-full`}>
        <FooterTopContent app={app} />
        <FooterBottomContent />
      </div>
    </FooterContainer>
  );
};

const FooterTopContent: React.FC<FooterProps> = ({ app }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full p-4 border-b border-[#212121]">
      {/* logo */}
      <div className="flex flex-col justify-center items-center text-muted-foreground">
        <Image src="/assets/daao-logo.svg" alt="logo" width={200} height={200} />
      </div>

      {/* Footer Links (Terms, Cookie Policy, etc.) */}
      {/* <div className="flex flex-col lg:flex-row gap-4 justify-center md:text-right md:items-right items:center text-center py-8">
        {footerLinks.map((link, index) => (
          <FooterLink key={index} href={link.href} label={link.label}>
            {link.label}
          </FooterLink>
        ))}
      </div> */}
    </div>
  );
};

const FooterBottomContent: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full p-4">
      {/* logo */}
      <div className="flex flex-col justify-center items-center text-muted-foreground">
        <p>© 2025 DAAOS. All rights reserved. </p>
      </div>

      {/* Social Icons */}
      <div className="flex flex-row gap-4">
        {socialLinks.map((social, index) => (
          <FooterIconLink key={index} href={social.href} label={social.label}>
            <Image src={social.src} alt={social.alt} width={20} height={20} />
          </FooterIconLink>
        ))}
      </div>
    </div>
  );
};

const FooterLink: React.FC<FooterData> = ({ href, children }) => {
  return (
    <Link href={href} className="text-sm text-muted-foreground hover:text-muted-foreground/60 transition">
      {children}
    </Link>
  );
};

export const FooterIconLink: React.FC<FooterData> = ({ href, label, children }) => {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="text-gray-500 hover:text-gray-900 transition "
    >
      {children}
    </Link>
  );
};

const FooterContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <footer className="bg-black/50 rounded-t-xl px-6 py-6 flex flex-col lg:flex-row items-start justify-between gap-4">
      {children}
    </footer>
  );
};
