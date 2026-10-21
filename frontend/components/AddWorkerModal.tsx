"use client";

import { useState, type FormEvent } from "react";
import { membershipService, type Member } from "../lib/services";

interface Props {
  isOpen: boolean;
  organizationId: number;
  onClose: () => void;
  onWorkerAdded: (newMember: Member) => void;
}

export function AddWorkerModal({ isOpen, organizationId, onClose, onWorkerAdded }: Props) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [dailyWage, setDailyWage] = useState("500");
  const [role, setRole] = useState("employee");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter the worker's name");
      return;
    }
    if (!dailyWage || isNaN(Number(dailyWage)) || Number(dailyWage) < 0) {
      setError("Please enter a valid daily salary/wage rate in ₹");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const member = await membershipService.add({
        organizationId,
        name: name.trim(),
        age: age ? Number(age) : undefined,
        phone: phone.trim() || undefined,
        dailyWage: Number(dailyWage).toFixed(2),
        role,
      });

      setName("");
      setAge("");
      setPhone("");
      setDailyWage("500");
      onWorkerAdded(member);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.response?.data?.details || err.message || "Failed to add worker");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="eyebrow">ROSTER</span>
            <h3>Add Worker to Group</h3>
            <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#63756c" }}>
              Workers don&apos;t need to log in or download the app. You track them here.
            </p>
          </div>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="alert-banner error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="worker-name">Worker Name *</label>
            <input
              id="worker-name"
              type="text"
              className="ui-input"
              placeholder="e.g. Ramesh Kumar, Chhotu, Sunita Devi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              required
              autoFocus
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="worker-wage">Daily Salary / Wage (₹ / Day) *</label>
              <div className="currency-input-wrapper">
                <span className="currency-symbol">₹</span>
                <input
                  id="worker-wage"
                  type="number"
                  min="0"
                  step="10"
                  className="ui-input currency-input"
                  placeholder="500"
                  value={dailyWage}
                  onChange={(e) => setDailyWage(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="worker-age">Age (Optional)</label>
              <input
                id="worker-age"
                type="number"
                min="14"
                max="90"
                className="ui-input"
                placeholder="e.g. 28"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="worker-phone">Phone Number (Optional)</label>
              <input
                id="worker-phone"
                type="tel"
                className="ui-input"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="worker-role">Role (Optional)</label>
              <select
                id="worker-role"
                className="ui-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={isLoading}
              >
                <option value="employee">Worker / Laborer</option>
                <option value="manager">Supervisor / Head</option>
                <option value="member">General Staff</option>
              </select>
            </div>
          </div>

          <div className="info-box">
            💡 At month end, this person&apos;s payout will be: <strong>(Days Present × ₹{dailyWage || 0}) + (Half Days × ₹{(Number(dailyWage || 0) * 0.5).toFixed(0)})</strong>.
          </div>

          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={isLoading}>
              {isLoading ? "Adding…" : "Add Worker"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
