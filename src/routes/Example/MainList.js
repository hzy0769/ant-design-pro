import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import moment from 'moment';
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Button,
  InputNumber,
  DatePicker,
  Modal,
  message,
  Divider,
} from 'antd';
import StandardTable from 'components/StandardTable';
import DictSelect from 'components/DictSelect';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { getAuthorityToken } from '../../utils/authority';

import styles from '../List/TableList.less';

const FormItem = Form.Item;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

const CreateForm = Form.create({
  mapPropsToFields(props) {
    let { status } = props.domain;
    if (status) {
      status = status.toString();
    }
    return {
      fullname: Form.createFormField({
        value: props.domain.fullname,
      }),
      account: Form.createFormField({
        value: props.domain.account,
      }),
      mobile: Form.createFormField({
        value: props.domain.mobile,
      }),
      status: Form.createFormField({
        value: status,
      }),
      accounttype: Form.createFormField({
        value: props.domain.accounttype,
      }),
    };
  },
})(props => {
  const { modalVisible, form, handleSave, handleModalVisible, dictionary, isNew } = props;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      handleSave(fieldsValue);
    });
  };

  return (
    <Modal
      width={1024}
      title="用户管理"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
    >
      <Row>
        <Col md={12} sm={24}>
          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="用户名称">
            {form.getFieldDecorator('fullname', {
              rules: [{ required: true, message: '' }],
              initialValue: '',
            })(<Input placeholder="请输入" />)}
          </FormItem>
        </Col>
        <Col md={12} sm={24}>
          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="登录账号">
            {form.getFieldDecorator('account', {
              rules: [{ required: true, message: '' }],
              initialValue: '',
            })(<Input placeholder="请输入" />)}
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col md={12} sm={24}>
          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="密码">
            {form.getFieldDecorator('password', {
              rules: [{ required: isNew, message: '' }],
              initialValue: '',
            })(<Input placeholder="请输入" />)}
          </FormItem>
        </Col>
        <Col md={12} sm={24}>
          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="手机号码">
            {form.getFieldDecorator('mobile', {
              rules: [{ required: true, message: '' }],
              initialValue: '',
            })(<Input placeholder="请输入" />)}
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col md={12} sm={24}>
          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="状态">
            {form.getFieldDecorator('status', {
              rules: [{ required: true, message: '' }],
            })(
              <DictSelect
                placeholder="请选择"
                style={{ width: '100%' }}
                dictList={dictionary['sys.user.state']}
              />
            )}
          </FormItem>
        </Col>
        <Col md={12} sm={24}>
          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="账户类型">
            {form.getFieldDecorator('accounttype', {
              rules: [{ required: true, message: '' }],
            })(
              <DictSelect
                placeholder="请选择"
                style={{ width: '100%' }}
                dictList={dictionary['sys.account.type']}
              />
            )}
          </FormItem>
        </Col>
      </Row>
    </Modal>
  );
});

