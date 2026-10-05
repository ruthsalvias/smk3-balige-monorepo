import { DataTypes } from "sequelize";
import { dbPelanggaran } from "../config/database";

const SiswaModel = dbPelanggaran.define("m_siswa", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nama: { type: DataTypes.STRING, allowNull: false },
    kelas: { type: DataTypes.STRING, allowNull: false },
    no_wa_ortu: { type: DataTypes.STRING, allowNull: true },
    // Dipakai untuk mencocokkan data saat sinkronisasi dari service-management.
    nis: { type: DataTypes.STRING, allowNull: true },
}, {
    freezeTableName: true, // 👈 Tambahkan ini agar tetap 'm_siswa'
    tableName: 'm_siswa'
});

export default SiswaModel;