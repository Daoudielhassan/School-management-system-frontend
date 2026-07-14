'use client';

import { useEffect, useState } from 'react';
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  // resolved after enrollment lookup
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
    STUDENT: 'Student',
    ETUDIANT: 'Student',
    INSTRUCTOR: 'Instructor',
    PROFESSEUR: 'Instructor',
    MANAGER: 'Manager',
    ADMIN: 'Admin',
    ADMINISTRATEUR: 'Admin',
  };
  return map[role] ?? role;
};

const roleBadge = (role: string) => {
  const map: Record<string, string> = {
    STUDENT: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    ETUDIANT: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    INSTRUCTOR: 'bg-blue-100 text-blue-800 border-blue-300',
    PROFESSEUR: 'bg-blue-100 text-blue-800 border-blue-300',
    MANAGER: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    ADMIN: 'bg-purple-100 text-purple-800 border-purple-300',
    ADMINISTRATEUR: 'bg-purple-100 text-purple-800 border-purple-300',
  };
  return map[role] ?? 'bg-gray-100 text-gray-800 border-gray-300';
};

const isStudent = (r: string) => r === 'STUDENT' || r === 'ETUDIANT';
const isInstructor = (r: string) => r === 'INSTRUCTOR' || r === 'PROFESSEUR';

/* ─── Info Row ───────────────────────────────────────────── */

const InfoRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
}) => (
  <div className="flex items-center gap-3 py-3 border-b last:border-0" style={{ borderColor: 'var(--border-light)' }}>
    <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <Icon className="h-4 w-4" style={{ color: 'var(--accent)' }} />
    </div>
    <div>
      <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</p>
      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{value ?? '—'}</p>
    </div>
  </div>
);

