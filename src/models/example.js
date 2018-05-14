import { routerRedux } from 'dva/router';
import { searchAdminUser, saveAdminUser, removeAdminUser, getAdminUser } from '../services/lmapi';

export default {
  namespace: 'example',

  state: {
    data: {
      list: [],
      pagination: {},
    },
    domain: {},
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(searchAdminUser, payload);
      yield put({
        type: 'updateList',
        payload: response,
      });
    },
    *loadDomain({ payload, callback }, { call, put }) {
      const response = yield call(getAdminUser, payload);
      yield put({
        type: 'updateDomain',
        payload: response,
      });
      if (callback) callback(response);
    },
    *clearDomain({ payload }, { put }) {
      yield put({
        type: 'updateDomain',
        payload: { ...payload, code: 200 },
      });
    },
    *save({ payload, callback }, { call }) {
      const response = yield call(saveAdminUser, payload);
      if (callback) callback(response);
    },
    *remove({ payload, callback }, { call }) {
      const response = yield call(removeAdminUser, payload);
      if (callback) callback(response);
    },
    *showprofile({ payload }, { put }) {
      yield put(routerRedux.push(`/example/main-profile/${payload}`));
    },
  },

  reducers: {
    updateList(state, action) {
      const resp = action.payload;
      const result = {
        list: resp.rows,
        pagination: {
          total: resp.total,
        },
      };
      return {
        ...state,
        data: result,
      };
    },
    updateDomain(state, action) {
      const resp = action.payload;
      return {
        ...state,
        domain: resp,
      };
    },
  },
};
