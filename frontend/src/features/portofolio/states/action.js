import portofolioApi from '../api/portofolioApi';

// Action Types

export const PORTO_SUBMIT_REQUEST = 'PORTO_SUBMIT_REQUEST';
export const PORTO_SUBMIT_SUCCESS = 'PORTO_SUBMIT_SUCCESS';
export const PORTO_SUBMIT_FAILURE = 'PORTO_SUBMIT_FAILURE';

export const PORTO_PUBLISH_REQUEST = 'PORTO_PUBLISH_REQUEST';
export const PORTO_PUBLISH_SUCCESS = 'PORTO_PUBLISH_SUCCESS';
export const PORTO_PUBLISH_FAILURE = 'PORTO_PUBLISH_FAILURE';

export const PORTO_REJECT_REQUEST = 'PORTO_REJECT_REQUEST';
export const PORTO_REJECT_SUCCESS = 'PORTO_REJECT_SUCCESS';
export const PORTO_REJECT_FAILURE = 'PORTO_REJECT_FAILURE';

export const PORTO_FETCH_ALL_REQUEST = 'PORTO_FETCH_ALL_REQUEST';
export const PORTO_FETCH_ALL_SUCCESS = 'PORTO_FETCH_ALL_SUCCESS';
export const PORTO_FETCH_ALL_FAILURE = 'PORTO_FETCH_ALL_FAILURE';

export const PORTO_FETCH_MINE_REQUEST = 'PORTO_FETCH_MINE_REQUEST';
export const PORTO_FETCH_MINE_SUCCESS = 'PORTO_FETCH_MINE_SUCCESS';
export const PORTO_FETCH_MINE_FAILURE = 'PORTO_FETCH_MINE_FAILURE';

export const PORTO_FETCH_ONE_REQUEST = 'PORTO_FETCH_ONE_REQUEST';
export const PORTO_FETCH_ONE_SUCCESS = 'PORTO_FETCH_ONE_SUCCESS';
export const PORTO_FETCH_ONE_FAILURE = 'PORTO_FETCH_ONE_FAILURE';

export const PORTO_CREATE_REQUEST = 'PORTO_CREATE_REQUEST';
export const PORTO_CREATE_SUCCESS = 'PORTO_CREATE_SUCCESS';
export const PORTO_CREATE_FAILURE = 'PORTO_CREATE_FAILURE';

export const PORTO_UPDATE_REQUEST = 'PORTO_UPDATE_REQUEST';
export const PORTO_UPDATE_SUCCESS = 'PORTO_UPDATE_SUCCESS';
export const PORTO_UPDATE_FAILURE = 'PORTO_UPDATE_FAILURE';

export const PORTO_DELETE_REQUEST = 'PORTO_DELETE_REQUEST';
export const PORTO_DELETE_SUCCESS = 'PORTO_DELETE_SUCCESS';
export const PORTO_DELETE_FAILURE = 'PORTO_DELETE_FAILURE';

// Thunk Actions
export const fetchAllPortofolio = (params) => async (dispatch) => {
  dispatch({ type: PORTO_FETCH_ALL_REQUEST });
  try {
    const data = await portofolioApi.getAll(params);
    dispatch({ type: PORTO_FETCH_ALL_SUCCESS, payload: data.data ?? [] });
  } catch (error) {
    dispatch({ type: PORTO_FETCH_ALL_FAILURE, payload: error.message });
  }
};

export const fetchMyPortofolios = (params) => async (dispatch) => {
  dispatch({ type: PORTO_FETCH_MINE_REQUEST });
  try {
    const data = await portofolioApi.getMyPortofolios(params);
    dispatch({ type: PORTO_FETCH_MINE_SUCCESS, payload: data.data ?? [] });
  } catch (error) {
    dispatch({ type: PORTO_FETCH_MINE_FAILURE, payload: error.message });
  }
};

export const fetchOnePortofolio = (id) => async (dispatch) => {
  dispatch({ type: PORTO_FETCH_ONE_REQUEST });
  try {
    const data = await portofolioApi.getOne(id);
    dispatch({ type: PORTO_FETCH_ONE_SUCCESS, payload: data.data ?? data });
  } catch (error) {
    dispatch({ type: PORTO_FETCH_ONE_FAILURE, payload: error.message });
  }
};

// src/features/portofolio/states/action.js

export const createPortofolio = (payload) => async (dispatch) => {
  dispatch({ type: PORTO_CREATE_REQUEST });
  try {
    const data = await portofolioApi.createPortofolio(payload);
    dispatch({ type: PORTO_CREATE_SUCCESS, payload: data.data });
    
    // Ambil data terbaru dari server agar list di frontend langsung sinkron dengan PostgreSQL
    const params = { page: 1, limit: 10 };
    dispatch(fetchAllPortofolio(params)); 
    
    return { success: true };
  } catch (error) {
    dispatch({ type: PORTO_CREATE_FAILURE, payload: error.message });
    return { success: false, message: error.message };
  }
};

export const updatePortofolio = (id, payload) => async (dispatch) => {
  dispatch({ type: PORTO_UPDATE_REQUEST });
  try {
    const data = await portofolioApi.updatePortofolio(id, payload);
    dispatch({ type: PORTO_UPDATE_SUCCESS, payload: data.data });
    return { success: true };
  } catch (error) {
    dispatch({ type: PORTO_UPDATE_FAILURE, payload: error.message });
    return { success: false, message: error.message };
  }
};

export const deletePortofolio = (id) => async (dispatch) => {
  dispatch({ type: PORTO_DELETE_REQUEST });
  try {
    await portofolioApi.deletePortofolio(id);
    dispatch({ type: PORTO_DELETE_SUCCESS, payload: id });
    return { success: true };
  } catch (error) {
    dispatch({ type: PORTO_DELETE_FAILURE, payload: error.message });
    return { success: false, message: error.message };
  }
};

export const submitPortofolio = (id) => async (dispatch) => {
  dispatch({ type: PORTO_SUBMIT_REQUEST });
  try {
    const data = await portofolioApi.submitPortofolio(id);
    dispatch({ type: PORTO_SUBMIT_SUCCESS, payload: data.data });
    return { success: true };
  } catch (error) {
    dispatch({ type: PORTO_SUBMIT_FAILURE, payload: error.message });
    return { success: false, message: error.message };
  }
};

export const publishPortofolio = (id) => async (dispatch) => {
  dispatch({ type: PORTO_PUBLISH_REQUEST });
  try {
    const data = await portofolioApi.publishPortofolio(id);
    dispatch({ type: PORTO_PUBLISH_SUCCESS, payload: data.data });
    return { success: true };
  } catch (error) {
    dispatch({ type: PORTO_PUBLISH_FAILURE, payload: error.message });
    return { success: false, message: error.message };
  }
};

export const rejectPortofolio = (id, reason) => async (dispatch) => {
  dispatch({ type: PORTO_REJECT_REQUEST });
  try {
    const data = await portofolioApi.rejectPortofolio(id, reason);
    dispatch({ type: PORTO_REJECT_SUCCESS, payload: data.data });
    return { success: true };
  } catch (error) {
    dispatch({ type: PORTO_REJECT_FAILURE, payload: error.message });
    return { success: false, message: error.message };
  }
};