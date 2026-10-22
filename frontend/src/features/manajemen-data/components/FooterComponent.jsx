export default function Footer() {
  return (
    <footer className="smk-footer">
      <div className="smk-footer-inner">
        {/* Header */}
        <div className="smk-footer-header">
          <span className="smk-footer-badge">Hubungi Kami</span>
          <h2>
            Kontak <span className="smk-footer-highlight">Sekolah</span>
          </h2>
          <p>Kami siap membantu dan menjawab pertanyaan Anda</p>
        </div>

        {/* Grid */}
        <div className="smk-footer-grid">
          {/* Kontak */}
          <div className="smk-footer-box">
            <h3>Informasi Kontak</h3>

            <div className="smk-footer-contact-item">
              <div className="smk-footer-icon smk-icon-loc">
                <svg
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </div>
              <div>
                <strong>Alamat</strong>
                <p>Jl. Pendidikan No. 123, Balige,12345</p>
              </div>
            </div>

            <div className="smk-footer-contact-item">
              <div className="smk-footer-icon smk-icon-phone">
                <svg
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                </svg>
              </div>
              <div>
                <strong>Telepon</strong>
                <p>
                  (021) 1234-5678
                  <br />
                  +62 812-3456-7890
                </p>
              </div>
            </div>

            <div className="smk-footer-contact-item">
              <div className="smk-footer-icon smk-icon-email">
                <svg
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              </div>
              <div>
                <strong>Email</strong>
                <p>
                  info@smant.sch.id
                  <br />
                  admin@smant.sch.id
                </p>
              </div>
            </div>

            <div className="smk-footer-contact-item">
              <div className="smk-footer-icon smk-icon-time">
                <svg
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.5 5v5.25l4.5 2.67-.75 1.23L11 13V7h1.5z" />
                </svg>
              </div>
              <div>
                <strong>Jam Operasional</strong>
                <p>
                  Senin – Jumat: 07:00 – 15:00
                  <br />
                  Sabtu: 07:00 – 12:00
                </p>
              </div>
            </div>

            <div className="smk-footer-social">
              <h4>Media Sosial</h4>
              <div className="smk-social-buttons">
                <button className="smk-social-btn smk-social-fb">
                  <svg
                    width="18"
                    height="18"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                  </svg>
                </button>
                <button className="smk-social-btn smk-social-ig">
                  <svg
                    width="18"
                    height="18"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <rect
                      x="2"
                      y="2"
                      width="20"
                      height="20"
                      rx="5"
                      ry="5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                    <line
                      x1="17.5"
                      y1="6.5"
                      x2="17.51"
                      y2="6.5"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="smk-footer-bottom">
          <p className="smk-footer-bottom-title">
            Sistem Informasi {pengaturan?.nama_sekolah || "SMK Negeri 3 Balige"}
          </p>
          <p className="smk-footer-bottom-dev">
            Dikembangkan oleh Program Studi S1 Informatika, Institut Teknologi Del
          </p>
          <p className="smk-footer-bottom-copy">
            © {new Date().getFullYear()}. Hak Cipta Dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
