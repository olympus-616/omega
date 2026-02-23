import { NavLink } from 'react-router-dom';
import './SubNav.css';

const tabs = [
  { label: 'Overview', to: '/' },
  { label: 'Demo', to: '/demo' },
  { label: 'Config', to: '/config' },
];

export default function SubNav() {
  return (
    <nav className="subnav">
      {tabs.map((tab) => (
        <NavLink key={tab.to} to={tab.to} end={tab.to === '/'}>
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
