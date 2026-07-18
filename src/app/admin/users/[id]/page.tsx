'use client';

import { useEffect, useState, type ElementType } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiGet, apiPut, API_ENDPOINTS } from '@/config/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  User,
  Mail,
  Shield,
  BookOpen,
  GraduationCap,
  Hash,
  Building,
  Layers,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { toast } from 'react-toastify';

/* ─── Types ─────────────────────────────────────────────── */

interface UserData {
  id: string;
  username: string;
  email: string;
  firstname?: string;
  lastname?: string;
  role: string;
  enabled?: boolean;
}

interface StudentProfile {
  id: string;
  studentNumber?: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  classGroupId?: string;
}

interface InstructorProfile {
  id: string;
  code?: string;
  userId?: string;
  email?: string;
  name?: string;
}

interface ClassGroup {
  id: string;
  name: string;
  level: number;
  departmentId?: string;
}

interface Department {
  id: string;
  name: string;
}

/* ─── Helpers ────────────────────────────────────────────── */

const ROLES = ['ADMIN', 'MANAGER', 'INSTRUCTOR', 'STUDENT'] as const;

const roleLabel = (role: string) => {
  const map: Record<string, string> = {
    STUDENT: 'Étudiant',
    ETUDIANT: 'Étudiant',
    INSTRUCTOR: 'Professeur',
    PROFESSEUR: 'Professeur',
    MANAGER: 'Manager',
    ADMIN: 'Admin',
    ADMINISTRATEUR: 'Admin',
  };
  return map[role] ?? role;
};

// One gray family (slate) + a single desaturated accent per role.
const roleBadge = (role: string) => {
  const map: Record<string, string> = {
    STUDENT: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    ETUDIANT: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    INSTRUCTOR: 'bg-sky-50 text-sky-700 border-sky-200',
    PROFESSEUR: 'bg-sky-50 text-sky-700 border-sky-200',
    MANAGER: 'bg-blue-50 text-blue-700 border-blue-200',
    ADMIN: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    ADMINISTRATEUR: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };
  return map[role] ?? 'bg-slate-100 text-slate-700 border-slate-200';
};

const roleAvatar = (role: string) => {
  if (isStudent(role)) return 'bg-emerald-600';
  if (isInstructor(role)) return 'bg-sky-600';
  if (role === 'MANAGER') return 'bg-blue-600';
  return 'bg-indigo-600';
};

function isStudent(r: string) {
  return r === 'STUDENT' || r === 'ETUDIANT';
}
function isInstructor(r: string) {
  return r === 'INSTRUCTOR' || r === 'PROFESSEUR';
}

/* ─── Info Row ───────────────────────────────────────────── */

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: ElementType;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="p-2 rounded-lg bg-blue-50">
        <Icon className="h-4 w-4 text-blue-600" />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="text-sm font-semibold text-slate-800">{value ?? '—'}</p>
      </div>
    </div>
  );
}

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">{children}</CardTitle>
);

async function silentGet(url: string, token: string): Promise<any> {
  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return null;
    return await res.json().catch(() => null);
  } catch {
    return null;
  }
}

