import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SignIn } from "@clerk/clerk-react";
import {
  ShieldCheck,
  ArrowLeft,
  AlertTriangle,
  ExternalLink,
  Loader2,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const DEFAULT_JIRA_URL =
  "https://www.atlassian.com";

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const jiraDashboardUrl = import.meta.env.VITE_JIRA_DASHBOARD_URL || DEFAULT_JIRA_URL;
  const isAdmin = Boolean(user?.isAdmin);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate("/admin/console", { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const openJiraDashboard = () => {
    window.open(jiraDashboardUrl, "_blank", "noopener,noreferrer");
  };

  const renderAccessContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/5 bg-slate-900/60 p-6 text-sm text-slate-300">
          <Loader2 className="h-5 w-5 animate-spin text-slate-200" />
          <p>Checking your admin status...</p>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-6 backdrop-blur">
          <div className="flex items-start gap-3 text-slate-300">
            <ShieldCheck className="w-5 h-5 text-emerald-300" />
            <div>
              <p className="font-medium text-white">Sign in with your admin account</p>
              <p className="text-sm text-slate-400">
                Only accounts flagged as administrators in FoodBargain can review Jira escalations.
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <SignIn
              routing="virtual"
              fallbackRedirectUrl="/admin/console"
              forceRedirectUrl="/admin/console"
              appearance={{
                elements: {
                  rootBox: "w-full flex justify-center",
                  card: "bg-transparent shadow-none border-0 px-0 w-full max-w-md",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  formButtonPrimary:
                    "bg-emerald-500 hover:bg-emerald-400 text-white font-medium border-0",
                  formFieldInput:
                    "bg-slate-800 border border-slate-700 text-white focus:border-emerald-400",
                  formFieldLabel: "text-slate-300",
                  footerActionText: "text-slate-400",
                  footerActionLink: "text-emerald-300 hover:text-emerald-200",
                  dividerText: "text-slate-500",
                  dividerLine: "bg-slate-800",
                },
              }}
            />
          </div>
        </div>
      );
    }

    if (isAdmin) {
      return (
        <div className="space-y-4 rounded-2xl border border-emerald-400/40 bg-emerald-400/10 p-6">
          <div className="flex items-start gap-3 text-emerald-100">
            <ShieldCheck className="w-5 h-5" />
            <div>
              <p className="font-semibold text-white">Access granted</p>
              <p className="text-sm">
                {user?.email || "Your account"} is verified as an administrator. Continue to the
                Jira dashboard to triage live reports.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openJiraDashboard}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-400/60 bg-sky-400/10 px-4 py-3 text-sm font-medium text-sky-100 hover:bg-sky-400/20 transition-colors"
          >
            Continue to Jira board <ExternalLink className="w-4 h-4" />
          </button>
          <p className="text-xs text-emerald-100/70 break-all">
            Destination: {jiraDashboardUrl}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4 rounded-2xl border border-rose-400/40 bg-rose-500/10 p-6">
        <div className="flex items-start gap-3 text-rose-100">
          <AlertTriangle className="w-5 h-5" />
          <div>
            <p className="font-semibold text-white">Access restricted</p>
            <p className="text-sm text-rose-50/80">
              {user?.email || "This account"} is signed in but does not have admin privileges. Use a
              FoodBargain admin identity provisioned by the security team.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => logout()}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign out and switch accounts
        </button>
      </div>
    );
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
            <ArrowLeft className="w-4 h-4" /> Back to app
          </button>

          <header className="space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Admin Console</p>
            <h1 className="text-3xl lg:text-4xl font-semibold leading-tight text-white">
              Secure access to Jira-synced FoodBargain escalations
            </h1>
            <p className="text-slate-300 text-lg">
              Only FoodBargain staff accounts that have been marked as administrators can authenticate
              here. Once verified, you will be deep-linked into the Jira Scrum board to review
              escalations in real time.
            </p>
          </header>

          <section className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
            <article className="rounded-3xl border border-white/5 bg-slate-900/50 p-8 backdrop-blur">
              <div className="space-y-4 text-slate-300">
                <p className="text-sm font-medium text-slate-200">What to expect</p>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-300 mt-0.5" />
                    <span>Sign in with Clerk, then we confirm your admin flag via the FoodBargain API.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-300 mt-0.5" />
                    <span>Verified admins get a direct button to the Jira dashboard specified in environment configuration.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-300 mt-0.5" />
                    <span>Non-admin accounts are blocked and prompted to switch credentials.</span>
                  </li>
                </ul>
                <p className="text-xs text-slate-500">
                  Need access? Contact the FoodBargain security group with your Clerk user ID for approval.
                </p>
              </div>
            </article>

            <article className="space-y-4">
              {renderAccessContent()}
            </article>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
