<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item><a href="/">权限管理</a></el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片试图-->
    <el-card>
      <el-table :data="rightsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="权限名称" prop="name"></el-table-column>
        <el-table-column label="路径" prop="controller"></el-table-column>
        <el-table-column label="权限等级" prop="level">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level === 0">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.level === 1">二级</el-tag>
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      rightsList: [],
      query: {}
    }
  },
  created () {
    this.getRightsList()
  },
  methods: {
    async getRightsList () {
      this.query.type = 'list'
      const { data: res } = await this.$http.post('/menu/rights', this.query)
      const { data: list, meta } = res
      if (meta.code !== 200) return this.$message.error(meta.message)
      console.log(list)
      this.rightsList = list
    }
  }
}
</script>

<style lang="less" scoped>

</style>
