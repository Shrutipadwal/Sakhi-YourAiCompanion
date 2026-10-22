import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getRedirectResult,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

const redirectStorageKey = "sakhi-google-sign-in-redirect";

async function ensureUserDocument(signedInUser) {
  const userDocRef = doc(db, "users", signedInUser.uid);
  const userDocSnap = await getDoc(userDocRef);

  if (!userDocSnap.exists()) {
    await setDoc(
      userDocRef,
      {
        uid: signedInUser.uid,
        name: signedInUser.displayName || "",
        email: signedInUser.email || "",
        createdAt: new Date().toISOString(),
      },
      { merge: true },
    );
  }
}

function hasPendingRedirect() {
  try {
    return sessionStorage.getItem(redirectStorageKey) === "true";
  } catch {
    return false;
  }
}

function clearPendingRedirect() {
  try {
    sessionStorage.removeItem(redirectStorageKey);
  } catch {}
}

export default function GoogleAuth({
  title,
  subtitle,
  helpText,
  helpLink,
  helpLinkText,
  containerClassName = "",
  cardClassName = "",
}) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirectPending, setRedirectPending] = useState(hasPendingRedirect);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const redirectHandledRef = useRef(false);

  useEffect(() => {
    if (!redirectPending || redirectHandledRef.current) {
      return undefined;
    }

    redirectHandledRef.current = true;
    let isActive = true;
    setLoading(true);

    const finishRedirectSignIn = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          await ensureUserDocument(result.user);
          if (isActive) {
            navigate("/chat", { replace: true });
          }
        }
      } catch (redirectError) {
        console.error("Google redirect sign-in error:", redirectError);
        if (isActive) {
          setError(
            redirectError?.message ||
              "Unable to finish Google sign-in. Please try again.",
          );
        }
      } finally {
        clearPendingRedirect();
        if (isActive) {
          setRedirectPending(false);
          setLoading(false);
        }
      }
    };

    void finishRedirectSignIn();

    return () => {
      isActive = false;
    };
  }, [navigate, redirectPending]);

  useEffect(() => {
    if (!authLoading && !loading && !redirectPending && user) {
      navigate("/chat", { replace: true });
    }
  }, [authLoading, loading, redirectPending, user, navigate]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      const result = await signInWithPopup(auth, provider);
      await ensureUserDocument(result.user);
      navigate("/chat", { replace: true });
    } catch (err) {
      console.error("Google sign-in error:", err);
      if (
        err?.code === "auth/popup-blocked" ||
        err?.code === "auth/operation-not-supported-in-this-environment"
      ) {
        try {
          sessionStorage.setItem(redirectStorageKey, "true");
          await signInWithRedirect(auth, new GoogleAuthProvider());
          return;
        } catch (redirectError) {
          clearPendingRedirect();
          setError(
            redirectError?.message ||
              "Unable to start Google sign-in. Please try again.",
          );
        }
      } else {
        setError(
          err?.message || "Unable to sign in with Google. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`auth-container ${containerClassName}`.trim()}>
      <div className={`auth-card ${cardClassName}`.trim()}>
        <h1>{title}</h1>
        <p className="auth-subtitle">{subtitle}</p>

        <button
          type="button"
          className="auth-button"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          {loading ? "Signing in…" : "Sign in with Google"}
        </button>

        {error && <p className="auth-error">{error}</p>}

        {helpText && helpLink ? (
          <p className="auth-footer">
            {helpText} <Link to={helpLink}>{helpLinkText}</Link>
          </p>
        ) : null}
      </div>
    </div>
  );
}
