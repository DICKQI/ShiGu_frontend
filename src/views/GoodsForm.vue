<template>
  <div class="goods-form">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ formTitle }}</span>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
        label-position="top"
      >
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <el-form-item label="谷子名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入谷子名称" />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12">
            <el-form-item label="IP作品" prop="ip">
              <el-select
                v-model="formData.ip"
                placeholder="选择IP"
                filterable
                @change="handleIpChange"
                style="width: 100%"
              >
                <el-option
                  v-for="ip in ipOptions"
                  :key="ip.id"
                  :label="ip.name"
                  :value="ip.id"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12">
            <el-form-item label="角色" prop="character">
              <el-select
                v-model="formData.character"
                placeholder="选择角色"
                filterable
                :disabled="!formData.ip"
                style="width: 100%"
              >
                <el-option
                  v-for="char in filteredCharacters"
                  :key="char.id"
                  :label="char.name"
                  :value="char.id"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12">
            <el-form-item label="品类" prop="category">
              <el-select
                v-model="formData.category"
                placeholder="选择品类"
                style="width: 100%"
              >
                <el-option
                  v-for="cat in categoryOptions"
                  :key="cat.id"
                  :label="cat.name"
                  :value="cat.id"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="formData.status">
                <el-radio-button label="in_cabinet">在馆</el-radio-button>
                <el-radio-button label="outdoor">出街中</el-radio-button>
                <el-radio-button label="sold">已售出</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12">
            <el-form-item label="位置" prop="location">
              <el-tree-select
                v-model="formData.location"
                :data="locationStore.treeData"
                placeholder="选择位置"
                clearable
                style="width: 100%"
                :props="{ label: 'label', value: 'id' }"
              />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12">
            <el-form-item label="数量" prop="quantity">
              <el-input-number v-model="formData.quantity" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12">
            <el-form-item label="购入价格">
              <el-input-number
                v-model="formData.price"
                :precision="2"
                :min="0"
                placeholder="请输入价格"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12">
            <el-form-item label="入手日期">
              <el-date-picker
                v-model="formData.purchase_date"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12">
            <el-form-item label="是否官谷">
              <el-switch v-model="formData.is_official" />
            </el-form-item>
          </el-col>

          <el-col :xs="24">
            <el-form-item label="主图">
              <el-upload
                v-model:file-list="mainPhotoList"
                :action="uploadUrl"
                :limit="1"
                list-type="picture-card"
                :auto-upload="false"
                :on-success="handleMainPhotoSuccess"
                :on-remove="handleMainPhotoRemove"
                :before-upload="beforeMainPhotoUpload"
                :on-change="handleMainPhotoChange"
                accept="image/*"
              >
                <el-icon><Plus /></el-icon>
              </el-upload>
            </el-form-item>
          </el-col>

          <el-col :xs="24">
            <el-form-item label="备注">
              <el-input
                v-model="formData.notes"
                type="textarea"
                :rows="4"
                placeholder="请输入备注信息"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            提交
          </el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 图片裁切对话框 -->
    <el-dialog
      v-model="cropDialogVisible"
      title="裁切图片"
      width="600px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="crop-container">
        <vue-cropper
          ref="cropperRef"
          :img="cropImageSrc"
          :output-size="1"
          :output-type="'png'"
          :info="true"
          :full="true"
          :can-move="true"
          :can-move-box="true"
          :fixed-box="true"
          :original="false"
          :auto-crop="true"
          :auto-crop-width="300"
          :auto-crop-height="300"
          :center-box="true"
          :high="true"
          :fixed="true"
          :fixed-number="[1, 1]"
          :enlarge="1"
          :mode="'contain'"
          class="cropper"
        />
      </div>
      <template #footer>
        <el-button @click="handleCropCancel">取消</el-button>
        <el-button type="primary" @click="handleCropConfirm" :loading="cropping">
          确认裁切
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules, type UploadFile } from 'element-plus'
import { useLocationStore } from '@/stores/location'
import { createGoods, updateGoods, getGoodsDetail } from '@/api/goods'
import { getIPList, getCharacterList, getCategoryList } from '@/api/metadata'
import type { GoodsDetail, IP, Character, Category } from '@/api/types'
import request from '@/utils/request'
// @ts-ignore
import { VueCropper } from 'vue-cropper'

const router = useRouter()
const route = useRoute()
const locationStore = useLocationStore()

const formRef = ref<FormInstance>()
const submitting = ref(false)

// 从API获取的数据
const ipOptions = ref<IP[]>([])
const characters = ref<Character[]>([])
const categoryOptions = ref<Category[]>([])

const formData = ref({
  name: '',
  ip: undefined as number | undefined,
  character: undefined as number | undefined,
  category: undefined as number | undefined,
  status: 'in_cabinet' as 'in_cabinet' | 'outdoor' | 'sold',
  location: undefined as number | undefined,
  quantity: 1,
  price: undefined as number | undefined,
  purchase_date: '',
  is_official: true,
  notes: '',
  main_photo: '',
})

const mainPhotoList = ref<UploadFile[]>([])
const cropperRef = ref<any>(null)
const cropDialogVisible = ref(false)
const cropImageSrc = ref('')
const pendingFile = ref<File | null>(null)
const cropping = ref(false)

const uploadUrl = '/api/upload' // 实际的上传接口

const formTitle = computed(() => {
  return route.params.id ? '编辑谷子' : '新增谷子'
})

