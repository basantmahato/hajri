"use client";

import { useState, useEffect, useCallback } from "react";
import { membershipService, type WageReportItem } from "../lib/services";

interface Props {
  organizationId: number;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function WageReportTab({ organizationId }: Props) {
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [report, setReport] = useState<WageReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadReport = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await membershipService.getWageReport(organizationId, month, year);
      setReport(data);
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || "Failed to load monthly wage report");
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, month, year]);

  useEffect(() => {
    if (organizationId) {
      loadReport();
    }
  }, [organizationId, loadReport]);

  const totalPayout = report.reduce((sum, item) => sum + parseFloat(item.totalEarnings || "0"), 0);
  const totalDaysPresent = report.reduce((sum, item) => sum + item.totalDaysPresent, 0);
  const totalHalfDays = report.reduce((sum, item) => sum + item.totalHalfDays, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="tab-pane">
      {/* Selector Bar */}
      <div className="report-control-bar no-print">
        <div className="report-period-selectors">
          <div className="selector-field">
            <label htmlFor="report-month">Month:</label>
            <select
              id="report-month"
              className="ui-select"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {MONTHS.map((name, idx) => (
                <option key={name} value={idx + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="selector-field">
            <label htmlFor="report-year">Year:</label>
            <select
              id="report-year"
              className="ui-select"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {[2024, 2025, 2026, 2027, 2028].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="report-actions">
          <button className="secondary-button" onClick={loadReport} disabled={isLoading}>
            ↻ Refresh
          </button>
          <button className="primary-button" onClick={handlePrint}>
            🖨️ Print / Export PDF
          </button>
        </div>
      </div>

      {error && <div className="alert-banner error-banner">{error}</div>}

      {/* Big Metric Banner */}
      <div className="metrics-row">
        <div className="metric-card payout-metric-card">
          <span className="metric-label">TOTAL MONTHLY PAYOUT</span>
          <span className="metric-value payout-value">
            ₹{totalPayout.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="metric-hint">For {MONTHS[month - 1]} {year}</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">TOTAL DAYS WORKED</span>
          <span className="metric-value">{totalDaysPresent} <small className="metric-sub">full</small> + {totalHalfDays} <small className="metric-sub">half</small></span>
          <span className="metric-hint">Calculated across all workers</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">ACTIVE WORKERS IN REPORT</span>
          <span className="metric-value">{report.length}</span>
          <span className="metric-hint">Roster members</span>
        </div>
      </div>

      {/* Detailed Table */}
      {isLoading ? (
        <div className="loading-box">
          <span className="spinner" />
          <span>Calculating monthly payouts…</span>
        </div>
      ) : report.length === 0 ? (
        <div className="empty-state-box">
          <div className="empty-icon">📊</div>
          <h4>No wage records found</h4>
          <p>There are no workers or attendance marked for {MONTHS[month - 1]} {year}.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="report-table">
            <thead>
              <tr>
                <th>Worker</th>
                <th style={{ textAlign: "right" }}>Daily Wage</th>
                <th style={{ textAlign: "center" }}>Present (1.0x)</th>
                <th style={{ textAlign: "center" }}>Half Day (0.5x)</th>
                <th style={{ textAlign: "center" }}>Absent</th>
                <th style={{ textAlign: "center" }}>Leave</th>
                <th style={{ textAlign: "right" }}>Total Payout</th>
              </tr>
            </thead>
            <tbody>
              {report.map((item) => {
                const initials = (item.userName || "U")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase();

                const wage = item.dailyWage ? parseFloat(item.dailyWage) : 0;
                const earnings = parseFloat(item.totalEarnings || "0");

                return (
                  <tr key={item.memberId}>
                    <td>
                      <div className="worker-cell">
                        <div className="worker-avatar">{initials}</div>
                        <div>
                          <div className="worker-name">{item.userName || "Unnamed Worker"}</div>
                          <div className="worker-subtext">ID #{item.userId}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span className="rate-text">₹{wage.toLocaleString("en-IN")}/day</span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span className="count-badge present-count">{item.totalDaysPresent}</span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span className={`count-badge ${item.totalHalfDays > 0 ? "half-count" : "zero-count"}`}>
                        {item.totalHalfDays}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span className={`count-badge ${item.totalAbsent > 0 ? "absent-count" : "zero-count"}`}>
                        {item.totalAbsent}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span className={`count-badge ${item.totalLeave > 0 ? "leave-count" : "zero-count"}`}>
                        {item.totalLeave}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="payout-cell">
                        <span className="payout-amount">₹{earnings.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                        <div className="payout-formula">
                          ({item.totalDaysPresent} × ₹{wage}) + ({item.totalHalfDays} × ₹{(wage * 0.5).toFixed(0)})
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2}><strong>Total Payroll</strong></td>
                <td style={{ textAlign: "center" }}><strong>{totalDaysPresent}</strong></td>
                <td style={{ textAlign: "center" }}><strong>{totalHalfDays}</strong></td>
                <td colSpan={2} />
                <td style={{ textAlign: "right" }}>
                  <span className="grand-total-amount">
                    ₹{totalPayout.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
