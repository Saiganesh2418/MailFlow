import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Upload, Sparkles, Monitor, Smartphone,
  CheckCircle, XCircle, AlertTriangle, Send, ChevronLeft, ChevronRight, Plus,
  Code, Eye, LayoutTemplate, UserPlus, Trash2
} from 'lucide-react';
import api from '../lib/api';
import { PRESET_TEMPLATES, EmailTemplate } from '../lib/templates';

// ─── Types ────────────────────────────────────────────────────────────────────

type Contact = Record<string, any>;

interface CampaignDraft {
  name: string;
  senderName: string;
  subject: string;
  body: string;
  contacts: Contact[];
  invalidContacts: { name: string; email: string; reason: string }[];
  detectedVariables: string[];
}

// ─── Helper: Token Replacer ───────────────────────────────────────────────────

function personalizeText(template: string, contact: Contact): string {
  if (!template) return '';
  if (!contact) return template;

  const normalizedMap: Record<string, string> = {};
  for (const [key, value] of Object.entries(contact)) {
    const cleanKey = String(key).trim().toLowerCase();
    normalizedMap[cleanKey] = value !== undefined && value !== null ? String(value) : '';
  }

  if (!normalizedMap['name']) {
    normalizedMap['name'] = normalizedMap['first_name'] || normalizedMap['firstname'] || normalizedMap['full_name'] || normalizedMap['fullname'] || '';
  }

  return template.replace(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/gi, (match, varName) => {
    const key = varName.trim().toLowerCase();
    return normalizedMap[key] !== undefined ? normalizedMap[key] : match;
  });
}

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEPS = ['Contacts', 'Compose', 'Preview', 'Send'];

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-0">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
              i < current ? 'bg-indigo-600 border-indigo-600 text-white'
              : i === current ? 'border-indigo-600 text-indigo-600 bg-white'
              : 'border-slate-300 text-slate-400 bg-white'
            }`}>
              {i < current ? <CheckCircle size={14} /> : i + 1}
            </div>
            <span className={`text-xs mt-1 font-medium ${i === current ? 'text-indigo-700' : i < current ? 'text-slate-600' : 'text-slate-400'}`}>{s}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-0.5 w-12 sm:w-20 mx-1 mb-4 transition-colors ${i < current ? 'bg-indigo-600' : 'bg-slate-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Step 1: Contacts (CSV Upload + Manual Add) ───────────────────────────────

function ContactsStep({ draft, setDraft }: { draft: CampaignDraft; setDraft: (d: CampaignDraft) => void }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Manual contact input state
  const [manualName, setManualName] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualCompany, setManualCompany] = useState('');
  const [activeTab, setActiveTab] = useState<'csv' | 'manual'>('csv');

  async function processFile(file: File) {
    if (!file.name.endsWith('.csv')) { setError('Please upload a .csv file.'); return; }
    setError('');
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      const { data } = await api.post('/contacts/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });

      const vars = data.columns && data.columns.length > 0
        ? data.columns
        : ['name', 'email', 'company'];

      setDraft({
        ...draft,
        contacts: [...draft.contacts, ...data.valid],
        invalidContacts: [...draft.invalidContacts, ...(data.invalid || [])],
        detectedVariables: Array.from(new Set([...draft.detectedVariables, ...vars]))
      });
    } catch (err: unknown) {
      setError('Failed to parse CSV. Ensure it has an email column.');
    } finally {
      setUploading(false);
    }
  }

  function handleAddManual(e: React.FormEvent) {
    e.preventDefault();
    if (!manualEmail.trim()) {
      setError('Email is required.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(manualEmail.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    const newContact: Contact = {
      name: manualName.trim() || 'Friend',
      email: manualEmail.trim(),
      company: manualCompany.trim() || 'Organization',
    };

    setDraft({
      ...draft,
      contacts: [...draft.contacts, newContact],
      detectedVariables: Array.from(new Set([...draft.detectedVariables, 'name', 'email', 'company'])),
    });

    setManualName('');
    setManualEmail('');
    setManualCompany('');
  }

  function handleRemoveContact(idx: number) {
    const updated = draft.contacts.filter((_, i) => i !== idx);
    setDraft({ ...draft, contacts: updated });
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  const columns = draft.contacts.length > 0 ? Object.keys(draft.contacts[0]) : ['name', 'email', 'company'];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Add Recipients</h2>
        <p className="text-sm text-slate-500">
          Upload a CSV file or add recipient emails manually below.
        </p>
      </div>

      {/* Switch between CSV and Manual */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('csv')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors flex items-center gap-1.5 ${
            activeTab === 'csv'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Upload size={15} /> Upload CSV
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('manual')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors flex items-center gap-1.5 ${
            activeTab === 'manual'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <UserPlus size={15} /> Add Manually
        </button>
      </div>

      {/* Tab: CSV Upload */}
      {activeTab === 'csv' && (
        <label
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors ${
            dragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-slate-100'
          }`}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <Upload size={28} className={`mb-2 ${dragging ? 'text-indigo-600' : 'text-slate-400'}`} />
          <p className="text-sm font-medium text-slate-700">
            {uploading ? 'Importing & analyzing columns…' : 'Drag & drop CSV or click to browse'}
          </p>
          <p className="text-xs text-slate-400 mt-1">Supports all columns (name, email, company, and any custom attributes)</p>
          <input type="file" accept=".csv" className="hidden" onChange={e => { if (e.target.files?.[0]) processFile(e.target.files[0]); }} />
        </label>
      )}

      {/* Tab: Manual Add Form */}
      {activeTab === 'manual' && (
        <form onSubmit={handleAddManual} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Add Single Contact</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                placeholder="Saiganesh"
                value={manualName}
                onChange={e => setManualName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={manualEmail}
                onChange={e => setManualEmail(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Company / Role</label>
              <input
                type="text"
                placeholder="Acme Corp"
                value={manualCompany}
                onChange={e => setManualCompany(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            <Plus size={14} /> Add to Campaign ({draft.contacts.length} total)
          </button>
        </form>
      )}

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

      {/* Recipient list */}
      {draft.contacts.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm text-green-700 font-semibold">
              <CheckCircle size={16} />
              <span>{draft.contacts.length} Total Recipients in this Campaign</span>
            </div>
            <button
              type="button"
              onClick={() => setDraft({ ...draft, contacts: [], invalidContacts: [] })}
              className="text-xs text-red-600 hover:underline"
            >
              Clear All
            </button>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Available Tags:</span>
            <div className="flex flex-wrap gap-1.5">
              {draft.detectedVariables.map(v => (
                <span key={v} className="bg-indigo-50 text-indigo-700 font-mono text-xs px-2 py-0.5 rounded border border-indigo-200">
                  {`{{${v}}}`}
                </span>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-lg max-h-60 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-3 py-2 text-slate-600 font-semibold uppercase">#</th>
                  {columns.map(col => (
                    <th key={col} className="text-left px-3 py-2 text-slate-600 font-semibold uppercase">{col}</th>
                  ))}
                  <th className="text-right px-3 py-2 text-slate-600 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {draft.contacts.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-3 py-2 text-slate-400">{i + 1}</td>
                    {columns.map(col => (
                      <td key={col} className="px-3 py-2 text-slate-700 whitespace-nowrap">{String(row[col] ?? '—')}</td>
                    ))}
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveContact(i)}
                        className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                        title="Remove contact"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 2: Compose (with HTML Mode & Templates) ─────────────────────────────

const AI_ACTIONS = [
  { key: 'generate', label: '✨ Generate' },
  { key: 'improve', label: '⬆ Improve' },
  { key: 'shorten', label: '✂ Shorten' },
  { key: 'professional', label: '💼 Professional' },
  { key: 'friendly', label: '😊 Friendly' },
  { key: 'grammar', label: '✓ Fix Grammar' },
];

function ComposeStep({ draft, setDraft }: { draft: CampaignDraft; setDraft: (d: CampaignDraft) => void }) {
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [customVar, setCustomVar] = useState('');
  const [editorMode, setEditorMode] = useState<'html' | 'preview'>('html');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  function insertVariable(v: string) {
    const token = `{{${v}}}`;
    setDraft({ ...draft, body: draft.body + (draft.body.endsWith(' ') || draft.body === '' ? '' : ' ') + token });
  }

  function addCustomVariable(e: React.FormEvent) {
    e.preventDefault();
    if (!customVar.trim()) return;
    const clean = customVar.trim().replace(/[{}]/g, '');
    if (!draft.detectedVariables.includes(clean)) {
      setDraft({
        ...draft,
        detectedVariables: [...draft.detectedVariables, clean]
      });
    }
    insertVariable(clean);
    setCustomVar('');
  }

  function handleApplyTemplate(tmpl: EmailTemplate) {
    setSelectedTemplateId(tmpl.id);
    setDraft({
      ...draft,
      subject: tmpl.subject,
      body: tmpl.body,
    });
  }

  async function runAi(action: string) {
    setAiError('');
    setAiLoading(true);
    try {
      const { data } = await api.post('/email/ai', {
        action,
        prompt: aiPrompt || `Write a professional email about: ${draft.subject}`,
        currentContent: draft.body,
      });
      setDraft({ ...draft, body: data.content || draft.body });
    } catch {
      setAiError('AI is not configured. Set GEMINI_API_KEY or OPENAI_API_KEY in your backend .env');
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Templates Row */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <LayoutTemplate size={18} className="text-indigo-600" />
          <h3 className="text-sm font-semibold text-slate-900">Choose a Pre-built Email Template</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_TEMPLATES.map(tmpl => (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => handleApplyTemplate(tmpl)}
              className={`p-3 rounded-lg border text-left transition-all ${
                selectedTemplateId === tmpl.id
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-2xs'
                  : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50/80'
              }`}
            >
              <p className="text-xs font-bold text-slate-800 truncate">{tmpl.name}</p>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{tmpl.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Campaign Name</label>
            <input
              type="text"
              value={draft.name}
              onChange={e => setDraft({ ...draft, name: e.target.value })}
              placeholder="e.g. Hackathon Invitation 2026"
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sender Name</label>
            <input
              type="text"
              value={draft.senderName}
              onChange={e => setDraft({ ...draft, senderName: e.target.value })}
              placeholder="e.g. Saiganesh (or Organization Name)"
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Subject Line</label>
            <input
              type="text"
              value={draft.subject}
              onChange={e => setDraft({ ...draft, subject: e.target.value })}
              placeholder="Exclusive invitation for {{name}} ({{company}})"
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium text-slate-700">Email Body</label>
                <div className="inline-flex rounded-md border border-slate-200 bg-white p-0.5 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setEditorMode('html')}
                    className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded ${
                      editorMode === 'html' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Code size={12} /> HTML / Plain
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMode('preview')}
                    className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded ${
                      editorMode === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Eye size={12} /> Live Render
                  </button>
                </div>
              </div>

              <form onSubmit={addCustomVariable} className="flex items-center gap-1">
                <input
                  type="text"
                  value={customVar}
                  onChange={e => setCustomVar(e.target.value)}
                  placeholder="+ Add variable"
                  className="border border-slate-200 rounded px-2 py-0.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none w-28"
                />
                <button
                  type="submit"
                  title="Add tag"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-xs flex items-center"
                >
                  <Plus size={12} />
                </button>
              </form>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-2.5 p-2 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-xs text-slate-400 self-center mr-1">Insert tag:</span>
              {draft.detectedVariables.map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => insertVariable(v)}
                  className="px-2 py-0.5 text-xs bg-white text-indigo-700 border border-indigo-200 rounded font-mono hover:bg-indigo-600 hover:text-white transition-colors shadow-2xs"
                >
                  {`{{${v}}}`}
                </button>
              ))}
            </div>

            {editorMode === 'html' ? (
              <textarea
                rows={13}
                value={draft.body}
                onChange={e => setDraft({ ...draft, body: e.target.value })}
                placeholder="Enter standard text or paste full HTML code with inline styles..."
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none leading-relaxed"
              />
            ) : (
              <div className="min-h-[300px] max-h-[420px] overflow-y-auto border border-slate-300 rounded-lg p-4 bg-white">
                <div dangerouslySetInnerHTML={{ __html: draft.body || '<p class="text-slate-400 italic">No content yet. Type HTML or select a template above.</p>' }} />
              </div>
            )}
            <p className="text-[11px] text-slate-400 mt-1">
              💡 Supports full HTML formatting (divs, inline CSS styles, buttons, images) or simple plain text.
            </p>
          </div>
        </div>

        {/* Right: AI Panel */}
        <div className="space-y-3">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-indigo-600" />
              <span className="text-sm font-semibold text-slate-800">AI HTML Assistant</span>
            </div>
            <textarea
              rows={3}
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              placeholder="e.g. Generate a styled HTML newsletter button for {{name}}..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none mb-3"
            />
            {aiError && <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 mb-2">{aiError}</p>}
            {aiLoading && <p className="text-xs text-indigo-600 mb-2 animate-pulse">✨ AI is writing your HTML email…</p>}
            <div className="grid grid-cols-2 gap-1.5">
              {AI_ACTIONS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => runAi(key)}
                  disabled={aiLoading}
                  className="px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-colors disabled:opacity-50"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Preview (Supports HTML rendering) ─────────────────────────────────

function PreviewStep({ draft }: { draft: CampaignDraft }) {
  const [view, setView] = useState<'desktop' | 'mobile'>('desktop');
  const [recipientIdx, setRecipientIdx] = useState(0);

  const fallbackContact = { name: 'Saiganesh', email: 'saiganesh@example.com', company: 'Acme Corp' };
  const contact = draft.contacts[recipientIdx] || fallbackContact;

  const previewSubject = personalizeText(draft.subject, contact);
  const previewBody = personalizeText(draft.body, contact);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Preview</h2>
        <p className="text-sm text-slate-500">Live preview showing full rendered HTML and personalized values.</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-white w-fit">
          <button
            onClick={() => setView('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${view === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Monitor size={14} />Desktop
          </button>
          <button
            onClick={() => setView('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${view === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Smartphone size={14} />Mobile
          </button>
        </div>

        {draft.contacts.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setRecipientIdx(Math.max(0, recipientIdx - 1))}
              disabled={recipientIdx === 0}
              className="p-1 rounded hover:bg-slate-200 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-semibold text-slate-800">
              {contact.name || contact.email || `Record #${recipientIdx + 1}`}
            </span>
            <button
              onClick={() => setRecipientIdx(Math.min(draft.contacts.length - 1, recipientIdx + 1))}
              disabled={recipientIdx >= draft.contacts.length - 1}
              className="p-1 rounded hover:bg-slate-200 disabled:opacity-40 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
            <span className="text-slate-400 text-xs ml-1">({recipientIdx + 1} of {draft.contacts.length})</span>
          </div>
        )}
      </div>

      <div className={`mx-auto border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden transition-all ${view === 'mobile' ? 'max-w-sm' : 'max-w-2xl'}`}>
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3">
          <p className="text-xs text-slate-500">To: <span className="text-slate-800 font-medium">{contact.email}</span></p>
          <p className="text-xs text-slate-500 mt-1">Subject: <span className="text-slate-900 font-semibold">{previewSubject || '(no subject)'}</span></p>
        </div>
        <div className="px-6 py-6 min-h-[220px]">
          <div
            className="leading-relaxed text-slate-900"
            dangerouslySetInnerHTML={{ __html: previewBody || '<span class="text-slate-400 italic">No content entered yet.</span>' }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Step 4: Send ─────────────────────────────────────────────────────────────

function SendStep({
  draft,
  onSend,
  onSendTest,
  sending,
  results,
}: {
  draft: CampaignDraft;
  onSend: () => void;
  onSendTest: (email: string) => void;
  sending: boolean;
  results: { name: string; email: string; status: string; error?: string }[] | null;
}) {
  const [testEmail, setTestEmail] = useState('');
  const [confirm, setConfirm] = useState(false);

  const valid = draft.contacts.length;
  const invalid = draft.invalidContacts.length;

  if (results) {
    const sent = results.filter(r => r.status === 'sent').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const pct = results.length > 0 ? Math.round((sent / results.length) * 100) : 0;

    return (
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <CheckCircle size={20} className="text-green-600" />
          <h2 className="text-lg font-semibold text-slate-900">Campaign Completed!</h2>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">{results.length} total recipients processed</span>
            <span className="text-sm font-bold text-slate-900">{pct}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div className="h-2 rounded-full bg-indigo-600 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex gap-5 text-sm">
            <span className="text-green-700 flex items-center gap-1 font-medium"><CheckCircle size={14} /> {sent} Sent</span>
            <span className="text-red-700 flex items-center gap-1 font-medium"><XCircle size={14} /> {failed} Failed</span>
          </div>
        </div>

        <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Recipient</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status & Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.map((r, i) => (
                <tr key={i}>
                  <td className="px-5 py-3 text-slate-900 font-medium">{r.name || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{r.email}</td>
                  <td className="px-4 py-3">
                    {r.status === 'sent' ? (
                      <span className="text-green-700 inline-flex items-center gap-1 text-xs font-medium bg-green-50 px-2 py-0.5 rounded border border-green-200">
                        <CheckCircle size={12} /> Delivered
                      </span>
                    ) : (
                      <div>
                        <span className="text-red-700 inline-flex items-center gap-1 text-xs font-medium bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          <XCircle size={12} /> Failed
                        </span>
                        {r.error && (
                          <p className="text-[11px] text-red-600 mt-1 max-w-sm font-mono bg-red-50/50 p-1 rounded">
                            {r.error}
                          </p>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Ready to Send?</h2>
        <p className="text-sm text-slate-500">Review your campaign summary and test before dispatching to all contacts.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-xs text-slate-500 font-medium mb-0.5">Recipients to Send</p>
            <p className="font-bold text-indigo-700 text-lg">{valid}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium mb-0.5">Valid Emails</p>
            <p className="font-bold text-green-700 text-lg">{valid}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium mb-0.5">Invalid/Skipped</p>
            <p className="font-bold text-amber-700 text-lg">{invalid}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium mb-0.5">Active Subject</p>
            <p className="font-medium text-slate-700 truncate">{draft.subject || '(none)'}</p>
          </div>
        </div>
      </div>

      {/* Test Email Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <p className="text-sm font-semibold text-slate-800 mb-1">Send a Test Email First (Sends 1 Single Email)</p>
        <p className="text-xs text-slate-500 mb-3">
          This sends <strong>only 1 preview email</strong> to verify styling without starting the entire bulk campaign.
        </p>
        <div className="flex gap-2">
          <input
            type="email"
            value={testEmail}
            onChange={e => setTestEmail(e.target.value)}
            placeholder="your_email@example.com"
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
          <button
            onClick={() => onSendTest(testEmail)}
            disabled={!testEmail || sending}
            className="px-4 py-2.5 border border-indigo-300 text-indigo-700 text-sm font-semibold rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50"
          >
            Send 1 Test Email
          </button>
        </div>
      </div>

      {/* Bulk Send Button */}
      {!confirm ? (
        <button
          onClick={() => setConfirm(true)}
          disabled={valid === 0 || sending}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-sm"
        >
          <Send size={16} />
          Send Full Campaign to All {valid} Recipients
        </button>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-3">
          <p className="text-sm font-semibold text-amber-900">⚠ Confirm Full Campaign Send</p>
          <p className="text-sm text-amber-800">
            You are about to send to <strong>all {valid} recipients</strong> one by one. Are you sure you want to proceed?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setConfirm(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setConfirm(false);
                onSend();
              }}
              disabled={sending}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60"
            >
              {sending ? 'Sending to all recipients…' : `✓ Yes, Send All ${valid} Emails`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main NewCampaignPage ─────────────────────────────────────────────────────

export default function NewCampaignPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<{ name: string; email: string; status: string; error?: string }[] | null>(null);
  const [error, setError] = useState('');

  const [draft, setDraft] = useState<CampaignDraft>({
    name: '',
    senderName: '',
    subject: '',
    body: PRESET_TEMPLATES[0].body,
    contacts: [],
    invalidContacts: [],
    detectedVariables: ['name', 'email', 'company'],
  });

  function canNext(): boolean {
    if (step === 0) return draft.contacts.length > 0;
    if (step === 1) return draft.name.trim() !== '' && draft.subject.trim() !== '' && draft.body.trim() !== '';
    return true;
  }

  // 1. Send 1 Single Test Email
  async function handleSendTest(testEmail: string) {
    if (!testEmail) return;
    setError('');
    setSending(true);
    try {
      const firstContact = draft.contacts[0] || { name: 'Test User', company: 'Sample Org' };
      const testContact = { ...firstContact, email: testEmail };

      const { data } = await api.post('/email/test', {
        to: testEmail,
        subject: draft.subject,
        body: draft.body,
        senderName: draft.senderName,
        contact: testContact,
      });

      alert(`✓ Test email delivered to ${testEmail}! (Check inbox / spam)`);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Failed to send test email.";
      setError(msg);
    } finally {
      setSending(false);
    }
  }

  // 2. Send Entire Campaign to ALL Recipients
  async function handleSendAll() {
    setError('');
    setSending(true);
    try {
      // Create campaign record
      const { data: campData } = await api.post('/campaigns', {
        name: draft.name,
        subject: draft.subject,
        body: draft.body,
        sender_name: draft.senderName,
        contacts: draft.contacts,
      });

      // Send to ALL recipients
      const { data } = await api.post('/email/send', {
        campaignId: campData.campaign?.id,
        contacts: draft.contacts, // Sends all contacts!
        subject: draft.subject,
        body: draft.body,
        senderName: draft.senderName,
      });

      setResults(data.results || []);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Could not dispatch campaign. Check your SMTP settings.";
      setError(msg);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/campaigns')}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-5 transition-colors"
      >
        <ArrowLeft size={15} />Back to Campaigns
      </button>

      <h1 className="text-2xl font-bold text-slate-900 mb-6">New Campaign</h1>

      <StepBar current={step} />

      {error && (
        <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button className="text-red-800 font-medium underline text-xs ml-3" onClick={() => setError('')}>Dismiss</button>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-5 shadow-2xs">
        {step === 0 && <ContactsStep draft={draft} setDraft={setDraft} />}
        {step === 1 && <ComposeStep draft={draft} setDraft={setDraft} />}
        {step === 2 && <PreviewStep draft={draft} />}
        {step === 3 && (
          <SendStep
            draft={draft}
            onSend={handleSendAll}
            onSendTest={handleSendTest}
            sending={sending}
            results={results}
          />
        )}
      </div>

      {!results && (
        <div className="flex justify-between">
          <button
            onClick={() => step > 0 && setStep(step - 1)}
            disabled={step === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-40"
          >
            <ArrowLeft size={15} />Previous
          </button>
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canNext()}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              Next<ArrowRight size={15} />
            </button>
          ) : null}
        </div>
      )}

      {results && (
        <div className="flex justify-center">
          <button
            onClick={() => navigate('/campaigns')}
            className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            View All Campaigns
          </button>
        </div>
      )}
    </div>
  );
}
