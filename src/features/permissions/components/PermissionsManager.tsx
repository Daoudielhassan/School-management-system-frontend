'use client';

/**
 * Role-based permissions overview (read-only grid grouped by role).
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Shield } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { usePermissionsByRole } from '../hooks/usePermissions';
import { ROLES } from '../constants';

export function PermissionsManager() {
  const { byRole } = usePermissionsByRole();

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Shield}
        title="Permissions"
        description="Aperçu du contrôle d'accès par rôle (RBAC)"
      />

      <div className="grid gap-6">
        {ROLES.map((role) => {
          const perms = byRole[role] ?? [];
          return (
            <Card key={role} className="border-slate-200 shadow-sm shadow-slate-200/50">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{role}</CardTitle>
                  <Badge variant="outline">{perms.length} permissions</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ressource</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {perms.length > 0 ? (
                      perms.map((perm) => (
                        <TableRow key={perm.id}>
                          <TableCell className="font-medium">{perm.resource}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              {perm.actions.map((action) => (
                                <Badge key={action} variant="secondary">
                                  {action}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-muted-foreground h-24">
                          Aucune permission explicite définie. Les valeurs par défaut s'appliquent.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
