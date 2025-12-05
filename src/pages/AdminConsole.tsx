import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { ExternalLink, ShieldCheck, Home, ArrowLeft, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const DEFAULT_JIRA_URL =
  "https://www.atlassian.com";

export const AdminConsole: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const jiraDashboardUrl = import.meta.env.VITE_JIRA_DASHBOARD_URL || DEFAULT_JIRA_URL;

  const openJira = () => {
    window.open(jiraDashboardUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_rgba(2,6,23,0.9))]"
        aria-hidden="true"
      />
      <div className="relative z-10 px-6 py-8 lg:py-16">
        <div className="max-w-4xl mx-auto space-y-10">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <header className="space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Admin Console</p>
            <h1 className="text-3xl lg:text-4xl font-semibold leading-tight text-white">
              Welcome, {user?.displayName || user?.email}
            </h1>
            <p className="text-slate-300 text-lg">
              Choose where you&apos;d like to work next. Both destinations require your administrator
              privileges and open in secure contexts.
            </p>
          </header>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <article className="rounded-3xl border border-sky-400/40 bg-sky-400/5 p-6 backdrop-blur flex flex-col gap-4">
              <div className="space-y-2">
                <p className="text-sky-100 text-sm uppercase tracking-[0.2em]">Jira</p>
                <h2 className="text-2xl font-semibold">Deal escalations board</h2>
                <p className="text-slate-200 text-sm">
                  Jump straight into the SCRUM board where partner and diner escalations are triaged in
                  real time.
                </p>
              </div>
              <button
                type="button"
                onClick={openJira}
                className="mt-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-300/60 bg-sky-400/10 px-4 py-3 text-sm font-medium text-sky-50 hover:bg-sky-400/20 transition-colors"
              >
                Open Jira dashboard <ExternalLink className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-slate-400 break-all">{jiraDashboardUrl}</p>
            </article>

            <article className="rounded-3xl border border-purple-400/40 bg-purple-400/5 p-6 backdrop-blur flex flex-col gap-4">
              <div className="space-y-2">
                <p className="text-purple-100 text-sm uppercase tracking-[0.2em]">Users</p>
                <h2 className="text-2xl font-semibold">User Management</h2>
                <p className="text-slate-200 text-sm">
                  View all registered users, manage their status, and handle bans or suspensions.
                </p>
              </div>
              <Link
                to="/admin/users"
                className="mt-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-purple-300/60 bg-purple-400/10 px-4 py-3 text-sm font-medium text-purple-50 hover:bg-purple-400/20 transition-colors"
              >
                Manage Users <Users className="w-4 h-4" />
              </Link>
            </article>

            <article className="rounded-3xl border border-emerald-400/40 bg-emerald-400/5 p-6 backdrop-blur flex flex-col gap-4">
              <div className="space-y-2">
                <p className="text-emerald-100 text-sm uppercase tracking-[0.2em]">FoodBargain</p>
                <h2 className="text-2xl font-semibold">Return to main app</h2>
                <p className="text-slate-200 text-sm">
                  Continue working inside the core FoodBargain experience while staying signed in as an
                  administrator.
                </p>
              </div>
              <Link
                to="/"
                className="mt-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-300/60 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-50 hover:bg-emerald-400/20 transition-colors"
              >
                Go to FoodBargain <Home className="w-4 h-4" />
              </Link>
            </article>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 flex items-center gap-4">
            <ShieldCheck className="w-6 h-6 text-emerald-300" />
            <div className="text-sm text-slate-300">
              <p className="text-white font-semibold">Access verified</p>
              <p className="text-slate-400">
                This page is available only to FoodBargain staff flagged as administrators. Keep your
                credentials safe and sign out when leaving shared devices.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminConsole;
