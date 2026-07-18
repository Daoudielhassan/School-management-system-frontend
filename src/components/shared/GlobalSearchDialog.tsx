'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ComponentType, ReactNode, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Search, GraduationCap, Users as UsersIcon, BookOpen } from 'lucide-react';
import { useStudents } from '@/features/students';
import { useUsers } from '@/features/users';
import { useClasses } from '@/features/classes';
import type { StudentData } from '@/features/students';
import type { UserData } from '@/features/users';
import type { ClassGroup } from '@/features/classes';

const MAX_RESULTS_PER_GROUP = 5;

/**
 * Global "⌘K" search — students, users and classes. Owns its own trigger and
 * dialog so the header only needs to render this one component. The data
 * hooks live in a child that only mounts once the dialog opens, so the three
 * list queries never fire just from having the admin header on screen.
 */
export function GlobalSearchDialog() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-between w-full h-12 px-4 bg-white/60 hover:bg-white border border-slate-200/60 hover:border-blue-300 shadow-sm hover:shadow-md hover:shadow-blue-500/5 rounded-2xl text-slate-400 transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-blue-100"
      >
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
          <span className="text-[15px] text-slate-400 group-hover:text-slate-600 transition-colors">
            Rechercher des étudiants, utilisateurs, classes...
          </span>
        </div>
        {mounted && (
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-500 bg-slate-100/80 border border-slate-200/60 rounded-lg">
            <span className="text-sm">⌘</span>K
          </kbd>
        )}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden">
          <DialogTitle className="sr-only">Recherche globale</DialogTitle>
          {open && <GlobalSearchPanel onNavigate={() => setOpen(false)} />}
        </DialogContent>
      </Dialog>
    </>
  );
}

interface GlobalSearchPanelProps {
  onNavigate: () => void;
}

function GlobalSearchPanel({ onNavigate }: GlobalSearchPanelProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const { data: students = [], isLoading: studentsLoading } = useStudents();
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { data: classes = [], isLoading: classesLoading } = useClasses();

  const isLoading = studentsLoading || usersLoading || classesLoading;
  const q = query.trim().toLowerCase();

  const studentResults = useMemo(() => {
    if (!q) return [];
    return students
      .filter((s) => `${s.firstName} ${s.lastName} ${s.email} ${s.studentNumber}`.toLowerCase().includes(q))
      .slice(0, MAX_RESULTS_PER_GROUP);
  }, [students, q]);

  const userResults = useMemo(() => {
    if (!q) return [];
    return users
      .filter((u) => `${u.firstname ?? ''} ${u.lastname ?? ''} ${u.username} ${u.email}`.toLowerCase().includes(q))
      .slice(0, MAX_RESULTS_PER_GROUP);
  }, [users, q]);

  const classResults = useMemo(() => {
    if (!q) return [];
    return classes.filter((c) => `${c.name} ${c.code}`.toLowerCase().includes(q)).slice(0, MAX_RESULTS_PER_GROUP);
  }, [classes, q]);

  const hasResults = studentResults.length + userResults.length + classResults.length > 0;

  const goToStudent = (s: StudentData) => {
    router.push(`/admin/students?q=${encodeURIComponent(`${s.firstName} ${s.lastName}`)}`);
    onNavigate();
  };
  const goToUser = (u: UserData) => {
    router.push(`/admin/users/${u.id}`);
    onNavigate();
  };
  const goToClass = (c: ClassGroup) => {
    router.push(`/admin/classes?q=${encodeURIComponent(c.name)}`);
    onNavigate();
  };

  const handleKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key !== 'Enter') return;
    if (studentResults[0]) goToStudent(studentResults[0]);
    else if (userResults[0]) goToUser(userResults[0]);
    else if (classResults[0]) goToClass(classResults[0]);
  };

  return (
    <div className="flex flex-col max-h-[70vh]">
      <div className="flex items-center gap-3 px-4 border-b border-slate-100">
        <Search className="h-4 w-4 text-slate-400 flex-shrink-0" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Rechercher des étudiants, utilisateurs, classes..."
          className="w-full h-14 bg-transparent text-[15px] text-slate-800 placeholder:text-slate-400 focus:outline-none"
        />
      </div>

      <div className="overflow-y-auto p-2">
        {!q ? (
          <p className="text-center text-sm text-slate-400 py-10">Commencez à taper pour rechercher</p>
        ) : isLoading ? (
          <p className="text-center text-sm text-slate-400 py-10">Chargement…</p>
        ) : !hasResults ? (
          <p className="text-center text-sm text-slate-400 py-10">Aucun résultat pour « {query} »</p>
        ) : (
          <>
            {studentResults.length > 0 && (
              <ResultGroup label="Étudiants">
                {studentResults.map((s) => (
                  <ResultRow
                    key={s.id}
                    icon={GraduationCap}
                    title={`${s.firstName} ${s.lastName}`}
                    subtitle={s.email}
                    onClick={() => goToStudent(s)}
                  />
                ))}
              </ResultGroup>
            )}

            {userResults.length > 0 && (
              <ResultGroup label="Utilisateurs">
                {userResults.map((u) => (
                  <ResultRow
                    key={u.id}
                    icon={UsersIcon}
                    title={`${u.firstname ?? ''} ${u.lastname ?? ''}`.trim() || u.username}
                    subtitle={u.email}
                    onClick={() => goToUser(u)}
                  />
                ))}
              </ResultGroup>
            )}

            {classResults.length > 0 && (
              <ResultGroup label="Classes">
                {classResults.map((c) => (
                  <ResultRow key={c.id} icon={BookOpen} title={c.name} subtitle={c.code} onClick={() => goToClass(c)} />
                ))}
              </ResultGroup>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ResultGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-2 last:mb-0">
      <p className="px-2.5 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function ResultRow({
  icon: Icon,
  title,
  subtitle,
  onClick,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full px-2.5 py-2 rounded-xl text-left hover:bg-slate-50 transition-colors"
    >
      <div className="flex-shrink-0 grid place-items-center h-8 w-8 rounded-lg bg-blue-50">
        <Icon className="h-4 w-4 text-blue-600" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">{title}</p>
        {subtitle && <p className="text-xs text-slate-500 truncate">{subtitle}</p>}
      </div>
    </button>
  );
}
