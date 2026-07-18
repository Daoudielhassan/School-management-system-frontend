'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { UserCircle } from 'lucide-react';
import { extractErrorMessage } from '@/lib/api-error';
import { useMyInstructorProfile, useUpdateMyInstructorProfile } from '../hooks/useMyProfile';
import { QueryErrorState } from './QueryErrorState';
import type { InstructorProfileUpdatePayload } from '../types';

const EMPTY_FORM: InstructorProfileUpdatePayload = { code: '', name: '', email: '' };

export function ProfileForm() {
  const { data: profile, isLoading, isError, refetch } = useMyInstructorProfile();
  const updateProfile = useUpdateMyInstructorProfile();
  const [form, setForm] = useState<InstructorProfileUpdatePayload>(EMPTY_FORM);

  useEffect(() => {
    if (!profile) return;
    setForm({ code: profile.code, name: profile.name, email: profile.email });
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync(form);
      toast.success('Profil mis à jour');
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Échec de la mise à jour du profil'));
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="p-6">
          <QueryErrorState message="Impossible de charger votre profil." onRetry={refetch} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <UserCircle className="h-5 w-5 text-blue-600" />
          Informations personnelles
        </CardTitle>
        <CardDescription>Matricule {profile?.code}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="code">Code</Label>
            <Input id="code" value={form.code} disabled />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={updateProfile.isPending || !profile}>
              {updateProfile.isPending ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
