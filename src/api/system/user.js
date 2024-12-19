import request from '@/utils/request'
import { parseStrEmpty } from '@/utils/tools'

// 查询用户列表
export function userList(query) {
	return request({
		url: '/user/list',
		method: 'get',
		params: query,
	})
}

// 查询用户详细
export function getUser(userId) {
	return request({
		url: '/user/' + parseStrEmpty(userId),
		method: 'get',
	})
}

// 新增用户
export function addUser(data) {
	return request({
		url: '/user',
		method: 'post',
		data: data,
	})
}

// 修改用户
export function updateUser(data) {
	return request({
		url: '/user/update',
		method: 'post',
		data: data,
	})
}

// 删除用户
export function delUser(userId) {
	return request({
		url: '/system/user/' + userId,
		method: 'delete',
	})
}

// 用户密码重置
export function resetUserPwd(userId, password) {
	const data = {
		userId,
		password,
	}
	return request({
		url: '/system/user/resetPwd',
		method: 'put',
		data: data,
	})
}

// 用户状态修改
export function changeUserStatus(userId, status) {
	const data = {
		userId,
		status,
	}
	return request({
		url: '/system/user/changeStatus',
		method: 'put',
		data: data,
	})
}

// 查询用户个人信息
export function getUserProfile() {
	return request({
		url: '/system/user/profile',
		method: 'get',
	})
}

// 修改用户个人信息
export function updateUserProfile(data) {
	return request({
		url: '/system/user/profile',
		method: 'put',
		data: data,
	})
}

// 用户密码重置
export function changeUserPassword(data) {
	return request({
		url: '/user/changePassword',
		method: 'post',
		params: data,
	})
}

// 用户头像上传
export function uploadAvatar(data) {
	return request({
		url: '/system/user/profile/avatar',
		method: 'post',
		data: data,
	})
}

// 查询授权角色
export function getAuthRole(userId) {
	return request({
		url: '/system/user/authRole/' + userId,
		method: 'get',
	})
}

// 保存授权角色
export function updateAuthRole(data) {
	return request({
		url: '/system/user/authRole',
		method: 'put',
		params: data,
	})
}

// 查询部门下拉树结构
export function deptTreeSelect() {
	return request({
		url: '/system/user/deptTree',
		method: 'get',
	})
}

//获取用户表格设置
export function getTableConfig(params) {
	return request({
		url: '/system/table',
		method: 'get',
		params,
	})
}

//添加或者编辑用户表格设置
export function addTableConfig(data) {
	return request({
		url: '/system/table',
		method: 'post',
		data,
	})
}

//重置用户表格设置
export function deleteTableConfig(params) {
	return request({
		url: '/system/table',
		method: 'delete',
		params,
	})
}