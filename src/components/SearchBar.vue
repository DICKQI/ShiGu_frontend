<template>
  <div class="search-bar">
    <el-input
      v-model="searchText"
      placeholder="搜索谷子名称、IP、角色..."
      clearable
      @input="handleInput"
      @clear="handleClear"
      @keyup.enter="handleSearch"
      class="search-input"
    >
      <template #prefix>
        <el-icon><Search /></el-icon>
      </template>
    </el-input>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { useGuziStore } from '@/stores/guzi'

const guziStore = useGuziStore()
const searchText = ref('')

const handleInput = () => {
  guziStore.searchGuzi({ search: searchText.value || undefined })
}

const handleClear = () => {
  searchText.value = ''
  guziStore.searchGuzi({ search: undefined })
}

const handleSearch = () => {
  guziStore.searchGuzi({ search: searchText.value || undefined })
}

// 监听外部筛选条件变化
watch(() => guziStore.filters.search, (newVal) => {
  if (newVal !== searchText.value) {
    searchText.value = newVal || ''
  }
}, { immediate: true })
</script>

<style scoped>
.search-bar {
  margin-bottom: 20px;
}

.search-input {
  max-width: 600px;
}

:deep(.el-input__wrapper) {
  border-radius: var(--button-radius);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

:deep(.el-input__wrapper:hover) {
  border-color: var(--primary-gold);
}

:deep(.el-input__wrapper.is-focus) {
  border-color: var(--primary-gold);
  box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.1);
}
</style>

