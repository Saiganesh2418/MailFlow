import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, CheckCircle, XCircle, BarChart2, Plus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../lib/api';
import { StatCard, StatusBadge, EmptyState, SkeletonRow } from '../components/UI';

interface Stats { campaigns: number; emails_sent: number; successful: number; failed: number; }
interface Campaign { id: string; name: string; status: string; created_at: string; }

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/campaigns/stats/summary').catch(() => ({ data: { campaigns: 0, emails_sent: 0, successful: 0, failed: 0 } })),
      api.get('/campaigns').catch(() => ({ data: { campaigns: [] } })),
    ]).then(([statsRes, campRes]) => {
      setStats(statsRes.data);
      setCampaigns((campRes.data.campaigns || []).slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {getGreeting()}, {user?.name?.split(' ')[0]}.
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Create and manage your email campaigns.</p>
        </div>
        <button
          onClick={() => navigate('/campaigns/new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          Create Campaign
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <StatCard label="Campaigns" value={stats?.campaigns ?? '—'} icon={<BarChart2 size={18} />} />
        <StatCard label="Emails Sent" value={stats?.emails_sent?.toLocaleString() ?? '—'} icon={<Send size={18} />} />
        <StatCard label="Successful" value={stats?.successful?.toLocaleString() ?? '—'} icon={<CheckCircle size={18} className="text-green-500" />} />
        <StatCard label="Failed" value={stats?.failed?.toLocaleString() ?? '—'} icon={<XCircle size={18} className="text-red-500" />} />
      </div>

      {/* Recent Campaigns */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Recent Campaigns</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Campaign</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading
                ? Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} cols={3} />)
                : campaigns.length === 0
                ? (
                  <tr><td colSpan={3}>
                    <EmptyState
                      title="No campaigns yet"
                      description="Create your first campaign and start sending smarter emails."
                      action="+ Create Campaign"
                      onAction={() => navigate('/campaigns/new')}
                    />
                  </td></tr>
                )
                : campaigns.map((c) => (
                  <tr key={c.id}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/campaigns/${c.id}`)}>
                    <td className="px-5 py-3 font-medium text-slate-900">{c.name}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
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
