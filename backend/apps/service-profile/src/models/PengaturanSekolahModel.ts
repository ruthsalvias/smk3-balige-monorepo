import { DataTypes } from "sequelize";
import { dbProfile } from "../config/database";

const PengaturanSekolahModel = dbProfile.define(
  "m_pengaturan_sekolah",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nama_sekolah: { type: DataTypes.STRING, allowNull: false, defaultValue: "SMK Negeri 3 Balige" },
    nama_singkat: { type: DataTypes.STRING, allowNull: true, defaultValue: "SMKN 3 Balige" },
    tagline: { type: DataTypes.STRING, allowNull: true, defaultValue: "Excellence in Education" },
    deskripsi_singkat: { type: DataTypes.TEXT, allowNull: true },
    tahun_ajaran: { type: DataTypes.STRING, allowNull: true },
    logo_url: { type: DataTypes.STRING, allowNull: true },
    alamat: { type: DataTypes.TEXT, allowNull: true },
    // satu baris = satu nomor / alamat / rentang jam
    telepon: { type: DataTypes.TEXT, allowNull: true },
    email: { type: DataTypes.TEXT, allowNull: true },
    jam_operasional: { type: DataTypes.TEXT, allowNull: true },
    // [{ platform: "instagram", url: "https://..." }]
    sosial_media: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
    // Array of image paths for hero slider: ["pengaturan/hero-xxx.jpg", ...]
    hero_images: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
    // Background image for login page
    login_bg_url: { type: DataTypes.STRING, allowNull: true },
  },
  {
    freezeTableName: true,
    tableName: "m_pengaturan_sekolah",
  },
);

export default PengaturanSekolahModel;
