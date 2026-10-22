import { NavLink } from "react-router-dom";
import Icon from "../../../components/Icon";
import { mediaUrl } from "../../admin/components/AdminComponents";
import { useSiteSettings, toLines } from "../context/SiteSettingsContext";

const SOCIAL_LABEL = {
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  twitter: "X / Twitter",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  whatsapp: "WhatsApp",
  globe: "Website",
};

function ContactItem({ icon, iconClass, title, lines, hrefBuilder }) {
  if (!lines.length) return null;
  return (
    <div className="smk-footer-contact-item">
      <div className={`smk-footer-icon ${iconClass}`}>
        <Icon name={icon} size={16} />
      </div>
      <div>
        <strong>{title}</strong>
        <p>
          {lines.map((line, index) => (
            <span key={`${line}-${index}`}>
              {hrefBuilder ? (
                <a href={hrefBuilder(line)} className="smk-footer-link">
                  {line}
                </a>
              ) : (
                line
              )}
              {index < lines.length - 1 && <br />}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}

export default function Footer() {
  const { pengaturan } = useSiteSettings();
  const logoSrc = mediaUrl(pengaturan.logo_url);

  const alamat = toLines(pengaturan.alamat);
  const telepon = toLines(pengaturan.telepon);
  const email = toLines(pengaturan.email);
  const jam = toLines(pengaturan.jam_operasional);
  const sosial = (pengaturan.sosial_media || []).filter((s) => s?.url);

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
          {/* Identitas */}
          <div className="smk-footer-box smk-footer-about">
            <div className="smk-footer-brand">
              <span className="smk-footer-brand-logo">
                {logoSrc ? (
                  <img
                    src={logoSrc}
                    alt=""
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      if (e.currentTarget.nextElementSibling) {
                        e.currentTarget.nextElementSibling.style.display = "inline-flex";
                      }
                    }}
                  />
                ) : null}
                <span style={{ display: logoSrc ? "none" : "inline-flex" }}>
                  <Icon name="graduation" size={24} />
                </span>
              </span>
              <span className="smk-footer-brand-text">
                <strong>{pengaturan.nama_sekolah}</strong>
                <span>{pengaturan.tagline}</span>
              </span>
            </div>

            {pengaturan.deskripsi_singkat && (
              <p className="smk-footer-desc">{pengaturan.deskripsi_singkat}</p>
            )}

            {pengaturan.tahun_ajaran && (
              <p className="smk-footer-year">
                <Icon name="calendar" size={15} /> Tahun Ajaran {pengaturan.tahun_ajaran}
              </p>
            )}

            <nav className="smk-footer-links">
              <NavLink to="/">Beranda</NavLink>
              <NavLink to="/berita">Berita &amp; Informasi</NavLink>
              <NavLink to="/profil">Profil Sekolah</NavLink>
              <NavLink to="/portofolio">Portofolio</NavLink>
            </nav>
          </div>

          {/* Kontak */}
          <div className="smk-footer-box">
            <h3>Informasi Kontak</h3>

            <ContactItem icon="mapPin" iconClass="smk-icon-loc" title="Alamat" lines={alamat} />
            <ContactItem
              icon="phone"
              iconClass="smk-icon-phone"
              title="Telepon"
              lines={telepon}
              hrefBuilder={(line) => `tel:${line.replace(/[^\d+]/g, "")}`}
            />
            <ContactItem
              icon="mail"
              iconClass="smk-icon-email"
              title="Email"
              lines={email}
              hrefBuilder={(line) => `mailto:${line}`}
            />
            <ContactItem
              icon="clock"
              iconClass="smk-icon-time"
              title="Jam Operasional"
              lines={jam}
            />

            {sosial.length > 0 && (
              <div className="smk-footer-social">
                <h4>Media Sosial</h4>
                <div className="smk-social-buttons">
                  {sosial.map((item, index) => (
                    <a
                      key={`${item.platform}-${index}`}
                      href={item.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className={`smk-social-btn smk-social-${item.platform}`}
                      aria-label={SOCIAL_LABEL[item.platform] || item.platform}
                      title={SOCIAL_LABEL[item.platform] || item.platform}
                    >
                      <Icon name={item.platform} size={18} />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom */}
        <div className="smk-footer-bottom">
          <p className="smk-footer-bottom-title">
            Sistem Informasi {pengaturan.nama_sekolah || "SMK Negeri 3 Balige"}
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
