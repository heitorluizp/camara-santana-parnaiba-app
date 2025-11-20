export default function Container({ children }) {
  return (
    <div
      style={{
        maxWidth: 960,                 // um pouco mais largo, tipo portal
        margin: "0 auto",
        padding: "24px 16px 80px",     // espaço pro bottom nav
      }}
    >
      {children}
    </div>
  );
}
