import { ExceptionCase } from '../types/settlewise';

export interface DailyCashProjection {
  dayLabel: string;
  dateStr: string;
  projectedSettlement: number;
  unlockedFromRecovery: number;
  quarantinedAtRisk: number;
  netCashPosition: number;
  liquidityHealth: 'OPTIMAL' | 'STABLE' | 'ATTENTION';
}

export interface CashForecastSummary {
  sevenDayNetLiquidity: number;
  unclaimedDiscrepancyRecovery: number;
  quarantinedRiskCapital: number;
  payoutConfidenceIndex: number;
  dailyProjections: DailyCashProjection[];
}

export function generateCashForecast(cases: ExceptionCase[]): CashForecastSummary {
  const totalBaseValue = cases.reduce((acc, c) => acc + c.paymentAmount, 0);
  const totalResolved = cases.filter(c => c.status === 'RESOLVED').reduce((acc, c) => acc + c.paymentAmount, 0);
  const totalQuarantined = cases.filter(c => c.status === 'BLOCKED' || c.authorizedAction === 'BLOCK').reduce((acc, c) => acc + c.paymentAmount, 0);
  const totalRecovering = cases.filter(c => c.status === 'RECOVERING' || c.authorizedAction === 'RECOVERY_CASE').reduce((acc, c) => acc + c.paymentAmount, 0);

  const days = ['Today', 'Day +1', 'Day +2', 'Day +3', 'Day +4', 'Day +5', 'Day +6'];
  const today = new Date();

  let cumulativeCash = totalResolved;

  const dailyProjections: DailyCashProjection[] = days.map((dayLabel, idx) => {
    const d = new Date(today);
    d.setDate(d.getDate() + idx);
    const dateStr = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

    // Projected daily settlement inflow
    const dailyBaseInflow = Math.round((totalBaseValue / 7) * (0.85 + Math.sin(idx) * 0.15));
    const dailyRecoveryUnlock = idx >= 2 ? Math.round(totalRecovering / 4) : 0;
    const dailyRiskQuarantine = Math.round(totalQuarantined / 7);

    cumulativeCash += (dailyBaseInflow + dailyRecoveryUnlock - dailyRiskQuarantine);

    const health: 'OPTIMAL' | 'STABLE' | 'ATTENTION' = 
      dailyRiskQuarantine > dailyBaseInflow * 0.25 ? 'ATTENTION' : idx >= 2 ? 'OPTIMAL' : 'STABLE';

    return {
      dayLabel,
      dateStr,
      projectedSettlement: dailyBaseInflow,
      unlockedFromRecovery: dailyRecoveryUnlock,
      quarantinedAtRisk: dailyRiskQuarantine,
      netCashPosition: Math.max(0, cumulativeCash),
      liquidityHealth: health
    };
  });

  return {
    sevenDayNetLiquidity: cumulativeCash,
    unclaimedDiscrepancyRecovery: totalRecovering,
    quarantinedRiskCapital: totalQuarantined,
    payoutConfidenceIndex: 98.4,
    dailyProjections
  };
}
