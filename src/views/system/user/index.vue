<template>
	<ProTable
		ref="proTable"
		:dataSource="dataSource"
		:columns="columns"
		:params="params"
		:searchForm="searchForm"
		:showForm="showForm"
		:getListFunc="getListFunc"
	>
		<template #toolbar_title>
			<span style="font-weight: bold; font-size: 20px; color: #000"
				>列表</span
			>
		</template>
		<template #toolbar_buttons>
			<el-button type="primary" @click="add"> 新增 </el-button>
		</template>
	</ProTable>
	<DialogForm
		v-if="visible"
		:title="title"
		:visible="visible"
		:formData="formData"
		:renderForm="renderForm"
		:formFunc="formFunc"
		:showGeoLink="false"
		@close="close"
	></DialogForm>
	<DialogForm
		v-if="roleVisible"
		title="绑定角色"
		:visible="roleVisible"
		:formData="roleFormData"
		:renderForm="roleRenderForm"
		:formFunc="bindUserRole"
		@close="closeRole"
	></DialogForm>
</template>

<script setup>
defineOptions({
	name: 'User',
})
import { ref, onMounted, createVNode } from 'vue'
import { getToken } from '@/utils/auth'
import {
	createButton,
	createSpaceGroup,
	createTag,
} from '@/utils/createElement'

import { userList, updateUser, addUser, changePassword, delUser, bindUserRole, getUserRoles } from '@/api/system/user'
import dayjs from 'dayjs'
import {
	ElButton,
	ElMessage,
	ElSpace,
	ElMessageBox,
	ElImage,
} from 'element-plus'
import DialogForm from '@/components/DialogForm/index.vue'
import ProTable from '@/components/ProTable/index.vue'
import router from '@/router'
const dataSource = ref([])
const proTable = ref()
const visible = ref(false)
const title = ref('新增')
const getListFunc = userList
const formFunc = ref()
const formData = ref({
	username: '',
	nickname: '',
})
const renderForm = [
	{
		field: 'username',
		label: '登录名',
		type: 'input',
		placeholder: '请输入',
		required: true,
	},
	{
		field: 'nickname',
		label: '昵称',
		type: 'input',
		placeholder: '请输入',
		required: true,
	},
]
const columns = [
	{
		type: 'seq',
		width: 60,
		treeNode: false, // 开启树图表
	},
	{ field: 'id', title: 'ID', width: 80 },
	{
		field: 'avatar',
		title: '头像',
		width: 140,
		slots: {
			default: ({ row }) => {
				return createVNode(
					ElImage,
					{
						src: row.avatar,
						fit: 'contain',
						style: 'width: 60px; height: 60px',
						previewSrcList: [row.avatar],
					},
					{
						default: () => '暂无图片',
					}
				)
			},
		},
	},
	{ field: 'username', title: '登录账号', width: 140 },
	{ field: 'nickname', title: '昵称', width: 140 },
	{
		field: 'createAt',
		title: '创建时间',
		width: 180,
		formatter: (row) => {
			return dayjs(row.row.createdAt).format('YYYY-MM-DD HH:mm:ss')
		},
	},
	{
		field: 'updateAt',
		title: '更新时间',
		width: 180,
		formatter: (row) => {
			return row.row.updatedAt
				? dayjs(row.row.updatedAt).format('YYYY-MM-DD HH:mm:ss')
				: dayjs(row.row.createAt).format('YYYY-MM-DD HH:mm:ss')
		},
	},
	{
		title: '操作',
		width: 280,
		align: 'center',
		fixed: 'right',
		slots: {
			default: ({ row }) => {
				return createSpaceGroup([
					createButton('primary', 'small', '编辑', () => updateColumnData(row)),
					createButton('warning', 'small', '角色', () => showBindRole(row)),
					createButton('danger', 'small', '删除', () => handleDelete(row.id)),
					createButton('warning', 'small', '修改密码', () => changePasswordModel(row))
				])
			},
		},
	},
]

const showForm = true
// 搜索区域
const searchForm = [
	{
		label: '登录名',
		field: 'username',
		type: 'input',
		componentProps: {
			placeholder: '请输入',
		},
	},
	{
		label: '昵称',
		field: 'nickname',
		type: 'input',
		componentProps: {
			placeholder: '请输入',
		},
	},
]
const params = ref({
	pageNum: 1,
	pageSize: 10,
})
const add = async () => {
	title.value = '新增'
	visible.value = true
	formData.value = renderForm.reduce((acc, cur) => {
		acc[cur.field] = ''
		return acc
	}, {})
	formData.value.password = '123456'
	formFunc.value = addUser
}

const close = (e) => {
	visible.value = false
	if (e) {
		refreshTable()
	}
}

const refreshTable = () => {
	setTimeout(() => {
		proTable.value.reloadData()
	}, 500)
}

const updateColumnData = (row) => {
	const rowBak = JSON.parse(JSON.stringify(row))
	// console.log(rowBak)
	delete rowBak._X_ROW_KEY
	title.value = '编辑'
	formData.value = rowBak
	formFunc.value = updateUser
	visible.value = true
}

const changePasswordModel = (row) => {
	const rowBak = JSON.parse(JSON.stringify(row))
	delete rowBak._X_ROW_KEY
	title.value = '修改密码'
	formData.value = rowBak
	formFunc.value = changePassword
}
const deleteFunc = async (id) => {
	ElMessageBox.confirm('确认删除吗？', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	}).then(async () => {
		const res = await deleteQun(id)
		ElMessage.success('删除成功')
		refreshTable()
	})
}

const bindData = (row) => {
	router.push({
		path: `/qun/qunBindData/${row.qunId}`,
		query: {
			name: row.name,
		},
	})
}

const detailData = (row) => {
	router.push({
		path: `/qun/qunDetailData/${row.qunId}`,
		query: {
			name: row.name,
		},
	})
}

const roleVisible = ref(false)
const roleFormData = ref({
  userId: '',
  roleIds: []
})

const roleRenderForm = [
  {
    field: 'roleIds',
    label: '角色',
    type: 'select-dynamic',
    placeholder: '请选择角色',
    required: true,
    componentProps: {
      multiple: true,
      renderFunc: getUserRoles,
      renderParams: {},
      formatData: {
        label: 'name',
        value: 'id'
      }
    }
  }
]

const showBindRole = async (row) => {
  roleVisible.value = true
  roleFormData.value.userId = row.id
  const roles = await getUserRoles(row.id)
  roleFormData.value.roleIds = roles.data.map(role => role.id)
}

const closeRole = (refresh) => {
  roleVisible.value = false
  if(refresh) {
    refreshTable()
  }
}

const handleDelete = (id) => {
  ElMessageBox.confirm('确认删除该用户?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await delUser(id)
    ElMessage.success('删除成功')
    refreshTable()
  })
}

</script>
