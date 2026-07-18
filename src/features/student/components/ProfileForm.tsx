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
import { useMyProfile, useUpdateMyProfile } from '../hooks/useMyProfile';
import { QueryErrorState } from './QueryErrorState';
import type { StudentProfileUpdatePayload } from '../types';

const EMPTY_FORM: StudentProfileUpdatePayload = {
  studentNumber: '',
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: null,
  dateOfBirth: null,
};

export function ProfileForm() {
  const { data: profile, isLoading, isError, refetch } = useMyProfile();
  const updateProfile = useUpdateMyProfile();
  const [form, setForm] = useState<StudentProfileUpdatePayload>(EMPTY_FORM);

  useEffect(() => {
    if (!profile) return;
    setForm({
      studentNumber: profile.studentNumber,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phoneNumber: profile.phoneNumber ?? null,
      dateOfBirth: profile.dateOfBirth ?? null,
    });
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
        <CardDescription>Numéro étudiant : {profile?.studentNumber}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                required
              />
            </div>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="phoneNumber">Téléphone</Label>
              <Input
                id="phoneNumber"
                value={form.phoneNumber ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value || null }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dateOfBirth">Date de naissance</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={form.dateOfBirth ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value || null }))}
              />
            </div>
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
