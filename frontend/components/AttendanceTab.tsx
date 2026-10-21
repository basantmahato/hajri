"use client";

import { useState, useEffect, useCallback } from "react";
import { attendanceService, type Member, type AttendanceRecord } from "../lib/services";

interface Props {
  organizationId: number;
  members: Member[];
}

type StatusType = "present" | "half_day" | "absent" | "leave";

export function AttendanceTab({ organizationId, members }: Props) {
  const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const [date, setDate] = useState(getTodayString());
  const [attendanceMap, setAttendanceMap] = useState<Record<number, { status: StatusType; notes: string }>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Load existing attendance for selected date
  const loadAttendance = useCallback(async (targetDate: string) => {
    setIsLoading(true);
    setMessage(null);
    try {
      const records: AttendanceRecord[] = await attendanceService.getByDate(organizationId, targetDate);
      const newMap: Record<number, { status: StatusType; notes: string }> = {};

      records.forEach((r) => {
        newMap[r.userId] = {
          status: r.status,
          notes: r.notes || "",
        };
      });

      setAttendanceMap(newMap);
    } catch (err: any) {
      console.error("Failed to load attendance records:", err);
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    if (organizationId && date) {
      loadAttendance(date);
    }
  }, [organizationId, date, loadAttendance]);

  const changeDateBy = (days: number) => {
    const current = new Date(date);
    current.setDate(current.getDate() + days);
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, "0");
    const dd = String(current.getDate()).padStart(2, "0");
    setDate(`${yyyy}-${mm}-${dd}`);
  };

  const setStatus = (userId: number, status: StatusType) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [userId]: {
        status,
        notes: prev[userId]?.notes || "",
      },
    }));
  };

  const setNotes = (userId: number, notes: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [userId]: {
        status: prev[userId]?.status || "present",
        notes,
      },
    }));
  };

  // The owner/manager takes attendance for their workers, not for themselves
  const workers = members.filter((m) => m.role !== "owner");

  const markAll = (status: StatusType) => {
    const newMap = { ...attendanceMap };
    workers.forEach((m) => {
      newMap[m.userId] = {
        status,
        notes: newMap[m.userId]?.notes || "",
      };
    });
    setAttendanceMap(newMap);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    const entries = workers.map((m) => {
      const record = attendanceMap[m.userId];
      return {
        userId: m.userId,
        status: record ? record.status : ("present" as StatusType),
        notes: record?.notes?.trim() || undefined,
      };
    });

    try {
      await attendanceService.bulkMark({
        organizationId,
        date,
        entries,
      });
      setMessage({ text: `Attendance successfully saved for ${date}!`, type: "success" });
      loadAttendance(date);
    } catch (err: any) {
      setMessage({
        text: err?.response?.data?.error || err.message || "Failed to save attendance",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Counts
  let presentCount = 0;
  let halfDayCount = 0;
  let absentCount = 0;
  let leaveCount = 0;

  workers.forEach((m) => {
    const status = attendanceMap[m.userId]?.status;
    if (status === "present") presentCount++;
    else if (status === "half_day") halfDayCount++;
    else if (status === "absent") absentCount++;
    else if (status === "leave") leaveCount++;
  });

  return (
    <div className="tab-pane">
      {/* Date Bar & Controls */}
      <div className="attendance-control-bar">
        <div className="date-navigation">
          <button className="nav-date-btn" onClick={() => changeDateBy(-1)} title="Previous Day">
            ◀
          </button>
          <input
            type="date"
            className="date-picker-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <button className="nav-date-btn" onClick={() => changeDateBy(1)} title="Next Day">
            ▶
          </button>
          <button className="today-btn" onClick={() => setDate(getTodayString())}>
            Today
          </button>
        </div>

        <div className="attendance-action-buttons">
          <button
            type="button"
            className="secondary-button mark-all-btn"
            onClick={() => markAll("present")}
            disabled={isLoading || workers.length === 0}
          >
            Mark All Present
          </button>
          <button
            type="button"
            className="primary-button save-attendance-btn"
            onClick={handleSave}
            disabled={isSaving || isLoading || workers.length === 0}
          >
            {isSaving ? "Saving…" : "Save Attendance"}
          </button>
        </div>
      </div>

      {message && (
        <div className={`alert-banner ${message.type === "success" ? "success-banner" : "error-banner"}`}>
          {message.text}
        </div>
      )}

      {/* Metrics Stat Row */}
      <div className="attendance-summary-pills">
        <div className="summary-pill total-pill">
          <span className="pill-dot" />
          <span>Total Workers: <strong>{workers.length}</strong></span>
        </div>
        <div className="summary-pill present-pill">
          <span className="pill-dot present-dot" />
          <span>Present: <strong>{presentCount}</strong></span>
        </div>
        <div className="summary-pill half-pill">
          <span className="pill-dot half-dot" />
          <span>Half Day (0.5x): <strong>{halfDayCount}</strong></span>
        </div>
        <div className="summary-pill absent-pill">
          <span className="pill-dot absent-dot" />
          <span>Absent: <strong>{absentCount}</strong></span>
        </div>
        {leaveCount > 0 && (
          <div className="summary-pill leave-pill">
            <span className="pill-dot leave-dot" />
            <span>Leave: <strong>{leaveCount}</strong></span>
          </div>
        )}
      </div>

      {/* Member Attendance List */}
      {workers.length === 0 ? (
        <div className="empty-state-box">
          <div className="empty-icon">📋</div>
          <h4>No workers in this group yet</h4>
          <p>Go to the Workers & Wages tab to add your workers with their daily wage.</p>
        </div>
      ) : (
        <div className="attendance-list-container">
          {workers.map((m) => {
            const currentStatus = attendanceMap[m.userId]?.status || "present";
            const currentNotes = attendanceMap[m.userId]?.notes || "";
            const wage = m.dailyWage ? parseFloat(m.dailyWage) : 0;

            const initials = (m.userName || "U")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase();

            return (
              <div key={m.id} className={`attendance-row-card status-border-${currentStatus}`}>
                <div className="worker-info-area">
                  <div className="worker-avatar">{initials}</div>
                  <div>
                    <div className="worker-name-line">
                      <span className="worker-name">{m.userName || "Unnamed Worker"}</span>
                      <span className="worker-wage-bubble">₹{wage.toLocaleString("en-IN")}/day</span>
                    </div>
                    <div className="worker-phone-line">{m.userPhone || m.userEmail || "No contact"}</div>
                  </div>
                </div>

                {/* Status Toggle Buttons */}
                <div className="status-toggle-group">
                  <button
                    type="button"
                    className={`status-btn btn-present ${currentStatus === "present" ? "active" : ""}`}
                    onClick={() => setStatus(m.userId, "present")}
                  >
                    <span className="btn-indicator">✓</span>
                    <span>Present</span>
                    <small className="btn-wage-hint">1.0x (₹{wage})</small>
                  </button>

                  <button
                    type="button"
                    className={`status-btn btn-half ${currentStatus === "half_day" ? "active" : ""}`}
                    onClick={() => setStatus(m.userId, "half_day")}
                  >
                    <span className="btn-indicator">½</span>
                    <span>Half Day</span>
                    <small className="btn-wage-hint">0.5x (₹{(wage * 0.5).toFixed(0)})</small>
                  </button>

                  <button
                    type="button"
                    className={`status-btn btn-absent ${currentStatus === "absent" ? "active" : ""}`}
                    onClick={() => setStatus(m.userId, "absent")}
                  >
                    <span className="btn-indicator">✕</span>
                    <span>Absent</span>
                    <small className="btn-wage-hint">0x (₹0)</small>
                  </button>

                  <button
                    type="button"
                    className={`status-btn btn-leave ${currentStatus === "leave" ? "active" : ""}`}
                    onClick={() => setStatus(m.userId, "leave")}
                  >
                    <span className="btn-indicator">○</span>
                    <span>Leave</span>
                    <small className="btn-wage-hint">0x</small>
                  </button>
                </div>

                {/* Note input */}
                <div className="row-notes-area">
                  <input
                    type="text"
                    className="row-note-input"
                    placeholder="Optional note (e.g. Left early, Overtime)…"
                    value={currentNotes}
                    onChange={(e) => setNotes(m.userId, e.target.value)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
