'use client';

/**
 * Bulk CSV/XLSX upload panel. Owns only local file-selection UI state and
 * delegates the actual upload to `onUpload` (wired to a mutation by the parent).
 */
import { useRef, useState } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { STUDENT_UPLOAD_ACCEPT, STUDENT_UPLOAD_EXTENSIONS } from '../constants';

export interface BulkUploadCardProps {
  isUploading?: boolean;
  onUpload: (file: File) => void | Promise<void>;
}

export function BulkUploadCard({ isUploading = false, onUpload }: BulkUploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !STUDENT_UPLOAD_EXTENSIONS.includes(ext as never)) {
      setError('Only CSV or Excel files are supported');
      return;
    }
    setError('');
    await onUpload(file);
    setFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-start gap-4">
        <FileSpreadsheet className="text-blue-600 h-10 w-10 flex-shrink-0" />
        <div className="w-full">
          <h3 className="font-medium text-blue-800 mb-1">Bulk Upload Students</h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload a CSV or Excel file containing student information.
          </p>

          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="file-upload">Upload File</Label>
              <div className="flex gap-2">
                <Input
                  id="file-upload"
                  type="file"
                  ref={inputRef}
                  accept={STUDENT_UPLOAD_ACCEPT}
                  onChange={(e) => {
                    setFile(e.target.files?.[0] ?? null);
                    setError('');
                  }}
                />
                <Button onClick={handleSubmit} disabled={isUploading}>
                  {isUploading ? 'Uploading…' : 'Upload'}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
