import { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, FileText, X } from 'lucide-react';
import { GlassCard } from './GlassCard.tsx';

export interface TelemetryFile {
  name: string;
  size: string;
  type: string;
  status: 'validated' | 'uploading';
}

interface FileUploadPanelProps {
  onFilesChange?: (files: TelemetryFile[]) => void;
}

export function FileUploadPanel({ onFilesChange }: FileUploadPanelProps) {
  const [files, setFiles] = useState<TelemetryFile[]>([
    { name: 'site-a_telemetry.csv', size: '2.4 MB', type: 'CSV', status: 'validated' },
    { name: 'interfaces.json', size: '532 KB', type: 'JSON', status: 'validated' },
    { name: 'topology.json', size: '1.1 MB', type: 'JSON', status: 'validated' },
  ]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newItems: TelemetryFile[] = Array.from(e.dataTransfer.files).map((f) => ({
        name: f.name,
        size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
        type: f.name.split('.').pop()?.toUpperCase() || 'FILE',
        status: 'validated',
      }));
      const updated = [...files, ...newItems];
      setFiles(updated);
      if (onFilesChange) onFilesChange(updated);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newItems: TelemetryFile[] = Array.from(e.target.files).map((f) => ({
        name: f.name,
        size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
        type: f.name.split('.').pop()?.toUpperCase() || 'FILE',
        status: 'validated',
      }));
      const updated = [...files, ...newItems];
      setFiles(updated);
      if (onFilesChange) onFilesChange(updated);
    }
  };

  const handleRemoveFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    if (onFilesChange) onFilesChange(updated);
  };

  return (
    <GlassCard variant="default" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pcap,.csv,.json,.netflow"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Drag & Drop Dropzone (Exact Reference Match) */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: isDragging ? '2px dashed #FF7A18' : '2px dashed rgba(168, 85, 247, 0.4)',
          borderRadius: '12px',
          padding: '36px 20px',
          textAlign: 'center',
          backgroundColor: isDragging ? 'rgba(255, 122, 24, 0.08)' : 'rgba(25, 28, 38, 0.4)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(56, 217, 255, 0.25))',
            border: '1px solid rgba(168, 85, 247, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#A855F7',
            boxShadow: '0 0 16px rgba(168, 85, 247, 0.35)',
          }}
        >
          <UploadCloud size={28} />
        </div>

        <div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#F5F5F7', marginBottom: '4px' }}>
            Drag & drop telemetry files here
          </div>
          <div style={{ fontSize: '12px', color: '#FF7A18', fontWeight: 600 }}>
            or browse files
          </div>
          <div style={{ fontSize: '11px', color: '#6A6D7C', marginTop: '4px' }}>
            (PCAP, CSV, JSON, NetFlow)
          </div>
        </div>
      </div>

      {/* Uploaded File List (Exact Reference Match) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {files.map((file, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(8, 9, 13, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={16} color="#38D9FF" />
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#F5F5F7' }}>{file.name}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '11px', color: '#A3A6B3' }}>{file.size}</span>
              <CheckCircle2 size={16} color="#10B981" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile(idx);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#6A6D7C',
                  cursor: 'pointer',
                  padding: '2px',
                }}
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
