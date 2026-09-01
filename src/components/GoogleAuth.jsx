import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

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
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/chat");
    }
  }, [authLoading, user, navigate]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      const result = await signInWithPopup(auth, provider);
      const signedInUser = result.user;
      console.log("Google sign-in success", signedInUser);
      console.log("Authenticated uid:", signedInUser.uid);

      const userDocRef = doc(db, "users", signedInUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        console.log(
          "Firestore user document already exists, skipping creation for uid:",
          signedInUser.uid,
        );
        navigate("/chat");
        return;
      }

      console.log("Firestore write attempt for uid:", signedInUser.uid);
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
      console.log("Firestore write success for uid:", signedInUser.uid);
      navigate("/chat");
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError(
        err?.message || "Unable to sign in with Google. Please try again.",
      );
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
