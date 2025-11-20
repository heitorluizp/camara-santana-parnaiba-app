function TvCamara() {
  // Usa um vídeo de YouTube qualquer como mock
  const youtubeId = "dQw4w9WgXcQ"; // depois você troca pelo link da TV Câmara

  return (
    <div>
      <h2>TV Câmara</h2>
      <p style={{ marginBottom: 16, opacity: 0.8 }}>
        Transmissões ao vivo e vídeos gravados da Câmara Municipal.
      </p>
      <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}`}
          title="TV Câmara"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            border: 0,
            borderRadius: 8
          }}
          allowFullScreen
        />
      </div>
    </div>
  );
}

export default TvCamara;
