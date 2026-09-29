import { useMemo, useState, type CSSProperties } from 'react';
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertOctagon,
  ArrowDownRight,
  Bell,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  CloudLightning,
  CloudRain,
  Compass,
  Download,
  Droplets,
  Gauge,
  Info,
  LayoutDashboard,
  LifeBuoy,
  Map,
  Menu,
  Mountain,
  Navigation,
  Radio,
  RefreshCw,
  ShieldCheck,
  Siren,
  X,
} from 'lucide-react';
import { type ReactNode } from 'react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import NotFound from '@/pages/not-found';

type Scenario = 'normal' | 'heavy' | 'extreme';
type VillageStatus = 'Safe' | 'Watch' | 'High risk';

type Village = {
  id: string;
  name: string;
  people: string;
  status: VillageStatus;
  water: number;
  eta: string;
  marker: { left: string; top: string };
};

type Conditions = {
  rainfall: number;
  soil: number;
  river: number;
  slope: number;
};

type ScenarioData = {
  label: string;
  risk: number;
  level: string;
  color: string;
  leadTime: string;
  rainfall: string;
  rainfallChange: string;
  river: string;
  riverChange: string;
  soil: string;
  soilChange: string;
  slope: string;
  slopeChange: string;
  conditions: Conditions;
  summary: string;
  chart: Array<{ time: string; risk: number; rain: number }>;
  ai: string;
  bullets: string[];
  villages: Village[];
};

