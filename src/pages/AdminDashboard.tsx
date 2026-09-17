import React, { useState, useEffect } from 'react';
import { StatCard } from '../components/StatCard';
import { MapView } from '../components/MapView';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  MOCK_ADMIN_STATS,
  MOCK_STUDENT_LOCATION,
  MOCK_COLLEGE_LOCATION,
} from '../data/mockData';
import { AdminDashboardStats, HotspotItem, DashboardChartsData } from '../types';
import { getDashboardStats, getHotspots, getCharts } from '../services/api';
import {
  Users,
  AlertTriangle,
  FileText,
  Clock,
  BarChart3,
  PieChart as PieIcon,
  LineChart as LineIcon,
  MapPin,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats>(MOCK_ADMIN_STATS);
  const [hotspots, setHotspots] = useState<HotspotItem[]>([]);
  const [chartsData, setChartsData] = useState<DashboardChartsData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [connectionNotice, setConnectionNotice] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsRefreshing(true);
    setConnectionNotice(null);

    try {
      const [statsRes, hotspotsRes, chartsRes] = await Promise.all([
        getDashboardStats(),
        getHotspots(),
        getCharts(),
      ]);

      if (statsRes.data) {
        setStats(statsRes.data);
      }
      if (hotspotsRes.data) {
        setHotspots(hotspotsRes.data);
      }
      if (chartsRes.data) {
        setChartsData(chartsRes.data);
      }

      if (statsRes.error || hotspotsRes.error || chartsRes.error) {
        setConnectionNotice(
          statsRes.error || hotspotsRes.error || chartsRes.error || 'Operating in fallback mode.'
        );
      }
    } catch (err) {
      setConnectionNotice('Unable to connect to RouteSafe AI server.');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Safe fallback chart data if loading or offline
  const hazardsByType = chartsData?.hazardsByType || [
    { type: 'Pothole', count: 16, color: '#b45309' },
    { type: 'Flooding', count: 11, color: '#0284c7' },
    { type: 'Accident', count: 7, color: '#e11d48' },
    { type: 'Poor Lighting', count: 23, color: '#6366f1' },
    { type: 'Construction', count: 9, color: '#ea580c' },
    { type: 'High Traffic', count: 17, color: '#d97706' },
  ];

  const riskDistribution = chartsData?.riskDistribution || [
    { range: '0–30 Low', level: 'LOW', percentage: 58, color: '#10b981' },
    { range: '31–60 Med', level: 'MEDIUM', percentage: 28, color: '#f59e0b' },
    { range: '61–100 High', level: 'HIGH', percentage: 14, color: '#ef4444' },
  ];

  const reportsOverTime = chartsData?.reportsOverTime || [
    { day: 'Mon', reports: 18, verified: 16 },
    { day: 'Tue', reports: 24, verified: 22 },
    { day: 'Wed', reports: 31, verified: 29 },
    { day: 'Thu', reports: 22, verified: 20 },
    { day: 'Fri', reports: 45, verified: 41 },
    { day: 'Sat', reports: 38, verified: 35 },
    { day: 'Sun', reports: 19, verified: 17 },
  ];

  return (
    <div className="space-y-8 pb-12" id="admin-dashboard-page">
      {/* Backend connection notice */}
      {connectionNotice && (
        <div
          id="admin-connection-notice"
          className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold shadow-xs"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{connectionNotice} Cached safety data displayed.</span>
          </div>
          <button
            type="button"
            onClick={() => setConnectionNotice(null)}
            className="text-amber-700 hover:text-amber-900 underline font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200 uppercase tracking-wider">
              Campus Security Console
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-medium text-slate-500">Live Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Safety Operations Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Centralized monitoring for student transit corridors, risk distribution, and crowdsourced hazard reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            isLoading={isRefreshing}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            className="text-xs font-semibold shadow-xs"
          >
            Refresh Telemetry
          </Button>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-1.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>FastAPI Connected</span>
          </div>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <section id="admin-stats-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Active Students */}
        <StatCard
          id="stat-active-students"
          title="Active Students"
          value={stats.activeStudents.toLocaleString()}
          subtitle="Currently navigating via RouteSafe"
          tone="info"
          icon={<Users className="w-5 h-5" />}
        />

        {/* Stat 2: High-Risk Zones */}
        <StatCard
          id="stat-high-risk-zones-admin"
          title="High-Risk Zones"
          value={stats.highRiskZones}
          subtitle="Flooded underpasses & dark corridors"
          tone="danger"
          icon={<AlertTriangle className="w-5 h-5" />}
        />

        {/* Stat 3: Total Reports */}
        <StatCard
          id="stat-total-reports"
          title="Total Reports"
          value={stats.totalReports}
          subtitle="Crowdsourced semester incidents"
          tone="default"
          icon={<FileText className="w-5 h-5" />}
        />

        {/* Stat 4: Today's Reports */}
        <StatCard
          id="stat-todays-reports"
          title="Today's Reports"
          value={stats.todayReports}
          subtitle="Logged in the last 24 hours"
          tone="warning"
          icon={<Clock className="w-5 h-5" />}
        />
      </section>

      {/* Map Section: Live Safety Hotspots */}
      <section id="admin-map-section" className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <MapPin className="w-5 h-5 text-rose-600" />
              <span>Live Safety Hotspots</span>
            </h2>
            <p className="text-xs text-slate-500">
              High-resolution spatial risk density. Pins colored by risk: <span className="text-emerald-600 font-bold">LOW (Green)</span>, <span className="text-amber-600 font-bold">MEDIUM (Yellow)</span>, <span className="text-rose-600 font-bold">HIGH (Red)</span>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
              {hotspots.length} Monitored Hotspots
            </span>
          </div>
        </div>

        <MapView
          id="admin-hotspots-map"
          hotspots={hotspots}
          studentLocation={MOCK_STUDENT_LOCATION}
          collegeLocation={MOCK_COLLEGE_LOCATION}
          height="440px"
        />
      </section>

      {/* 3 Recharts Analytics Visualizations */}
      <section id="admin-charts-section" className="space-y-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            <span>Safety Analytics & Trends</span>
          </h2>
          <p className="text-xs text-slate-500">
            Real-time analytics grounded in backend database logs and multi-factor risk engine metrics.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Chart 1: Hazards by Type (BarChart) */}
          <Card
            id="chart-container-hazards-by-type"
            padding="md"
            className="border border-slate-200/90 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Hazards by Type
                  </h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  Live BarChart
                </span>
              </div>

              <div className="h-56 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={hazardsByType}
                    margin={{ top: 10, right: 10, left: -15, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="type"
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      angle={-25}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Bar
                      dataKey="count"
                      radius={[6, 6, 0, 0]}
                      fill="#6366f1"
                    >
                      {hazardsByType.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color || '#6366f1'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>Top Risk: Poor Lighting & Flooding</span>
              <span className="font-bold text-slate-800">
                {hazardsByType.reduce((acc, h) => acc + h.count, 0)} Total
              </span>
            </div>
          </Card>

          {/* Chart 2: Risk Distribution (PieChart) */}
          <Card
            id="chart-container-risk-distribution"
            padding="md"
            className="border border-slate-200/90 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                    <PieIcon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Risk Distribution
                  </h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Live PieChart
                </span>
              </div>

              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskDistribution}
                      dataKey="percentage"
                      nameKey="range"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={4}
                      label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell
                          key={`pie-cell-${index}`}
                          fill={entry.color || (index === 0 ? '#10b981' : index === 1 ? '#f59e0b' : '#ef4444')}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [`${val}% of Campus Routes`, 'Risk Ratio']}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-around text-[11px] font-bold">
              <span className="text-emerald-700">Low: 58%</span>
              <span className="text-amber-700">Med: 28%</span>
              <span className="text-rose-700">High: 14%</span>
            </div>
          </Card>

          {/* Chart 3: Reports Over Time (LineChart) */}
          <Card
            id="chart-container-reports-over-time"
            padding="md"
            className="border border-slate-200/90 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-sky-50 text-sky-700">
                    <LineIcon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Reports Over Time
                  </h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  Live LineChart
                </span>
              </div>

              <div className="h-56 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={reportsOverTime}
                    margin={{ top: 10, right: 15, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="reports"
                      name="Reports Logged"
                      stroke="#0284c7"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: '#0284c7' }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="verified"
                      name="Verified Hazards"
                      stroke="#10b981"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={{ r: 3, fill: '#10b981' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>Peak Reporting: Friday Evening</span>
              <span className="font-bold text-slate-800">89% Verified</span>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};
