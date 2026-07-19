'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { ArrowLeft, FileText, GraduationCap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { extractErrorMessage } from '@/lib/api-error';
import { useStudents, useGenerateStudentAttestation } from '@/features/students';

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}

export default function AdminStudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const { data: students = [], isLoading } = useStudents();
  const generateAttestation = useGenerateStudentAttestation();

  const student = useMemo(() => students.find((s) => s.id === id), [students, id]);

  const handleGenerateAttestation = () => {
    if (!student) return;
    // Open synchronously (inside the click handler, before any await) so the
    // browser ties this window to the user gesture — opening it after the
    // network call resolves gets blocked as a pop-up by most browsers.
    const attestationWindow = window.open('', '_blank');
    if (attestationWindow) {
      attestationWindow.document.write(
        '<p style="font-family:sans-serif;padding:2rem;color:#64748b">Génération en cours…</p>'
      );
    }
    generateAttestation.mutate(student.id, {
      onSuccess: (html) => {
        if (!attestationWindow) {
          toast.error('Autorisez les fenêtres pop-up pour afficher l’attestation');
          return;
        }
        attestationWindow.document.open();
        attestationWindow.document.write(html);
        attestationWindow.document.close();
      },
      onError: (error) => {
        attestationWindow?.close();
        toast.error(extractErrorMessage(error, "Échec de la génération de l'attestation"));
      },
    });
  };

  if (!isAuthenticated || !token) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-slate-500">Chargement…</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={GraduationCap}
          title="Étudiant introuvable"
          description="Cet étudiant n'existe pas ou a été supprimé."
        />
        <Button variant="outline" onClick={() => router.push('/admin/students')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux étudiants
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={GraduationCap}
        title={`${student.firstName} ${student.lastName}`}
        description={student.studentNumber}
        actions={
          <>
            <Button variant="outline" onClick={() => router.push('/admin/students')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <Button onClick={handleGenerateAttestation} disabled={generateAttestation.isPending}>
              <FileText className="h-4 w-4 mr-2" />
              {generateAttestation.isPending ? 'Génération…' : "Générer l'attestation de scolarité"}
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label="Numéro étudiant" value={student.studentNumber} />
          <Field label="Email" value={student.email} />
          <Field label="Téléphone" value={student.phoneNumber || '—'} />
          <Field label="Date de naissance" value={student.dateOfBirth || '—'} />
          <Field label="CINE" value={student.cine || '—'} />
        </CardContent>
      </Card>
    </div>
  );
}
