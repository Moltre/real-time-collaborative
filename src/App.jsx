import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Dashboard from '@/pages/Dashboard';
import Workspaces from '@/pages/Workspaces';
import WorkspaceDetail from '@/pages/WorkspaceDetail';
import BoardPage from '@/pages/BoardPage';
import Settings from '@/pages/Settings';
import MyTasks from '@/pages/MyTasks';
import ActivityFeed from '@/pages/ActivityFeed';
import Team from '@/pages/Team';
import Analytics from '@/pages/Analytics';
import Notifications from '@/pages/Notifications';
import Templates from '@/pages/Templates';
import CalendarView from '@/pages/CalendarView';
import Files from '@/pages/Files';
import Help from '@/pages/Help';
import Billing from '@/pages/Billing';
import ArchivedItems from '@/pages/ArchivedItems';
import Integrations from '@/pages/Integrations';
import NotificationPreferences from '@/pages/NotificationPreferences';
import SystemStatus from '@/pages/SystemStatus';
import GlobalSearch from '@/pages/GlobalSearch';
import KeyboardShortcuts from '@/pages/KeyboardShortcuts';
import WorkspaceFeedback from '@/pages/WorkspaceFeedback';
import DataExport from '@/pages/DataExport';
import HelpCenter from '@/pages/HelpCenter';
import TaskArchive from '@/pages/TaskArchive';
import UserProfile from '@/pages/UserProfile';
import WorkspaceUsage from '@/pages/WorkspaceUsage';
import SecurityLog from '@/pages/SecurityLog';
import InviteMembers from '@/pages/InviteMembers';
import WorkspaceLabels from '@/pages/WorkspaceLabels';
import BoardFolders from '@/pages/BoardFolders';
import ApiKeys from '@/pages/ApiKeys';
import SavedFilters from '@/pages/SavedFilters';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError?.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/workspaces" element={<Workspaces />} />
          <Route path="/workspaces/:id" element={<WorkspaceDetail />} />
          <Route path="/boards/:boardId" element={<BoardPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/my-tasks" element={<MyTasks />} />
          <Route path="/activity-feed" element={<ActivityFeed />} />
          <Route path="/team" element={<Team />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/files" element={<Files />} />
          <Route path="/help" element={<Help />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/archived-items" element={<ArchivedItems />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/notifications-settings" element={<NotificationPreferences />} />
          <Route path="/status" element={<SystemStatus />} />
          <Route path="/search" element={<GlobalSearch />} />
          <Route path="/shortcuts" element={<KeyboardShortcuts />} />
          <Route path="/feedback" element={<WorkspaceFeedback />} />
          <Route path="/export" element={<DataExport />} />
          <Route path="/help-center" element={<HelpCenter />} />
          <Route path="/archive" element={<TaskArchive />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/usage-limits" element={<WorkspaceUsage />} />
          <Route path="/security" element={<SecurityLog />} />
          <Route path="/invite-members" element={<InviteMembers />} />
          <Route path="/workspace-labels" element={<WorkspaceLabels />} />
          <Route path="/board-folders" element={<BoardFolders />} />
          <Route path="/api-keys" element={<ApiKeys />} />
          <Route path="/saved-filters" element={<SavedFilters />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App