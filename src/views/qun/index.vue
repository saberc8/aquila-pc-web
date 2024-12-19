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
		:showGeoLink="true"
		@close="close"
	></DialogForm>
</template>

<script setup>
defineOptions({
	name: 'QunList',
})
import { ref, onMounted, createVNode } from 'vue'
import { getToken } from '@/utils/auth'
import {
	createButton,
	createSpaceGroup,
	createTag,
} from '@/utils/createElement'
import {
	getQunList,
	addQun,
	updateQun,
	deleteQun,
	getQunTypeList,
} from '@/api/qun'
import { getWxuserAdminList } from '@/api/wxuser'
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
import router from '../../router'
const dataSource = ref([])
const proTable = ref()
const visible = ref(false)
const title = ref('新增')
const getListFunc = getQunList
const formFunc = ref()
const formData = ref({
	name: '',
})
const renderForm = [
	{
		field: 'name',
		label: 'name',
		type: 'input',
		placeholder: '请输入',
		required: true,
	},
	// announcement
	{
		field: 'announcement',
		label: '简介',
		type: 'input',
		placeholder: '请输入',
		required: true,
	},
	{
		field: 'qunTypeId',
		label: '类型',
		type: 'select-dynamic',
		placeholder: '请选择类型',
		required: false,
		componentProps: {
			renderFunc: getQunTypeList,
			multiple: true,
			renderParams: {},
			options: [],
			formatData: {
				value: 'qunTypeId',
				label: 'name',
			},
		},
	},
	{
		field: 'adminWechatId',
		label: '管理员',
		type: 'select-dynamic',
		placeholder: '请选择类型',
		required: false,
		componentProps: {
			renderFunc: getWxuserAdminList,
			renderParams: {},
			options: [],
			formatData: {
				value: 'adminWechatId',
				label: 'nickname',
			},
		},
	},
	{
		field: 'wxid',
		label: 'wxid',
		type: 'input',
		placeholder: '请输入',
		required: true,
	},
	{
		field: 'tags',
		label: 'tags',
		type: 'input',
		placeholder: '请输入',
		required: true,
	},
	{
		field: 'keyword',
		label: 'keyword',
		type: 'input',
		placeholder: '请输入',
		required: true,
	},
	{
		field: 'longitude',
		label: '经度',
		type: 'input-number',
		placeholder: '请输入经度',
		required: false,
	},
	{
		field: 'latitude',
		label: '纬度',
		type: 'input-number',
		placeholder: '请输入纬度',
		required: false,
	},
	{
		field: 'avatar',
		label: '主题图',
		type: 'upload-img',
		placeholder: '请上传',
		required: false,
	},
	{
		field: 'qrcode',
		label: '二维码',
		type: 'upload-img',
		placeholder: '请上传',
		required: false,
	},
]
const columns = [
	{
		type: 'seq',
		width: 60,
		treeNode: false, // 开启树图表
	},
	{ field: 'qunId', title: 'ID', width: 80 },
	{
		field: 'avatar',
		title: '主题图',
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
	{ field: 'name', title: '', width: 140 },
	{ field: 'tags', title: 'tag', width: 230 },
	{ field: 'wxid', title: 'wxid', width: 240 },
	{ field: 'adminWechatId', title: 'adminWechatId', width: 140 },

	{ field: 'keyword', title: '进口令', width: 140 },

	{
		field: 'type',
		title: '类型',
		width: 150,
		slots: {
			default: ({ row }) => {
				return createSpaceGroup(
					row.type.map((item) => {
						return createTag('success', item.name)
					})
				)
			},
		},
	},
	{ field: 'longitude', title: '经度', width: 150 },
	{ field: 'latitude', title: '纬度', width: 150 },
	{
		field: 'createAt',
		title: '创建时间',
		width: 180,
		formatter: (row) => {
			return dayjs(row.row.createAt).format('YYYY-MM-DD HH:mm:ss')
		},
	},
	{
		field: 'updateAt',
		title: '更新时间',
		width: 180,
		formatter: (row) => {
			return row.row.updateAt
				? dayjs(row.row.updateAt).format('YYYY-MM-DD HH:mm:ss')
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
				])
			},
		},
	},
]
const showForm = true
// 搜索区域
const searchForm = [
	{
		label: '',
		field: 'name',
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
	formFunc.value = addQun
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
	rowBak.qunTypeId = rowBak.type.map((item) => item.qunTypeId)
	title.value = '编辑'
	formData.value = rowBak
	formFunc.value = updateQun
	visible.value = true
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

</script>
