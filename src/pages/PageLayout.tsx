import { ReactNode } from 'react';
import { Navigation } from '../components/layout/Navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Link } from 'react-router-dom';
import { Settings, Info, Clock, Star, Heart } from 'lucide-react';
import React, { useState } from 'react';

type PageLayoutProps = {
  title?: string;
  description?: string;
  children: ReactNode;
};

export function PageLayout({ title, description, children }: PageLayoutProps) {
  return (
    <div className="space-y-6">
      {(title || description) && (
        <div className="px-4 pt-6">
          {title && <h1 className="text-ios-large-title font-bold tracking-tight text-foreground mb-2">{title}</h1>}
          {description && (
            <p className="text-ios-body text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <Navigation />
      <div className="space-y-6 px-4">{children}</div>
    </div>
  );
}
