export default function NotificationBanner({ message }) {
  if (!message) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 70,
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "#2563eb",
        color: "#fff",
        padding: "10px 16px",
        borderRadius: 6,
        boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
        zIndex: 999,
        animation: "fadeIn 0.2s ease-out",
      }}
    >
      {message}
    </div>
  );
}
