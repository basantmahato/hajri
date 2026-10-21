"use client";

import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { authClient } from "../lib/auth-client";
import { userService, type User } from "../lib/services";
import { Dashboard } from "../components/Dashboard";

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="google-icon">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94a11.1 11.1 0 0 1-4.8 7.28l7.73 6C44.37 38.15 46.98 31.95 46.98 24.55Z" />
      <path fill="#FBBC05" d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.9 23.9 0 0 0 0 21.56l7.98-6.19Z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.78l-7.73-6c-2.14 1.44-4.89 2.28-8.17 2.28-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
    </svg>
  );
}

export default function Home() {
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const [localUser, setLocalUser] = useState<User | null>(null);
  const [isCheckingLocalAuth, setIsCheckingLocalAuth] = useState(true);

  // Auth Method: "phone" | "email"
  const [authMethod, setAuthMethod] = useState<"phone" | "email">("phone");

  // Phone OTP State
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpPhoneNumber, setOtpPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Email / Password State
  const [emailMode, setEmailMode] = useState<"signin" | "register">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);

  // Google State
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState("");

  // Check local JWT token on mount
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("hajri_token") : null;
    if (token) {
      userService
        .getProfile()
        .then((user) => setLocalUser(user))
        .catch(() => {
          localStorage.removeItem("hajri_token");
          setLocalUser(null);
        })
        .finally(() => setIsCheckingLocalAuth(false));
    } else {
      setIsCheckingLocalAuth(false);
    }
  }, []);

  const currentUser = session?.user || localUser;

  // Phone OTP Handlers
  const handleSendOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const normalizedPhoneNumber = phoneNumber.trim().replace(/[\s()-]/g, "");

    if (!/^\+[1-9]\d{7,14}$/.test(normalizedPhoneNumber)) {
      setError("Enter your phone number with country code, for example +919876543210.");
      return;
    }

    setIsSendingOtp(true);
    try {
      const result = await authClient.phoneNumber.sendOtp({
        phoneNumber: normalizedPhoneNumber,
      });

      if (result.error) {
        setError(result.error.message || "Could not send the verification code. Please try again.");
        return;
      }

      setOtpPhoneNumber(normalizedPhoneNumber);
      setOtp("");
    } catch {
      setError("Could not send the verification code. Check the backend and MSG91 configuration.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit code sent to your phone.");
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const result = await authClient.phoneNumber.verify({
        phoneNumber: otpPhoneNumber,
        code: otp,
      });

      if (result.error) {
        setError(result.error.message || "That code could not be verified. Check it and try again.");
        setIsVerifyingOtp(false);
        return;
      }

      window.location.reload();
    } catch {
      setError("Could not verify the code. Check your connection and try again.");
      setIsVerifyingOtp(false);
    }
  };

  // Email / Password Handlers
  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsEmailSubmitting(true);

    try {
      if (emailMode === "signin") {
        const res = await userService.login(email.trim(), password);
        setLocalUser(res.user);
      } else {
        if (!name.trim()) {
          setError("Name is required");
          setIsEmailSubmitting(false);
          return;
        }
        const res = await userService.register(name.trim(), email.trim(), password);
        setLocalUser(res.user);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || "Authentication failed. Check credentials.");
    } finally {
      setIsEmailSubmitting(false);
    }
  };

  // Google Sign-in Handler
  const handleGoogleSignIn = async () => {
    setError("");
    setIsSigningIn(true);

    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: window.location.origin,
      });

      if (result.error) {
        setError(result.error.message || "Could not start Google sign-in. Please try again.");
        setIsSigningIn(false);
      }
    } catch {
      setError("Could not connect to the authentication server. Check that the backend is running.");
      setIsSigningIn(false);
    }
  };

  // Sign Out Handler
  const handleSignOut = async () => {
    setError("");
    localStorage.removeItem("hajri_token");
    setLocalUser(null);

    try {
      await authClient.signOut();
    } catch {
      // Ignored
    }

    window.location.reload();
  };

  // If user is authenticated, render the complete dashboard!
  if (currentUser) {
    return <Dashboard user={currentUser} onSignOut={handleSignOut} />;
  }

  return (
    <main className="login-page">
      <section className="login-shell" aria-label="Hajri account">
        <div className="login-visual">
          <div className="visual-top">
            <Link className="brand brand-light" href="/" aria-label="Hajri home">
              <span className="brand-mark" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </span>
              <span>hajri</span>
            </Link>
            <span className="visual-badge">
              <span className="status-dot" />
              Attendance & Daily Wages
            </span>
          </div>

          <div className="visual-copy">
            <p className="eyebrow">A better way to work</p>
            <h1>Your team.<br />Right on time.</h1>
            <p className="visual-description">
              Create groups, add employees with their daily wages, record attendance in seconds, and generate automated monthly payout reports.
            </p>
          </div>

          <div className="attendance-card" aria-hidden="true">
            <div className="attendance-card-heading">
              <div>
                <span className="card-kicker">MONTHLY WAGE SUMMARY</span>
                <strong>Auto-calculated Payouts</strong>
              </div>
              <span className="card-date">LIVE</span>
            </div>
            <div className="attendance-stat">
              <div className="stat-ring"><span>₹</span></div>
              <div>
                <strong>Calculated instantly</strong>
                <span>Days present × Daily wage rate</span>
              </div>
            </div>
            <div className="avatar-stack">
              <span className="avatar avatar-one">RK</span>
              <span className="avatar avatar-two">SV</span>
              <span className="avatar avatar-three">AS</span>
              <span className="avatar avatar-four">MD</span>
              <span className="avatar-more">+</span>
              <span className="avatar-caption">Pointers on team payouts</span>
            </div>
          </div>
          <div className="visual-decoration decoration-one" />
          <div className="visual-decoration decoration-two" />
        </div>

        <div className="login-panel">
          <div className="login-panel-inner">
            <Link className="brand brand-dark" href="/" aria-label="Hajri home">
              <span className="brand-mark" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </span>
              <span>hajri</span>
            </Link>

            {isSessionPending || isCheckingLocalAuth ? (
              <div className="auth-state" role="status" aria-live="polite">
                <span className="spinner" />
                <span>Checking your session…</span>
              </div>
            ) : (
              <div className="login-content">
                <p className="eyebrow panel-eyebrow">WELCOME TO HAJRI</p>
                <h2>Good work starts<br />with a sign in.</h2>
                <p className="login-description">
                  Sign in to manage your team&apos;s attendance, daily wages, and monthly payroll.
                </p>

                {/* Method Switcher Tabs */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "16px", background: "#f0f4f1", padding: "4px", borderRadius: "10px" }}>
                  <button
                    type="button"
                    style={{
                      flex: 1,
                      padding: "8px",
                      borderRadius: "8px",
                      border: "none",
                      background: authMethod === "phone" ? "#fff" : "transparent",
                      color: authMethod === "phone" ? "#163d30" : "#63756c",
                      fontWeight: 600,
                      fontSize: "13px",
                      cursor: "pointer",
                      boxShadow: authMethod === "phone" ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
                    }}
                    onClick={() => { setAuthMethod("phone"); setError(""); }}
                  >
                    Phone OTP
                  </button>
                  <button
                    type="button"
                    style={{
                      flex: 1,
                      padding: "8px",
                      borderRadius: "8px",
                      border: "none",
                      background: authMethod === "email" ? "#fff" : "transparent",
                      color: authMethod === "email" ? "#163d30" : "#63756c",
                      fontWeight: 600,
                      fontSize: "13px",
                      cursor: "pointer",
                      boxShadow: authMethod === "email" ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
                    }}
                    onClick={() => { setAuthMethod("email"); setError(""); }}
                  >
                    Email & Password
                  </button>
                </div>

                {/* Method 1: Phone OTP */}
                {authMethod === "phone" && (
                  <form
                    className="phone-form"
                    onSubmit={otpPhoneNumber ? handleVerifyOtp : handleSendOtp}
                  >
                    {!otpPhoneNumber ? (
                      <>
                        <label className="field-label" htmlFor="phone-number">
                          Phone number
                        </label>
                        <input
                          id="phone-number"
                          className="login-input"
                          type="tel"
                          autoComplete="tel"
                          inputMode="tel"
                          placeholder="+91 98765 43210"
                          value={phoneNumber}
                          onChange={(event) => setPhoneNumber(event.target.value)}
                          disabled={isSendingOtp}
                          required
                        />
                        <p className="field-hint">Include country code (e.g. +91).</p>
                        <button className="google-button phone-submit" type="submit" disabled={isSendingOtp}>
                          {isSendingOtp ? <span className="spinner" /> : <span aria-hidden="true">↗</span>}
                          <span>{isSendingOtp ? "Sending code…" : "Send a one-time code"}</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="otp-sent-copy">
                          Enter the 6-digit code sent to <strong>{otpPhoneNumber}</strong>.
                        </p>
                        <label className="field-label" htmlFor="phone-otp">
                          Verification code
                        </label>
                        <input
                          id="phone-otp"
                          className="login-input otp-input"
                          type="text"
                          autoComplete="one-time-code"
                          inputMode="numeric"
                          pattern="[0-9]{6}"
                          maxLength={6}
                          placeholder="000000"
                          value={otp}
                          onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
                          disabled={isVerifyingOtp}
                          required
                        />
                        <button className="google-button phone-submit" type="submit" disabled={isVerifyingOtp}>
                          {isVerifyingOtp ? <span className="spinner" /> : <span aria-hidden="true">✓</span>}
                          <span>{isVerifyingOtp ? "Verifying…" : "Verify and sign in"}</span>
                        </button>
                        <div className="otp-actions">
                          <button
                            className="text-button"
                            type="button"
                            onClick={() => {
                              setOtpPhoneNumber("");
                              setOtp("");
                              setError("");
                            }}
                            disabled={isVerifyingOtp || isSendingOtp}
                          >
                            Change number
                          </button>
                        </div>
                      </>
                    )}
                  </form>
                )}

                {/* Method 2: Email & Password */}
                {authMethod === "email" && (
                  <form onSubmit={handleEmailSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
                    {emailMode === "register" && (
                      <div>
                        <label className="field-label" htmlFor="email-name">Full Name</label>
                        <input
                          id="email-name"
                          type="text"
                          className="login-input"
                          placeholder="Your Name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          disabled={isEmailSubmitting}
                          required
                        />
                      </div>
                    )}
                    <div>
                      <label className="field-label" htmlFor="email-input">Email Address</label>
                      <input
                        id="email-input"
                        type="email"
                        className="login-input"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isEmailSubmitting}
                        required
                      />
                    </div>
                    <div>
                      <label className="field-label" htmlFor="password-input">Password</label>
                      <input
                        id="password-input"
                        type="password"
                        className="login-input"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isEmailSubmitting}
                        required
                      />
                    </div>

                    <button className="google-button phone-submit" type="submit" disabled={isEmailSubmitting}>
                      {isEmailSubmitting ? <span className="spinner" /> : <span aria-hidden="true">→</span>}
                      <span>{isEmailSubmitting ? "Please wait…" : emailMode === "signin" ? "Sign In with Email" : "Create Account"}</span>
                    </button>

                    <div style={{ textAlign: "center", marginTop: "4px" }}>
                      {emailMode === "signin" ? (
                        <span style={{ fontSize: "12.5px", color: "#63756c" }}>
                          Don&apos;t have an account?{" "}
                          <button
                            type="button"
                            className="text-button"
                            style={{ fontWeight: 700 }}
                            onClick={() => { setEmailMode("register"); setError(""); }}
                          >
                            Register
                          </button>
                        </span>
                      ) : (
                        <span style={{ fontSize: "12.5px", color: "#63756c" }}>
                          Already have an account?{" "}
                          <button
                            type="button"
                            className="text-button"
                            style={{ fontWeight: 700 }}
                            onClick={() => { setEmailMode("signin"); setError(""); }}
                          >
                            Sign In
                          </button>
                        </span>
                      )}
                    </div>
                  </form>
                )}

                <div className="login-divider">
                  <span>or continue with</span>
                </div>

                <button
                  className="google-button"
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isSigningIn}
                >
                  {isSigningIn ? <span className="spinner" /> : <GoogleIcon />}
                  <span>{isSigningIn ? "Connecting to Google…" : "Continue with Google"}</span>
                  {!isSigningIn && <span className="button-arrow" aria-hidden="true">↗</span>}
                </button>

                {error && <p className="error-message" role="alert">{error}</p>}

                <p className="terms-copy">
                  By continuing, you agree to Hajri&apos;s{" "}
                  <a href="#terms">Terms of Service</a> and{" "}
                  <a href="#privacy">Privacy Policy</a>.
                </p>
              </div>
            )}
          </div>

          <footer className="panel-footer">
            <span>© Hajri</span>
            <span className="secure-label"><span aria-hidden="true">◈</span> Secure sign in</span>
          </footer>
        </div>
      </section>
    </main>
  );
}