const filteredCharacters = computed(() => {
  if (!formData.value.ip) return []
  return characters.value.filter((char) => char.ip.id === formData.value.ip)
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入谷子名称', trigger: 'blur' }],
  ip: [{ required: true, message: '请选择IP', trigger: 'change' }],
  character: [{ required: true, message: '请选择角色', trigger: 'change' }],
  category: [{ required: true, message: '请选择品类', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

const handleIpChange = () => {
  formData.value.character = undefined
}

// 上传前拦截，进入裁切界面
const beforeMainPhotoUpload = (file: File) => {
  // 阻止自动上传
  return false
}

// 文件选择变化，打开裁切对话框
const handleMainPhotoChange = (file: UploadFile) => {
  if (file.raw) {
    pendingFile.value = file.raw
    const reader = new FileReader()
    reader.onload = (e) => {
      cropImageSrc.value = e.target?.result as string
      cropDialogVisible.value = true
    }
    reader.readAsDataURL(file.raw)
  }
}

// 确认裁切
const handleCropConfirm = async () => {
  if (!cropperRef.value) return

  cropping.value = true
  try {
    // 获取裁切后的图片数据
    cropperRef.value.getCropBlob(async (blob: Blob) => {
      try {
        // 将 blob 转换为 File
        const croppedFile = new File([blob], pendingFile.value?.name || 'cropped.png', {
          type: 'image/png',
        })

        // 创建 FormData 上传
        const formDataObj = new FormData()
        formDataObj.append('file', croppedFile)

        // 使用项目的 request 工具上传
        const result = await request.post<{ url?: string; data?: { url?: string } }>(
          uploadUrl,
          formDataObj
        )
        const imageUrl = result.url || result.data?.url || ''

        // 更新表单数据
        formData.value.main_photo = imageUrl

        // 更新文件列表显示
        if (mainPhotoList.value.length > 0 && mainPhotoList.value[0]) {
          mainPhotoList.value[0].url = imageUrl
          mainPhotoList.value[0].status = 'success'
        } else {
          mainPhotoList.value = [
            {
              name: croppedFile.name,
              url: imageUrl,
              status: 'success',
            } as UploadFile,
          ]
        }

        ElMessage.success('图片上传成功')
        cropDialogVisible.value = false
        cropImageSrc.value = ''
        pendingFile.value = null
      } catch (error: any) {
        ElMessage.error(error.message || '上传失败')
        // 移除失败的文件
        mainPhotoList.value = []
      } finally {
        cropping.value = false
      }
    })
  } catch (error: any) {
    ElMessage.error(error.message || '裁切失败')
    cropping.value = false
  }
}

// 取消裁切
const handleCropCancel = () => {
  cropDialogVisible.value = false
  cropImageSrc.value = ''
  pendingFile.value = null
  // 移除未裁切的文件
  mainPhotoList.value = []
}

const handleMainPhotoSuccess = (response: any) => {
  formData.value.main_photo = response.url || response.data?.url || ''
}

const handleMainPhotoRemove = () => {
  formData.value.main_photo = ''
  mainPhotoList.value = []
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      const submitData: import('@/api/types').GoodsInput = {
        ...formData.value,
        price: formData.value.price?.toString(),
        ip: formData.value.ip,
        character: formData.value.character,
        category: formData.value.category,
      }

      if (route.params.id) {
        await updateGoods(route.params.id as string, submitData)
        ElMessage.success('更新成功')
      } else {
        const result = await createGoods(submitData)
        // 检查是否是幂等返回
        if (result && result.id) {
          ElMessage.success('创建成功')
        }
      }

      router.push({ name: 'CloudShowcase' })
    } catch (err: any) {
      // 幂等性处理
      if (err.response?.status === 409 || err.message?.includes('已存在')) {
        ElMessage.warning('检测到相同资产已存在，已为您跳转至编辑页面')
        // 这里可以跳转到编辑页面
      } else {
        ElMessage.error(err.message || '提交失败')
      }
    } finally {
      submitting.value = false
    }
  })
}

const handleReset = () => {
  formRef.value?.resetFields()
}

const handleCancel = () => {
  router.back()
}

onMounted(async () => {
  // 加载基础数据
  try {
    const [ipList, characterList, categoryList] = await Promise.all([
      getIPList(),
      getCharacterList(),
      getCategoryList(),
    ])
    ipOptions.value = ipList
    characters.value = characterList
    categoryOptions.value = categoryList
  } catch (err) {
    ElMessage.error('加载基础数据失败')
  }

  await locationStore.fetchNodes()

  // 如果是编辑模式，加载数据
  if (route.params.id) {
    try {
      const data = await getGoodsDetail(route.params.id as string)
      formData.value = {
        name: data.name,
        ip: data.ip.id,
        character: data.character.id,
        category: data.category.id,
        status: data.status as 'in_cabinet' | 'outdoor' | 'sold',
        location: data.location || undefined,
        quantity: data.quantity,
        price: data.price ? parseFloat(data.price) : undefined,
        purchase_date: data.purchase_date || '',
        is_official: data.is_official,
        notes: data.notes || '',
        main_photo: data.main_photo || '',
      }
      if (data.main_photo) {
        mainPhotoList.value = [{ url: data.main_photo }] as any
      }
    } catch (err) {
      ElMessage.error('加载数据失败')
    }
  }
})
</script>

<style scoped>
.goods-form {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  font-weight: bold;
  color: var(--primary-gold);
  font-size: 18px;
}

:deep(.el-upload--picture-card) {
  border-color: var(--border-color);
}

:deep(.el-upload--picture-card:hover) {
  border-color: var(--primary-gold);
}

.crop-container {
  width: 100%;
  height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.cropper {
  width: 100%;
  height: 100%;
}
</style>

