<template>
  <div class="character-management-container">
    <!-- 顶部操作区 -->
    <div class="header-section">
      <div class="title-wrapper">
        <h2 class="page-title">角色管理</h2>
        <span class="sub-title">定义作品下的具体人物角色</span>
      </div>
      <el-button class="add-btn" type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        <span>新增角色</span>
      </el-button>
    </div>

    <!-- 搜索与筛选卡片 -->
    <el-card class="search-card" shadow="never">
      <div class="search-flex">
        <el-select
          v-model="selectedIP"
          placeholder="按作品筛选"
          clearable
          filterable
          class="custom-select"
          @change="handleFilter"
        >
          <el-option v-for="ip in ipList" :key="ip.id" :label="ip.name" :value="ip.id" />
        </el-select>
        <el-input
          v-model="searchText"
          placeholder="搜索角色名..."
          clearable
          @clear="handleSearch"
          @keyup.enter="handleSearch"
          class="custom-search"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-button class="search-btn" type="primary" @click="handleSearch">搜索</el-button>
      </div>
    </el-card>

    <!-- 内容展示区 -->
    <div v-loading="loading" class="content-body">
      <!-- PC端表格 -->
      <div class="desktop-view">
        <el-table :data="characterList" style="width: 100%">
          <el-table-column label="头像" width="80" align="center">
            <template #default="{ row }">
              <el-avatar :size="40" :src="row.avatar" shape="square" class="table-avatar">
                <el-icon><UserFilled /></el-icon>
              </el-avatar>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="角色名称" min-width="150">
            <template #default="{ row }">
              <span class="table-name">{{ row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="ip.name" label="所属IP" min-width="150">
            <template #default="{ row }">
              <el-tag size="small" effect="plain" class="ip-tag">{{ row.ip.name }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="性别" width="100" align="center">
            <template #default="{ row }">
              <span :class="['gender-text', row.gender]">{{ getGenderLabel(row.gender) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" align="right" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
              <el-divider direction="vertical" />
              <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 移动端卡片 -->
      <div class="mobile-view">
        <div v-for="item in characterList" :key="item.id" class="char-card" @click="handleEdit(item)">
          <div class="char-main">
            <el-avatar :size="60" :src="item.avatar" shape="square" class="char-avatar">
              <el-icon><UserFilled /></el-icon>
            </el-avatar>
            <div class="char-info">
              <div class="name-line">
                <span class="name">{{ item.name }}</span>
                <span :class="['gender-badge', item.gender]">{{ getGenderLabel(item.gender) }}</span>
              </div>
              <div class="ip-line">{{ item.ip.name }}</div>
            </div>
            <el-icon class="arrow-icon"><ArrowRight /></el-icon>
          </div>
          <div class="card-footer">
            <div class="footer-btn" @click.stop="handleEdit(item)"><el-icon><Edit /></el-icon>编辑</div>
            <div class="footer-btn delete" @click.stop="handleDelete(item)"><el-icon><Delete /></el-icon>删除</div>
          </div>
        </div>
      </div>
      <el-empty v-if="!loading && characterList.length === 0" description="未找到匹配的角色" />
    </div>

    <!-- 弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="90%" class="custom-dialog" align-center>
      <el-form :model="formData" :rules="formRules" ref="formRef" label-position="top">
        <div class="form-layout">
          <div class="avatar-col">
            <el-upload
              class="avatar-uploader"
              :auto-upload="false"
              :show-file-list="false"
              @change="handleAvatarFileChange"
            >
              <img v-if="avatarPreview" :src="avatarPreview" class="preview-img" />
              <el-icon v-else class="uploader-icon"><Plus /></el-icon>
              <div class="upload-label">修改头像</div>
            </el-upload>
          </div>
          <div class="info-col">
            <el-form-item label="角色名称" prop="name">
              <el-input v-model="formData.name" placeholder="输入角色名" />
            </el-form-item>
            <el-form-item label="所属作品" prop="ip_id">
              <el-select v-model="formData.ip_id" placeholder="选择所属IP" filterable style="width: 100%">
                <el-option v-for="ip in ipList" :key="ip.id" :label="ip.name" :value="ip.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="formData.gender" class="custom-radio">
                <el-radio-button value="female">女</el-radio-button>
                <el-radio-button value="male">男</el-radio-button>
                <el-radio-button value="other">其他</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </div>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" class="submit-btn" @click="handleSubmit" :loading="submitting">保存信息</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, Edit, Delete, Search, UserFilled, ArrowRight } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules, UploadFile } from 'element-plus'
import { getIPList, getCharacterList, createCharacter, updateCharacter, deleteCharacter } from '@/api/metadata'
import type { IP, Character, CharacterGender } from '@/api/types'

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
const avatarPreview = ref('')
const avatarFile = ref<File | null>(null)

const formData = ref({
  name: '',
  ip_id: null as number | null,
  gender: 'female' as CharacterGender,
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入角色名', trigger: 'blur' }],
  ip_id: [{ required: true, message: '请选择所属IP', trigger: 'change' }],
}

const dialogTitle = computed(() => (isEdit.value ? '🎭 编辑角色资料' : '✨ 迎接新角色'))

const getGenderLabel = (g: CharacterGender) => ({ male: '男', female: '女', other: '其他' }[g] || '未知')

const fetchIPList = async () => {
  const data = await getIPList()
  ipList.value = data
}

const fetchCharacterList = async () => {
  loading.value = true
  try {
    const data = await getCharacterList({
      ip: selectedIP.value || undefined,
      search: searchText.value.trim() || undefined
    })
    characterList.value = data
  } finally {
    loading.value = false
  }
}

const handleSearch = () => fetchCharacterList()
const handleFilter = () => fetchCharacterList()

const handleAdd = () => {
  isEdit.value = false
  editingId.value = null
  formData.value = { name: '', ip_id: null, gender: 'female' }
  avatarPreview.value = ''
  avatarFile.value = null
  dialogVisible.value = true
}

const handleEdit = (row: Character) => {
  isEdit.value = true
  editingId.value = row.id
  formData.value = { name: row.name, ip_id: row.ip.id, gender: row.gender }
  avatarPreview.value = row.avatar || ''
  avatarFile.value = null
  dialogVisible.value = true
}

const handleAvatarFileChange = (file: UploadFile) => {
  if (file.raw) {
    avatarFile.value = file.raw
    const reader = new FileReader()
    reader.onload = (e) => (avatarPreview.value = e.target?.result as string)
    reader.readAsDataURL(file.raw)
  }
}

const handleDelete = async (row: Character) => {
  try {
    await ElMessageBox.confirm(`确定删除角色《${row.name}》吗？关联的谷子数据也会受到影响。`, '警告', {
      type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消'
    })
    await deleteCharacter(row.id)
    ElMessage.success('已删除')
    fetchCharacterList()
  } catch {}
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      const data = new FormData()
      data.append('name', formData.value.name)
      data.append('ip_id', String(formData.value.ip_id))
      data.append('gender', formData.value.gender)
      if (avatarFile.value) data.append('avatar', avatarFile.value)

      if (isEdit.value && editingId.value) {
        await updateCharacter(editingId.value, data)
      } else {
        await createCharacter(data)
      }
      ElMessage.success('保存成功')
      dialogVisible.value = false
      fetchCharacterList()
    } catch (err: any) {
      ElMessage.error(err.message || '操作失败')
    } finally {
      submitting.value = false
    }
  })
}

onMounted(() => { fetchIPList(); fetchCharacterList(); })
</script>

<style scoped>
.character-management-container {
  padding: 16px;
  max-width: 1000px;
  margin: 0 auto;
  background-color: #f8f9fc;
  min-height: 100vh;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title { font-size: 22px; font-weight: 600; color: #303133; margin: 0; }
.sub-title { font-size: 13px; color: #909399; }

/* 搜索栏 */
.search-card { border-radius: 12px; border: none; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
.search-flex { display: flex; gap: 10px; flex-wrap: wrap; }
.custom-select { width: 180px; }
.custom-search { flex: 1; min-width: 200px; }
:deep(.el-input__wrapper) { border-radius: 8px; }

/* 按钮 */
.add-btn, .search-btn, .submit-btn {
  background: linear-gradient(135deg, #a396ff 0%, #8e7dff 100%);
  border: none; border-radius: 8px;
}

/* PC表格 */
.desktop-view { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
.table-name { font-weight: 600; color: #444; }
.ip-tag { border-radius: 6px; border-color: #e0dbff; color: #7d6cff; background: #f5f3ff; }
.gender-text.female { color: #f56c6c; }
.gender-text.male { color: #409eff; }

/* 移动端卡片 */
.mobile-view { display: none; flex-direction: column; gap: 12px; }
.char-card { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.char-main { padding: 16px; display: flex; align-items: center; gap: 12px; }
.char-info { flex: 1; }
.name-line { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.name { font-size: 17px; font-weight: 600; }
.gender-badge { font-size: 11px; padding: 1px 6px; border-radius: 4px; }
.gender-badge.female { background: #fff0f0; color: #f56c6c; }
.gender-badge.male { background: #ecf5ff; color: #409eff; }
.ip-line { font-size: 13px; color: #666; margin-bottom: 2px; }
.card-footer { display: flex; background: #fafbfc; border-top: 1px solid #f2f6fc; }
.footer-btn { flex: 1; padding: 10px; text-align: center; font-size: 13px; color: #606266; display: flex; align-items: center; justify-content: center; gap: 4px; }
.footer-btn.delete { color: #f56c6c; border-left: 1px solid #f2f6fc; }

/* 弹窗布局 */
.form-layout { display: flex; gap: 24px; }
.avatar-col { display: flex; flex-direction: column; align-items: center; }
.info-col { flex: 1; }
.avatar-uploader {
  width: 120px; height: 120px; border: 1px dashed #dcdfe6; border-radius: 12px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  overflow: hidden; cursor: pointer; position: relative; background: #f8f9fc;
}
.preview-img { width: 100%; height: 100%; object-fit: cover; }
.upload-label { position: absolute; bottom: 0; width: 100%; background: rgba(0,0,0,0.5); color: #fff; font-size: 11px; text-align: center; padding: 4px 0; }
.custom-radio :deep(.el-radio-button__inner) { border-radius: 8px !important; margin-right: 8px; border: 1px solid #dcdfe6 !important; }

@media (max-width: 768px) {
  .desktop-view { display: none; }
  .mobile-view { display: flex; }
  .form-layout { flex-direction: column; align-items: center; }
  .custom-select { width: 100%; }
  .add-btn span { display: none; }
  .add-btn { width: 40px; height: 40px; border-radius: 50%; padding: 0; }
}
</style>