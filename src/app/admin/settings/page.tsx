'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, SlidersHorizontal, Shield, Database, ArrowRight } from 'lucide-react';
import { AdminPageHeader } from '@/components/shared/AdminPageHeader';

const AREAS = [
  {
    icon: SlidersHorizontal,
    title: 'Configuration système',
    description: 'Paramètres globaux et variables de fonctionnement.',
    href: '/admin/config',
  },
  {
    icon: Shield,
    title: 'Permissions',
    description: "Contrôle d'accès par rôle (RBAC).",
    href: '/admin/permissions',
  },
  {
    icon: Database,
    title: 'Sauvegarde & restauration',
    description: 'Sauvegardes de la base et restauration système.',
    href: '/admin/backups',
  },
];

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader icon={Settings} title="Paramètres" description="Configuration du système" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {AREAS.map(({ icon: Icon, title, description, href }) => (
          <Card key={title} className="flex flex-col border-slate-200 hover:shadow-md transition-all duration-200">
            <CardHeader className="flex-1">
              <div className="grid place-items-center h-11 w-11 rounded-2xl bg-blue-50 ring-1 ring-inset ring-blue-100 mb-1">
                <Icon className="h-[22px] w-[22px] text-blue-600" />
              </div>
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={href}>
                <Button variant="outline" size="sm" className="w-full">
                  Ouvrir
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
