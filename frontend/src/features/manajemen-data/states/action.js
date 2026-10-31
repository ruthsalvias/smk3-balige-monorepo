import manajemenApi from "../api/manajemenApi.js";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

export const ActionType = {
  SET_SISWA: "SET_SISWA",
  SET_GURU: "SET_GURU",
  SET_STATS_SISWA: "SET_STATS_SISWA",
  SET_LOADING: "SET_LOADING",
  SET_HAS_MORE_SISWA: "SET_HAS_MORE_SISWA",
  SET_HAS_MORE_GURU: "SET_HAS_MORE_GURU",
};

// =======================
// SYNC
// =======================
export const setSiswa = (data) => ({
  type: ActionType.SET_SISWA,
  payload: data,
});

export const setGuru = (data) => ({
  type: ActionType.SET_GURU,
  payload: data,
});

export const setStatsSiswa = (data) => ({
  type: ActionType.SET_STATS_SISWA,
  payload: data,
});

export const setLoading = (status) => ({
  type: ActionType.SET_LOADING,
  payload: status,
});

export const setHasMoreSiswa = (val) => ({ type: ActionType.SET_HAS_MORE_SISWA, payload: val });

export const setHasMoreGuru  = (val) => ({ type: ActionType.SET_HAS_MORE_GURU,  payload: val });
// =======================
// SISWA
// =======================
export function asyncGetSiswa(offset = 0, limit = 20) {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      const data = await manajemenApi.getSiswaPage(limit, offset);
      dispatch(setSiswa(data.data.siswa));
      dispatch(setHasMoreSiswa(data.data.hasMore));
    } catch (e) {
      dispatch(setSiswa([]));
      showErrorDialog(e.message);
    } finally {
      dispatch(setLoading(false));
    }
  };
}

// Tambahkan setelah asyncGetSiswa

export function asyncGetStatsSiswa() {
  return async (dispatch) => {
    try {
      const data = await manajemenApi.getStatsSiswa();
      dispatch(setStatsSiswa(data.data));
    } catch (e) {
      showErrorDialog(e.message);
    }
  };
}

export function asyncPostSiswa(payload, cb) {
  return async (dispatch) => {
    try {
      await manajemenApi.postSiswa(payload);
      showSuccessDialog("Siswa berhasil ditambahkan");
      dispatch(asyncGetSiswa());
      dispatch(asyncGetStatsSiswa());
      if (cb) cb();
    } catch (e) {
      showErrorDialog(e.message);
    }
  };
}

export function asyncPutSiswa(id, payload, cb) {
  return async (dispatch) => {
    try {
      await manajemenApi.putSiswa(id, payload);
      showSuccessDialog("Siswa berhasil diperbarui");
      dispatch(asyncGetSiswa());
      if (cb) cb();
    } catch (e) {
      showErrorDialog(e.message);
    }
  };
}

export function asyncDeleteSiswa(id, cb) {
  return async (dispatch) => {
    try {
      await manajemenApi.deleteSiswa(id);
      showSuccessDialog("Siswa berhasil dihapus");
      dispatch(asyncGetSiswa());
      dispatch(asyncGetStatsSiswa());
      if (cb) cb();
    } catch (e) {
      showErrorDialog(e.message);
    }
  };
}

// =======================
// GURU
// =======================

export function asyncGetGuru(offset = 0, limit = 20) {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));
      const data = await manajemenApi.getGuruPage(limit, offset);
      dispatch(setGuru(data.data.guru));
      dispatch(setHasMoreGuru(data.data.hasMore));
    } catch (e) {
      dispatch(setGuru([]));
      showErrorDialog(e.message);
    } finally {
      dispatch(setLoading(false));
    }
  };
}

export function asyncPostGuru(payload, cb) {
  return async (dispatch) => {
    try {
      await manajemenApi.postGuru(payload);
      showSuccessDialog("Guru berhasil ditambahkan");
      dispatch(asyncGetGuru());
      if (cb) cb();
    } catch (e) {
      showErrorDialog(e.message);
    }
  };
}

export function asyncPutGuru(id, payload, cb) {
  return async (dispatch) => {
    try {
      await manajemenApi.putGuru(id, payload);
      showSuccessDialog("Guru berhasil diperbarui");
      dispatch(asyncGetGuru());
      if (cb) cb();
    } catch (e) {
      showErrorDialog(e.message);
    }
  };
}

export function asyncDeleteGuru(id, cb) {
  return async (dispatch) => {
    try {
      await manajemenApi.deleteGuru(id);
      showSuccessDialog("Guru berhasil dihapus");
      dispatch(asyncGetGuru());
      if (cb) cb();
    } catch (e) {
      showErrorDialog(e.message);
    }
  };
}