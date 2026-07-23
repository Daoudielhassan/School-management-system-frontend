'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { UserCircle } from 'lucide-react';
import { extractErrorMessage } from '@/lib/api-error';
import { useDepartments } from '@/features/departments';
import { useMyManagerProfile, useUpdateMyManagerProfile } from '../hooks/useMyProfile';
import { QueryErrorState } from './QueryErrorState';
import { MANAGER_LEVEL_OPTIONS } from '../constants';
import type { ManagerProfileUpdatePayload } from '../types';

const EMPTY_FORM: ManagerProfileUpdatePayload = {
  firstName: '',
  lastName: '',
  email: '',
  phone: null,
  specialization: null,
  bio: null,
  officeLocation: null,
  officePhone: null,
  level: 'HEAD_OF_DEPARTMENT',
};

export function ProfileForm() {
  const { data: profile, isLoading, isError, refetch } = useMyManagerProfile();
  const { data: departments = [] } = useDepartments();
  const updateProfile = useUpdateMyManagerProfile();
  const [form, setForm] = useState<ManagerProfileUpdatePayload>(EMPTY_FORM);
  const departmentName = departments.find((d) => d.id === profile?.departmentId)?.name ?? 'Département inconnu';

  useEffect(() => {
    if (!profile) return;
    setForm({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone ?? null,
      specialization: profile.specialization ?? null,
      bio: profile.bio ?? null,
      officeLocation: profile.officeLocation ?? null,
      officePhone: profile.officePhone ?? null,
      level: profile.level,
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
        <CardDescription>
          {profile && MANAGER_LEVEL_OPTIONS.find((o) => o.value === profile.level)?.label} · Matricule{' '}
          {profile?.employeeNumber}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {profile && (
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 text-sm">
            <div>
              <dt className="text-slate-400 text-xs">Département</dt>
              <dd className="text-slate-700 font-medium">{departmentName}</dd>
            </div>
            {profile.dateOfBirth && (
              <div>
                <dt className="text-slate-400 text-xs">Date de naissance</dt>
                <dd className="text-slate-700 font-medium">{format(new Date(profile.dateOfBirth), 'dd/MM/yyyy')}</dd>
              </div>
            )}
            {profile.hireDate && (
              <div>
                <dt className="text-slate-400 text-xs">Date d&apos;embauche</dt>
                <dd className="text-slate-700 font-medium">{format(new Date(profile.hireDate), 'dd/MM/yyyy')}</dd>
              </div>
            )}
          </dl>
        )}

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
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={form.phone ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value || null }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="officePhone">Téléphone bureau</Label>
              <Input
                id="officePhone"
                value={form.officePhone ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, officePhone: e.target.value || null }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="specialization">Spécialisation</Label>
              <Input
                id="specialization"
                value={form.specialization ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, specialization: e.target.value || null }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="officeLocation">Bureau</Label>
              <Input
                id="officeLocation"
                value={form.officeLocation ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, officeLocation: e.target.value || null }))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={form.bio ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value || null }))}
              rows={3}
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
