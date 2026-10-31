import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard.tsx';

interface JsonMessageEditorProps {
  initialJson?: string;
  onChange?: (val: string) => void;
  readOnly?: boolean;
}

const DEFAULT_PAYLOAD = `{
  "message_id": "msg-7421",
  "agent": "orchestrator",
  "type": "diagnosis_request",
  "incident_id": "INC-1024",
  "telemetry_window": "15m"
}`;

export function JsonMessageEditor({
  initialJson = DEFAULT_PAYLOAD,
  onChange,
  readOnly = false,
}: JsonMessageEditorProps) {
  const [content, setContent] = useState(initialJson);
  const [copied, setCopied] = useState(false);

  const lines = content.split('\n');
  const lineCount = Math.max(15, lines.length);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    if (onChange) onChange(val);
  };

  return (
    <GlassCard
      variant="default"
      style={{
        padding: 0,
        overflow: 'hidden',
        border: '1px solid rgba(255, 122, 24, 0.25)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Editor Title Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          backgroundColor: '#0F1118',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#FF4D4D' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#FFB347' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981' }} />
          </div>
          <span style={{ fontSize: '12px', color: '#A3A6B3', fontFamily: 'monospace', marginLeft: '6px' }}>
            payload.json
          </span>
        </div>

        <button
          onClick={handleCopy}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: 'transparent',
            border: 'none',
            color: copied ? '#10B981' : '#A3A6B3',
            fontSize: '11px',
            cursor: 'pointer',
          }}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Editor Body with Line Numbers */}
      <div style={{ display: 'flex', backgroundColor: '#0A0C12', minHeight: '260px' }}>
        {/* Line Numbers Column */}
        <div
          style={{
            width: '44px',
            padding: '14px 0',
            textAlign: 'center',
            backgroundColor: '#07080C',
            borderRight: '1px solid rgba(255, 255, 255, 0.05)',
            userSelect: 'none',
            color: '#4B4E5E',
            fontFamily: 'monospace',
            fontSize: '12px',
            lineHeight: '22px',
          }}
        >
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Text Area */}
        <textarea
          value={content}
          onChange={handleTextChange}
          readOnly={readOnly}
          spellCheck={false}
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#38D9FF',
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: '13px',
            lineHeight: '22px',
            padding: '14px 16px',
            resize: 'none',
            whiteSpace: 'pre',
          }}
        />
      </div>
    </GlassCard>
  );
}
