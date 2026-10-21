"use client";

import { type Organization, type User } from "../lib/services";

interface Props {
  user: User | { name?: string | null; email?: string | null };
  organizations: Organization[];
  activeOrg: Organization | null;
  activeTab: "attendance" | "roster" | "wages";
  onSelectOrg: (org: Organization) => void;
  onOpenCreateGroup: () => void;
  onTabChange: (tab: "attendance" | "roster" | "wages") => void;
  onSignOut: () => void;
}

export function Header({
  user,
  organizations,
  activeOrg,
  activeTab,
  onSelectOrg,
  onOpenCreateGroup,
  onTabChange,
  onSignOut,
}: Props) {
  const userInitials = (user.name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <header className="app-header no-print">
      <div className="header-inner">
        {/* Brand & Group Selector */}
        <div className="header-left">
          <div className="brand brand-dark">
            <span className="brand-mark" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </span>
            <span className="brand-title">hajri</span>
          </div>

          <div className="group-switcher-wrapper">
            <span className="group-label">GROUP:</span>
            {organizations.length > 0 ? (
              <select
                className="group-select"
                value={activeOrg?.id || ""}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  const found = organizations.find((o) => o.id === id);
                  if (found) onSelectOrg(found);
                }}
              >
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name} {org.city ? `(${org.city})` : ""}
                  </option>
                ))}
              </select>
            ) : (
              <span className="no-groups-hint">No groups yet</span>
            )}

            <button
              className="new-group-btn"
              onClick={onOpenCreateGroup}
              title="Create new attendance group"
            >
              + New Group
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="header-nav">
          <button
            className={`nav-tab-btn ${activeTab === "attendance" ? "active" : ""}`}
            onClick={() => onTabChange("attendance")}
          >
            <span className="nav-icon">📋</span>
            <span>Take Attendance</span>
          </button>

          <button
            className={`nav-tab-btn ${activeTab === "roster" ? "active" : ""}`}
            onClick={() => onTabChange("roster")}
          >
            <span className="nav-icon">👥</span>
            <span>Workers & Wages</span>
          </button>

          <button
            className={`nav-tab-btn ${activeTab === "wages" ? "active" : ""}`}
            onClick={() => onTabChange("wages")}
          >
            <span className="nav-icon">📊</span>
            <span>Monthly Wage Report</span>
          </button>
        </nav>

        {/* User Badge & Sign Out */}
        <div className="header-right">
          <div className="user-profile-badge">
            <div className="user-avatar-circle">{userInitials}</div>
            <div className="user-text-box">
              <span className="user-display-name">{user.name || "User"}</span>
              <span className="user-display-role">{user.email || ""}</span>
            </div>
          </div>
          <button className="signout-button" onClick={onSignOut} title="Sign Out">
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
