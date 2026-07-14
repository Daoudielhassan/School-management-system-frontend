'use client';

/**
 * Role-based permissions overview (read-only grid grouped by role).
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import { usePermissionsByRole } from '../hooks/usePermissions';
import { ROLES } from '../constants';

export function PermissionsManager() {
  const { byRole } = usePermissionsByRole();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Permissions Management</h1>
          <p className="text-muted-foreground">
            Configure role-based access control (RBAC) policies.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Permission
        </Button>
      </div>

      <div className="grid gap-6">
        {ROLES.map((role) => {
          const perms = byRole[role] ?? [];
          return (
            <Card key={role}>
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
                      <TableHead>Resource</TableHead>
                      <TableHead>Actions</TableHead>
                      <TableHead className="text-right">Manage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {perms.length > 0 ? (
                      perms.map((perm) => (
                        <TableRow key={perm.id}>
                          <TableCell className="font-medium">{perm.resource}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {perm.actions.map((action) => (
                                <Badge key={action} variant="secondary">
                                  {action}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
                          No explicit permissions defined. Using defaults.
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
