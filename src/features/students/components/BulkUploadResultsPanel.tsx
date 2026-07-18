'use client';

/**
 * Shown after a bulk-upload response: success/failure summary, a table of
 * failed rows (so the admin can fix just those and re-upload), and a
 * downloadable CSV of credentials for the newly created accounts — bulk
 * equivalent of `TemporaryPasswordDialog` (must be noted now, never stored).
 */
import { CheckCircle2, XCircle, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { BulkUploadResult } from '../types';

export interface BulkUploadResultsPanelProps {
  result: BulkUploadResult;
}

function downloadCredentialsCsv(result: BulkUploadResult) {
  const successRows = result.results.filter((r) => r.success && r.temporaryPassword);
  const header = 'firstName,lastName,email,studentNumber,temporaryPassword';
  const lines = successRows.map(
    (r) => `${r.firstName},${r.lastName},${r.email},${r.studentNumber ?? ''},${r.temporaryPassword}`
  );
  const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `student-credentials-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function BulkUploadResultsPanel({ result }: BulkUploadResultsPanelProps) {
  const failedRows = result.results.filter((r) => !r.success);
  const hasCredentials = result.results.some((r) => r.success && r.temporaryPassword);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-slate-700">{result.totalRows}</span>
            <span className="text-slate-500">rows total</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            <span className="font-medium">{result.successCount}</span> created
          </div>
          <div className="flex items-center gap-2 text-sm text-red-700">
            <XCircle className="h-4 w-4" />
            <span className="font-medium">{result.failureCount}</span> failed
          </div>
          {hasCredentials && (
            <Button variant="outline" size="sm" onClick={() => downloadCredentialsCsv(result)} className="ml-auto">
              <Download className="mr-2 h-4 w-4" />
              Download credentials
            </Button>
          )}
        </div>

        {hasCredentials && (
          <Alert>
            <AlertDescription>
              Temporary passwords are only shown in the downloaded CSV — they cannot be retrieved again afterwards.
            </AlertDescription>
          </Alert>
        )}

        {failedRows.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Failed rows</p>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Row</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {failedRows.map((r) => (
                    <TableRow key={r.rowNumber}>
                      <TableCell>{r.rowNumber}</TableCell>
                      <TableCell>
                        {r.firstName} {r.lastName}
                      </TableCell>
                      <TableCell>{r.email}</TableCell>
                      <TableCell className="text-red-600">{r.errorMessage}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
