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
			<span style="font-weight: bold; font-size: 20px; color: #000">列表</span>
		</template>
		<template #toolbar_buttons>
			<el-button type="primary" @click="add"> 新增 </el-button>
		</template>
	</ProTable>
	<DialogForm
		:title="title"
		:visible="visible"
		:formData="formData"
		:renderForm="renderForm"
		:formFunc="formFunc"
		@close="close"
	></DialogForm>
	<!-- 绑定属性值弹窗 -->
	<el-dialog
		:width="500"
		v-model="bindVisible"
		title="绑定属性值"
		@close="closeBindDialog"
	>
		<div class="bindDialog">
			<el-input placeholder="请输入属性值" v-model="attrInputValue">
				<template #append>
					<el-button :icon="Plus" @click="addBindData" />
				</template>
			</el-input>
			<div class="bind-data-list">
				<el-tag
					v-for="(item, index) in bindDataList"
					closable
					@close="deleteBindTag(index)"
					>{{ item }}</el-tag
				>
			</div>
		</div>
		<template #footer>
			<span class="dialog-footer">
				<el-button @click="closeBindDialog">取消</el-button>
				<el-button type="primary" @click="confirmBindDialog"> 确认 </el-button>
			</span>
		</template>
	</el-dialog>
</template>

<script setup>
import { createVNode } from 'vue'
import { getToken } from '@/utils/auth'
import { attributesTypeOptions } from '@/common/constants'
import {
	getAttributesList,
	addAttributes,
	updateAttributes,
	deleteAttributes,
	bindAttributesValue,
} from '@/api/attributes'
import dayjs from 'dayjs'
import { Plus } from '@element-plus/icons-vue'
import {
	ElButton,
	ElMessage,
	ElSpace,
	ElMessageBox,
	ElTransfer,
	ElTag,
} from 'element-plus'

import DialogForm from '@/components/DialogForm/index.vue'
import ProTable from '@/components/ProTable/index.vue'

const bindDataList = ref([])
const currentId = ref()
const proTable = ref()
const visible = ref(false)
const title = ref('新增')
const getListFunc = getAttributesList
const formFunc = ref()
const formData = ref({
	attributesName: '',
	attributesType: '',
	address: '',
	longitude: '',
	latitude: '',
	buildTime: '',
	checkTime: '',
})
const renderForm = [
	{
		field: 'attributesName',
		label: '名称',
		type: 'input',
		placeholder: '请输入名称',
		required: true,
	},
	{
		field: 'attributesType',
		label: '属性值类型',
		type: 'select',
		placeholder: '请选择',
		componentProps: {
			options: attributesTypeOptions,
		},
		required: true,
	},
	{
		field: 'attributesDesc',
		label: '属性描述',
		type: 'input',
		placeholder: '请输入属性描述',
		required: true,
	},
]
const columns = [
	{
		type: 'seq',
		width: 60,
		treeNode: false, // 开启树图表
	},
	{ field: 'attributesId', title: 'ID', width: 80 },
	{ field: 'attributesName', title: '名称', width: 300 },
	{
		field: 'attributesType',
		title: '属性值类型',
		width: 150,
		formatter: (row) => {
			return attributesTypeOptions.find(
				(item) => item.value === row.row.attributesType
			).label
		},
	},
	{ field: 'attributesDesc', title: '属性描述', width: 300 },
	{
		field: 'attributesValue',
		title: '属性值',
		minWidth: 300,
		slots: {
			default: ({ row }) => {
				if (row.attributesValue) {
					return createVNode(
						ElSpace,
						{
							size: 10,
							wrap: true,
						},
						() =>
							row.attributesValue.map((item) => {
								return createVNode(
									ElTag,
									{
										type: 'success',
										size: 'small',
									},
									() => item.attributesValue
								)
							})
					)
				}
			},
		},
	},
	{
		field: 'createAt',
		title: '创建时间',
		width: 180,
		formatter: (row) => {
			return dayjs(row.row.createAt).format('YYYY-MM-DD HH:mm:ss')
		},
	},
	{
		field: 'updateTime',
		title: '更新时间',
		width: 180,
		formatter: (row) => {
			return row.row.updateTime
				? dayjs(row.row.updateTime).format('YYYY-MM-DD HH:mm:ss')
				: dayjs(row.row.createAt).format('YYYY-MM-DD HH:mm:ss')
		},
	},
	{
		title: '操作',
		width: 260,
		align: 'center',
		fixed: 'right',
		slots: {
			default: ({ row }) => {
				return createVNode(
					ElSpace,
					{
						size: 10,
						wrap: true,
					},
					{
						default: () => [
							createVNode(
								ElButton,
								{
									type: 'primary',
									size: 'small',
									onClick: () => {
										updateColumnData(row)
									},
								},
								() => '编辑'
							),
							row.attributesType === 'items' &&
								createVNode(
									ElButton,
									{
										type: 'primary',
										size: 'small',
										onClick: () => {
											bindFunc(row)
										},
									},
									() => '绑定属性值'
								),
							createVNode(
								ElButton,
								{
									type: 'danger',
									size: 'small',
									onClick: () => {
										deleteFunc(row.attributesId)
									},
								},
								() => '删除'
							),
						],
					}
				)
			},
		},
	},
]

const showForm = true
// 搜索区域
const searchForm = [
	{
		label: '名称',
		field: 'attributesName',
		type: 'input',
		componentProps: {
			placeholder: '请输入名称',
		},
	},
]

const params = ref({
	pageNum: 1,
	pageSize: 10,
})

let dataSource = ref([])

const add = async () => {
	title.value = '新增'
	visible.value = true
	formData.value = renderForm.reduce((acc, cur) => {
		acc[cur.field] = ''
		return acc
	}, {})
	formFunc.value = addAttributes
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
	formFunc.value = updateAttributes
	visible.value = true
}

const deleteFunc = async (id) => {
	ElMessageBox.confirm('确认删除吗？', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	}).then(async () => {
		const res = await deleteAttributes(id)
		ElMessage.success('删除成功')
		refreshTable()
	})
}

const bindVisible = ref(false)
const attrInputValue = ref('')

const bindFunc = (data) => {
	console.log(data)
	bindDataList.value = data.attributesValue
		? data.attributesValue.map((item) => item.attributesValue)
		: []
	currentId.value = data.attributesId
	bindVisible.value = true
}

const closeBindDialog = () => {
	bindVisible.value = false
}

const addBindData = (e) => {
	if (attrInputValue.value) {
		// 验证重复
		if (bindDataList.value.includes(attrInputValue.value)) {
			ElMessage.error('属性值重复')
			return
		}
		bindDataList.value.push(attrInputValue.value)
		attrInputValue.value = ''
	}
}

const deleteBindTag = (index) => {
	console.log(index)
	bindDataList.value.splice(index, 1)
}

const confirmBindDialog = async () => {
	console.log(bindDataList.value)
	const res = await bindAttributesValue(currentId.value, {
		attributesValueArr: JSON.stringify(bindDataList.value),
	})
	if (res.code === 200) {
		ElMessage.success('绑定成功')
		closeBindDialog()
		refreshTable()
	} else {
		ElMessage.error(res.msg || '绑定失败')
	}
}
</script>

<style lang="scss" scoped>
.bindDialog {
	padding: 10px 0;
	display: flex;
	flex-direction: column;
	.bind-data-list {
		display: flex;
		flex-wrap: wrap;
		margin-top: 20px;
		.el-tag {
			margin-right: 10px;
			margin-bottom: 10px;
		}
	}
}
</style>
