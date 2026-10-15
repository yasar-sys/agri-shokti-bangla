export function pestReportSummary(reports: { pest_name_bn: string; severity: string }[]) {
  const counts: Record<string, number> = {};
  for (const report of reports) {
    counts[report.pest_name_bn] = (counts[report.pest_name_bn] ?? 0) + 1;
  }
  return {
    reports: reports.length,
    highRisk: reports.filter(report => report.severity === 'high').length,
    mainPest: Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'রিপোর্ট নেই',
  };
}