import { configureStore } from "@reduxjs/toolkit";
import {
  sejarahIdentitasReducer,
  visiMisiReducer,
  strukturOrganisasiReducer,
  fasilitasReducer,
  prestasiReducer,
  programKeahlianReducer,
  mitraKerjasamaReducer,
  profilLoadingReducer,
} from "./features/profil/states/reducer";
import { portofolioReducer } from "./features/portofolio/states/reducer";
import {
  beritaReducer,
  agendaReducer,
  pengumumanReducer,
  beritaLoadingReducer,
} from "./features/berita/states/reducer";

// Tambahkan ini
import {
  siswaReducer,
  guruReducer,
  statsSiswaReducer,
  manajemenLoadingReducer,
  hasMoreSiswaReducer, 
  hasMoreGuruReducer,
  totalSiswaReducer,
  totalGuruReducer,
} from "./features/manajemen-data/states/reducer";

const store = configureStore({
  reducer: {
    // Profil
    sejarahIdentitas: sejarahIdentitasReducer,
    visiMisi: visiMisiReducer,
    strukturOrganisasi: strukturOrganisasiReducer,
    fasilitas: fasilitasReducer,
    prestasi: prestasiReducer,
    programKeahlian: programKeahlianReducer,
    mitraKerjasama: mitraKerjasamaReducer,
 profilLoading: profilLoadingReducer,

    
    siswa: siswaReducer,
    guru: guruReducer,
    statsSiswa: statsSiswaReducer,
    manajemenLoading: manajemenLoadingReducer,

    hasMoreSiswa: hasMoreSiswaReducer,
    hasMoreGuru:  hasMoreGuruReducer,
    totalSiswa:   totalSiswaReducer,
    totalGuru:    totalGuruReducer,
    portofolio: portofolioReducer,

    // Berita & Informasi
    berita: beritaReducer,
    agenda: agendaReducer,
    pengumuman: pengumumanReducer,
    beritaLoading: beritaLoadingReducer,
  },
});

export default store;