import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import api from '../lib/api';
import { StatusBadge, Spinner } from '../components/UI';

interface Campaign { id: string; name: string; subject: string; body: string; status: string; created_at: string; }
interface Recipient { id: string; name: string; email: string; status: string; error_message?: string; }

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/campaigns/${id}`)
      .then(r => { setCampaign(r.data.campaign); setRecipients(r.data.recipients || []); })
      .catch(() => navigate('/campaigns'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;
  if (!campaign) return null;

  const sent = recipients.filter(r => r.status === 'sent').length;
  const failed = recipients.filter(r => r.status === 'failed').length;
  const total = recipients.length;
  const pct = total > 0 ? Math.round((sent / total) * 100) : 0;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button onClick={() => navigate('/campaigns')}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-5 transition-colors">
        <ArrowLeft size={15} />Back to Campaigns
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{campaign.name}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{campaign.subject}</p>
        </div>
        <StatusBadge status={campaign.status} />
      </div>

      {/* Progress */}
      {total > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-800">Campaign Progress</span>
            <span className="text-lg font-bold text-slate-900">{pct}% Sent</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 mb-4">
            <div
              className="h-2.5 rounded-full bg-indigo-600 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex gap-6">
            <div className="flex items-center gap-1.5 text-sm text-green-700">
              <CheckCircle size={15} /><span className="font-medium">{sent}</span> Sent
            </div>
            <div className="flex items-center gap-1.5 text-sm text-red-700">
              <XCircle size={15} /><span className="font-medium">{failed}</span> Failed
            </div>
            <div className="text-sm text-slate-500">{total} Total</div>
          </div>
        </div>
      )}

      {/* Recipients table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Recipients ({total})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recipients.length === 0
                ? <tr><td colSpan={3} className="px-5 py-8 text-center text-slate-400 text-sm">No recipients found.</td></tr>
                : recipients.map((r, i) => (
                  <tr key={r.id || i}>
                    <td className="px-5 py-3 font-medium text-slate-900">{r.name || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{r.email}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                      {r.error_message && <p className="text-xs text-red-600 mt-0.5">{r.error_message}</p>}
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