@connect(({ example, dictionary, loading }) => ({
  example,
  dictionary,
  loading: loading.models.example,
}))
@Form.create()
export default class MainList extends PureComponent {
  state = {
    modalVisible: false,
    selectedRows: [],
    formValues: {},
    isNew: true,
    editingKey: '',
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'example/fetch',
    });

    dispatch({
      type: 'dictionary/loadDict',
      codetype: 'sys.user.state',
    });

    dispatch({
      type: 'dictionary/loadDict',
      codetype: 'sys.account.type',
    });
  }

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      page: pagination.current - 1,
      size: pagination.pageSize,
      ...formValues,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'example/fetch',
      payload: params,
    });
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'example/fetch',
      payload: {},
    });
  };

  handleRemove = () => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;

    if (!selectedRows) return;
    const onOkf = () => {
      dispatch({
        type: 'example/remove',
        payload: {
          ids: selectedRows.map(row => row.userid).join(','),
        },
        callback: () => {
          this.setState({
            selectedRows: [],
          });
          message.info('已成功删除');
          this.doSearch();
        },
      });
    };
    Modal.confirm({
      title: '删除',
      content: '确定永久删除选定的记录吗？',
      okText: '确定删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: onOkf,
      onCancel() {
        // console.log('Cancel');
      },
    });
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  doSearch = () => {
    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
        ge_createtime:
          fieldsValue.ge_createtime && fieldsValue.ge_createtime.format('YYYY-MM-DD HH:mm:ss'),
        le_createtime:
          fieldsValue.le_createtime && fieldsValue.le_createtime.format('YYYY-MM-DD HH:mm:ss'),
      };

      // console.log(values)

      this.setState({
        formValues: values,
      });

      dispatch({
        type: 'example/fetch',
        payload: values,
      });
    });
  };

  handleSearch = e => {
    e.preventDefault();

    this.doSearch();
  };

  handleExport = e => {
    e.preventDefault();
    const { form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
        ge_createtime:
          fieldsValue.ge_createtime && fieldsValue.ge_createtime.format('YYYY-MM-DD HH:mm:ss'),
        le_createtime:
          fieldsValue.le_createtime && fieldsValue.le_createtime.format('YYYY-MM-DD HH:mm:ss'),
      };

      let params = '';
      for (const v in values) {
        if (values[v] !== null && values[v] !== undefined) {
          params += `${v}=${values[v]}&`;
        }
      }
      // console.log(params);
      open(`/api/admin/user/sysUser/export?${params}tokenid=${getAuthorityToken()}`);
    });
  };

  handleImport = () => {
    this.props.dispatch(routerRedux.push('/example/main-import'));
  };

  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
    });
  };

  handleEdit = (e, key) => {
    this.props.dispatch({
      type: 'example/loadDomain',
      payload: key,
      callback: () => {
        this.handleModalVisible(true);
        this.setState({
          isNew: false,
          editingKey: key,
        });
      },
    });
  };

  handleShow = (e, key) => {
    this.props.dispatch(routerRedux.push(`/example/main-profile/${key}`));
  };

  handleAdd = () => {
    this.props.dispatch({
      type: 'example/clearDomain',
    });
    this.handleModalVisible(true);
    this.setState({
      isNew: true,
      editingKey: '',
    });
  };

  handleSave = fields => {
    // var formData = new FormData();
    // formData.append('isNew', true);
    // Object.keys(fields).map(key => {
    //   formData.append(key, fields[key]);
    // })
    const { isNew, editingKey } = this.state;

    this.props.dispatch({
      type: 'example/save',
      // payload: formData,
      payload: {
        ...fields,
        isNew,
        userid: editingKey,
      },
      callback: response => {
        if (response.code === 200) {
          this.doSearch();
          message.success('保存成功');
        } else {
          message.success('保存失败：[' + response.code + ']' + response.message);
        }
      },
    });
    this.setState({
      modalVisible: false,
    });
  };

  renderAdvancedForm() {
    const { getFieldDecorator } = this.props.form;
    const { dictionary } = this.props;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="用户名称">
              {getFieldDecorator('like_fullname')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="账号">
              {getFieldDecorator('eq_account')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="手机号码">
              {getFieldDecorator('eq_mobile')(<InputNumber style={{ width: '100%' }} />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="创建时间>=">
              {getFieldDecorator('ge_createtime')(
                <DatePicker
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD HH:mm:ss"
                  showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                  placeholder="请输入更新日期"
                />
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="创建时间<=">
              {getFieldDecorator('le_createtime')(
                <DatePicker
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD HH:mm:ss"
                  showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                  placeholder="请输入更新日期"
                />
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="状态">
              {getFieldDecorator('eq_status')(
                <DictSelect
                  placeholder="请选择"
                  style={{ width: '100%' }}
                  dictList={dictionary['sys.user.state']}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <div style={{ overflow: 'hidden' }}>
          <span style={{ float: 'right', marginBottom: 24 }}>
            <Button icon="search" type="primary" htmlType="submit">
              查询
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
              重置
            </Button>
            <Button icon="export" style={{ marginLeft: 8 }} onClick={this.handleExport}>
              导出
            </Button>
            <Button icon="cloud-download-o" style={{ marginLeft: 8 }} onClick={this.handleImport}>
              导入
            </Button>
          </span>
        </div>
      </Form>
    );
  }

  renderForm() {
    return this.renderAdvancedForm();
  }

  render() {
    const { example: { data, domain }, dictionary, loading } = this.props;
    const { selectedRows, modalVisible, isNew } = this.state;

    const columns = [
      {
        title: '用户id',
        dataIndex: 'userid',
      },
      {
        title: '名称',
        dataIndex: 'fullname',
      },
      {
        title: '登录账号',
        dataIndex: 'account',
      },
      {
        title: '手机号码',
        dataIndex: 'mobile',
      },
      {
        title: '状态',
        dataIndex: 'statusName',
      },
      {
        title: '创建时间',
        dataIndex: 'createtime',
      },
      {
        title: '操作',
        render: (text, record) => (
          <Fragment>
            <a onClick={e => this.handleEdit(e, record.userid)}>编辑</a>
            <Divider type="vertical" />
            <a onClick={e => this.handleShow(e, record.userid)}>查看</a>
          </Fragment>
        ),
      },
    ];

    const parentMethods = {
      handleSave: this.handleSave,
      handleModalVisible: this.handleModalVisible,
      dictionary,
      domain,
      isNew,
    };

    return (
      <PageHeaderLayout>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={this.handleAdd}>
                新建
              </Button>
              {selectedRows.length > 0 && (
                <span>
                  <Button icon="minus" type="dashed" onClick={this.handleRemove}>
                    删除
                  </Button>
                </span>
              )}
            </div>
            <StandardTable
              selectedRows={selectedRows}
              loading={loading}
              data={data}
              columns={columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
              rowKey="userid"
            />
          </div>
        </Card>
        <CreateForm {...parentMethods} modalVisible={modalVisible} />
      </PageHeaderLayout>
    );
  }
}
