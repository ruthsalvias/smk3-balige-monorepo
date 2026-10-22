import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import ProfilLayout from "../layouts/ProfilLayout";
import Icon from "../../../components/Icon";
import Reveal from "../../../components/Reveal";
import portofolioApi, {
  getPortofolioImageUrl,
} from "../../portofolio/api/portofolioApi";

const initial = (name) => String(name || "?").trim().charAt(0).toUpperCase();

const ringkas = (text, max = 160) => {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max)}…` : clean;
};

const parseSkills = (skill) =>
  String(skill || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);

export default function PortofolioPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [jurusan, setJurusan] = useState("Semua");

  useEffect(() => {
    let aktif = true;

    (async () => {
      try {
        setLoading(true);
        const res = await portofolioApi.getPortofolios({ page: 1, limit: 50 });
        const data = Array.isArray(res?.data) ? res.data : [];
        if (aktif) setItems(data);
      } catch {
        if (aktif) setError("Gagal memuat portofolio siswa.");
      } finally {
        if (aktif) setLoading(false);
      }
    })();

    return () => {
      aktif = false;
    };
  }, []);

  const jurusanList = useMemo(() => {
    const set = new Set(items.map((i) => i.major).filter(Boolean));
    return ["Semua", ...Array.from(set)];
  }, [items]);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return items
      .filter((i) => (jurusan === "Semua" ? true : i.major === jurusan))
      .filter((i) =>
        keyword
          ? [i.title, i.description, i.studentName, i.major, i.skill, i.category]
              .map((v) => String(v || "").toLowerCase())
              .some((v) => v.includes(keyword))
          : true,
      );
  }, [items, query, jurusan]);

  return (
    <ProfilLayout>
      {/* HERO */}
      <section className="smk-galeri-hero">
        <div className="smk-container">
          <span className="smk-badge">Karya Siswa</span>
          <h1 className="smk-galeri-title">
            Galeri <span>Portofolio</span> Siswa
          </h1>
          <p className="smk-galeri-sub">
            Kumpulan karya terbaik siswa yang mencerminkan kompetensi, kreativitas,
            dan semangat berkarya di setiap program keahlian.
          </p>

          <div className="smk-hero-search">
            <div className="smk-search-box">
              <span className="smk-search-icon">
                <Icon name="search" size={18} />
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari karya siswa..."
                aria-label="Cari karya siswa"
              />
              {query && (
                <button
                  type="button"
                  className="smk-search-clear"
                  onClick={() => setQuery("")}
                  aria-label="Bersihkan pencarian"
                >
                  <Icon name="close" size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FILTER JURUSAN */}
      {jurusanList.length > 1 && (
        <section className="smk-section" style={{ paddingBottom: 0 }}>
          <div className="smk-container smk-center">
            <div className="smk-berita-filters">
              {jurusanList.map((j) => (
                <button
                  key={j}
                  className={`smk-filter-btn${jurusan === j ? " is-active" : ""}`}
                  onClick={() => setJurusan(j)}
                >
                  {j}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* GRID KARYA */}
      <section className="smk-section">
        <div className="smk-container">
          {loading ? (
            <p className="smk-state-text">Memuat karya siswa…</p>
          ) : error ? (
            <p className="smk-state-text">{error}</p>
          ) : filtered.length === 0 ? (
            <p className="smk-state-text">
              {query || jurusan !== "Semua"
                ? "Tidak ada karya yang cocok dengan pencarian."
                : "Belum ada portofolio yang dipublikasikan."}
            </p>
          ) : (
            <div className="smk-galeri-grid">
              {filtered.map((item, idx) => {
                const img = getPortofolioImageUrl(item.image);
                const skills = parseSkills(item.skill);

                return (
                  <Reveal
                    as={NavLink}
                    to={`/portofolio/${item.id}`}
                    variant="up"
                    delay={(idx % 3) * 90}
                    className="smk-galeri-card"
                    key={item.id}
                  >
                    <div className="smk-galeri-img">
                      {img ? (
                        <img
                          src={img}
                          alt={item.title}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            if (e.currentTarget.nextElementSibling) {
                              e.currentTarget.nextElementSibling.style.display = "flex";
                            }
                          }}
                        />
                      ) : null}
                      <div
                        className="smk-galeri-placeholder"
                        style={{ display: img ? "none" : "flex" }}
                      >
                        <Icon name="image" size={40} />
                      </div>
                      {(item.category || item.major) && (
                        <span className="smk-galeri-chip">
                          {item.category || item.major}
                        </span>
                      )}
                    </div>

                    <div className="smk-galeri-body">
                      <h3 className="smk-galeri-card-title">{item.title}</h3>
                      <p className="smk-galeri-desc">{ringkas(item.description)}</p>
                      {skills.length > 0 && (
                        <div className="smk-galeri-skills">
                          {skills.map((s, i) => (
                            <span key={i} className="smk-galeri-skill">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="smk-galeri-footer">
                      <div className="smk-galeri-avatar">
                        {initial(item.studentName)}
                      </div>
                      <div className="smk-galeri-author">
                        <strong>{item.studentName}</strong>
                        <span>{item.major || "Siswa"}</span>
                      </div>
                      <span className="smk-galeri-more" style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "0.85rem", fontWeight: 700, color: "var(--p-navy-700)" }}>
                        Selengkapnya <Icon name="chevron-right" size={16} />
                      </span>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </ProfilLayout>
  );
}
