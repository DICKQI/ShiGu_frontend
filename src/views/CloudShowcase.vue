<template>
  <div class="cloud-showcase">
    <!-- 搜索栏 -->
    <div class="search-section">
      <SearchBar />
    </div>

    <!-- 筛选面板 -->
    <FilterPanel />

    <!-- 列表区域 -->
    <div class="list-section">
      <div v-if="guziStore.loading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>

      <div v-else-if="guziStore.error" class="error-container">
        <el-alert :title="guziStore.error" type="error" :closable="false" />
      </div>

      <div v-else-if="guziStore.guziList.length === 0" class="empty-container">
        <el-empty description="暂无谷子数据" />
      </div>

      <div v-else class="goods-grid">
        <GoodsCard
          v-for="goods in guziStore.guziList"
          :key="goods.id"
          :goods="goods"
          @click="handleCardClick"
          @location-click="handleLocationClick"
        />
      </div>

      <!-- 分页 -->
      <div v-if="guziStore.pagination.count > 0" class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="20"
          :total="guziStore.pagination.count"
          layout="prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 详情抽屉 -->
    <GoodsDrawer v-model="drawerVisible" :goods-id="selectedGoodsId" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGuziStore } from '@/stores/guzi'
import SearchBar from '@/components/SearchBar.vue'
import FilterPanel from '@/components/FilterPanel.vue'
import GoodsCard from '@/components/GoodsCard.vue'
import GoodsDrawer from '@/components/GoodsDrawer.vue'
import type { GoodsListItem } from '@/api/types'

const router = useRouter()
const guziStore = useGuziStore()

const drawerVisible = ref(false)
const selectedGoodsId = ref<string>('')

const currentPage = computed({
  get: () => guziStore.pagination.page,
  set: (val) => guziStore.setPage(val),
})

const handleCardClick = (goods: GoodsListItem) => {
  selectedGoodsId.value = goods.id
  drawerVisible.value = true
}

const handleLocationClick = (path: string) => {
  // 跳转到位置管理页
  router.push({ name: 'Location', query: { highlight: path } })
}

const handlePageChange = (page: number) => {
  guziStore.setPage(page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  // 初始化加载数据（立即执行，不使用防抖）
  guziStore.searchGuziImmediate()
})
</script>

<style scoped>
.cloud-showcase {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.search-section {
  margin-bottom: 24px;
}

.list-section {
  margin-top: 24px;
}

.loading-container,
.error-container,
.empty-container {
  padding: 40px 20px;
  text-align: center;
}

.goods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

@media (max-width: 768px) {
  .goods-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 40px;
  padding-bottom: 40px;
}

:deep(.el-pagination) {
  --el-pagination-button-color: var(--text-dark);
  --el-pagination-hover-color: var(--primary-gold);
  --el-pagination-active-color: var(--primary-gold);
}
</style>

