import { useState, useRef, useEffect } from 'react';
import './SearchableDropdown.css';

export default function SearchableDropdown({ options, placeholder, onSelect, allowAdd }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filtered, setFiltered] = useState(options);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setFiltered(options.filter(opt => opt.toLowerCase().includes(query.toLowerCase())));
  }, [query, options]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (value) => {
    onSelect(value);
    setQuery(value);
    setIsOpen(false);
  };

  const addNew = () => {
    if (query.trim()) {
      onSelect(query.trim(), true); // true = new item
      setQuery('');
      setIsOpen(false);
    }
  };

  return (
    <div className="dropdown-wrapper" ref={wrapperRef}>
      <div
        className="dropdown-input"
        onClick={() => setIsOpen(true)}
      >
        <input
          type="text"
          value={query}
          placeholder={placeholder}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
        />
        <span className="arrow">▼</span>
      </div>
      {isOpen && (
        <div className="dropdown-list">
          {filtered.length > 0 ? (
            filtered.map(opt => (
              <div key={opt} className="dropdown-item" onClick={() => handleSelect(opt)}>
                {opt}
              </div>
            ))
          ) : (
            allowAdd && (
              <div className="dropdown-item add-new" onClick={addNew}>
                Add “{query}” as new
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}