const scenarios: Record<Scenario, ScenarioData> = {
  normal: {
    label: 'Normal conditions',
    risk: 18,
    level: 'LOW RISK',
    color: '#328d74',
    leadTime: '—',
    rainfall: '15',
    rainfallChange: 'within seasonal range',
    river: '1.2',
    riverChange: 'stable river stage',
    soil: '35',
    soilChange: 'stable moisture',
    slope: '10',
    slopeChange: 'low terrain exposure',
    conditions: { rainfall: 15, soil: 35, river: 1.2, slope: 10 },
    summary: 'Catchments are stable. No immediate action is recommended.',
    chart: [
      { time: '08:00', risk: 13, rain: 10 },
      { time: '10:00', risk: 15, rain: 12 },
      { time: '12:00', risk: 17, rain: 11 },
      { time: '14:00', risk: 16, rain: 14 },
      { time: '16:00', risk: 18, rain: 12 },
      { time: '18:00', risk: 18, rain: 12 },
      { time: 'Now', risk: 18, rain: 12 },
    ],
    ai: 'Terrain and sensor signals are aligned with a quiet baseline. The model sees no compounding pattern across the upper catchment.',
    bullets: ['Keep routine watch on River Kosi gauge.', 'Road access remains open to all monitored villages.'],
    villages: [
      { id: 'FG-014', name: 'Bhairavpur', people: '1,240', status: 'Safe', water: 28, eta: 'No action', marker: { left: '26%', top: '38%' } },
      { id: 'FG-022', name: 'Kandoli', people: '860', status: 'Safe', water: 34, eta: 'No action', marker: { left: '50%', top: '63%' } },
      { id: 'FG-031', name: 'Suryagaon', people: '2,110', status: 'Watch', water: 47, eta: 'Monitor', marker: { left: '68%', top: '29%' } },
      { id: 'FG-044', name: 'Dharali', people: '730', status: 'Safe', water: 31, eta: 'No action', marker: { left: '78%', top: '73%' } },
      { id: 'FG-057', name: 'Kothi', people: '540', status: 'Safe', water: 25, eta: 'No action', marker: { left: '39%', top: '22%' } },
      { id: 'FG-063', name: 'Jhakri', people: '1,020', status: 'Safe', water: 36, eta: 'No action', marker: { left: '88%', top: '47%' } },
    ],
  },
  heavy: {
    label: 'Heavy rain',
    risk: 61,
    level: 'MEDIUM RISK',
    color: '#b67b1b',
    leadTime: '2h 18m',
    rainfall: '65',
    rainfallChange: '+42.1 mm in 3 hours',
    river: '2.8',
    riverChange: '+0.8 m and rising',
    soil: '72',
    soilChange: 'saturation increasing',
    slope: '24',
    slopeChange: 'medium terrain exposure',
    conditions: { rainfall: 65, soil: 72, river: 2.8, slope: 24 },
    summary: 'Rain bands are concentrating over the Kosi catchment. Prepare public messaging.',
    chart: [
      { time: '08:00', risk: 24, rain: 24 },
      { time: '10:00', risk: 29, rain: 31 },
      { time: '12:00', risk: 36, rain: 44 },
      { time: '14:00', risk: 43, rain: 53 },
      { time: '16:00', risk: 51, rain: 61 },
      { time: '18:00', risk: 57, rain: 66 },
      { time: 'Now', risk: 61, rain: 69 },
    ],
    ai: 'The model is detecting a persistent rainfall cluster above the upper catchment. River response is lagging by approximately 35 minutes, which is consistent with rising runoff.',
    bullets: ['Pre-position response teams at Kandoli road junction.', 'Verify shelter capacity and test village siren relay.'],
    villages: [
      { id: 'FG-014', name: 'Bhairavpur', people: '1,240', status: 'Watch', water: 58, eta: '2h 18m', marker: { left: '26%', top: '38%' } },
      { id: 'FG-022', name: 'Kandoli', people: '860', status: 'Watch', water: 64, eta: '1h 46m', marker: { left: '50%', top: '63%' } },
      { id: 'FG-031', name: 'Suryagaon', people: '2,110', status: 'High risk', water: 76, eta: '54 min', marker: { left: '68%', top: '29%' } },
      { id: 'FG-044', name: 'Dharali', people: '730', status: 'Watch', water: 63, eta: '1h 32m', marker: { left: '78%', top: '73%' } },
      { id: 'FG-057', name: 'Kothi', people: '540', status: 'Watch', water: 55, eta: '2h 04m', marker: { left: '39%', top: '22%' } },
      { id: 'FG-063', name: 'Jhakri', people: '1,020', status: 'High risk', water: 74, eta: '48 min', marker: { left: '88%', top: '47%' } },
    ],
  },
  extreme: {
    label: 'Extreme flood',
    risk: 94,
    level: 'HIGH RISK',
    color: '#ca5045',
    leadTime: '55 min',
    rainfall: '120',
    rainfallChange: '+96.2 mm in 3 hours',
    river: '4.5',
    riverChange: '+2.1 m in 30 minutes',
    soil: '94',
    soilChange: 'critical saturation',
    slope: '38',
    slopeChange: 'high terrain exposure',
    conditions: { rainfall: 120, soil: 94, river: 4.5, slope: 38 },
    summary: 'Multiple signals indicate imminent flash flooding. Evacuate low-lying areas now.',
    chart: [
      { time: '08:00', risk: 31, rain: 27 },
      { time: '10:00', risk: 38, rain: 35 },
      { time: '12:00', risk: 48, rain: 50 },
      { time: '14:00', risk: 61, rain: 72 },
      { time: '16:00', risk: 73, rain: 92 },
      { time: '18:00', risk: 86, rain: 121 },
      { time: 'Now', risk: 94, rain: 143 },
    ],
    ai: 'A rapid rise in river stage is coinciding with saturated slopes and intense upstream precipitation. This is a high-consequence pattern with a short response window.',
    bullets: ['Evacuate river-adjacent homes toward the Ridgeview shelter.', 'Close the Dharali–Kandoli road and deploy loudspeaker teams.'],
    villages: [
      { id: 'FG-014', name: 'Bhairavpur', people: '1,240', status: 'High risk', water: 86, eta: '38 min', marker: { left: '26%', top: '38%' } },
      { id: 'FG-022', name: 'Kandoli', people: '860', status: 'High risk', water: 91, eta: '24 min', marker: { left: '50%', top: '63%' } },
      { id: 'FG-031', name: 'Suryagaon', people: '2,110', status: 'High risk', water: 97, eta: '18 min', marker: { left: '68%', top: '29%' } },
      { id: 'FG-044', name: 'Dharali', people: '730', status: 'High risk', water: 89, eta: '31 min', marker: { left: '78%', top: '73%' } },
      { id: 'FG-057', name: 'Kothi', people: '540', status: 'High risk', water: 82, eta: '42 min', marker: { left: '39%', top: '22%' } },
      { id: 'FG-063', name: 'Jhakri', people: '1,020', status: 'High risk', water: 94, eta: '21 min', marker: { left: '88%', top: '47%' } },
    ],
  },
};

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, target: 'overview' },
  { label: 'Live monitoring', icon: Activity, target: 'monitoring' },
  { label: 'Risk map', icon: Map, target: 'risk-map' },
  { label: 'Analytics', icon: Gauge, target: 'analytics' },
  { label: 'Alerts', icon: Siren, target: 'alerts' },
];

