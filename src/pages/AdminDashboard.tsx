import React, { useState, useEffect } from 'react';
import { StatCard } from '../components/StatCard';
import { MapView } from '../components/MapView';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  MOCK_ADMIN_STATS,
  MOCK_HAZARDS,
  MOCK_STUDENT_LOCATION,
  MOCK_COLLEGE_LOCATION,
} from '../data/mockData';
import { AdminDashboardStats, Hazard } from '../types';
import { getDashboardStats, getHazards } from '../services/api';
import {
  Users,
  AlertTriangle,
  FileText,
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  MapPin,
  RefreshCw,
  Filter,
  ShieldAlert,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats>(MOCK_ADMIN_STATS);
  const [hazards, setHazards] = useState<Hazard[]>(MOCK_HAZARDS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStats = async () => {
    setIsRefreshing(true);
    const data = await getDashboardStats();
    setStats(data.adminStats);
    const haz = await getHazards();
    setHazards(haz);
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 pb-12" id="admin-dashboard-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 uppercase tracking-wider">
              Campus Security Console
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-medium text-slate-500">Live Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Safety Operations Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Centralized monitoring for student transit safety corridors, active hazards, and incident distribution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStats}
            isLoading={isRefreshing}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            className="text-xs font-semibold"
          >
            Refresh Data
          </Button>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Telemetry Active</span>
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
          subtitle="Underpass flood & low-light alleys"
          tone="danger"
          icon={<AlertTriangle className="w-5 h-5" />}
        />

        {/* Stat 3: Total Reports */}
        <StatCard
          id="stat-total-reports"
          title="Total Reports"
          value={stats.totalReports}
          subtitle="Crowdsourced since semester start"
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
              Real-time map visualization of student corridors and reported road hazards
            </p>
          </div>

          <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2.5 py-1 rounded-md self-start sm:self-auto">
            {hazards.length} Active Hazard Pins
          </span>
        </div>

        <MapView
          id="admin-hotspots-map"
          hazards={hazards}
          studentLocation={MOCK_STUDENT_LOCATION}
          collegeLocation={MOCK_COLLEGE_LOCATION}
          height="440px"
        />
      </section>

      {/* 3 Empty Chart Containers (Prepared for later steps) */}
      <section id="admin-charts-section" className="space-y-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
            Safety Analytics & Trends
          </h2>
          <p className="text-xs text-slate-500">
            Historical incident metrics and safety distribution analysis (Charts ready for backend connection)
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Chart Container 1: Hazards by Type */}
          <Card
            id="chart-container-hazards-by-type"
            padding="md"
            className="border border-slate-200/90 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Hazards by Type
                  </h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  Chart Container
                </span>
              </div>

              {/* Empty chart placeholder container with styled skeleton bars */}
              <div className="h-48 rounded-xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center p-4 text-center">
                <div className="w-full flex items-end justify-around h-24 mb-3 px-4">
                  <div className="w-6 bg-slate-200 rounded-t h-[45%]" title="Potholes" />
                  <div className="w-6 bg-sky-200 rounded-t h-[75%]" title="Flooding" />
                  <div className="w-6 bg-rose-200 rounded-t h-[30%]" title="Accidents" />
                  <div className="w-6 bg-indigo-200 rounded-t h-[85%]" title="Poor Lighting" />
                  <div className="w-6 bg-amber-200 rounded-t h-[50%]" title="Traffic" />
                </div>
                <p className="text-xs font-semibold text-slate-600">
                  Hazards by Type Analytics
                </p>
                <span className="text-[11px] text-slate-400">
                  Recharts bar visualization will render here
                </span>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Top Category: Poor Lighting</span>
              <span className="font-semibold text-indigo-600">6 Categories</span>
            </div>
          </Card>

          {/* Chart Container 2: Risk Distribution */}
          <Card
            id="chart-container-risk-distribution"
            padding="md"
            className="border border-slate-200/90 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                    <PieChart className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Risk Distribution
                  </h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  Chart Container
                </span>
              </div>

              {/* Empty chart placeholder container with circular gauge skeleton */}
              <div className="h-48 rounded-xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center p-4 text-center">
                <div className="w-20 h-20 rounded-full border-8 border-slate-200 border-t-emerald-500 border-r-amber-500 border-b-rose-500 mb-3 flex items-center justify-center">
                  <span className="text-xs font-bold text-slate-700">100%</span>
                </div>
                <p className="text-xs font-semibold text-slate-600">
                  Risk Level Breakdown
                </p>
                <span className="text-[11px] text-slate-400">
                  Low (0–30), Med (31–60), High (61–100)
                </span>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-around text-[11px]">
              <span className="text-emerald-700 font-bold">58% Low</span>
              <span className="text-amber-700 font-bold">28% Med</span>
              <span className="text-rose-700 font-bold">14% High</span>
            </div>
          </Card>

          {/* Chart Container 3: Reports Over Time */}
          <Card
            id="chart-container-reports-over-time"
            padding="md"
            className="border border-slate-200/90 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-sky-50 text-sky-700">
                    <LineChart className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Reports Over Time
                  </h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  Chart Container
                </span>
              </div>

              {/* Empty chart placeholder container with waveform / line skeleton */}
              <div className="h-48 rounded-xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center p-4 text-center">
                <div className="w-full flex items-center justify-center h-20 mb-3 text-slate-300">
                  <svg className="w-36 h-12 stroke-current fill-none stroke-2" viewBox="0 0 100 30">
                    <path d="M0 25 Q 20 5, 40 18 T 70 8 T 100 22" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-slate-600">
                  Daily Report Frequency
                </p>
                <span className="text-[11px] text-slate-400">
                  Time-series line chart container ready
                </span>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>7-Day Trend: +12% Reports</span>
              <span className="font-semibold text-slate-700">Peak: 7 PM - 10 PM</span>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};
