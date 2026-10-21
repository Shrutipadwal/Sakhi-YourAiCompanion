import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Chat from "./pages/Chat";
import MyJourney from "./pages/MyJourney";
import RequireAuth from "./components/RequireAuth";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Landing />} />
      <Route path="/signup" element={<Navigate to="/login" replace />} />
      <Route
        path="/chat"
        element={
          <RequireAuth>
            <Chat />
          </RequireAuth>
        }
      />
      <Route
        path="/journey"
        element={
          <RequireAuth>
            <MyJourney />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
