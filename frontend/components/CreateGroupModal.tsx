"use client";

import { useState, type FormEvent } from "react";
import { organizationService, type Organization } from "../lib/services";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: (newOrg: Organization) => void;
}

export function CreateGroupModal({ isOpen, onClose, onGroupCreated }: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState("construction");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a group name");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const org = await organizationService.create({
        name: name.trim(),
        type,
        city: city.trim() || undefined,
        description: description.trim() || undefined,
      });

      setName("");
      setCity("");
      setDescription("");
      onGroupCreated(org);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || "Failed to create group");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="eyebrow">NEW GROUP</span>
            <h3>Create Attendance Group</h3>
          </div>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="alert-banner error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="group-name">Group / Team Name *</label>
            <input
              id="group-name"
              type="text"
              className="ui-input"
              placeholder="e.g. Site Alpha Workers, Shop Staff, Security Team"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="group-type">Category</label>
              <select
                id="group-type"
                className="ui-select"
                value={type}
                onChange={(e) => setType(e.target.value)}
                disabled={isLoading}
              >
                <option value="construction">Construction & Labor</option>
                <option value="factory">Factory & Manufacturing</option>
                <option value="retail">Retail & Shop</option>
                <option value="restaurant">Restaurant & Cafe</option>
                <option value="office">Office & Services</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="group-city">City / Location</label>
              <input
                id="group-city"
                type="text"
                className="ui-input"
                placeholder="e.g. Ranchi, Mumbai"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="group-desc">Description (Optional)</label>
            <textarea
              id="group-desc"
              className="ui-textarea"
              rows={2}
              placeholder="Short note about this group or project"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={isLoading}>
              {isLoading ? "Creating…" : "Create Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