const statusClass = (status: VillageStatus) => {
  if (status === 'High risk') return 'status-high';
  if (status === 'Watch') return 'status-watch';
  return 'status-safe';
};

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));

const calculateRisk = ({ rainfall, soil, river, slope }: Conditions) =>
  Math.round(
    clamp(rainfall / 120 * 100) * 0.35 +
      clamp(soil) * 0.2 +
      clamp(river / 4.5 * 100) * 0.3 +
      clamp(slope / 45 * 100) * 0.15,
  );

const riskBand = (score: number) => (score >= 70 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW');

function Home() {
  const [scenario, setScenario] = useState<Scenario>('normal');
  const [activeNav, setActiveNav] = useState('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [alertConfirm, setAlertConfirm] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const data = scenarios[scenario];
  const riskScore = calculateRisk(data.conditions);
  const riskBandLabel = riskBand(riskScore);
  const trendData = useMemo(
    () =>
      data.chart.map((point) => ({
        ...point,
        river: Number(data.river) * (0.78 + (point.risk / Math.max(data.risk, 1)) * 0.22),
        soil: Math.round(Number(data.soil) * (0.8 + (point.risk / Math.max(data.risk, 1)) * 0.2)),
      })),
    [data],
  );

  const totalPeople = useMemo(
    () => data.villages.reduce((sum, village) => sum + Number(village.people.replace(',', '')), 0).toLocaleString(),
    [data.villages],
  );

  const showFeedback = (message: string) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(''), 3600);
  };

  const navigateTo = (target: string) => {
    setActiveNav(target);
    setMobileOpen(false);
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const selectScenario = (next: Scenario) => {
    setScenario(next);
    setSelectedVillage(null);
    setAlertSent(false);
    setFeedback(`Simulation changed to ${scenarios[next].label}. All readings are illustrative.`);
  };

  const refreshData = () => {
    setRefreshing(true);
    window.setTimeout(() => {
      setRefreshing(false);
      showFeedback('Demo sensor snapshot refreshed at 14:32:08.');
    }, 700);
  };

  const cssRisk = { '--risk-color': data.color } as CSSProperties;

  return (
    <div className={`app-shell ${riskBandLabel === 'HIGH' ? 'high-risk-mode' : ''}`} style={cssRisk} data-risk-band={riskBandLabel.toLowerCase()}>
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><WavesIcon /></div>
          <div><div className="brand-name">FLOODGUARD AI</div><div className="brand-sub">District command center</div></div>
        </div>
        <div className="nav-label">Workspace</div>
        <nav className="nav-list" aria-label="Primary navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button type="button" key={item.target} className={`nav-item ${activeNav === item.target ? 'active' : ''}`} data-testid={`button-nav-${item.target}`} onClick={() => navigateTo(item.target)}>
                <Icon size={15} strokeWidth={1.8} /><span>{item.label}</span>{item.target === 'villages' && <span className="nav-count">4</span>}
              </button>
            );
          })}
        </nav>
          <div className="nav-label" style={{ marginTop: 29 }}>Operations</div>
        <nav className="nav-list">
          <button type="button" className="nav-item" data-testid="button-nav-settings" onClick={() => showFeedback('Settings are locked in this local demo workspace.')}><ShieldCheck size={15} strokeWidth={1.8} /><span>Protocol settings</span></button>
        </nav>
        <div className="sidebar-bottom">
          <div className="demo-chip"><Info size={13} /><span>Simulation mode<br />No live government or sensor feeds connected.</span></div>
          <div className="operator"><div className="avatar">AS</div><div><div className="operator-name">Aarav Sharma</div><div className="operator-role">District response lead</div></div><ChevronDown size={13} style={{ marginLeft: 'auto', opacity: .55 }} /></div>
        </div>
      </aside>

      {mobileOpen && (
        <div className="mobile-drawer" role="dialog" aria-label="Mobile navigation">
          <div className="drawer-head"><div className="brand"><div className="brand-mark"><WavesIcon /></div><div className="brand-name">FLOODGUARD AI</div></div><button type="button" className="icon-btn" data-testid="button-close-menu" onClick={() => setMobileOpen(false)}><X size={16} /></button></div>
          {navItems.map((item) => { const Icon = item.icon; return <button type="button" key={item.target} className={`nav-item ${activeNav === item.target ? 'active' : ''}`} onClick={() => navigateTo(item.target)}><Icon size={15} /><span>{item.label}</span></button>; })}
        </div>
      )}

      <div className="main-wrap">
        <header className="topbar">
          <div className="crumb"><button type="button" className="icon-btn mobile-menu" data-testid="button-open-menu" onClick={() => setMobileOpen(true)}><Menu size={17} /></button><span>Himachal district /</span><strong>Rampur response desk</strong></div>
          <div className="top-actions"><div className="live-state"><i className="live-dot" /> demo feeds operational</div><button type="button" className="icon-btn" aria-label="Refresh simulated readings" data-testid="button-refresh" onClick={refreshData}><RefreshCw size={14} className={refreshing ? 'spin' : ''} /></button><button type="button" className="icon-btn" aria-label="Open alert center" data-testid="button-notifications" onClick={() => setAlertConfirm(true)}><Bell size={14} /></button></div>
        </header>

        <main className="dashboard" id="overview">
          <div className="page-intro">
            <div><div className="eyebrow">Situation room / 06 June 2025</div><h1 className="page-title">Good afternoon, Modish.</h1><p className="page-subtitle">A focused view of catchment conditions, exposed villages, and the next decision window.</p></div>
            <div className="timestamp">LAST SYNCHRONIZED<b>14:32:08 IST</b></div>
          </div>

          <section className="scenario-bar" aria-label="Scenario simulation">
            <div className="scenario-copy"><CloudLightning size={16} /><div>Scenario simulation <span>Local demo controls · not a forecast</span></div></div>
            <div className="scenario-buttons">
              <button type="button" className={`scenario-btn ${scenario === 'normal' ? 'selected' : ''}`} data-testid="button-scenario-normal" onClick={() => selectScenario('normal')}>Normal conditions</button>
              <button type="button" className={`scenario-btn ${scenario === 'heavy' ? 'selected' : ''}`} data-testid="button-scenario-heavy" onClick={() => selectScenario('heavy')}>Heavy rain</button>
              <button type="button" className={`scenario-btn danger ${scenario === 'extreme' ? 'selected' : ''}`} data-testid="button-scenario-extreme" onClick={() => selectScenario('extreme')}>Extreme flood</button>
            </div>
          </section>

          <motion.div key={scenario} initial={{ opacity: .45, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .35 }} className="grid-top" id="monitoring">
            <section className="panel risk-card" data-testid="panel-risk-summary">
              <div className="panel-head"><div><div className="panel-kicker">Current assessment</div><h2 className="panel-title">Catchment risk score</h2><div className="panel-note">Composite of demo rainfall, river, soil and terrain signals</div></div><Radio size={17} color={data.color} /></div>
              <div className="risk-main">
                <div className="risk-gauge" data-testid="status-risk-score">
                  <svg viewBox="0 0 120 120" aria-hidden="true"><circle className="track" cx="60" cy="60" r="49" /><circle className="progress" cx="60" cy="60" r="49" strokeDasharray="308" strokeDashoffset={308 - (308 * riskScore) / 100} /></svg>
                  <div className="gauge-text"><div className="gauge-number">{riskScore}</div><div className="gauge-unit">out of 100</div></div>
                </div>
                <div className="risk-summary"><div className="risk-badge"><span className="live-dot" style={{ background: data.color }} />{riskBandLabel} RISK</div><h3>{data.label}</h3><p>{data.summary}</p></div>
              </div>
              <div className="risk-method">Risk engine: 35% rainfall · 20% soil moisture · 30% river level · 15% terrain slope</div>
              <div className="lead-time"><div><div className="lead-time-label">Estimated response lead time</div><div className="lead-time-value">{data.leadTime}</div></div><button type="button" className="mini-action" data-testid="button-view-protocol" onClick={() => navigateTo('villages')}>View response protocol <ArrowDownRight size={13} /></button></div>
            </section>

            <section className="panel map-panel" id="risk-map">
              <div className="panel-head"><div><div className="panel-kicker">Live monitoring / schematic</div><h2 className="panel-title">Kosi upper catchment</h2><div className="panel-note">Markers update with the selected scenario</div></div><button type="button" className="outline-btn" data-testid="button-map-details" onClick={() => showFeedback('Map layers are illustrative and do not represent real geography.')}><Compass size={13} /> Map details</button></div>
              <div className="map-canvas" data-testid="map-risk-canvas">
                <div className="map-water w1" /><div className="map-water w2" /><div className="ridge r1" /><div className="ridge r2" /><div className="ridge r3" />
                <span className="map-label l1">upper catchment</span><span className="map-label l2">river kosi</span><span className="map-label l3">ridge line</span>
                {data.villages.map((village) => <button type="button" key={village.id} className="map-marker" aria-label={`Inspect ${village.name}`} onClick={() => setSelectedVillage(village)} style={{ left: village.marker.left, top: village.marker.top, '--marker-color': village.status === 'High risk' ? '#ca5045' : village.status === 'Watch' ? '#b67b1b' : '#328d74' } as CSSProperties}><div className="marker-core" /><span className="marker-label">{village.name}</span></button>)}
                <div className="map-legend"><span className="legend-item"><i className="legend-dot safe" /> safe</span><span className="legend-item"><i className="legend-dot watch" /> watch</span><span className="legend-item"><i className="legend-dot high" /> high risk</span></div>
              </div>
              {selectedVillage && <div className="map-inspector"><div><div className="panel-kicker">Selected demo village</div><strong>{selectedVillage.name}</strong><span className={`status-pill ${statusClass(selectedVillage.status)}`}>{selectedVillage.status}</span></div><div className="inspector-grid"><span>Risk score <b>{clamp(riskScore + Math.round((selectedVillage.water - 60) / 4))}</b></span><span>Rainfall <b>{data.rainfall} mm/hr</b></span><span>Soil moisture <b>{data.soil}%</b></span><span>River level <b>{data.river} m</b></span><span>Slope <b>{data.slope}°</b></span><span>Lead time <b>{selectedVillage.eta}</b></span></div></div>}
              <div className="map-footer"><span>Demo basemap · terrain schematic</span><span className="coord">31.04° N&nbsp;&nbsp; 77.13° E</span></div>
            </section>
          </motion.div>

          <div className="metrics-grid">
            <Metric icon={<CloudRain size={14} />} label="3h rainfall" value={data.rainfall} unit="mm" change={data.rainfallChange} color="#2e8c91" />
            <Metric icon={<Droplets size={14} />} label="River Kosi" value={data.river} unit="m" change={data.riverChange} color="#4b83a0" />
            <Metric icon={<Mountain size={14} />} label="Soil saturation" value={data.soil} unit="%" change={data.soilChange} color="#a97829" />
            <Metric icon={<Mountain size={14} />} label="Terrain slope" value={data.slope} unit="°" change={data.slopeChange} color="#8470a4" />
          </div>

          <div className="section-grid" id="analytics">
            <section className="panel">
              <div className="panel-head"><div><div className="panel-kicker">Signal history / simulated</div><h2 className="panel-title">Risk trajectory</h2></div><div className="panel-note">Last 12 hours</div></div>
              <div className="chart-caption">Composite risk and rainfall intensity move together in this scenario.</div>
              <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data.chart} margin={{ top: 8, right: 14, left: -15, bottom: 0 }}><defs><linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={data.color} stopOpacity={.28} /><stop offset="95%" stopColor={data.color} stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} /><XAxis dataKey="time" tickLine={false} axisLine={false} /><YAxis domain={[0, 160]} tickLine={false} axisLine={false} /><Tooltip contentStyle={{ background: '#153044', border: 'none', borderRadius: 6, fontSize: 10 }} labelStyle={{ color: '#b9d4d2' }} itemStyle={{ color: '#f4e8ce' }} /><Area type="monotone" dataKey="rain" name="Rainfall mm" stroke="#4b83a0" strokeWidth={1.5} fill="none" strokeDasharray="4 4" /><Area type="monotone" dataKey="risk" name="Risk score" stroke={data.color} strokeWidth={2.5} fill="url(#riskFill)" /></AreaChart></ResponsiveContainer></div>
            </section>

            <section className="panel ai-panel" data-testid="panel-ai-analysis">
              <div className="panel-head"><div><div className="panel-kicker">Decision support / simulated</div><h2 className="panel-title">AI Risk Analysis</h2></div><div className="ai-head-icon"><BrainCircuit size={17} /></div></div>
              <div className="ai-content"><b>Model read:</b> {data.ai}</div>
              <div className="ai-bullets">{data.bullets.map((bullet) => <div className="ai-bullet" key={bullet}><CheckCircle2 size={13} />{bullet}</div>)}</div>
              <div className="confidence"><span>SIMULATION CONFIDENCE <strong>{scenario === 'normal' ? '92%' : scenario === 'heavy' ? '78%' : '71%'}</strong></span><span>Updated with scenario</span></div>
            </section>
          </div>

          <section className="trend-grid" aria-label="Signal trends">
            {[
              { key: 'rain' as const, label: 'Rainfall trend', unit: 'mm/hr', color: '#2e8c91' },
              { key: 'river' as const, label: 'River level trend', unit: 'm', color: '#4b83a0' },
              { key: 'soil' as const, label: 'Soil moisture trend', unit: '%', color: '#a97829' },
            ].map((trend) => (
              <div className="panel mini-trend" key={trend.key}>
                <div className="mini-trend-head"><span>{trend.label}</span><b>{trend.unit}</b></div>
                <div className="mini-trend-chart"><ResponsiveContainer width="100%" height="100%"><LineChart data={trendData}><CartesianGrid vertical={false} /><XAxis dataKey="time" hide /><YAxis hide domain={['auto', 'auto']} /><Tooltip contentStyle={{ background: '#153044', border: 'none', borderRadius: 6, fontSize: 10 }} /><Line type="monotone" dataKey={trend.key} stroke={trend.color} strokeWidth={2.3} dot={false} /></LineChart></ResponsiveContainer></div>
              </div>
            ))}
          </section>

          <section className="panel table-panel" id="villages">
            <div className="panel-head"><div><div className="panel-kicker">Exposure register / demo villages</div><h2 className="panel-title">Villages &amp; response status</h2><div className="panel-note">{totalPeople} residents across four monitored settlements</div></div><div className="table-head-actions"><button type="button" className="outline-btn" data-testid="button-export-register" onClick={() => showFeedback('Exposure register prepared for local download.')}><Download size={13} /> Export register</button><button type="button" className="solid-btn" data-testid="button-shelter-plan" onClick={() => showFeedback('Shelter plan opened: Ridgeview Community Hall, 1,450 capacity.')}><LifeBuoy size={13} /> Shelter plan</button></div></div>
            <div className="table-scroll"><table className="village-table"><thead><tr><th>Settlement</th><th>Residents</th><th>Water level</th><th>Status</th><th>Response window</th></tr></thead><tbody>{data.villages.map((village) => <tr key={village.id} data-testid={`row-village-${village.id}`}><td><div className="village-name">{village.name}</div><div className="village-id">{village.id}</div></td><td className="people">{village.people}</td><td><div className="progress-line" style={{ '--row-color': village.status === 'High risk' ? '#ca5045' : village.status === 'Watch' ? '#b67b1b' : '#328d74' } as CSSProperties}><i style={{ width: `${village.water}%` }} /></div><div className="village-id">{village.water}% threshold</div></td><td><span className={`status-pill ${statusClass(village.status)}`}>{village.status}</span></td><td className="people">{village.eta}</td></tr>)}</tbody></table></div>
          </section>

          <div className="bottom-grid">
            <section className="panel info-card" id="shelters">
              <div className="panel-head"><div><div className="panel-kicker">Preparedness / demo inventory</div><h2 className="panel-title">Shelter &amp; evacuation</h2></div><Navigation size={17} color="hsl(184 78% 32%)" /></div>
              <div className="info-list"><div className="info-item"><LifeBuoy size={15} /><div><b>Ridgeview Community Hall</b><span>Capacity 1,450 · 2.6 km north-east<br />Primary destination for river-adjacent homes</span></div></div><div className="info-item"><Navigation size={15} /><div><b>Evacuation direction</b><span>Move uphill toward Ridgeview<br />Avoid the Kosi bridge and low road</span></div></div></div>
            </section>
            <section className={`panel alert-card ${scenario === 'extreme' ? 'warning-card' : ''}`} id="alerts">
              <div className="panel-kicker">Responder action / local only</div><h2 className="panel-title">{scenario === 'extreme' ? 'Flash flood protocol' : 'Alert actions'}</h2><p className="alert-copy">{scenario === 'extreme' ? 'The selected simulation crosses the emergency threshold. Confirming will create a local demo alert and show the recommended evacuation direction.' : 'Use the simulation to rehearse alerting flows. Nothing is sent to residents or external systems.'}</p>
              {scenario === 'extreme' && <div className="flash-warning"><Siren size={18} /><div><strong>FLASH FLOOD WARNING</strong><span>Begin evacuation toward designated shelter · response window {data.leadTime}</span></div></div>}
              <div className="alert-actions"><button type="button" className="solid-btn" data-testid="button-simulate-alert" onClick={() => setAlertConfirm(true)}><Siren size={14} /> SEND ALERT</button><button type="button" className="outline-btn" data-testid="button-evacuation-direction" onClick={() => navigateTo('shelters')}><Navigation size={14} /> VIEW EVACUATION PLAN</button></div>
              {alertSent && <div className="feedback" data-testid="status-alert-confirmed"><CheckCircle2 size={13} style={{ verticalAlign: 'middle', marginRight: 5 }} />Demo alert confirmed at 14:32 IST. Response team notified locally.</div>}
              {feedback && !alertSent && <div className="feedback" data-testid="status-feedback">{feedback}</div>}
            </section>
          </div>

          <footer className="footer"><div><strong>FLOODGUARD AI</strong> · Beginner-friendly Smart India Hackathon prototype<br />All readings, locations, risk scores and recommendations are fictional simulated data for demonstration only. This system is not an operational warning service.</div><div className="footer-right">BUILD 0.4.2 / DEMO<br />No live feeds connected</div></footer>
        </main>
      </div>

      {alertConfirm && <div className="modal-backdrop" role="presentation" onClick={() => setAlertConfirm(false)}><div className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-heading" onClick={(event) => event.stopPropagation()}><div className="confirm-icon"><AlertOctagon size={22} /></div><div><div className="panel-kicker">Local simulation action</div><h2 id="confirm-heading">Confirm {scenario === 'extreme' ? 'flash flood warning' : 'alert rehearsal'}?</h2><p>This will only update the prototype workspace. No message will be sent to a real village, agency, or sensor network.</p></div><div className="modal-actions"><button type="button" className="outline-btn" data-testid="button-cancel-alert" onClick={() => setAlertConfirm(false)}>Cancel</button><button type="button" className="solid-btn" data-testid="button-confirm-alert" onClick={() => { setAlertConfirm(false); setAlertSent(true); showFeedback(''); }}>Confirm local action</button></div></div></div>}
    </div>
  );
}

