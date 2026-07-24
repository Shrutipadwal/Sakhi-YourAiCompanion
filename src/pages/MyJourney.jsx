import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getMemoryProfile } from "../services/memoryService";

function renderCard(title, items) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="journey-card" key={title}>
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function MyJourney() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) {
        return;
      }
      setIsLoading(true);
      setError("");

      try {
        const data = await getMemoryProfile(user.uid);
        setProfile(data);
      } catch (loadError) {
        console.error("Failed to load journey profile:", loadError);
        setError("Unable to load your journey right now.");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  if (!profile) {
    return (
      <main className="page-shell journey-shell">
        <section className="journey-panel">
          {isLoading ? (
            <p>Loading your journey…</p>
          ) : (
            <p>{error || "No journey data available."}</p>
          )}
        </section>
      </main>
    );
  }

  const cards = [];
  if (profile.goals?.length) {
    cards.push({ title: "🎯 Goals", items: profile.goals });
  }
  if (profile.studyHabits?.length || profile.learningPreferences?.length) {
    cards.push({
      title: "📚 Current Focus",
      items: [...profile.studyHabits, ...profile.learningPreferences].filter(
        Boolean,
      ),
    });
  }
  if (profile.personalChallenges?.length || profile.hobbies?.length) {
    cards.push({
      title: "🌱 Growth Areas",
      items: [...profile.personalChallenges, ...profile.hobbies].filter(
        Boolean,
      ),
    });
  }
  if (
    profile.motivationSources?.length ||
    profile.dreams?.length ||
    profile.importantPeople?.length
  ) {
    cards.push({
      title: "🔥 Motivation",
      items: [
        ...profile.motivationSources,
        ...profile.dreams,
        ...profile.importantPeople,
      ].filter(Boolean),
    });
  }
  if (profile.preferences?.length || profile.lifestylePreferences?.length) {
    cards.push({
      title: "🌙 Preferences",
      items: [...profile.preferences, ...profile.lifestylePreferences].filter(
        Boolean,
      ),
    });
  }

  return (
    <main className="page-shell journey-shell">
      <section className="journey-panel">
        <header className="journey-header">
          <div>
            <span className="journey-eyebrow">🌱 My Journey</span>
            <h1>Here is what Sakhi remembers about you.</h1>
          </div>
          <p>
            This space is your personal growth profile — a calm view of what
            Sakhi has learned about your goals, focus, motivation, and
            preferences.
          </p>
        </header>

        <div className="journey-card-grid">
          {cards.length > 0 ? (
            cards.map((card) => renderCard(card.title, card.items))
          ) : (
            <div className="journey-empty">
              <p>
                Sakhi is still learning about you. Share more in chat and this
                page will grow.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default MyJourney;
