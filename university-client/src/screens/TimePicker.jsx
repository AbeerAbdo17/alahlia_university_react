import React, { useState, useRef, useEffect } from "react";
import { FaClock } from "react-icons/fa";   

export default function TimePicker({ value = "08:00", onChange, disabled = false, label }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const [hour, setHour] = useState(() => {
    const [h] = String(value || "08:00").split(":");
    return parseInt(h, 10) || 8;
  });
  const [minute, setMinute] = useState(() => {
    const [, m] = String(value || "08:00").split(":");
    return parseInt(m, 10) || 0;
  });

  // sync when value changes externally
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(":");
      setHour(parseInt(h, 10) || 0);
      setMinute(parseInt(m, 10) || 0);
    }
  }, [value]);

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const emit = (h, m) => {
    const val = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    onChange?.(val);
  };

  const changeHour = (delta) => {
    const next = (hour + delta + 24) % 24;
    setHour(next);
    emit(next, minute);
  };

  const changeMinute = (delta) => {
    const next = (minute + delta + 60) % 60;
    setMinute(next);
    emit(hour, next);
  };

  const displayValue = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  return (
    <div ref={ref} style={{ position: "relative", direction: "rtl" }}>
      {/* trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        style={{
          width: "100%",
          padding: "10px 14px",
          border: open ? "1.5px solid #0a3753" : "1.5px solid #d1d5db",
          borderRadius: 10,
          background: disabled ? "#f3f4f6" : "#fff",
          cursor: disabled ? "not-allowed" : "pointer",
          fontFamily: `"Cairo", "Tajawal", Arial, sans-serif`,
          fontWeight: 700,
          fontSize: 16,
          color: disabled ? "#9ca3af" : "#0a3753",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          boxShadow: open ? "0 0 0 3px rgba(10,55,83,0.10)" : "none",
          transition: "border 0.15s, box-shadow 0.15s",
          textAlign: "center",
        }}
      >
        <FaClock style={{ fontSize: 18 }} />
        <span style={{ flex: 1, textAlign: "center", letterSpacing: 2, fontSize: 17 }}>
          {displayValue}
        </span>
        <span style={{ fontSize: 12, color: "#9ca3af" }}>{open ? "▲" : "▼"}</span>
      </button>

      {/* dropdown picker */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            zIndex: 999,
            background: "#fff",
            border: "1.5px solid #e5e7eb",
            borderRadius: 14,
            boxShadow: "0 8px 32px rgba(10,55,83,0.15)",
            padding: 0,
            minWidth: 280,
            overflow: "hidden",
            animation: "fadeInDown 0.15s ease",
          }}
        >
          {/* header */}
          <div
            style={{
              background: "#0a3753",
              color: "#fff",
              padding: "12px 18px",
              fontFamily: `"Cairo", "Tajawal", Arial, sans-serif`,
              fontWeight: 700,
              fontSize: 22,
              textAlign: "center",
              letterSpacing: 3,
            }}
          >
            {displayValue}
          </div>

          {/* spinners */}
          <div style={{ display: "flex", gap: 0, padding: "14px 18px", justifyContent: "center" }}>
            {/* Hour */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <span style={{ fontWeight: 700, color: "#6b7280", fontSize: 12, marginBottom: 2 }}>ساعة</span>
              <button type="button" onClick={() => changeHour(1)} style={arrowBtn}>▲</button>
              <div style={bigNum}>{String(hour).padStart(2, "0")}</div>
              <button type="button" onClick={() => changeHour(-1)} style={arrowBtn}>▼</button>
            </div>

            <div style={{ display: "flex", alignItems: "center", padding: "0 8px", fontWeight: 900, fontSize: 22, color: "#0a3753" }}>:</div>

            {/* Minute */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <span style={{ fontWeight: 700, color: "#6b7280", fontSize: 12, marginBottom: 2 }}>دقيقة</span>
              <button type="button" onClick={() => changeMinute(5)} style={arrowBtn}>▲</button>
              <div style={bigNum}>{String(minute).padStart(2, "0")}</div>
              <button type="button" onClick={() => changeMinute(-5)} style={arrowBtn}>▼</button>
            </div>
          </div>

          {/* Quick hour select */}
          <div style={{ padding: "0 14px 8px", borderTop: "1px solid #f3f4f6" }}>
            <div style={{ fontWeight: 700, color: "#6b7280", fontSize: 12, marginBottom: 6, marginTop: 8 }}>اختر الساعة</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {hours.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => { setHour(h); emit(h, minute); }}
                  style={{
                    width: 36,
                    height: 32,
                    borderRadius: 7,
                    border: "1px solid",
                    borderColor: h === hour ? "#0a3753" : "#e5e7eb",
                    background: h === hour ? "#0a3753" : "#f9fafb",
                    color: h === hour ? "#fff" : "#374151",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: `"Cairo", "Tajawal", Arial, sans-serif`,
                    transition: "all 0.1s",
                  }}
                >
                  {String(h).padStart(2, "0")}
                </button>
              ))}
            </div>
          </div>

          {/* Quick minute select */}
          <div style={{ padding: "0 14px 10px" }}>
            <div style={{ fontWeight: 700, color: "#6b7280", fontSize: 12, marginBottom: 6, marginTop: 4 }}>الدقائق</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {minutes.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMinute(m); emit(hour, m); }}
                  style={{
                    width: 42,
                    height: 32,
                    borderRadius: 7,
                    border: "1px solid",
                    borderColor: m === minute ? "#0a3753" : "#e5e7eb",
                    background: m === minute ? "#0a3753" : "#f9fafb",
                    color: m === minute ? "#fff" : "#374151",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: `"Cairo", "Tajawal", Arial, sans-serif`,
                    transition: "all 0.1s",
                  }}
                >
                  :{String(m).padStart(2, "0")}
                </button>
              ))}
            </div>
          </div>

          {/* confirm */}
          <div style={{ padding: "8px 14px 14px", borderTop: "1px solid #f3f4f6" }}>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                width: "100%",
                padding: "10px",
                background: "#0a3753",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontFamily: `"Cairo", "Tajawal", Arial, sans-serif`,
                fontWeight: 700,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              تأكيد 
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

const arrowBtn = {
  width: 36,
  height: 32,
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  background: "#f9fafb",
  cursor: "pointer",
  fontWeight: 900,
  fontSize: 14,
  color: "#0a3753",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
};

const bigNum = {
  fontSize: 36,
  fontWeight: 900,
  color: "#0a3753",
  fontFamily: `"Cairo", "Tajawal", Arial, sans-serif`,
  lineHeight: 1,
  padding: "6px 0",
};
