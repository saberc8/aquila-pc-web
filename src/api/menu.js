import request from '@/utils/request'

// 获取路由
export const getUserMenus = () => {
	return request({
		url: '/user/menus',
		method: 'get',
	})
}
