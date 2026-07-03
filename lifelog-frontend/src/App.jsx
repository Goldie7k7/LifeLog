import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { GitCommit, ListChecks, Code2, Languages, Flame } from 'lucide-react';
import './App.css';

const CLOUDS = [
  '26px 34px 22px 30px / 30px 22px 34px 26px',
  '30px 22px 34px 26px / 26px 34px 22px 30px',
  '34px 26px 30px 22px / 22px 30px 26px 34px',
  '22px 30px 26px 34px / 34px 26px 30px 22px',
];

function App() {
  const [commitData, setCommitData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/commits')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setCommitData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="page-loading">Loading...</div>;
  if (error) return <div className="page-error">Error: {error}</div>;

  const totalCommits = commitData.reduce((sum, d) => sum + d.commits, 0);
  const bestDay = commitData.reduce((a, b) => (b.commits > a.commits ? b : a), commitData[0] || { day: '', commits: 0 });

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <div>
            <h1 className="logo">lifelog</h1>
            <p className="subtitle">personal analytics · self-hosted</p>
          </div>
        <div className="header-right">
          <div className="username">divyansh</div>
          <div className="live-dot">● live</div>
        </div>
        </header>

        <div className="stat-grid">
          <StatBlob shape={CLOUDS[0]} icon={<GitCommit size={16} strokeWidth={2.5} />} label="commits (7d)" value={totalCommits.toString()} />
          <StatBlob shape={CLOUDS[1]} icon={<Flame size={16} strokeWidth={2.5} />} label="best day" value={bestDay.day} sub={`${bestDay.commits} commits`} />
          <StatBlob shape={CLOUDS[2]} icon={<Code2 size={16} strokeWidth={2.5} />} label="leetcode" value="142" sub="solved" />
          <StatBlob shape={CLOUDS[3]} icon={<Languages size={16} strokeWidth={2.5} />} label="german streak" value="468" sub="days" />
        </div>

        <div className="cloud-card chart-card" style={{ borderRadius: '32px 40px 28px 44px / 40px 28px 44px 28px' }}>
          <div className="card-header">
            <div>
              <h2>commit activity</h2>
              <p className="card-subtitle">github · last 7 days</p>
            </div>
            <div className="icon-badge">
              <GitCommit size={16} strokeWidth={2.5} color="#181614" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={commitData} barCategoryGap="28%">
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#a8a29a', fontSize: 12, fontWeight: 700, fontFamily: "'Baloo 2', sans-serif" }} />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: '#2a2622' }}
                contentStyle={{ background: '#faf6ec', border: '3px solid #f4c430', borderRadius: 12, fontSize: 12, fontWeight: 700, fontFamily: "'Baloo 2', sans-serif" }}
                labelStyle={{ color: '#181614' }}
                itemStyle={{ color: '#a8790a' }}
              />
              <Bar dataKey="commits" radius={[8, 8, 4, 4]}>
                {commitData.map((entry, i) => (
                  <Cell key={i} fill={entry.day === bestDay.day ? '#f4c430' : '#3a352f'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="two-col">
          <div className="cloud-card" style={{ borderRadius: '36px 24px 40px 28px / 28px 40px 24px 36px' }}>
            <div className="card-header">
              <div>
                <h2>tasks</h2>
                <p className="card-subtitle">todoist · this week</p>
              </div>
              <div className="icon-badge">
                <ListChecks size={16} strokeWidth={2.5} color="#181614" />
              </div>
            </div>
            <div className="progress-list">
              <ProgressRow label="completed" value={27} max={34} />
              <ProgressRow label="linear algebra" value={5} max={6} />
              <ProgressRow label="german" value={7} max={7} />
            </div>
          </div>

          <div className="cloud-card" style={{ borderRadius: '24px 40px 28px 36px / 40px 24px 36px 28px' }}>
            <div className="card-header">
              <div>
                <h2>dsa progress</h2>
                <p className="card-subtitle">leetcode · by difficulty</p>
              </div>
              <div className="icon-badge">
                <Code2 size={16} strokeWidth={2.5} color="#181614" />
              </div>
            </div>
            <div className="progress-list">
              <ProgressRow label="easy" value={68} max={70} />
              <ProgressRow label="medium" value={61} max={120} />
              <ProgressRow label="hard" value={13} max={60} />
            </div>
          </div>
        </div>

        <footer className="footer">
          <span>fastapi + sqlite + react</span>
          <span>updated 2m ago</span>
        </footer>
      </div>
    </div>
  );
}

function StatBlob({ shape, icon, label, value, sub }) {
  return (
    <div className="cloud-card stat-blob" style={{ borderRadius: shape }}>
      <div className="stat-label">
        {icon}
        <span>{label}</span>
      </div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

function ProgressRow({ label, value, max }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="progress-labels">
        <span>{label}</span>
        <span className="progress-fraction">{value}/{max}</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default App;