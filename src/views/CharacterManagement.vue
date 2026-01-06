<template>
  <div class="character-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增角色
          </el-button>
        </div>
      </template>

      <!-- 筛选和搜索栏 -->
      <div class="filter-bar">
        <el-select
          v-model="selectedIP"
          placeholder="筛选IP作品"
          clearable
          filterable
          style="width: 250px"
          @change="handleFilter"
        >
          <el-option
            v-for="ip in ipList"
            :key="ip.id"
            :label="ip.name"
            :value="ip.id"
          />
        </el-select>
        <el-input
          v-model="searchText"
          placeholder="搜索角色名称"
          clearable
          @clear="handleSearch"
          @keyup.enter="handleSearch"
          style="width: 300px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </div>

      <!-- 表格 -->
      <div v-loading="loading" class="table-container">
        <el-table :data="characterList" stripe style="width: 100%">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="角色名称" min-width="150" />
          <el-table-column prop="ip.name" label="所属IP" min-width="200" />
          <el-table-column label="头像" width="100">
            <template #default="{ row }">
              <el-avatar
                v-if="row.avatar"
                :src="row.avatar"
                :size="50"
                shape="square"
              />
              <span v-else class="text-gray">暂无</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-button text type="primary" @click="handleEdit(row)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button text type="danger" @click="handleDelete(row)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-empty v-if="!loading && characterList.length === 0" description="暂无数据" />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      @close="handleDialogClose"
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item label="角色名称" prop="name">
          <el-input
            v-model="formData.name"
            placeholder="请输入角色名称"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="所属IP" prop="ip_id">
          <el-select
            v-model="formData.ip_id"
            placeholder="请选择所属IP"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="ip in ipList"
              :key="ip.id"
              :label="ip.name"
              :value="ip.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="头像">
          <div class="avatar-upload-section">
            <el-radio-group v-model="avatarInputType" class="avatar-input-type">
              <el-radio-button label="upload">上传图片</el-radio-button>
              <el-radio-button label="url">输入URL</el-radio-button>
            </el-radio-group>
            
            <!-- 上传图片 -->
            <div v-if="avatarInputType === 'upload'" class="upload-section">
              <el-upload
                v-model:file-list="avatarFileList"
                :auto-upload="false"
                :limit="1"
                list-type="picture-card"
                :on-remove="handleAvatarRemove"
                :before-upload="beforeAvatarUpload"
                :on-change="handleAvatarFileChange"
                accept="image/*"
              >
                <el-icon v-if="!avatarPreview"><Plus /></el-icon>
                <img v-if="avatarPreview" :src="avatarPreview" class="avatar-preview" />
              </el-upload>
              <div class="upload-tip">支持 JPG、PNG 格式，建议尺寸 200x200，将在提交时上传</div>
            </div>
            
            <!-- 输入URL -->
            <div v-else class="url-section">
              <el-input
                v-model="formData.avatar"
                placeholder="请输入头像URL（可选）"
                clearable
              >
                <template #prepend>
                  <el-icon><Link /></el-icon>
                </template>
              </el-input>
              <div v-if="formData.avatar" class="avatar-preview-url">
                <el-image
                  :src="formData.avatar"
                  fit="cover"
                  :preview-src-list="[formData.avatar]"
                  style="width: 100px; height: 100px; border-radius: 4px;"
                />
              </div>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, Edit, Delete, Search, Link } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules, UploadFile, UploadFiles } from 'element-plus'
import {
  getIPList,
  getCharacterList,
  createCharacter,
  updateCharacter,
  deleteCharacter,
} from '@/api/metadata'
import type { IP, Character } from '@/api/types'

const loading = ref(false)
const submitting = ref(false)
const searchText = ref('')
const selectedIP = ref<number | null>(null)
const ipList = ref<IP[]>([])
const characterList = ref<Character[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()

const formData = ref({
  name: '',
  ip_id: null as number | null,
  avatar: null as string | null,
})

// 头像上传相关
const avatarInputType = ref<'upload' | 'url'>('upload')
const avatarFileList = ref<UploadFiles>([])
const avatarPreview = ref<string>('')

const formRules: FormRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { max: 100, message: '角色名称不能超过100个字符', trigger: 'blur' },
  ],
  ip_id: [
    { required: true, message: '请选择所属IP', trigger: 'change' },
  ],
}

const dialogTitle = computed(() => (isEdit.value ? '编辑角色' : '新增角色'))

// 加载IP列表
const fetchIPList = async () => {
  try {
    const data = await getIPList()
    ipList.value = data
  } catch (err: any) {
    ElMessage.error(err.message || '加载IP列表失败')
  }
}

