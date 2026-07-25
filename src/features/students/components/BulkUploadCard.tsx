'use client';

/**
 * Bulk CSV/XLSX upload panel. Owns local file-selection/preview state and
 * delegates the actual upload to `onUpload` (wired to a mutation by the parent).
 */
import { useRef, useState } from 'react';
import { FileSpreadsheet, Download, UploadCloud } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  STUDENT_UPLOAD_ACCEPT,
  STUDENT_UPLOAD_EXTENSIONS,
  STUDENT_UPLOAD_MAX_SIZE_BYTES,
} from '../constants';
import { parseBulkUploadFile, type BulkUploadPreview } from '../lib/parse-bulk-upload-file';
import type { ClassGroup } from '../types';

export interface BulkUploadCardProps {
  isUploading?: boolean;
  /** When provided, a class selector lets every imported student be enrolled at once. */
  classGroups?: ClassGroup[];
  onUpload: (file: File, classGroupId?: string) => void | Promise<void>;
}

const TEMPLATE_CSV = 'firstName,lastName,email,phoneNumber,dateOfBirth\nJohn,Doe,john.doe@example.com,+1 (555) 123-4567,2005-03-14\n';

function downloadTemplate() {
  const blob = new Blob([TEMPLATE_CSV], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'student-bulk-upload-template.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}

export function BulkUploadCard({ isUploading = false, classGroups, onUpload }: BulkUploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<BulkUploadPreview | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [classGroupId, setClassGroupId] = useState<string>('');

  const reset = () => {
    setFile(null);
    setPreview(null);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleFile = async (selected: File | null) => {
    setError('');
    setPreview(null);
    if (!selected) {
      setFile(null);
      return;
    }
    const ext = selected.name.split('.').pop()?.toLowerCase();
    if (!ext || !STUDENT_UPLOAD_EXTENSIONS.includes(ext as never)) {
      setError('Seuls les fichiers CSV ou Excel sont acceptés');
      setFile(null);
      return;
    }
    if (selected.size > STUDENT_UPLOAD_MAX_SIZE_BYTES) {
      setError('Le fichier dépasse la limite de 5 Mo');
      setFile(null);
      return;
    }
    setFile(selected);
    try {
      const parsed = await parseBulkUploadFile(selected);
      setPreview(parsed);
      if (parsed.missingHeaders.length > 0) {
        setError(`Colonne(s) requise(s) manquante(s) : ${parsed.missingHeaders.join(', ')}`);
      }
    } catch {
      setError('Impossible de lire ce fichier — vérifiez son format');
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Veuillez sélectionner un fichier à importer');
      return;
    }
    if (preview && preview.missingHeaders.length > 0) {
      return;
    }
    await onUpload(file, classGroupId || undefined);
    reset();
    setClassGroupId('');
  };

  const canSubmit = !!file && !isUploading && (!preview || preview.missingHeaders.length === 0);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-start gap-4">
        <FileSpreadsheet className="text-blue-600 h-10 w-10 flex-shrink-0" />
        <div className="w-full space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-medium text-blue-800 mb-1">Import en masse des étudiants</h3>
              <p className="text-sm text-gray-600">
                Importez un fichier CSV ou Excel contenant les informations des étudiants.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate} type="button">
              <Download className="mr-2 h-4 w-4" />
              Télécharger le modèle
            </Button>
          </div>

          {classGroups && classGroups.length > 0 && (
            <div className="space-y-1.5">
              <Label htmlFor="bulk-upload-class-group">Classe (optionnel)</Label>
              <Select value={classGroupId} onValueChange={setClassGroupId}>
                <SelectTrigger id="bulk-upload-class-group" className="w-full max-w-sm bg-white">
                  <SelectValue placeholder="Inscrire tous les étudiants importés dans une classe" />
                </SelectTrigger>
                <SelectContent>
                  {classGroups.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} (L{c.level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div
            className={cn(
              'border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer',
              isDragging ? 'border-blue-500 bg-blue-100/50' : 'border-blue-200 bg-white/50'
            )}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFile(e.dataTransfer.files?.[0] ?? null);
            }}
            onClick={() => inputRef.current?.click()}
          >
            <UploadCloud className="mx-auto h-8 w-8 text-blue-400 mb-2" />
            <p className="text-sm text-gray-600">
              {file ? file.name : 'Glissez-déposez un fichier ici, ou cliquez pour parcourir'}
            </p>
            <Label htmlFor="file-upload" className="sr-only">
              Importer un fichier
            </Label>
            <input
              id="file-upload"
              type="file"
              ref={inputRef}
              accept={STUDENT_UPLOAD_ACCEPT}
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {preview && preview.missingHeaders.length === 0 && (
            <div className="space-y-2">
              <p className="text-sm text-blue-800 font-medium">
                {preview.totalRows} étudiant{preview.totalRows === 1 ? '' : 's'} détecté{preview.totalRows === 1 ? '' : 's'} — aperçu des premières lignes :
              </p>
              <div className="bg-white rounded-md border border-blue-100 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {preview.headers.map((h, i) => (
                        <TableHead key={i}>{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.rows.map((row, i) => (
                      <TableRow key={i}>
                        {row.map((cell, j) => (
                          <TableCell key={j} className="text-xs">
                            {cell}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={!canSubmit}>
              {isUploading ? 'Import en cours…' : 'Importer'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
