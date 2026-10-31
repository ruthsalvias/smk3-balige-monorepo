import apiGateway from '../../../config/axios';

const PREFIX = '/akun';

export async function getDaftarAkun() {
  const res = await apiGateway.get(PREFIX);
  return res.data?.data ?? [];
}

export async function buatAkun(payload) {
  const res = await apiGateway.post(PREFIX, payload);
  return res.data;
}

export async function buatAkunSiswaMassal(payload) {
  const res = await apiGateway.post(`${PREFIX}/siswa-massal`, payload);
  return res.data;
}

export async function resetPasswordAkun(id, password) {
  const res = await apiGateway.post(`${PREFIX}/${id}/reset-password`, { password });
  return res.data;
}

export async function ubahStatusAkun(id, aktif) {
  const res = await apiGateway.patch(`${PREFIX}/${id}/status`, { aktif });
  return res.data;
}

export async function hapusAkun(id) {
  const res = await apiGateway.delete(`${PREFIX}/${id}`);
  return res.data;
}

export async function ubahPasswordSendiri(passwordBaru) {
  const res = await apiGateway.post(`${PREFIX}/saya/ubah-password`, { passwordBaru });
  return res.data;
}
