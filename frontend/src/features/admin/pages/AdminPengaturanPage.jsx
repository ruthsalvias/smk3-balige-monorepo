import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import Icon from "../../../components/Icon";
import { mediaUrl } from "../components/AdminComponents";
import { getPengaturan, putPengaturan } from "../../profil/api/pengaturanApi";
import { useSiteSettings } from "../../profil/context/SiteSettingsContext";
import { showConfirmDialog, showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

const PLATFORMS = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "twitter", label: "X / Twitter" },
  { value: "tiktok", label: "TikTok" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "globe", label: "Website Lain" },
];

const EMPTY = {
  nama_sekolah: "",
  nama_singkat: "",
  tagline: "",
  deskripsi_singkat: "",
  tahun_ajaran: "",
  alamat: "",
  telepon: "",
  email: "",
  jam_operasional: "",
};

export default function AdminPengaturanPage() {
  const { refresh } = useSiteSettings();
  const [form, setForm] = useState(EMPTY);
  const [sosial, setSosial] = useState([]);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Hero images state
  const [heroExisting, setHeroExisting] = useState([]);
  const [heroNewFiles, setHeroNewFiles] = useState([]);
  const [heroNewPreviews, setHeroNewPreviews] = useState([]);

  // Login bg state
  const [loginBgFile, setLoginBgFile] = useState(null);
  const [loginBgPreview, setLoginBgPreview] = useState(null);
  const [loginBgRemoved, setLoginBgRemoved] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getPengaturan();
        if (!alive) return;
        setForm({
          nama_sekolah: data.nama_sekolah || "",
          nama_singkat: data.nama_singkat || "",
          tagline: data.tagline || "",
          deskripsi_singkat: data.deskripsi_singkat || "",
          tahun_ajaran: data.tahun_ajaran || "",
          alamat: data.alamat || "",
          telepon: data.telepon || "",
          email: data.email || "",
          jam_operasional: data.jam_operasional || "",
        });
        setSosial(Array.isArray(data.sosial_media) ? data.sosial_media : []);
        setLogoPreview(mediaUrl(data.logo_url));
        setHeroExisting(Array.isArray(data.hero_images) ? data.hero_images : []);
        setLoginBgPreview(data.login_bg_url ? mediaUrl(data.login_bg_url) : null);
        setLoginBgRemoved(false);
      } catch (err) {
        showErrorDialog(err.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const onChange = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const onLogo = (file) => {
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const addSosial = () => setSosial((prev) => [...prev, { platform: "facebook", url: "" }]);
  const updateSosial = (index, key, value) =>
    setSosial((prev) => prev.map((it, i) => (i === index ? { ...it, [key]: value } : it)));
  const removeSosial = (index) => setSosial((prev) => prev.filter((_, i) => i !== index));

  // Hero image handlers
  const addHeroFiles = (files) => {
    const arr = Array.from(files);
    setHeroNewFiles((p) => [...p, ...arr]);
    setHeroNewPreviews((p) => [...p, ...arr.map((f) => URL.createObjectURL(f))]);
  };

  const removeExistingHero = async (index) => {
    const r = await showConfirmDialog(`Hapus foto slider ke-${index + 1} ini?`);
    if (!r.isConfirmed) return;

    const nextHero = heroExisting.filter((_, i) => i !== index);
    setHeroExisting(nextHero);

    try {
      setSaving(true);
      const cleanSosial = sosial.filter((s) => s.platform && s.url?.trim()).map((s) => ({ platform: s.platform, url: s.url.trim() }));
      await putPengaturan(
        {
          ...form,
          sosial_media: cleanSosial,
          hero_images: nextHero,
        },
        null,
        null,
        null
      );
      await refresh();
      showSuccessDialog("Foto slider berhasil dihapus");
    } catch (err) {
      showErrorDialog("Gagal menghapus foto slider: " + err.message);
      setHeroExisting(heroExisting);
    } finally {
      setSaving(false);
    }
  };

  const removeNewHero = (index) => {
    setHeroNewFiles((p) => p.filter((_, i) => i !== index));
    setHeroNewPreviews((p) => {
      URL.revokeObjectURL(p[index]);
      return p.filter((_, i) => i !== index);
    });
  };

  const handleSaveNewHero = async () => {
    if (heroNewFiles.length === 0) return;
    setSaving(true);
    try {
      const cleanSosial = sosial.filter((s) => s.platform && s.url?.trim()).map((s) => ({ platform: s.platform, url: s.url.trim() }));
      await putPengaturan(
        {
          ...form,
          sosial_media: cleanSosial,
          hero_images: heroExisting,
        },
        null,
        heroNewFiles,
        null
      );
      setHeroNewFiles([]);
      setHeroNewPreviews([]);
      await refresh();
      const data = await getPengaturan();
      setHeroExisting(Array.isArray(data.hero_images) ? data.hero_images : []);
      showSuccessDialog("Foto slider baru berhasil disimpan");
    } catch (err) {
      showErrorDialog("Gagal mengunggah foto slider: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Login bg handlers
  const onLoginBg = (file) => {
    if (!file) return;
    setLoginBgFile(file);
    setLoginBgPreview(URL.createObjectURL(file));
    setLoginBgRemoved(false);
  };

  const onRemoveLoginBg = async () => {
    if (loginBgFile) {
      setLoginBgFile(null);
      try {
        const data = await getPengaturan();
        setLoginBgPreview(data.login_bg_url ? mediaUrl(data.login_bg_url) : null);
      } catch {
        setLoginBgPreview(null);
      }
      setLoginBgRemoved(false);
      return;
    }

    const r = await showConfirmDialog("Hapus background halaman login? Halaman login akan menggunakan latar warna bawaan.");
    if (!r.isConfirmed) return;

    try {
      setSaving(true);
      const cleanSosial = sosial.filter((s) => s.platform && s.url?.trim()).map((s) => ({ platform: s.platform, url: s.url.trim() }));
      await putPengaturan(
        {
          ...form,
          sosial_media: cleanSosial,
          hero_images: heroExisting,
          login_bg_url: "",
        },
        null,
        null,
        null
      );
      setLoginBgFile(null);
      setLoginBgPreview(null);
      setLoginBgRemoved(false);
      await refresh();
      showSuccessDialog("Background halaman login berhasil dihapus");
    } catch (err) {
      showErrorDialog("Gagal menghapus background: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNewLoginBg = async () => {
    if (!loginBgFile) return;
    setSaving(true);
    try {
      const cleanSosial = sosial.filter((s) => s.platform && s.url?.trim()).map((s) => ({ platform: s.platform, url: s.url.trim() }));
      await putPengaturan(
        {
          ...form,
          sosial_media: cleanSosial,
          hero_images: heroExisting,
        },
        null,
        null,
        loginBgFile
      );
      setLoginBgFile(null);
      await refresh();
      const data = await getPengaturan();
      setLoginBgPreview(data.login_bg_url ? mediaUrl(data.login_bg_url) : null);
      showSuccessDialog("Background halaman login berhasil diperbarui");
    } catch (err) {
      showErrorDialog("Gagal menyimpan background: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nama_sekolah.trim()) { showErrorDialog("Nama sekolah wajib diisi"); return; }
    setSaving(true);
    try {
      const cleanSosial = sosial.filter((s) => s.platform && s.url.trim()).map((s) => ({ platform: s.platform, url: s.url.trim() }));
      await putPengaturan(
        {
          ...form,
          sosial_media: cleanSosial,
          hero_images: heroExisting,
          ...(loginBgRemoved ? { login_bg_url: "" } : {}),
        },
        logoFile,
        heroNewFiles.length > 0 ? heroNewFiles : null,
        loginBgFile
      );
      setLogoFile(null);
      setHeroNewFiles([]);
      setHeroNewPreviews([]);
      setLoginBgFile(null);
      setLoginBgRemoved(false);
      await refresh();
      const data = await getPengaturan();
      setHeroExisting(Array.isArray(data.hero_images) ? data.hero_images : []);
      setLoginBgPreview(data.login_bg_url ? mediaUrl(data.login_bg_url) : null);
      showSuccessDialog("Pengaturan sekolah berhasil disimpan");
    } catch (err) {
      showErrorDialog(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Pengaturan Sekolah"
      subtitle="Identitas, kontak, jam operasional, dan tampilan website."
    >
      {loading ? (
        <div className="smk-admin-card">
          <div className="smk-admin-card-body smk-admin-table-state">
            <span className="smk-admin-spinner" /> Memuat pengaturan...
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="smk-settings-grid">
          {/* IDENTITAS */}
          <section className="smk-admin-card">
            <div className="smk-admin-card-header">
              <div>
                <div className="smk-admin-card-title"><Icon name="shield" size={18} /> Identitas Sekolah</div>
                <div className="smk-admin-card-sub">Nama, tagline, dan logo resmi.</div>
              </div>
            </div>
            <div className="smk-admin-card-body">
              <div className="smk-form-row">
                <div className="smk-form-group">
                  <label htmlFor="nama_sekolah">Nama Sekolah</label>
                  <input id="nama_sekolah" value={form.nama_sekolah} onChange={onChange("nama_sekolah")} placeholder="SMK NEGERI 3 BALIGE" />
                </div>
                <div className="smk-form-group">
                  <label htmlFor="nama_singkat">Nama Singkat</label>
                  <input id="nama_singkat" value={form.nama_singkat} onChange={onChange("nama_singkat")} placeholder="SMKN 3 Balige" />
                </div>
              </div>
              <div className="smk-form-row">
                <div className="smk-form-group">
                  <label htmlFor="tagline">Tagline</label>
                  <input id="tagline" value={form.tagline} onChange={onChange("tagline")} placeholder="Excellence in Education" />
                </div>
                <div className="smk-form-group">
                  <label htmlFor="tahun_ajaran">Tahun Ajaran</label>
                  <input id="tahun_ajaran" value={form.tahun_ajaran} onChange={onChange("tahun_ajaran")} placeholder="2025/2026" />
                </div>
              </div>
              <div className="smk-form-group">
                <label htmlFor="deskripsi_singkat">Deskripsi Singkat</label>
                <textarea id="deskripsi_singkat" rows={3} value={form.deskripsi_singkat} onChange={onChange("deskripsi_singkat")} placeholder="Kalimat singkat tentang sekolah." />
              </div>
              <div className="smk-form-group">
                <label>Logo Sekolah</label>
                <div className="smk-logo-picker">
                  <div className="smk-logo-preview">
                    {logoPreview ? <img src={logoPreview} alt="Logo sekolah" /> : <Icon name="image" size={26} />}
                  </div>
                  <label htmlFor="logo-input" className="smk-btn-outline">
                    <Icon name="upload" size={16} /> Pilih Logo
                    <input id="logo-input" type="file" accept="image/*" hidden onChange={(e) => onLogo(e.target.files?.[0])} />
                  </label>
                </div>
                <small className="smk-form-hint">PNG / JPG / WEBP, maksimal 5MB.</small>
              </div>
            </div>
          </section>

          {/* KONTAK */}
          <section className="smk-admin-card">
            <div className="smk-admin-card-header">
              <div>
                <div className="smk-admin-card-title"><Icon name="mapPin" size={18} /> Kontak & Jam Operasional</div>
                <div className="smk-admin-card-sub">Tulis satu item per baris untuk telepon, email, dan jam operasional.</div>
              </div>
            </div>
            <div className="smk-admin-card-body">
              <div className="smk-form-group">
                <label htmlFor="alamat">Alamat</label>
                <textarea id="alamat" rows={2} value={form.alamat} onChange={onChange("alamat")} placeholder="Jl. Pendidikan No. 123, Balige" />
              </div>
              <div className="smk-form-group">
                <label htmlFor="telepon">Telepon</label>
                <textarea id="telepon" rows={2} value={form.telepon} onChange={onChange("telepon")} placeholder={"(021) 1234-5678\n+62 812-3456-7890"} />
              </div>
              <div className="smk-form-group">
                <label htmlFor="email">Email</label>
                <textarea id="email" rows={2} value={form.email} onChange={onChange("email")} placeholder={"info@sekolah.sch.id\nadmin@sekolah.sch.id"} />
              </div>
              <div className="smk-form-group">
                <label htmlFor="jam_operasional">Jam Operasional</label>
                <textarea id="jam_operasional" rows={2} value={form.jam_operasional} onChange={onChange("jam_operasional")} placeholder={"Senin - Jumat: 07:00 - 15:00\nSabtu: 07:00 - 12:00"} />
              </div>
            </div>
          </section>

          {/* ── HERO SLIDER ─────────────────────────────── */}
          <section className="smk-admin-card smk-settings-full">
            <div className="smk-admin-card-header">
              <div>
                <div className="smk-admin-card-title"><Icon name="image" size={18} /> Gambar Hero (Slider Beranda)</div>
                <div className="smk-admin-card-sub">Upload beberapa foto untuk slider beranda. Pengunjung bisa geser dan klik.</div>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                {heroNewFiles.length > 0 && (
                  <button
                    type="button"
                    className="smk-btn-primary smk-admin-btn-sm"
                    style={{ background: "#16a34a" }}
                    onClick={handleSaveNewHero}
                    disabled={saving}
                  >
                    <Icon name="upload" size={15} /> Simpan {heroNewFiles.length} Foto Baru
                  </button>
                )}
                <label htmlFor="hero-input" className="smk-btn-primary smk-admin-btn-sm" style={{ cursor: "pointer" }}>
                  <Icon name="plus" size={15} /> Tambah Foto
                  <input id="hero-input" type="file" accept="image/*" multiple hidden onChange={(e) => { addHeroFiles(e.target.files); e.target.value = ""; }} />
                </label>
              </div>
            </div>
            <div className="smk-admin-card-body">
              {heroExisting.length === 0 && heroNewPreviews.length === 0 ? (
                <p className="smk-admin-empty-inline">Belum ada gambar hero. Gambar bawaan akan digunakan.</p>
              ) : (
                <div className="smk-hero-admin-grid">
                  {heroExisting.map((path, i) => (
                    <div key={`ex-${i}`} className="smk-hero-admin-item">
                      <div className="smk-hero-admin-thumb">
                        <img src={mediaUrl(path)} alt={`Hero ${i + 1}`} />
                        <span className="smk-hero-admin-badge">{i + 1}</span>
                      </div>
                      <div className="smk-hero-admin-footer">
                        <span className="smk-hero-admin-name">Foto #{i + 1}</span>
                        <button
                          type="button"
                          className="smk-hero-btn-delete"
                          onClick={() => removeExistingHero(i)}
                          title="Hapus foto ini"
                          disabled={saving}
                        >
                          <Icon name="trash" size={13} /> Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                  {heroNewPreviews.map((url, i) => (
                    <div key={`new-${i}`} className="smk-hero-admin-item smk-hero-admin-new">
                      <div className="smk-hero-admin-thumb">
                        <img src={url} alt={`Baru ${i + 1}`} />
                        <span className="smk-hero-admin-badge" style={{ background: "#d97706" }}>Baru</span>
                      </div>
                      <div className="smk-hero-admin-footer">
                        <span className="smk-hero-admin-name" style={{ color: "#d97706", fontWeight: 600 }}>Belum disimpan</span>
                        <button
                          type="button"
                          className="smk-hero-btn-delete"
                          onClick={() => removeNewHero(i)}
                          title="Batal upload"
                        >
                          <Icon name="x" size={13} /> Batal
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ── LOGIN BACKGROUND ─────────────────────────── */}
          <section className="smk-admin-card smk-settings-full">
            <div className="smk-admin-card-header">
              <div>
                <div className="smk-admin-card-title"><Icon name="image" size={18} /> Background Halaman Login</div>
                <div className="smk-admin-card-sub">Foto ini ditampilkan sebagai latar belakang login dengan efek blur/samar.</div>
              </div>
            </div>
            <div className="smk-admin-card-body">
              <div className="smk-loginbg-picker">
                <div className="smk-loginbg-preview">
                  {loginBgPreview ? (
                    <img src={loginBgPreview} alt="Background login" />
                  ) : (
                    <div className="smk-loginbg-empty">
                      <Icon name="image" size={32} />
                      <span>Belum ada background. Warna solid bawaan akan digunakan.</span>
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                  <label htmlFor="loginbg-input" className="smk-btn-outline" style={{ cursor: "pointer" }}>
                    <Icon name="upload" size={16} /> {loginBgPreview ? "Ganti Background" : "Upload Background"}
                    <input id="loginbg-input" type="file" accept="image/*" hidden onChange={(e) => { onLoginBg(e.target.files?.[0]); e.target.value = ""; }} />
                  </label>
                  {loginBgFile && (
                    <button
                      type="button"
                      className="smk-btn-primary smk-admin-btn-sm"
                      style={{ background: "#16a34a" }}
                      onClick={handleSaveNewLoginBg}
                      disabled={saving}
                    >
                      <Icon name="upload" size={15} /> Simpan Background Baru
                    </button>
                  )}
                  {loginBgPreview && (
                    <button
                      type="button"
                      className="smk-btn-outline"
                      style={{ color: "#ef4444", borderColor: "#fca5a5" }}
                      onClick={onRemoveLoginBg}
                      disabled={saving}
                    >
                      <Icon name="trash" size={16} /> {loginBgFile ? "Batal Pilihan" : "Hapus Background"}
                    </button>
                  )}
                </div>
              </div>
              <small className="smk-form-hint">Foto akan ditampilkan dengan efek blur dan overlay gelap.</small>
            </div>
          </section>

          {/* SOSIAL MEDIA */}
          <section className="smk-admin-card smk-settings-full">
            <div className="smk-admin-card-header">
              <div>
                <div className="smk-admin-card-title"><Icon name="globe" size={18} /> Media Sosial</div>
                <div className="smk-admin-card-sub">Tautan yang muncul di footer website.</div>
              </div>
              <button type="button" className="smk-btn-primary smk-admin-btn-sm" onClick={addSosial}>
                <Icon name="plus" size={15} /> Tambah
              </button>
            </div>
            <div className="smk-admin-card-body">
              {sosial.length === 0 ? (
                <p className="smk-admin-empty-inline">Belum ada tautan media sosial.</p>
              ) : (
                <div className="smk-repeater">
                  {sosial.map((item, index) => (
                    <div className="smk-repeater-row" key={index}>
                      <span className="smk-repeater-icon"><Icon name={item.platform || "globe"} size={18} /></span>
                      <select value={item.platform} onChange={(e) => updateSosial(index, "platform", e.target.value)} aria-label="Platform">
                        {PLATFORMS.map((p) => (<option key={p.value} value={p.value}>{p.label}</option>))}
                      </select>
                      <input type="url" value={item.url} onChange={(e) => updateSosial(index, "url", e.target.value)} placeholder="https://..." aria-label="URL" />
                      <button type="button" className="smk-admin-btn-delete" onClick={() => removeSosial(index)} aria-label="Hapus">
                        <Icon name="trash" size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <div className="smk-settings-actions smk-settings-full">
            <button type="submit" className="smk-btn-primary" disabled={saving}>
              {saving ? (<><span className="smk-admin-spinner smk-admin-spinner-sm" /> Menyimpan...</>) : (<><Icon name="shield" size={16} /> Simpan Pengaturan</>)}
            </button>
          </div>
        </form>
      )}
    </AdminLayout>
  );
}