function Metric({ icon, label, value, unit, change, color }: { icon: ReactNode; label: string; value: string; unit: string; change: string; color: string }) {
  return <div className="panel metric-card" style={{ '--metric-color': color } as CSSProperties} data-testid={`metric-${label.toLowerCase().replaceAll(' ', '-')}`}><div className="metric-top"><span>{label}</span>{icon}</div><div className="metric-value">{value}<span className="metric-unit">{unit}</span></div><div className="metric-change">{change}</div></div>;
}

function WavesIcon() {
  return <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 8c2.1 0 2.1-1.7 4.2-1.7S9.3 8 11.4 8s2.1-1.7 4.2-1.7S17.7 8 19.8 8" /><path d="M3 13c2.1 0 2.1-1.7 4.2-1.7s2.1 1.7 4.2 1.7 2.1-1.7 4.2-1.7 2.1 1.7 4.2 1.7" /><path d="M3 18c2.1 0 2.1-1.7 4.2-1.7s2.1 1.7 4.2 1.7 2.1-1.7 4.2-1.7 2.1 1.7 4.2 1.7" /></svg>;
}

function Router() {
  return <RoutedErrorBoundary><Switch><Route path="/" component={Home} /><Route component={NotFound} /></Switch></RoutedErrorBoundary>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

const queryClient = new QueryClient();

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;