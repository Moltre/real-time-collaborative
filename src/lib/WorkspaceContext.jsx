import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWorkspaces = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const ws = await base44.entities.Workspace.list('-updated_date', 50);
      setWorkspaces(ws);
      const saved = localStorage.getItem('rtc_selected_workspace');
      if (saved && ws.find((w) => w.id === saved)) {
        setSelectedWorkspaceId(saved);
      } else if (ws.length > 0) {
        setSelectedWorkspaceId(ws[0].id);
      }
      // Load memberships for all workspaces
      if (ws.length > 0) {
        const ms = await base44.entities.WorkspaceMember.filter({
          workspace: { $in: ws.map((w) => w.id) },
        });
        setMemberships(ms);
      }
    } catch (e) {
      console.error('Failed to load workspaces', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

  const selectWorkspace = useCallback((id) => {
    setSelectedWorkspaceId(id);
    if (id) localStorage.setItem('rtc_selected_workspace', id);
  }, []);

  const selectedWorkspace = workspaces.find((w) => w.id === selectedWorkspaceId) || null;

  const userMembership = memberships.find(
    (m) => m.workspace === selectedWorkspaceId && m.user === user?.id
  );
  const userRole = userMembership?.role || null;

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        selectedWorkspaceId,
        selectedWorkspace,
        selectWorkspace,
        loading,
        refreshWorkspaces: loadWorkspaces,
        memberships,
        userRole,
        userMembership,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export const useWorkspace = () => {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
};