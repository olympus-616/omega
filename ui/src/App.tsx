import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Overview from './pages/Overview';
import Demo from './pages/Demo';
import Config from './pages/Config';
import AboutPage from './pages/AboutPage';

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/config" element={<Config />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
