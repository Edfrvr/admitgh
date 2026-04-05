"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Loader2, CheckCircle2 } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "signin" | "signup";

interface FormFields {
  name: string;
  email: string;
  password: string;
}

const EMPTY_FORM: FormFields = { name: "", email: "", password: "" };

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [form, setForm] = useState<FormFields>(EMPTY_FORM);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  function handleField(field: keyof FormFields) {
    return (e: ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (error) setError("");
    };
  }

  function switchMode(next: AuthMode) {
    setMode(next);
    setForm(EMPTY_FORM);
    setError("");
    setEmailSent(false);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signup") {
        await handleSignUp();
      } else {
        await handleSignIn();
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp() {
    const supabase = createClient();
    const name = form.name.trim();
    if (name.length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }
    if (!form.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email.trim().toLowerCase(),
      password: form.password,
    });

    if (authError) {
      setError(authError.message);
      return;
    }

    if (data.user) {
      // Create the profile row immediately
      await supabase.from("profiles").upsert({
        id: data.user.id,
        name,
        program: null,
        electives: [],
        grades: {},
        applied: {},
      });

      if (data.session) {
        // Email confirmation is disabled — user is signed in immediately
        router.push("/dashboard");
      } else {
        // Email confirmation required — prompt the user to check their inbox
        setEmailSent(true);
      }
    }
  }

  async function handleSignIn() {
    const supabase = createClient();
    if (!form.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!form.password) {
      setError("Please enter your password.");
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: form.email.trim().toLowerCase(),
      password: form.password,
    });

    if (authError) {
      setError(
        authError.message === "Invalid login credentials"
          ? "Incorrect email or password."
          : authError.message
      );
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  // ── Email-sent confirmation screen ────────────────────────────────────────
  if (emailSent) {
    return (
      <PageShell>
        <div style={{ textAlign: "center" }}>
          <CheckCircle2 size={44} color="#4ade80" style={{ marginBottom: 20 }} />
          <h1
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: 24,
              fontWeight: 800,
              color: "#faf5ef",
              margin: "0 0 10px",
            }}
          >
            Check your inbox
          </h1>
          <p style={{ color: "#a09080", fontSize: 14, lineHeight: 1.7, margin: "0 0 28px" }}>
            We sent a confirmation link to{" "}
            <strong style={{ color: "#faf5ef" }}>{form.email}</strong>. Click it
            to activate your account.
          </p>
          <button
            onClick={() => switchMode("signin")}
            style={{
              background: "none",
              border: "none",
              color: "#fbbf24",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Back to Sign In →
          </button>
        </div>
      </PageShell>
    );
  }

  // ── Main auth form ────────────────────────────────────────────────────────
  return (
    <PageShell>
      {/* Logo */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
        <Logo size={42} showWordmark />
      </div>

      {/* Tab switcher */}
      <div
        style={{
          display: "flex",
          background: "rgba(255,255,255,0.04)",
          borderRadius: 10,
          padding: 3,
          marginBottom: 28,
          gap: 2,
        }}
      >
        {(["signin", "signup"] as AuthMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => switchMode(m)}
            style={{
              flex: 1,
              padding: "8px 0",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "inherit",
              transition: "all 0.15s",
              background: mode === m ? "rgba(251,191,36,0.12)" : "transparent",
              color: mode === m ? "#fbbf24" : "#666",
            }}
          >
            {m === "signin" ? "Sign In" : "Create Account"}
          </button>
        ))}
      </div>

      {/* Heading */}
      <h1
        style={{
          fontFamily: "var(--font-playfair)",
          fontSize: 24,
          fontWeight: 800,
          color: "#faf5ef",
          textAlign: "center",
          margin: "0 0 6px",
        }}
      >
        {mode === "signin" ? "Welcome back" : "Start your journey"}
      </h1>
      <p style={{ textAlign: "center", color: "#666", fontSize: 13, margin: "0 0 28px" }}>
        {mode === "signin"
          ? "Sign in to your AdmitGH account."
          : "Create a free account to track your applications."}
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate>
        {mode === "signup" && (
          <Field
            id="name"
            label="Full Name"
            type="text"
            value={form.name}
            onChange={handleField("name")}
            placeholder="e.g. Kwame Asante"
            autoComplete="name"
            icon={<User size={14} color="#555" />}
            autoFocus
          />
        )}

        <Field
          id="email"
          label="Email Address"
          type="email"
          value={form.email}
          onChange={handleField("email")}
          placeholder="you@example.com"
          autoComplete={mode === "signin" ? "username" : "email"}
          icon={<Mail size={14} color="#555" />}
          autoFocus={mode === "signin"}
        />

        <Field
          id="password"
          label="Password"
          type="password"
          value={form.password}
          onChange={handleField("password")}
          placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          icon={<Lock size={14} color="#555" />}
        />

        {error && (
          <p
            style={{
              color: "#ef4444",
              fontSize: 12,
              margin: "-4px 0 16px",
              padding: "8px 12px",
              background: "rgba(239,68,68,0.08)",
              borderRadius: 8,
              border: "1px solid rgba(239,68,68,0.15)",
            }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "13px",
            borderRadius: 10,
            border: "none",
            background: loading
              ? "rgba(251,191,36,0.4)"
              : "linear-gradient(135deg, #fbbf24, #d97706)",
            color: "#0f0d0b",
            fontSize: 15,
            fontWeight: 800,
            fontFamily: "inherit",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "opacity 0.15s",
          }}
        >
          {loading && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}
          {loading
            ? mode === "signup"
              ? "Creating account…"
              : "Signing in…"
            : mode === "signup"
            ? "Create Account →"
            : "Sign In →"}
        </button>
      </form>

      {/* Footer */}
      <p style={{ textAlign: "center", color: "#444", fontSize: 12, marginTop: 20 }}>
        {mode === "signin" ? (
          <>
            No account?{" "}
            <button
              type="button"
              onClick={() => switchMode("signup")}
              style={{
                background: "none",
                border: "none",
                color: "#fbbf24",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                padding: 0,
              }}
            >
              Create one free →
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => switchMode("signin")}
              style={{
                background: "none",
                border: "none",
                color: "#fbbf24",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                padding: 0,
              }}
            >
              Sign in →
            </button>
          </>
        )}
      </p>
    </PageShell>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f0d0b",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      {/* Subtle radial glow */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500,
          height: 300,
          background:
            "radial-gradient(ellipse at center, rgba(251,191,36,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 18,
          padding: "40px 32px",
          position: "relative",
        }}
      >
        {children}
      </div>
    </div>
  );
}

interface FieldProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  autoComplete: string;
  icon: React.ReactNode;
  autoFocus?: boolean;
}

function Field({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  icon,
  autoFocus,
}: FieldProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label
        htmlFor={id}
        style={{
          display: "block",
          fontSize: 11,
          fontWeight: 700,
          color: "#a09080",
          textTransform: "uppercase",
          letterSpacing: 0.8,
          marginBottom: 7,
        }}
      >
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <span
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            pointerEvents: "none",
          }}
        >
          {icon}
        </span>
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus={autoFocus}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10,
            color: "#faf5ef",
            fontSize: 14,
            padding: "11px 14px 11px 36px",
            outline: "none",
            boxSizing: "border-box",
            fontFamily: "inherit",
            transition: "border-color 0.15s",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "rgba(251,191,36,0.35)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
          }}
        />
      </div>
    </div>
  );
}
