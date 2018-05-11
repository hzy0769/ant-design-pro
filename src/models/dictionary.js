import { getSysCodeDict } from '../services/lmapi';
// import { Select } from 'antd';

// 数据字典
export default {
  namespace: 'dictionary',

  state: {
    // selectCom: {},
  },

  effects: {
    *loadDict({ codetype, callback }, { call, put }) {
      const response = yield call(getSysCodeDict, codetype);
      yield put({
        type: 'addDict',
        payload: response,
        codetype,
      });
      if (callback) callback();
    },
  },

  reducers: {
    addDict(state, action) {
      const { codetype } = action;
      const { code, message, data } = action.payload;
      const addstate = {};
      if (code === 200) {
        addstate[codetype] = [{ codeid: 1, codeDef: '', codename: '请选择' }].concat(data);
      } else {
        addstate[codetype] = [{ codeid: 1, codeDef: '', codename: '[' + code + ']' + message }];
      }
      // const { Option } = Select;
      // const selectList = addstate[codetype].map(item => (
      //   <Option key={item.codeid} value={item.codeDef}>
      //     {item.codename}
      //   </Option>
      // ));
      // const selectCom = state.selectCom;
      // const addSelectCom = {};
      // addSelectCom[codetype] = selectList;
      return {
        ...state,
        ...addstate,
        // selectCom: {
        //   ...selectCom,
        //   ...addSelectCom,
        // },
      };
    },
  },
};
