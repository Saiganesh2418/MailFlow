import { useState } from 'react';
import { Eye, Code } from 'lucide-react';
import { PRESET_TEMPLATES, EmailTemplate } from '../lib/templates';
import { useNavigate } from 'react-router-dom';

export default function TemplatesPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<EmailTemplate>(PRESET_TEMPLATES[0]);
  const [mode, setMode] = useState<'preview' | 'code'>('preview');

  function handleUseTemplate(tmpl: EmailTemplate) {
    navigate('/campaigns/new');
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Email Templates</h1>
          <p className="text-sm text-slate-500 mt-0.5">Ready-to-use HTML and plain text email designs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template List */}
        <div className="space-y-3">
          {PRESET_TEMPLATES.map(t => (
            <div
              key={t.id}
              onClick={() => setSelected(t)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selected.id === t.id
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-2xs'
                  : 'border-slate-200 bg-white hover:border-indigo-300'
              }`}
            >
              <h3 className="text-sm font-bold text-slate-900">{t.name}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{t.description}</p>
              <span className="inline-block text-[11px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-mono mt-2">
                Subject: {t.subject}
              </span>
            </div>
          ))}
        </div>

        {/* Template Previewer */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs flex flex-col">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <h2 className="text-sm font-bold text-slate-900">{selected.name}</h2>
              <p className="text-xs text-slate-500">{selected.subject}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-md border border-slate-200 bg-white p-0.5 shadow-2xs">
                <button
                  onClick={() => setMode('preview')}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded ${
                    mode === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Eye size={12} /> Rendered
                </button>
                <button
                  onClick={() => setMode('code')}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded ${
                    mode === 'code' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Code size={12} /> HTML Code
                </button>
              </div>
              <button
                onClick={() => handleUseTemplate(selected)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Use Template
              </button>
            </div>
          </div>

          <div className="p-6 flex-1 overflow-y-auto max-h-[550px] bg-slate-50/40">
            {mode === 'preview' ? (
              <div
                className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs max-w-xl mx-auto"
                dangerouslySetInnerHTML={{
                  __html: selected.body
                    .replace(/\{\{name\}\}/g, 'Rahul')
                    .replace(/\{\{company\}\}/g, 'Acme Corp')
                    .replace(/\{\{email\}\}/g, 'rahul@example.com')
                }}
              />
            ) : (
              <pre className="text-xs font-mono text-slate-800 bg-white p-4 rounded-xl border border-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {selected.body}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
