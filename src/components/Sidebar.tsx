import React from 'react';
import { ActiveView } from '../App';
import {
  LayoutDashboard, AlertTriangle, DollarSign, Sliders,
  Database, Play, ChevronRight, Sun, Moon, ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  honestCount: number;
  onOpenLanding: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

type NavItem = { id: ActiveView; label: string; icon: React.FC<{ size?: number }> };

const CONTROL_NAV: NavItem[] = [
  { id: 'command-center', label: 'Command Center', icon: LayoutDashboard },
  { id: 'exceptions',     label: 'Honest Exceptions', icon: AlertTriangle },
];

const MONEY_NAV: NavItem[] = [
  { id: 'recoveries', label: 'Recoveries', icon: DollarSign },
];

const TOOLS_NAV: NavItem[] = [
  { id: 'policy',    label: 'Policy Simulator', icon: Sliders },
  { id: 'batch-runs', label: 'Batch Runs', icon: Play },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeView, onNavigate, honestCount, onOpenLanding, theme, onToggleTheme
}) => {
  const renderNav = (items: NavItem[]) =>
    items.map(item => {
      const Icon = item.icon;
      const isActive = activeView === item.id;
      return (
        <button
          key={item.id}
          className={`sidebar-item ${isActive ? 'active' : ''}`}
          onClick={() => onNavigate(item.id)}
        >
          <Icon size={14} />
          <span>{item.label}</span>
          {item.id === 'exceptions' && honestCount > 0 && (
            <span style={{
              marginLeft: 'auto',
              fontSize: 10,
              fontWeight: 700,
              background: 'var(--warning-bg)',
              color: 'var(--warning)',
              border: '1px solid color-mix(in srgb, var(--warning) 30%, transparent)',
              borderRadius: 4,
              padding: '1px 6px',
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              {honestCount}
            </span>
          )}
        </button>
      );
    });

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <button
          onClick={onOpenLanding}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: '100%' }}
        >
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <ShieldCheck size={15} color="#fff" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
              SettleWise
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
              Finance Controller
            </div>
          </div>
          <ChevronRight size={12} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
        </button>
      </div>

      {/* Nav sections */}
      <nav style={{ flex: 1 }}>
        <div className="sidebar-section-label">Control</div>
        {renderNav(CONTROL_NAV)}

        <div className="sidebar-section-label" style={{ marginTop: 8 }}>Money</div>
        {renderNav(MONEY_NAV)}

        <div className="sidebar-section-label" style={{ marginTop: 8 }}>Tools</div>
        {renderNav(TOOLS_NAV)}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--border)',
        fontSize: 11,
      }}>
        {/* System status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%', background: 'var(--success)',
            display: 'inline-block', flexShrink: 0,
          }} className="animate-pulse-dot" />
          <span style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontSize: 10 }}>
            Systems Operational
          </span>
        </div>
        <div style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, marginBottom: 12 }}>
          Last sync {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
        </div>
        {/* Theme toggle */}
        <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 11 }} onClick={onToggleTheme}>
          {theme === 'dark' ? <Sun size={12} /> : <Moon size={12} />}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
    </aside>
  );
};
