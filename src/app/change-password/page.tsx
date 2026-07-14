'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { API_ENDPOINTS, apiPost } from '@/config/api';
import { toast } from 'react-toastify';
import { Lock, Eye, EyeOff, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserRole } from '@/types/auth';

export default function ChangePasswordPage() {
  const { token, userId, role, clearMustChangePassword } = useAuth();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const dashboardPath: Record<UserRole, string> = {
    [UserRole.ADMIN]: '/admin/',
    [UserRole.MANAGER]: '/manager/',
    [UserRole.INSTRUCTOR]: '/professor/',
    [UserRole.STUDENT]: '/student/',
  };

  const validate = (): boolean => {
    if (!currentPassword) {
      toast.error('Veuillez saisir votre mot de passe temporaire.');
      return false;
    }
    if (newPassword.length < 8) {
      toast.error('Le nouveau mot de passe doit contenir au moins 8 caractères.');
      return false;
    }
    if (newPassword === currentPassword) {
      toast.error('Le nouveau mot de passe doit être différent du mot de passe temporaire.');
      return false;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !userId || !token) return;

    setIsLoading(true);
    try {
      await apiPost(
        API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
        { userId, currentPassword, newPassword },
        token,
      );

      toast.success('Mot de passe modifié avec succès !');
      clearMustChangePassword();

      const target = role ? (dashboardPath[role] ?? '/') : '/';
      router.replace(target);
    } catch (error: any) {
      const msg =
        error?.message?.includes('401') || error?.message?.includes('Invalid')
          ? 'Mot de passe temporaire incorrect.'
          : error?.message || 'Erreur lors du changement de mot de passe.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-2 pb-4">
          <div className="flex justify-center">
            <div className="bg-amber-100 p-3 rounded-full">
              <ShieldCheck className="h-8 w-8 text-amber-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Première connexion</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Pour votre sécurité, vous devez définir un nouveau mot de passe avant de continuer.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Current / temporary password */}
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">Mot de passe temporaire</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="currentPassword"
                  type={showCurrent ? 'text' : 'password'}
                  placeholder="Votre mot de passe temporaire"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pl-10 pr-10"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type={showNew ? 'text' : 'password'}
                  placeholder="Minimum 8 caractères"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 pr-10"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* Strength indicator */}
              {newPassword && (
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        passwordStrength(newPassword) >= level
                          ? level <= 1
                            ? 'bg-red-400'
                            : level === 2
                              ? 'bg-amber-400'
                              : level === 3
                                ? 'bg-yellow-400'
                                : 'bg-green-500'
                          : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Répétez le nouveau mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`pl-10 pr-10 ${
                    confirmPassword && confirmPassword !== newPassword
                      ? 'border-red-400 focus-visible:ring-red-400'
                      : ''
                  }`}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="text-xs text-red-500">Les mots de passe ne correspondent pas.</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Modification en cours…
                </>
              ) : (
                'Définir mon mot de passe'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function passwordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}
