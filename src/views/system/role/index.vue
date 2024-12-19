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

import { roleList, updateRole, addRole } from '@/api/system/role'
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
const getListFunc = roleList
const formFunc = ref()
const formData = ref({
	name: '',
})
const renderForm = [
	{
		field: 'name',
		label: '角色名称',
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
	{ field: 'name', title: '角色名称', width: 140 },
	{ field: 'status', title: '是否禁用', width: 140 },
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
		width: 190,
		align: 'center',
		fixed: 'right',
		slots: {
			default: ({ row }) => {
				return createSpaceGroup([
					createButton('primary', 'small', '编辑', () => updateColumnData(row)),
					createButton('primary', 'small', '绑定菜单', () => bindMenuBtn(row)),
				])
			},
		},
	},
]
const showForm = true
// 搜索区域
const searchForm = [
	{
		label: '角色名称',
		field: 'name',
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
	formFunc.value = addRole
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
	formFunc.value = updateRole
	visible.value = true
}

const bindMenuBtn = (row) => {
	console.log(row);
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

</script>
