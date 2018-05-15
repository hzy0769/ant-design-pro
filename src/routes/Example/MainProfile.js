import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Button, Card, Divider } from 'antd';
import DescriptionList from 'components/DescriptionList';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const { Description } = DescriptionList;
const ButtonGroup = Button.Group;

@connect(({ example, loading }) => ({
  example,
  loading: loading.effects['example/loadDomain'],
}))
export default class MainProfile extends Component {
  componentDidMount() {
    const { dispatch, match: { params } } = this.props;
    dispatch({
      type: 'example/loadDomain',
      payload: params.pid,
    });
  }

  goback = () => {
    history.back();
  };

  render() {
    const { example: { domain } } = this.props;
    const action = (
      <Fragment>
        <ButtonGroup>
          <Button icon="rollback" onClick={this.goback}>
            返回
          </Button>
        </ButtonGroup>
      </Fragment>
    );

    return (
      <PageHeaderLayout title="用户管理" action={action}>
        <Card bordered={false}>
          <DescriptionList size="large" title="基础信息" style={{ marginBottom: 32 }}>
            <Description term="用户id">{domain.userid}</Description>
            <Description term="名称">{domain.fullname}</Description>
            <Description term="登录账号">{domain.account}</Description>
            <Description term="手机号码">{domain.mobile}</Description>
            <Description term="状态">{domain.statusName}</Description>
            <Description term="创建时间">{domain.createtime}</Description>
            <Description term="账户类型">{domain.accounttypeName}</Description>
          </DescriptionList>
          <Divider style={{ marginBottom: 32 }} />
        </Card>
      </PageHeaderLayout>
    );
  }
}
