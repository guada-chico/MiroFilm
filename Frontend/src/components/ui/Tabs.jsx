import { useState } from 'react';
import './Tabs.css';

export function Tabs({ value, onValueChange, children, className = '' }) {
  return (
    <div className={`tabs ${className}`}>
      {children}
    </div>
  );
}

export function TabsList({ children }) {
  return (
    <div className="tabs-list">
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, ...props }) {
  const { onValueChange, activeValue } = props;
  const isActive = value === activeValue;
  
  return (
    <button
      className={`tabs-trigger ${isActive ? 'active' : ''}`}
      onClick={() => {
        if (props.setActive) {
          props.setActive(value);
        }
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, activeValue }) {
  if (value !== activeValue) {
    return null;
  }
  
  return (
    <div className="tabs-content">
      {children}
    </div>
  );
}

// Mejor versión con hooks internos
export function TabsNew({ defaultValue, children }) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  
  return (
    <div className="tabs">
      {/* Renderizar TabsList con contexto */}
      {children}
    </div>
  );
}
