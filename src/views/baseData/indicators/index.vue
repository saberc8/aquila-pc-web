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
	<!-- 新增弹窗 -->
	<DialogForm
		:title="title"
		:visible="visible"
		:formData="formData"
		:renderForm="renderForm"
		:formFunc="formFunc"
		@close="close"
	></DialogForm>
	<!-- 绑定属性弹窗 -->
	<el-dialog
		:width="800"
		v-model="bindVisible"
		title="绑定属性"
		@close="closeBindDialog"
	>
		<div class="bindDialog">
			<el-transfer
				v-model="rightValue"
				:props="{
					key: 'attributesId',
					label: 'attributesName',
				}"
				:data="attributesList"
				style="text-align: left; display: inline-block"
				filterable
				:filter-method="filterMethod"
				:left-default-checked="leftChecked"
				:right-default-checked="rightChecked"
				:titles="['属性列表', '已绑定属性']"
				:button-texts="['', '']"
				:format="{
					noChecked: '${total}',
					hasChecked: '${checked}/${total}',
				}"
				@change="handleChange"
			>
				<template #left-footer>
					<div class="left-footer">
						<div>
							<el-button class="transfer-footer" size="small">下一页</el-button>
							<el-button class="transfer-footer" size="small">上一页</el-button>
						</div>
						<span>1/3</span>
					</div>
				</template>
				<template #right-footer>
					<!-- <el-button class="transfer-footer" size="small">Operation</el-button> -->
				</template>
			</el-transfer>
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
import { createVNode, ref } from 'vue'
import { getToken } from '@/utils/auth'
import {
	getIndicatorsList,
	addIndicators,
	updateIndicators,
	deleteIndicators,
	bindAttributes,
} from '@/api/indicators'
import { getAttributesList } from '@/api/attributes'
import dayjs from 'dayjs'
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
import {
	createButton,
	createSpaceGroup,
	createTag,
} from '@/utils/createElement'

const bindVisible = ref(false)
const attrInputValue = ref('')
const currentId = ref()

const proTable = ref()
const visible = ref(false)
const title = ref('新增')
const getListFunc = getIndicatorsList
const formFunc = ref()
const formData = ref({
	indicatorsName: '',
})
const renderForm = [
	{
		field: 'indicatorsName',
		label: '名称',
		type: 'input',
		placeholder: '请输入',
		required: true,
	},
	{
		field: 'indicatorsDesc',
		label: '指标描述',
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
	{ field: 'indicatorsId', title: 'ID', width: 80 },
	{ field: 'indicatorsName', title: '名称', width: 300 },
	{ field: 'indicatorsDesc', title: '指标描述', width: 300 },
	{
		field: 'attributesName',
		title: '绑定属性',
		minWidth: 300,
		slots: {
			default: ({ row }) => {
				if (row.attributes) {
					return createSpaceGroup(
						row.attributes.map((item) => {
							return createTag('success', item.attributesName)
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
		width: 240,
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
							createVNode(
								ElButton,
								{
									type: 'primary',
									size: 'small',
									onClick: () => {
										bindFunc(row)
									},
								},
								() => '绑定属性'
							),
							createVNode(
								ElButton,
								{
									type: 'danger',
									size: 'small',
									onClick: () => {
										deleteFunc(row.indicatorsId)
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
		field: 'indicatorsName',
		type: 'input',
		componentProps: {
			placeholder: '请输入',
		},
	},
	{
		label: '指标描述',
		field: 'indicatorsDesc',
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

let dataSource = ref([])
const add = async () => {
	title.value = '新增'
	visible.value = true
	formData.value = renderForm.reduce((acc, cur) => {
		acc[cur.field] = ''
		return acc
	}, {})
	formFunc.value = addIndicators
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
	formFunc.value = updateIndicators
	visible.value = true
}

const deleteFunc = async (id) => {
	ElMessageBox.confirm('确认删除吗？', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	}).then(async () => {
		const res = await deleteIndicators(id)
		ElMessage.success('删除成功')
		refreshTable()
	})
}

const attributesList = ref([])

const leftChecked = ref([])
const rightChecked = ref([])

const rightValue = ref([])
const leftValue = ref([])

const handleChange = (value, direction, movedKeys) => {
	console.log(value, direction, movedKeys)
}

const filterMethod = (query, item) => {
	return item
}
const getAttributesListFn = async () => {
	const res = await getAttributesList({
		pageNum: 1,
		pageSize: 50,
	})
	console.log(res, 'resss')
	attributesList.value = res.data
	console.log(rightValue.value, 'rightValue')
	leftValue.value = []
}

const bindFunc = async (data) => {
	console.log(data)
	currentId.value = data.indicatorsId
	rightValue.value = data.attributes.map((item) => item.attributesId)
	bindVisible.value = true
	await getAttributesListFn()
}

const closeBindDialog = () => {
	bindVisible.value = false
}

const confirmBindDialog = async () => {
	const res = await bindAttributes(currentId.value, {
		attributesIds: JSON.stringify(rightValue.value),
	})
	ElMessage.success('绑定成功')
	bindVisible.value = false
	refreshTable()
}
</script>

<style lang="scss" scoped>
.bindDialog {
	padding: 10px 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	.bind-data-list {
		display: flex;
		flex-wrap: wrap;
		margin-top: 20px;
		.el-tag {
			margin-right: 10px;
			margin-bottom: 10px;
		}
	}
	.transfer-footer {
		margin-left: 15px;
		padding: 6px 5px;
	}
	.left-footer {
		display: flex;
		align-items: center;
		margin-top: 6px;
		justify-content: space-between;
		padding-right: 15px;
	}
}
.el-transfer {
	--el-transfer-panel-body-height: 500px;
}
</style>
