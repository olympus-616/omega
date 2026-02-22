import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import Overview from "./pages/Overview";
import Demo from "./pages/Demo";
import Config from "./pages/Config";

export default function App() {
  return (
    <Router>
      <AppShell>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/config" element={<Config />} />
        </Routes>
      </AppShell>
    </Router>
  );
}
