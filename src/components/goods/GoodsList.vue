<template>
    <div>
      <!--面包屑导航区-->
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item><a href="/">商品管理</a></el-breadcrumb-item>
        <el-breadcrumb-item>商品列表</el-breadcrumb-item>
      </el-breadcrumb>

      <!--卡片视图区域-->
      <el-card>
        <el-row :gutter="20">
          <el-col :span="8" >
            <el-input v-model="queryInfo.goodsName" placeholder="请输入内容" clearable @clear="clearInput">
              <el-button slot="append" icon="el-icon-search" @click="searchGoods"></el-button>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="goAddGoodsPage">添加商品</el-button>
          </el-col>
        </el-row>

        <!--table表格区-->
        <el-table :data="goodsList" border stripe>
          <el-table-column type="index"></el-table-column>
          <el-table-column label="商品名称" prop="goodsName"></el-table-column>
          <el-table-column label="商品价格(元)" prop="goodsPrice" width="95px"></el-table-column>
          <el-table-column label="商品重量" prop="goodsWeight" width="70px"></el-table-column>
          <el-table-column label="创建时间" prop="addTime" width="140px">
            <template slot-scope="scope">{{scope.row.addTime | dataFormat}}</template>
          </el-table-column>
          <el-table-column label="操作" width="130px">
            <template slot-scope="scope">
              <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeGoods(scope.row)"></el-button>
            </template>
          </el-table-column>
        </el-table>

        <!--分页区域-->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pageNum"
          :page-sizes="[2, 5, 10, 20]"
          :page-size="queryInfo.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total" background>
        </el-pagination>
      </el-card>
    </div>
</template>

<script>
export default {
  data () {
    return {
      queryInfo: {
        pageNum: 1,
        pageSize: 5,
        goodsName: ''
      },
      goodsList: [],
      total: 0
    }
  },
  created () {
    this.getGoodsList()
  },
  name: 'GoodsList',
  methods: {
    async getGoodsList () {
      const { data: res } = await this.$http.post('/goods/list', this.queryInfo)
      const { data, meta } = res
      if (meta.code !== 200) return this.$message.error(meta.message)
      this.goodsList = data.list
      this.total = data.total
    },
    handleSizeChange (newSize) {
      this.queryInfo.pageSize = newSize
      this.getGoodsList()
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pageNum = newPage
      this.getGoodsList()
    },
    searchGoods () {
      this.queryInfo.pageNum = 1
      this.getGoodsList()
    },
    clearInput () {
      this.queryInfo.pageNum = 1
      this.getGoodsList()
    },
    async removeGoods (row) {
      const res = await this.$confirm('此操作将删除该商品，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).catch(err => {
        return err
      })
      if (res !== 'confirm') {
        return this.$message.info('已取消删除该商品！')
      }
      this.queryInfo.goodsId = row.goodsId
      const { data: da } = await this.$http.post('/goods/delete', this.queryInfo)
      const { data, meta } = da
      if (meta.code !== 200) this.$message.error(meta.message)
      this.$message.success(meta.message)
      console.log(data)
      this.getGoodsList()
    },
    goAddGoodsPage () {
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style lang="less" scoped>
</style>