/* ─── Page ───────────────────────────────────────────────── */

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();

  const [user, setUser] = useState<UserData | null>(null);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [instructor, setInstructor] = useState<InstructorProfile | null>(null);
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstname: '', lastname: '', email: '', role: '', username: '' });
  const [studentForm, setStudentForm] = useState({ classGroupId: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token || !id) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const userData = await apiGet(API_ENDPOINTS.USERS.BY_ID(id), token);
        setUser(userData);
        setForm({
          firstname: userData.firstname ?? '',
          lastname: userData.lastname ?? '',
          email: userData.email ?? '',
          role: userData.role ?? '',
          username: userData.username ?? '',
        });

        const [classesRaw, deptsRaw] = await Promise.all([
          apiGet(API_ENDPOINTS.CLASSES.BASE, token).catch(() => []),
          apiGet(API_ENDPOINTS.DEPARTMENTS.BASE, token).catch(() => []),
        ]);
        const toArray = (v: unknown): any[] => {
          if (Array.isArray(v)) return v;
          if (v && typeof v === 'object' && Array.isArray((v as any).content)) return (v as any).content;
          return [];
        };
        setClasses(toArray(classesRaw));
        setDepartments(toArray(deptsRaw));

        if (isStudent(userData.role)) {
          const s = await silentGet(API_ENDPOINTS.STUDENTS.BY_USER_ID(id), token);
          if (s) {
            const enrollmentsRaw = await silentGet(`${API_ENDPOINTS.ENROLLMENTS.BY_STUDENT(s.id)}`, token);
            const enrollments: any[] = Array.isArray(enrollmentsRaw)
              ? enrollmentsRaw
              : Array.isArray(enrollmentsRaw?.content)
                ? enrollmentsRaw.content
                : [];
            const active = enrollments.find((e: any) => e.status === 'ACTIVE' || e.status === 'active') ?? enrollments[0];
            setStudent({ ...s, classGroupId: active?.classGroupId ?? undefined });
            setStudentForm({ classGroupId: active?.classGroupId ?? '' });
          }
        }

        if (isInstructor(userData.role)) {
          const ins = await silentGet(API_ENDPOINTS.INSTRUCTORS.BY_USER_ID(id), token);
          if (ins) setInstructor(ins);
        }
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load user');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token, id]);

  const handleSave = async () => {
    if (!user || !token) return;
    setSaving(true);
    try {
      const updated = await apiPut(API_ENDPOINTS.USERS.BY_ID(user.id), { ...form }, token);
      setUser(updated);
      setEditing(false);
      toast.success('Utilisateur mis à jour');
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const classGroupName = (cgId?: string) => {
    if (!cgId) return null;
    const cg = classes.find((c) => c.id === cgId);
    return cg ? `${cg.name} (L${cg.level})` : cgId;
  };

  const departmentName = (dId?: string) => {
    if (!dId) return null;
    return departments.find((d) => d.id === dId)?.name ?? dId;
  };

  const departmentFromClassGroup = (cgId?: string) => {
    if (!cgId) return null;
    const cg = classes.find((c) => c.id === cgId);
    return cg?.departmentId ? departmentName(cg.departmentId) : null;
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );

  if (error || !user)
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">{error ?? 'Utilisateur introuvable'}</p>
        <Button variant="ghost" className="mt-4" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Retour
        </Button>
      </div>
    );

  const fullName =
    user.firstname || user.lastname ? `${user.firstname ?? ''} ${user.lastname ?? ''}`.trim() : user.username;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Toolbar */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-slate-600">
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>
        <div className="flex-1" />
        {!editing ? (
          <Button onClick={() => setEditing(true)} size="sm" className="gap-2">
            <Edit className="h-4 w-4" /> Modifier
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditing(false);
                setForm({
                  firstname: user.firstname ?? '',
                  lastname: user.lastname ?? '',
                  email: user.email ?? '',
                  role: user.role,
                  username: user.username,
                });
              }}
            >
              <X className="h-4 w-4 mr-1" /> Annuler
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" /> {saving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </div>
        )}
      </div>

      {/* Identity banner */}
      <Card className="border-slate-200 shadow-sm shadow-slate-200/50">
        <CardContent className="p-6 flex items-center gap-5">
          <div className={`h-20 w-20 rounded-2xl grid place-items-center text-2xl font-bold text-white ${roleAvatar(user.role)}`}>
            {fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1
              className="text-2xl font-semibold text-slate-900 tracking-tight"
              style={{ fontFamily: 'var(--font-admin-display, inherit)' }}
            >
              {fullName}
            </h1>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${roleBadge(user.role)}`}>
                {roleLabel(user.role)}
              </span>
              <span className={`text-xs flex items-center gap-1 ${user.enabled !== false ? 'text-emerald-600' : 'text-red-500'}`}>
                {user.enabled !== false ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                {user.enabled !== false ? 'Actif' : 'Désactivé'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View mode */}
      {!editing && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-slate-200 shadow-sm shadow-slate-200/50">
            <CardHeader className="pb-2">
              <SectionTitle>Identité</SectionTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <InfoRow icon={User} label="Nom d'utilisateur" value={user.username} />
              <InfoRow icon={Mail} label="Email" value={user.email} />
              <InfoRow icon={User} label="Prénom" value={user.firstname} />
              <InfoRow icon={User} label="Nom" value={user.lastname} />
              <InfoRow icon={Shield} label="Rôle" value={roleLabel(user.role)} />
            </CardContent>
          </Card>

          {isStudent(user.role) && (
            <Card className="border-slate-200 shadow-sm shadow-slate-200/50">
              <CardHeader className="pb-2">
                <SectionTitle>Profil étudiant</SectionTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <InfoRow icon={Hash} label="Numéro étudiant" value={student?.studentNumber} />
                <InfoRow icon={Layers} label="Classe" value={classGroupName(student?.classGroupId)} />
                <InfoRow icon={Building} label="Département" value={departmentFromClassGroup(student?.classGroupId)} />
              </CardContent>
            </Card>
          )}

          {isInstructor(user.role) && (
            <Card className="border-slate-200 shadow-sm shadow-slate-200/50">
              <CardHeader className="pb-2">
                <SectionTitle>Profil professeur</SectionTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <InfoRow icon={Hash} label="Code" value={instructor?.code} />
                <InfoRow icon={BookOpen} label="Nom" value={instructor?.name} />
                <InfoRow icon={Mail} label="Email professeur" value={instructor?.email} />
              </CardContent>
            </Card>
          )}

          {(user.role === 'MANAGER' || user.role === 'ADMIN' || user.role === 'ADMINISTRATEUR') && (
            <Card className="border-slate-200 shadow-sm shadow-slate-200/50">
              <CardHeader className="pb-2">
                <SectionTitle>Permissions {roleLabel(user.role)}</SectionTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <InfoRow
                  icon={Shield}
                  label="Niveau d'accès"
                  value={user.role === 'ADMIN' || user.role === 'ADMINISTRATEUR' ? 'Accès complet au système' : 'Gestion de département'}
                />
                <InfoRow icon={GraduationCap} label="Gestion des étudiants" value="Oui" />
                <InfoRow
                  icon={BookOpen}
                  label="Gestion des professeurs"
                  value={user.role === 'ADMIN' || user.role === 'ADMINISTRATEUR' ? 'Oui' : 'Limitée'}
                />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Edit mode */}
      {editing && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-slate-200 shadow-sm shadow-slate-200/50">
            <CardHeader className="pb-2">
              <SectionTitle>Modifier l'identité</SectionTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Prénom</Label>
                  <Input value={form.firstname} onChange={(e) => setForm((f) => ({ ...f, firstname: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Nom</Label>
                  <Input value={form.lastname} onChange={(e) => setForm((f) => ({ ...f, lastname: e.target.value }))} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Nom d'utilisateur</Label>
                <Input value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} />
              </div>

              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              </div>

              <div className="space-y-1.5">
                <Label>Rôle</Label>
                <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {roleLabel(r)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {isStudent(user.role) && (
            <Card className="border-slate-200 shadow-sm shadow-slate-200/50">
              <CardHeader className="pb-2">
                <SectionTitle>Affectation étudiant</SectionTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-4">
                <div className="space-y-1.5">
                  <Label>Numéro étudiant</Label>
                  <Input value={student?.studentNumber ?? ''} disabled />
                  <p className="text-xs text-slate-400">Généré automatiquement, non modifiable</p>
                </div>

                <div className="space-y-1.5">
                  <Label>Classe</Label>
                  <Select value={studentForm.classGroupId} onValueChange={(v) => setStudentForm({ classGroupId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une classe" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cg) => (
                        <SelectItem key={cg.id} value={cg.id}>
                          {cg.name} (L{cg.level})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {isInstructor(user.role) && instructor && (
            <Card className="border-slate-200 shadow-sm shadow-slate-200/50">
              <CardHeader className="pb-2">
                <SectionTitle>Profil professeur</SectionTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-4">
                <div className="space-y-1.5">
                  <Label>Code professeur</Label>
                  <Input value={instructor.code ?? ''} disabled />
                  <p className="text-xs text-slate-400">Géré via le module Professeurs</p>
                </div>
              </CardContent>
            </Card>
          )}

          {(user.role === 'MANAGER' || user.role === 'ADMIN' || user.role === 'ADMINISTRATEUR') && (
            <Card className="border-slate-200 shadow-sm shadow-slate-200/50">
              <CardHeader className="pb-2">
                <SectionTitle>Contrôle d'accès</SectionTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-sm text-slate-500">
                  Le rôle peut être modifié dans la section Identité. Toutes les autres permissions découlent du rôle attribué.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
