"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "./Header";
import { AttendanceTab } from "./AttendanceTab";
import { RosterTab } from "./RosterTab";
import { WageReportTab } from "./WageReportTab";
import { CreateGroupModal } from "./CreateGroupModal";
import { AddWorkerModal } from "./AddWorkerModal";
import {
  organizationService,
  membershipService,
  type Organization,
  type Member,
  type User,
} from "../lib/services";

interface Props {
  user: User | { name?: string | null; email?: string | null };
  onSignOut: () => void;
}

export function Dashboard({ user, onSignOut }: Props) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeOrg, setActiveOrg] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [activeTab, setActiveTab] = useState<"attendance" | "roster" | "wages">("attendance");

  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [error, setError] = useState("");

  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false);

  // Load user organizations
  const loadOrganizations = useCallback(async () => {
    setIsLoadingOrgs(true);
    setError("");
    try {
      const orgs = await organizationService.list();
      setOrganizations(orgs);
      if (orgs.length > 0) {
        // Keep activeOrg if still exists, or default to first
        setActiveOrg((prev) => (prev ? orgs.find((o) => o.id === prev.id) || orgs[0] : orgs[0]));
      } else {
        setActiveOrg(null);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || "Failed to load organizations");
    } finally {
      setIsLoadingOrgs(false);
    }
  }, []);

  // Load members for active org
  const loadMembers = useCallback(async (orgId: number) => {
    setIsLoadingMembers(true);
    try {
      const data = await membershipService.list(orgId);
      setMembers(data);
    } catch (err: any) {
      console.error("Failed to load members:", err);
    } finally {
      setIsLoadingMembers(false);
    }
  }, []);

  useEffect(() => {
    loadOrganizations();
  }, [loadOrganizations]);

  useEffect(() => {
    if (activeOrg) {
      loadMembers(activeOrg.id);
    } else {
      setMembers([]);
    }
  }, [activeOrg, loadMembers]);

  const handleGroupCreated = (newOrg: Organization) => {
    setOrganizations((prev) => [...prev, newOrg]);
    setActiveOrg(newOrg);
  };

  const handleWorkerAdded = () => {
    if (activeOrg) {
      loadMembers(activeOrg.id);
    }
  };

  return (
    <div className="dashboard-container">
      <Header
        user={user}
        organizations={organizations}
        activeOrg={activeOrg}
        activeTab={activeTab}
        onSelectOrg={(org) => setActiveOrg(org)}
        onOpenCreateGroup={() => setIsCreateGroupOpen(true)}
        onTabChange={(tab) => setActiveTab(tab)}
        onSignOut={onSignOut}
      />

      <main className="dashboard-main">
        {error && <div className="alert-banner error-banner">{error}</div>}

        {isLoadingOrgs ? (
          <div className="loading-box full-height">
            <span className="spinner" />
            <span>Loading your groups…</span>
          </div>
        ) : organizations.length === 0 ? (
          <div className="welcome-onboarding-card">
            <div className="onboarding-icon">🏢</div>
            <h2>Welcome to Hajri!</h2>
            <p>
              To start taking attendance and calculating wages, create your first group (e.g. your construction site, shop team, or factory unit).
            </p>
            <button className="primary-button large-btn" onClick={() => setIsCreateGroupOpen(true)}>
              + Create Your First Group
            </button>
          </div>
        ) : !activeOrg ? (
          <div className="welcome-onboarding-card">
            <p>Please select a group above to continue.</p>
          </div>
        ) : (
          <div className="tab-content-wrapper">
            {isLoadingMembers ? (
              <div className="loading-box">
                <span className="spinner" />
                <span>Loading team roster…</span>
              </div>
            ) : (
              <>
                {activeTab === "attendance" && (
                  <AttendanceTab organizationId={activeOrg.id} members={members} />
                )}

                {activeTab === "roster" && (
                  <RosterTab
                    organizationId={activeOrg.id}
                    members={members}
                    onRefresh={() => loadMembers(activeOrg.id)}
                    onOpenAddModal={() => setIsAddWorkerOpen(true)}
                  />
                )}

                {activeTab === "wages" && (
                  <WageReportTab organizationId={activeOrg.id} />
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onGroupCreated={handleGroupCreated}
      />

      {activeOrg && (
        <AddWorkerModal
          isOpen={isAddWorkerOpen}
          organizationId={activeOrg.id}
          onClose={() => setIsAddWorkerOpen(false)}
          onWorkerAdded={handleWorkerAdded}
        />
      )}
    </div>
  );
}
