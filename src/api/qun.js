import request from '@/utils/request'

export const getQunList = (params) => {
	return request({
		url: '/qun/list',
		method: 'get',
    params
	})
}

export const addQun  = (data) => {
	return request({
		url: '/qun/add',
		method: 'post',
    data
	})
}

export const updateQun = (data) => {
  return request({
    url: '/qun/update',
    method: 'put',
    data
  })
}

export const deleteQun = (id) => {
  return request({
    url: `/qun/delete/${id}`,
    method: 'delete'
  })
}

export const getQunDetail = (id) => {
  return request({
    url: `/qun/${id}`,
    method: 'get'
  })
}

// saveSurveyData
export const saveSurveyData = (data) => {
  return request({
    url: '/qun/saveSurveyData',
    method: 'post',
    data
  })
}

export const getQunTypeList = (params) => {
  return request({
    url: '/qun/type/list',
    method: 'get',
    params
  })
}

// listByLocation
export const listByLocation = (params) => {
  return request({
    url: '/qun/listByLocation',
    method: 'get',
    params
  })
}