/* ─── Silent fetch (no error logging for optional lookups) ── */

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

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    email: '',
    role: '',
    username: '',
  });
  const [studentForm, setStudentForm] = useState({ classGroupId: '' });
  const [saving, setSaving] = useState(false);

  /* ── Fetch ────────────────────────────────────────────── */

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

        // Parallel role-specific + lookup fetches
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
            // Fetch active enrollment to get classGroupId
            const enrollmentsRaw = await silentGet(
              `${API_ENDPOINTS.ENROLLMENTS.BY_STUDENT(s.id)}`,
              token
            );
            const enrollments: any[] = Array.isArray(enrollmentsRaw)
              ? enrollmentsRaw
              : Array.isArray(enrollmentsRaw?.content)
              ? enrollmentsRaw.content
              : [];
            const active = enrollments.find(
              (e: any) => e.status === 'ACTIVE' || e.status === 'active'
            ) ?? enrollments[0];
            const profileWithClass: StudentProfile = {
              ...s,
              classGroupId: active?.classGroupId ?? undefined,
            };
            setStudent(profileWithClass);
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

  /* ── Save ─────────────────────────────────────────────── */

  const handleSave = async () => {
    if (!user || !token) return;
    setSaving(true);
    try {
      const updated = await apiPut(
        API_ENDPOINTS.USERS.BY_ID(user.id),
        { ...form },
        token
      );
      setUser(updated);
      setEditing(false);
      toast.success('User updated successfully');
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  /* ── Derived ──────────────────────────────────────────── */

  const classGroupName = (cgId?: string) => {
    if (!cgId) return null;
    const cg = classes.find((c) => c.id === cgId);
    return cg ? `${cg.name} (L${cg.level})` : cgId;
  };

  const departmentFromClassGroup = (cgId?: string) => {
    if (!cgId) return null;
    const cg = classes.find((c) => c.id === cgId);
    return cg?.departmentId ? departmentName(cg.departmentId) : null;
  };

  const departmentName = (dId?: string) => {
    if (!dId) return null;
    return departments.find((d) => d.id === dId)?.name ?? dId;
  };

  /* ── Render ───────────────────────────────────────────── */

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: 'var(--accent)' }} />
      </div>
    );

  if (error || !user)
    return (
      <div className="p-8 text-center">
        <p style={{ color: 'var(--accent)' }}>{error ?? 'User not found'}</p>
        <Button variant="ghost" className="mt-4" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </div>
    );

  const fullName =
    user.firstname || user.lastname
      ? `${user.firstname ?? ''} ${user.lastname ?? ''}`.trim()
      : user.username;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div className="flex-1" />
        {!editing ? (
          <Button
            onClick={() => setEditing(true)}
            size="sm"
            className="gap-2"
            style={{ backgroundColor: 'var(--accent)', color: 'white' }}
          >
            <Edit className="h-4 w-4" /> Edit
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
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="gap-2"
              style={{ backgroundColor: 'var(--accent)', color: 'white' }}
            >
              <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        )}
      </div>

      {/* Avatar + name card */}
      <Card style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}>
        <CardContent className="p-6 flex items-center gap-5">
          <div
            className="h-20 w-20 rounded-full flex items-center justify-center text-2xl font-bold text-white"
            style={{
              backgroundColor: isStudent(user.role)
                ? '#059669'
                : isInstructor(user.role)
                ? '#0284c7'
                : user.role === 'MANAGER'
                ? '#1d4ed8'
                : '#4338ca',
            }}
          >
            {fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {fullName}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-1 rounded-full border font-medium ${roleBadge(user.role)}`}>
                {roleLabel(user.role)}
              </span>
              <span
                className="text-xs flex items-center gap-1"
                style={{ color: user.enabled !== false ? '#10b981' : '#ef4444' }}
              >
                {user.enabled !== false ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                {user.enabled !== false ? 'Active' : 'Disabled'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── View mode ── */}
      {!editing && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Identity */}
          <Card style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <InfoRow icon={User} label="Username" value={user.username} />
              <InfoRow icon={Mail} label="Email" value={user.email} />
              <InfoRow icon={User} label="First Name" value={user.firstname} />
              <InfoRow icon={User} label="Last Name" value={user.lastname} />
              <InfoRow icon={Shield} label="Role" value={roleLabel(user.role)} />
            </CardContent>
          </Card>

          {/* Role-specific info */}
          {isStudent(user.role) && (
            <Card style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Student Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <InfoRow icon={Hash} label="Student Number" value={student?.studentNumber} />
                <InfoRow
                  icon={Layers}
                  label="Class Group"
                  value={classGroupName(student?.classGroupId)}
                />
                <InfoRow
                  icon={Building}
                  label="Department"
                  value={departmentFromClassGroup(student?.classGroupId)}
                />
              </CardContent>
            </Card>
          )}

          {isInstructor(user.role) && (
            <Card style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Instructor Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <InfoRow icon={Hash} label="Code" value={instructor?.code} />
                <InfoRow icon={BookOpen} label="Name" value={instructor?.name} />
                <InfoRow icon={Mail} label="Instructor Email" value={instructor?.email} />
              </CardContent>
            </Card>
          )}

          {(user.role === 'MANAGER' || user.role === 'ADMIN' || user.role === 'ADMINISTRATEUR') && (
            <Card style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  {roleLabel(user.role)} Permissions
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <InfoRow icon={Shield} label="Access Level" value={user.role === 'ADMIN' || user.role === 'ADMINISTRATEUR' ? 'Full system access' : 'Department management'} />
                <InfoRow icon={GraduationCap} label="Can manage students" value="Yes" />
                <InfoRow icon={BookOpen} label="Can manage instructors" value={user.role === 'ADMIN' || user.role === 'ADMINISTRATEUR' ? 'Yes' : 'Limited'} />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ── Edit mode ── */}
      {editing && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Identity form */}
          <Card style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Edit Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label style={{ color: 'var(--text-secondary)' }}>First Name</Label>
                  <Input
                    value={form.firstname}
                    onChange={(e) => setForm((f) => ({ ...f, firstname: e.target.value }))}
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div className="space-y-1">
                  <Label style={{ color: 'var(--text-secondary)' }}>Last Name</Label>
                  <Input
                    value={form.lastname}
                    onChange={(e) => setForm((f) => ({ ...f, lastname: e.target.value }))}
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label style={{ color: 'var(--text-secondary)' }}>Username</Label>
                <Input
                  value={form.username}
                  onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)', color: 'var(--text-primary)' }}
                />
              </div>

              <div className="space-y-1">
                <Label style={{ color: 'var(--text-secondary)' }}>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)', color: 'var(--text-primary)' }}
                />
              </div>

              <div className="space-y-1">
                <Label style={{ color: 'var(--text-secondary)' }}>Role</Label>
                <Select
                  value={form.role}
                  onValueChange={(v) => setForm((f) => ({ ...f, role: v }))}
                >
                  <SelectTrigger style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)', color: 'var(--text-primary)' }}>
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

          {/* Student-specific edit */}
          {isStudent(user.role) && (
            <Card style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Student Placement
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-4">
                <div className="space-y-1">
                  <Label style={{ color: 'var(--text-secondary)' }}>Student Number</Label>
                  <Input
                    value={student?.studentNumber ?? ''}
                    disabled
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)', color: 'var(--text-secondary)' }}
                  />
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Auto-assigned, cannot be changed</p>
                </div>

                <div className="space-y-1">
                  <Label style={{ color: 'var(--text-secondary)' }}>Class Group</Label>
                  <Select
                    value={studentForm.classGroupId}
                    onValueChange={(v) => setStudentForm({ classGroupId: v })}
                  >
                    <SelectTrigger style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)', color: 'var(--text-primary)' }}>
                      <SelectValue placeholder="Select class group" />
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

          {/* Instructor-specific edit (read-only fields shown for context) */}
          {isInstructor(user.role) && instructor && (
            <Card style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Instructor Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-4">
                <div className="space-y-1">
                  <Label style={{ color: 'var(--text-secondary)' }}>Instructor Code</Label>
                  <Input
                    value={instructor.code ?? ''}
                    disabled
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)', color: 'var(--text-secondary)' }}
                  />
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Managed via Instructors module</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Manager/Admin: no extra form fields needed */}
          {(user.role === 'MANAGER' || user.role === 'ADMIN' || user.role === 'ADMINISTRATEUR') && (
            <Card style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Access Control
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Role can be changed in the Identity section. All other access permissions are derived from the assigned role.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
