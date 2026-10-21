"use client";

import { useState } from "react";
import { membershipService, type Member } from "../lib/services";

interface Props {
  organizationId: number;
  members: Member[];
  onRefresh: () => void;
  onOpenAddModal: () => void;
}

export function RosterTab({ organizationId, members, onRefresh, onOpenAddModal }: Props) {
  const [search, setSearch] = useState("");
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null);
  const [editWage, setEditWage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionError, setActionError] = useState("");

  // Exclude owner from workers roster
  const workers = members.filter((m) => m.role !== "owner");

  const filteredMembers = workers.filter((m) => {
    const q = search.toLowerCase();
    return (
      (m.userName && m.userName.toLowerCase().includes(q)) ||
      (m.userPhone && m.userPhone.includes(q)) ||
      (m.role && m.role.toLowerCase().includes(q))
    );
  });

  const totalPayrollPerDay = workers.reduce((sum, m) => {
    return sum + (m.dailyWage ? parseFloat(m.dailyWage) : 0);
  }, 0);

  const startEdit = (m: Member) => {
    setEditingMemberId(m.id);
    setEditWage(m.dailyWage || "0");
    setActionError("");
  };

  const cancelEdit = () => {
    setEditingMemberId(null);
    setEditWage("");
  };

  const handleSaveWage = async (memberId: number) => {
    if (!editWage || isNaN(Number(editWage)) || Number(editWage) < 0) {
      setActionError("Please enter a valid amount");
      return;
    }

    setIsUpdating(true);
    setActionError("");
    try {
      await membershipService.update(memberId, {
        dailyWage: Number(editWage).toFixed(2),
      });
      setEditingMemberId(null);
      onRefresh();
    } catch (err: any) {
      setActionError(err?.response?.data?.error || "Failed to update wage");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async (member: Member) => {
    if (!confirm(`Are you sure you want to remove ${member.userName} from this group?`)) {
      return;
    }
    setActionError("");
    try {
      await membershipService.remove(member.id);
      onRefresh();
    } catch (err: any) {
      setActionError(err?.response?.data?.error || "Failed to remove member");
    }
  };

  return (
    <div className="tab-pane">
      {/* Top Banner Stats */}
      <div className="metrics-row">
        <div className="metric-card">
          <span className="metric-label">TOTAL WORKERS</span>
          <span className="metric-value">{workers.length}</span>
          <span className="metric-hint">Active roster members</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">DAILY PAYROLL CAPACITY</span>
          <span className="metric-value">₹{totalPayrollPerDay.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          <span className="metric-hint">If all present for full day</span>
        </div>

        <div className="metric-card action-metric-card">
          <span className="metric-label">QUICK ACTION</span>
          <button className="primary-button add-worker-btn" onClick={onOpenAddModal}>
            <span aria-hidden="true">+</span> Add Worker & Wage
          </button>
        </div>
      </div>

      {actionError && <div className="alert-banner error-banner">{actionError}</div>}

      {/* Search & Actions Bar */}
      <div className="section-toolbar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search by worker name, phone or role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear-search-btn" onClick={() => setSearch("")}>&times;</button>
          )}
        </div>
        <div className="toolbar-info">
          Showing <strong>{filteredMembers.length}</strong> of {workers.length} workers
        </div>
      </div>

      {/* Roster Table */}
      {filteredMembers.length === 0 ? (
        <div className="empty-state-box">
          <div className="empty-icon">👥</div>
          <h4>No workers found</h4>
          <p>
            {search
              ? "No worker matches your search term."
              : "No workers have been added to this group yet. Add your first worker with their daily wage!"}
          </p>
          {!search && (
            <button className="primary-button" onClick={onOpenAddModal}>
              + Add First Worker
            </button>
          )}
        </div>
      ) : (
        <div className="table-container">
          <table className="roster-table">
            <thead>
              <tr>
                <th>Worker</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Daily Wage Rate</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((m) => {
                const initials = (m.userName || "U")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase();

                const isEditing = editingMemberId === m.id;

                return (
                  <tr key={m.id}>
                    <td>
                      <div className="worker-cell">
                        <div className="worker-avatar">{initials}</div>
                        <div>
                          <div className="worker-name">{m.userName || "Unnamed Worker"}</div>
                          <div className="worker-subtext">ID #{m.userId}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="contact-text">{m.userPhone || m.userEmail || "—"}</div>
                    </td>
                    <td>
                      <span className={`role-badge role-${m.role}`}>
                        {m.role === "owner" ? "Owner" : m.role === "manager" ? "Supervisor" : "Worker"}
                      </span>
                    </td>
                    <td>
                      {isEditing ? (
                        <div className="wage-edit-wrapper">
                          <span className="currency-prefix">₹</span>
                          <input
                            type="number"
                            className="wage-edit-input"
                            value={editWage}
                            onChange={(e) => setEditWage(e.target.value)}
                            disabled={isUpdating}
                            autoFocus
                          />
                          <button
                            className="mini-action-btn save-btn"
                            onClick={() => handleSaveWage(m.id)}
                            disabled={isUpdating}
                            title="Save"
                          >
                            ✓
                          </button>
                          <button
                            className="mini-action-btn cancel-btn"
                            onClick={cancelEdit}
                            disabled={isUpdating}
                            title="Cancel"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="wage-display-wrapper">
                          <span className="wage-tag">
                            ₹{m.dailyWage ? parseFloat(m.dailyWage).toLocaleString("en-IN") : "0"}<small>/day</small>
                          </span>
                          {m.role !== "owner" && (
                            <button
                              className="edit-wage-btn"
                              onClick={() => startEdit(m)}
                              title="Change Daily Wage"
                            >
                              ✎
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="status-badge status-active">Active</span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {m.role !== "owner" && (
                        <button
                          className="danger-text-btn"
                          onClick={() => handleRemove(m)}
                          title="Remove from group"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