// 加载角色列表
const fetchCharacterList = async () => {
  loading.value = true
  try {
    const params: any = {}
    if (selectedIP.value) {
      params.ip = selectedIP.value
    }
    if (searchText.value.trim()) {
      params.search = searchText.value.trim()
    }
    const data = await getCharacterList(params)
    characterList.value = data
  } catch (err: any) {
    ElMessage.error(err.message || '加载失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  fetchCharacterList()
}

// 筛选
const handleFilter = () => {
  fetchCharacterList()
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  editingId.value = null
  formData.value = {
    name: '',
    ip_id: null,
    avatar: null,
  }
  avatarInputType.value = 'upload'
  avatarFileList.value = []
  avatarPreview.value = ''
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: Character) => {
  isEdit.value = true
  editingId.value = row.id
  formData.value = {
    name: row.name,
    ip_id: row.ip.id,
    avatar: row.avatar || null,
  }
  
  // 如果有头像URL，默认使用URL输入模式
  if (row.avatar) {
    avatarInputType.value = 'url'
    avatarFileList.value = []
    avatarPreview.value = ''
  } else {
    avatarInputType.value = 'upload'
    avatarFileList.value = []
    avatarPreview.value = ''
  }
  
  dialogVisible.value = true
}

// 头像上传前验证
const beforeAvatarUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB！')
    return false
  }
  return true
}

// 头像文件选择变化
const handleAvatarFileChange = (file: UploadFile) => {
  if (file.raw) {
    // 创建预览
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file.raw)
  }
}

// 移除头像
const handleAvatarRemove = () => {
  formData.value.avatar = null
  avatarPreview.value = ''
  avatarFileList.value = []
}

// 删除
const handleDelete = async (row: Character) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除角色"${row.name}"吗？删除后该角色下的所有谷子数据将无法正常显示。`,
      '提示',
      {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
      }
    )
    await deleteCharacter(row.id)
    ElMessage.success('删除成功')
    await fetchCharacterList()
  } catch (err: any) {
    if (err !== 'cancel') {
      ElMessage.error(err.message || '删除失败')
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      // 如果使用上传模式且有文件，使用FormData
      const firstFile = avatarFileList.value[0]
      if (avatarInputType.value === 'upload' && firstFile && firstFile.raw) {
        const formDataObj = new FormData()
        formDataObj.append('name', formData.value.name)
        formDataObj.append('ip_id', formData.value.ip_id!.toString())
        formDataObj.append('avatar', firstFile.raw)
        
        if (isEdit.value && editingId.value) {
          await updateCharacter(editingId.value, formDataObj)
          ElMessage.success('更新成功')
        } else {
          await createCharacter(formDataObj)
          ElMessage.success('创建成功')
        }
      } else {
        // 使用JSON格式（URL输入模式或没有文件）
        const submitData = {
          name: formData.value.name,
          ip_id: formData.value.ip_id!,
          avatar: formData.value.avatar || null,
        }
        
        if (isEdit.value && editingId.value) {
          await updateCharacter(editingId.value, submitData)
          ElMessage.success('更新成功')
        } else {
          await createCharacter(submitData)
          ElMessage.success('创建成功')
        }
      }
      
      dialogVisible.value = false
      await fetchCharacterList()
    } catch (err: any) {
      ElMessage.error(err.message || '操作失败')
    } finally {
      submitting.value = false
    }
  })
}

// 对话框关闭
const handleDialogClose = () => {
  formRef.value?.resetFields()
  formData.value = {
    name: '',
    ip_id: null,
    avatar: null,
  }
  avatarInputType.value = 'upload'
  avatarFileList.value = []
  avatarPreview.value = ''
}

onMounted(async () => {
  await fetchIPList()
  await fetchCharacterList()
})
</script>

<style scoped>
.character-management {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  color: var(--primary-gold);
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.table-container {
  min-height: 400px;
}

.text-gray {
  color: var(--text-light);
  font-size: 12px;
}

:deep(.el-table) {
  border-radius: var(--card-radius);
  overflow: hidden;
}

:deep(.el-button.is-text) {
  padding: 4px 8px;
}

.avatar-upload-section {
  width: 100%;
}

.avatar-input-type {
  margin-bottom: 16px;
}

.upload-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.upload-tip {
  font-size: 12px;
  color: var(--text-light);
  margin-top: -8px;
}

.avatar-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.url-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.avatar-preview-url {
  margin-top: 8px;
}

:deep(.el-upload--picture-card) {
  width: 100px;
  height: 100px;
}

:deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 100px;
  height: 100px;
}
</style>

