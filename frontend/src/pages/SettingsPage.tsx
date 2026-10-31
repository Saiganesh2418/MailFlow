import { useState } from 'react';
import { Settings, Save } from 'lucide-react';

export default function SettingsPage() {
  const [smtp, setSmtp] = useState({ host: '', port: '587', user: '', pass: '', secure: false });
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    // In a real app, save to backend env or user preferences
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Configure your email delivery provider.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Settings size={18} className="text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-800">SMTP Configuration</h2>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5 text-sm text-amber-800">
          ⚠ SMTP credentials are stored securely in your backend <code className="font-mono text-xs bg-amber-100 px-1 py-0.5 rounded">.env</code> file and never exposed to the browser.
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">SMTP Host</label>
              <input type="text" value={smtp.host} onChange={e => setSmtp({ ...smtp, host: e.target.value })}
                placeholder="smtp.gmail.com"
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Port</label>
              <input type="number" value={smtp.port} onChange={e => setSmtp({ ...smtp, port: e.target.value })}
                placeholder="587"
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email / Username</label>
            <input type="email" value={smtp.user} onChange={e => setSmtp({ ...smtp, user: e.target.value })}
              placeholder="you@example.com"
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password / App Password</label>
            <input type="password" value={smtp.pass} onChange={e => setSmtp({ ...smtp, pass: e.target.value })}
              placeholder="••••••••"
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
          </div>
          <div className="flex items-center gap-2">
            <input id="ssl" type="checkbox" checked={smtp.secure}
              onChange={e => setSmtp({ ...smtp, secure: e.target.checked })}
              className="w-4 h-4 accent-indigo-600" />
            <label htmlFor="ssl" className="text-sm text-slate-700">Use SSL/TLS (port 465)</label>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button type="submit"
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
              <Save size={15} />Save Settings
            </button>
            {saved && <span className="text-sm text-green-600 font-medium">✓ Saved!</span>}
          </div>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            These values are read-only in the UI preview. Update your actual credentials in the backend <code className="font-mono bg-slate-100 px-1 rounded">.env</code> file.
          </p>
        </div>
      </div>
    </div>
  );
}
