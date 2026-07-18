'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, BookOpen, MessageSquare, LifeBuoy } from 'lucide-react';
import { AdminPageHeader } from '@/components/shared/AdminPageHeader';

const RESOURCES = [
  {
    icon: BookOpen,
    title: 'Guide de démarrage',
    description: 'Créer des utilisateurs, départements, classes et gérer les inscriptions.',
    href: '/admin',
  },
  {
    icon: MessageSquare,
    title: 'Contacter le support',
    description: "Envoyez un message à l'équipe technique depuis le centre de communication.",
    href: '/admin/messages',
  },
  {
    icon: LifeBuoy,
    title: 'Journaux & diagnostics',
    description: "Consultez l'activité système et les événements récents dans les journaux d'audit.",
    href: '/admin/audit-logs',
  },
];

export default function AdminHelpPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader icon={HelpCircle} title="Aide" description="Support et documentation" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {RESOURCES.map(({ icon: Icon, title, description, href }) => (
          <Link key={title} href={href}>
            <Card className="h-full border-slate-200 hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
              <CardHeader>
                <div className="grid place-items-center h-11 w-11 rounded-2xl bg-blue-50 ring-1 ring-inset ring-blue-100 mb-1">
                  <Icon className="h-[22px] w-[22px] text-blue-600" />
                </div>
                <CardTitle className="text-base group-hover:text-blue-700 transition-colors">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
