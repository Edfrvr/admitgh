"use client";

import {
  useState,
  useEffect,
  type FormEvent,
  type ChangeEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  User,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import Logo from "@/components/ui/Logo";
import { createClient } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

type AuthMode = "signin" | "signup";

interface Fields {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

interface PasswordReqs {
  length: boolean;
  upper: boolean;
  lower: boolean;
  number: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const EMPTY_FIELDS: Fields = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function getPasswordReqs(pw: string): PasswordReqs {
  return {
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    number: /[0-9]/.test(pw),
  };
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

function mapAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials") || m.includes("invalid credentials")) {
    return "Incorrect email or password. Please try again.";
  }
  if (m.includes("rate limit") || m.includes("too many") || m.includes("email rate limit")) {
    return "Too many attempts. Please wait a few minutes and try again.";
  }
  if (m.includes("email not confirmed")) {
    return "Please confirm your email address before signing in.";
  }
  if (m.includes("already registered") || m.includes("already been registered")) {
    return "An account with this email already exists. Try signing in instead.";
  }
  return message;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AuthPage() {
  const router = useRouter();

  const [mode, setMode] = useState<AuthMode>("signin");
  const [fields, setFields] = useState<Fields>(EMPTY_FIELDS);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const pwReqs = getPasswordReqs(fields.password);
  const allPwReqsMet =
    pwReqs.length && pwReqs.upper && pwReqs.lower && pwReqs.number;

  // ── Redirect if already authenticated ─────────────────────────────────────
  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/dashboard");
    });
  }, [router]);

  // ── Field change handler ───────────────────────────────────────────────────
  function setField(key: keyof Fields) {
    return (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFields((prev) => ({ ...prev, [key]: value }));
      if (globalError) setGlobalError("");
      if (key === "password") setPasswordTouched(true);

      setFieldErrors((prev) => {
        const next = { ...prev, [key]: undefined };
        // Re-validate confirm password live as password changes
        if (key === "password" && fields.confirmPassword) {
          next.confirmPassword =
            fields.confirmPassword !== value
              ? "Passwords do not match."
              : undefined;
        }
        return next;
      });
    };
  }

  // ── Mode switch ───────────────────────────────────────────────────────────
  function switchMode(next: AuthMode) {
    setMode(next);
    setFields(EMPTY_FIELDS);
    setFieldErrors({});
    setGlobalError("");
    setEmailSent(false);
    setPasswordTouched(false);
    setShowPassword(false);
    setShowConfirm(false);
  }

  // ── Email blur validation ──────────────────────────────────────────────────
  function handleEmailBlur() {
    if (!fields.email) {
      setFieldErrors((prev) => ({
        ...prev,
        email: "Email address is required.",
      }));
    } else if (!isValidEmail(fields.email)) {
      setFieldErrors((prev) => ({
        ...prev,
        email: "Please enter a valid email address.",
      }));
    }
  }

  // ── Confirm password blur validation ──────────────────────────────────────
  function handleConfirmBlur() {
    if (fields.confirmPassword && fields.confirmPassword !== fields.password) {
      setFieldErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match.",
      }));
    }
  }

  // ── Full form validation before submit ────────────────────────────────────
  function validateForm(): boolean {
    const errors: FieldErrors = {};

    if (mode === "signup") {
      const name = fields.name.trim();
      if (!name || name.length < 2) {
        errors.name = "Full name must be at least 2 characters.";
      }
    }

    if (!fields.email.trim()) {
      errors.email = "Email address is required.";
    } else if (!isValidEmail(fields.email)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!fields.password) {
      errors.password = "Password is required.";
    } else if (mode === "signup" && !allPwReqsMet) {
      errors.password = "Password does not meet all requirements.";
    }

    if (mode === "signup") {
      if (!fields.confirmPassword) {
        errors.confirmPassword = "Please confirm your password.";
      } else if (fields.confirmPassword !== fields.password) {
        errors.confirmPassword = "Passwords do not match.";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validateForm()) return;

    setGlobalError("");
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

    const { data, error } = await supabase.auth.signUp({
      email: fields.email.trim().toLowerCase(),
      password: fields.password,
    });

    if (error) {
      setGlobalError(mapAuthError(error.message));
      return;
    }

    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        name: fields.name.trim(),
        program: null,
        electives: [],
        grades: {},
        applied: {},
      });

      if (data.session) {
        // Email confirmation disabled — go straight to dashboard
        router.push("/dashboard");
      } else {
        // Email confirmation required
        setEmailSent(true);
      }
    }
  }

  async function handleSignIn() {
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: fields.email.trim().toLowerCase(),
      password: fields.password,
    });

    if (error) {
      setGlobalError(mapAuthError(error.message));
      return;
    }

    router.push("/dashboard");
  }

  // ── Email-sent confirmation screen ────────────────────────────────────────
  if (emailSent) {
    return (
      <PageShell>
        <div style={{ textAlign: "center" }}>
          <CheckCircle2
            size={48}
            color="#4ade80"
            style={{ marginBottom: 20 }}
          />
          <h1
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: 22,
              fontWeight: 800,
              color: "#faf5ef",
              margin: "0 0 10px",
            }}
          >
            Check your inbox
          </h1>
          <p
            style={{
              color: "#7a6a5a",
              fontSize: 14,
              lineHeight: 1.7,
              margin: "0 0 28px",
            }}
          >
            We sent a confirmation link to{" "}
            <strong style={{ color: "#faf5ef" }}>{fields.email}</strong>. Click
            it to activate your account, then sign in.
          </p>
          <button
            onClick={() => switchMode("signin")}
            style={{
              background: "none",
              border: "none",
              color: "#fbbf24",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              padding: 0,
            }}
          >
            Back to Sign In →
          </button>
        </div>
      </PageShell>
    );
  }

  // ── Main form ─────────────────────────────────────────────────────────────
  return (
    <PageShell>
      {/* Logo */}
      <div
        style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}
      >
        <Logo size={40} showWordmark />
      </div>

      {/* Mode tabs */}
      <div
        role="tablist"
        style={{
          display: "flex",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.06)",
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
            role="tab"
            aria-selected={mode === m}
            onClick={() => switchMode(m)}
            style={{
              flex: 1,
              padding: "9px 0",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "inherit",
              transition: "background 0.15s, color 0.15s",
              background:
                mode === m ? "rgba(251,191,36,0.14)" : "transparent",
              color: mode === m ? "#fbbf24" : "#7a6a5a",
          minHeight: 44,
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
          fontSize: 22,
          fontWeight: 800,
          color: "#faf5ef",
          textAlign: "center",
          margin: "0 0 5px",
          letterSpacing: "-0.02em",
        }}
      >
        {mode === "signin" ? "Welcome back" : "Start your journey"}
      </h1>
      <p
        style={{
          textAlign: "center",
          color: "#5a4a3a",
          fontSize: 13,
          margin: "0 0 24px",
          lineHeight: 1.5,
        }}
      >
        {mode === "signin"
          ? "Sign in to your AdmitGH account."
          : "Create a free account to track your applications."}
      </p>

      {/* Global error banner */}
      {globalError && (
        <div
          role="alert"
          style={{
            padding: "10px 14px",
            marginBottom: 20,
            borderRadius: 9,
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 14,
              flexShrink: 0,
              marginTop: 1,
              color: "#ef4444",
            }}
          >
            ✕
          </span>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: "#ef4444",
              lineHeight: 1.5,
            }}
          >
            {globalError}
          </p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate>
        {/* Full name — signup only */}
        {mode === "signup" && (
          <Field
            id="name"
            label="Full Name"
            type="text"
            value={fields.name}
            onChange={setField("name")}
            placeholder="e.g. Kwame Asante"
            autoComplete="name"
            icon={<User size={15} color="#555" />}
            error={fieldErrors.name}
            autoFocus
          />
        )}

        {/* Email */}
        <Field
          id="email"
          label="Email Address"
          type="email"
          value={fields.email}
          onChange={setField("email")}
          onBlur={handleEmailBlur}
          placeholder="you@example.com"
          autoComplete={mode === "signin" ? "username" : "email"}
          icon={<Mail size={15} color="#555" />}
          error={fieldErrors.email}
          autoFocus={mode === "signin"}
        />

        {/* Password */}
        <Field
          id="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          value={fields.password}
          onChange={setField("password")}
          placeholder={mode === "signup" ? "Min. 8 characters" : "Your password"}
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          icon={<Lock size={15} color="#555" />}
          error={fieldErrors.password}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 2,
                display: "flex",
                color: "#555",
                lineHeight: 1,
              }}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
        />

        {/* Password requirements — signup, after first keystroke */}
        {mode === "signup" && passwordTouched && (
          <div
            style={{
              marginBottom: 16,
              padding: "10px 14px",
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 9,
            }}
          >
            <p
              style={{
                margin: "0 0 8px",
                fontSize: 10,
                fontWeight: 700,
                color: "#555",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Requirements
            </p>
            <div
              style={{ display: "flex", flexDirection: "column", gap: 5 }}
            >
              {(
                [
                  { key: "length", label: "At least 8 characters", met: pwReqs.length },
                  { key: "upper", label: "One uppercase letter (A–Z)", met: pwReqs.upper },
                  { key: "lower", label: "One lowercase letter (a–z)", met: pwReqs.lower },
                  { key: "number", label: "One number (0–9)", met: pwReqs.number },
                ] as const
              ).map(({ key, label, met }) => (
                <div
                  key={key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                  }}
                >
                  <Check
                    size={12}
                    strokeWidth={3}
                    color={met ? "#4ade80" : "#333"}
                  />
                  <span
                    style={{
                      fontSize: 12,
                      color: met ? "#4ade80" : "#3a3a3a",
                      transition: "color 0.15s",
                    }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Confirm password — signup only */}
        {mode === "signup" && (
          <Field
            id="confirmPassword"
            label="Confirm Password"
            type={showConfirm ? "text" : "password"}
            value={fields.confirmPassword}
            onChange={setField("confirmPassword")}
            onBlur={handleConfirmBlur}
            placeholder="Repeat your password"
            autoComplete="new-password"
            icon={<Lock size={15} color="#555" />}
            error={fieldErrors.confirmPassword}
            rightElement={
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 2,
                  display: "flex",
                  color: "#555",
                  lineHeight: 1,
                }}
              >
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
          />
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "13px",
            marginTop: 4,
            borderRadius: 10,
            border: "none",
            background: loading
              ? "rgba(251,191,36,0.35)"
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
            boxShadow: loading
              ? "none"
              : "0 4px 16px rgba(251,191,36,0.2)",
          }}
        >
          {loading && (
            <Loader2
              size={16}
              style={{ animation: "spin 1s linear infinite" }}
            />
          )}
          {loading
            ? mode === "signup"
              ? "Creating account…"
              : "Signing in…"
            : mode === "signup"
            ? "Create Account →"
            : "Sign In →"}
        </button>
      </form>

      {/* Footer link */}
      <p
        style={{
          textAlign: "center",
          color: "#3a3a3a",
          fontSize: 12,
          marginTop: 20,
          lineHeight: 1.5,
        }}
      >
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

// ─── PageShell ────────────────────────────────────────────────────────────────

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#0f0d0b",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 16px",
        boxSizing: "border-box",
      }}
    >
      {/* Ambient gold glow */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: "28%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 560,
          height: 320,
          background:
            "radial-gradient(ellipse at center, rgba(251,191,36,0.055) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Card */}
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "rgba(255,255,255,0.022)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 18,
          padding: "36px 28px",
          position: "relative",
          zIndex: 1,
          boxSizing: "border-box",
          boxShadow: "0 24px 64px rgba(0,0,0,0.35)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────

interface FieldProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  placeholder: string;
  autoComplete: string;
  icon: React.ReactNode;
  rightElement?: React.ReactNode;
  error?: string;
  autoFocus?: boolean;
}

function Field({
  id,
  label,
  type,
  value,
  onChange,
  onBlur,
  placeholder,
  autoComplete,
  icon,
  rightElement,
  error,
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
          color: error ? "#ef4444" : "#7a6a5a",
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          marginBottom: 7,
          transition: "color 0.15s",
        }}
      >
        {label}
      </label>

      <div style={{ position: "relative" }}>
        {/* Left icon */}
        <span
          style={{
            position: "absolute",
            left: 13,
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            pointerEvents: "none",
            zIndex: 1,
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
            background: error
              ? "rgba(239,68,68,0.05)"
              : "rgba(255,255,255,0.04)",
            border: error
              ? "1px solid rgba(239,68,68,0.35)"
              : "1px solid rgba(255,255,255,0.09)",
            borderRadius: 10,
            color: "#faf5ef",
            // 16px minimum — prevents iOS Safari auto-zoom on focus
            fontSize: 16,
            padding: rightElement
              ? "11px 42px 11px 38px"
              : "11px 14px 11px 38px",
            outline: "none",
            boxSizing: "border-box",
            fontFamily: "inherit",
            transition: "border-color 0.15s, background 0.15s",
          }}
          onFocus={(e) => {
            if (!error) {
              e.currentTarget.style.borderColor = "rgba(251,191,36,0.35)";
            }
          }}
          onBlur={(e) => {
            if (!error) {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)";
            }
            onBlur?.();
          }}
        />

        {/* Right element (eye toggle) */}
        {rightElement && (
          <span
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              zIndex: 1,
            }}
          >
            {rightElement}
          </span>
        )}
      </div>

      {/* Inline field error */}
      {error && (
        <p
          style={{
            margin: "6px 0 0",
            fontSize: 12,
            color: "#ef4444",
            lineHeight: 1.4,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
