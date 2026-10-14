// components/PrimaryButton.jsx
import React from "react";

/**
 * Large, touch-friendly primary action button.
 *
 * Props:
 *   onClick  - click handler
 *   icon     - optional Lucide icon element
 *   children - button label
 *   variant  - "primary" | "secondary" | "danger" | "ghost"
 *   disabled - boolean
 *   fullWidth- boolean
 *   type     - "button" | "submit"
 */
export default function PrimaryButton({
  onClick,
  icon,
  children,
  variant = "primary",
  disabled = false,
  fullWidth = false,
  type = "button",
  className = "",
}) {
  return (
    <button
      type={type}
      className={`btn btn--${variant} ${fullWidth ? "btn--full" : ""} ${className}`}
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
    >
      {icon && <span className="btn-icon" aria-hidden="true">{icon}</span>}
      <span className="btn-label">{children}</span>
    </button>
  );
}
