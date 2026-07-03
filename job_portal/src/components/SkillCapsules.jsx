import { useRef, useState } from "react";
import "../styles/SkillCapsules.css";

function normalizeSkill(skill) {
  return skill.trim();
}

export default function SkillCapsules({ skills, onChange }) {
  const [inputValue, setInputValue] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef(null);

  const addSkills = (text) => {
    const incoming = text
      .split(",")
      .map(normalizeSkill)
      .filter(Boolean);

    if (incoming.length === 0) return;

    const next = [...skills];
    incoming.forEach((skill) => {
      const exists = next.some(
        (existing) => existing.toLowerCase() === skill.toLowerCase()
      );
      if (!exists) next.push(skill);
    });
    onChange(next);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value.includes(",")) {
      addSkills(value);
      setInputValue("");
    } else {
      setInputValue(value);
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (inputValue.trim()) {
        addSkills(inputValue);
        setInputValue("");
      }
    } else if (e.key === "Backspace" && !inputValue && skills.length > 0) {
      onChange(skills.slice(0, -1));
    }
  };

  const handleInputBlur = () => {
    if (inputValue.trim()) {
      addSkills(inputValue);
      setInputValue("");
    }
  };

  const removeSkill = (index) => {
    onChange(skills.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
      setEditValue("");
    }
  };

  const startEdit = (index) => {
    setEditingIndex(index);
    setEditValue(skills[index]);
  };

  const saveEdit = () => {
    const trimmed = editValue.trim();
    if (editingIndex === null) return;

    if (!trimmed) {
      removeSkill(editingIndex);
    } else {
      const duplicate = skills.some(
        (skill, i) =>
          i !== editingIndex && skill.toLowerCase() === trimmed.toLowerCase()
      );
      if (duplicate) {
        removeSkill(editingIndex);
      } else {
        const next = [...skills];
        next[editingIndex] = trimmed;
        onChange(next);
      }
    }

    setEditingIndex(null);
    setEditValue("");
    inputRef.current?.focus();
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditValue("");
    inputRef.current?.focus();
  };

  const handleEditKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit();
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  };

  return (
    <div className="skill-capsules">
      {skills.map((skill, index) =>
        editingIndex === index ? (
          <input
            key={`edit-${index}`}
            type="text"
            className="skill-capsule__edit"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={handleEditKeyDown}
            autoFocus
          />
        ) : (
          <span key={`${skill}-${index}`} className="skill-capsule">
            <span className="skill-capsule__label">{skill}</span>
            <span className="skill-capsule__actions">
              <button
                type="button"
                className="skill-capsule__btn skill-capsule__btn--edit"
                onClick={() => startEdit(index)}
                aria-label={`Edit ${skill}`}
              >
                ✎
              </button>
              <button
                type="button"
                className="skill-capsule__btn skill-capsule__btn--delete"
                onClick={() => removeSkill(index)}
                aria-label={`Remove ${skill}`}
              >
                ×
              </button>
            </span>
          </span>
        )
      )}

      <input
        ref={inputRef}
        type="text"
        className="skill-capsules__input"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        onBlur={handleInputBlur}
        placeholder={
          skills.length === 0
            ? "Type skills separated by commas (e.g. react, js, node)"
            : "Add more..."
        }
      />
    </div>
  );
}
