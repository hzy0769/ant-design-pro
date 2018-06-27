import request from '../utils/request';

export async function ljdpFileBatchProcess(params) {
  return request(`/api/ljdp/filebatch/process.act`, {
    method: 'POST',
    'Content-Type': 'application/x-www-form-urlencoded;',
    body: params,
  });
}
