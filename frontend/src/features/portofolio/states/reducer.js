import {
  PORTO_FETCH_ALL_REQUEST, PORTO_FETCH_ALL_SUCCESS, PORTO_FETCH_ALL_FAILURE,
  PORTO_FETCH_MINE_REQUEST, PORTO_FETCH_MINE_SUCCESS, PORTO_FETCH_MINE_FAILURE,
  PORTO_FETCH_ONE_REQUEST, PORTO_FETCH_ONE_SUCCESS, PORTO_FETCH_ONE_FAILURE,
  PORTO_CREATE_REQUEST, PORTO_CREATE_SUCCESS, PORTO_CREATE_FAILURE,
  PORTO_UPDATE_REQUEST, PORTO_UPDATE_SUCCESS, PORTO_UPDATE_FAILURE,
  PORTO_DELETE_REQUEST, PORTO_DELETE_SUCCESS, PORTO_DELETE_FAILURE,
  PORTO_SUBMIT_REQUEST, PORTO_SUBMIT_SUCCESS, PORTO_SUBMIT_FAILURE,
  PORTO_PUBLISH_REQUEST, PORTO_PUBLISH_SUCCESS, PORTO_PUBLISH_FAILURE,
  PORTO_REJECT_REQUEST, PORTO_REJECT_SUCCESS, PORTO_REJECT_FAILURE,
} from './action';

const initialState = {
  list: [],
  detail: null,
  loading: false,
  loadingDetail: false,
  loadingMutate: false,
  error: null,
};

export const portofolioReducer = (state = initialState, action) => {
  switch (action.type) {

    // Fetch All
    case PORTO_FETCH_ALL_REQUEST:
    case PORTO_FETCH_MINE_REQUEST:
      return { ...state, loading: true, error: null };
    case PORTO_FETCH_ALL_SUCCESS:
    case PORTO_FETCH_MINE_SUCCESS:
      return { ...state, loading: false, list: action.payload };
    case PORTO_FETCH_ALL_FAILURE:
    case PORTO_FETCH_MINE_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // Fetch One
    case PORTO_FETCH_ONE_REQUEST:
      return { ...state, loadingDetail: true, detail: null, error: null };
    case PORTO_FETCH_ONE_SUCCESS:
      return { ...state, loadingDetail: false, detail: action.payload };
    case PORTO_FETCH_ONE_FAILURE:
      return { ...state, loadingDetail: false, error: action.payload };

    // Create
    case PORTO_CREATE_REQUEST:
      return { ...state, loadingMutate: true, error: null };
    case PORTO_CREATE_SUCCESS:
      return { ...state, loadingMutate: false, list: [action.payload, ...state.list] };
    case PORTO_CREATE_FAILURE:
      return { ...state, loadingMutate: false, error: action.payload };

    // Update
    case PORTO_UPDATE_REQUEST:
      return { ...state, loadingMutate: true, error: null };
    case PORTO_UPDATE_SUCCESS:
      return {
        ...state,
        loadingMutate: false,
        list: state.list.map((p) => (p.id === action.payload.id ? action.payload : p)),
        detail: action.payload,
      };
    case PORTO_UPDATE_FAILURE:
      return { ...state, loadingMutate: false, error: action.payload };

    // Delete
    case PORTO_DELETE_REQUEST:
      return { ...state, loadingMutate: true };
    case PORTO_DELETE_SUCCESS:
      return {
        ...state,
        loadingMutate: false,
        list: state.list.filter((p) => p.id !== Number(action.payload)),
      };
    case PORTO_DELETE_FAILURE:
      return { ...state, loadingMutate: false, error: action.payload };

    // Submit
    case PORTO_SUBMIT_REQUEST:
    case PORTO_PUBLISH_REQUEST:
    case PORTO_REJECT_REQUEST:
      return { ...state, loadingMutate: true, error: null };

    case PORTO_SUBMIT_SUCCESS:
    case PORTO_PUBLISH_SUCCESS:
    case PORTO_REJECT_SUCCESS:
      return {
        ...state,
        loadingMutate: false,
        detail: action.payload,
        list: state.list.map((p) =>
          p.id === action.payload?.id ? { ...p, status: action.payload.status } : p
        ),
      };

    case PORTO_SUBMIT_FAILURE:
    case PORTO_PUBLISH_FAILURE:
    case PORTO_REJECT_FAILURE:
      return { ...state, loadingMutate: false, error: action.payload };

    default:
      return state;
  }
};