import { searchAdminUser, saveAdminUser, removeAdminUser } from '../services/lmapi';

export default {
  namespace: 'example',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(searchAdminUser, payload);
      yield put({
        type: 'updateList',
        payload: response,
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
  },
};
