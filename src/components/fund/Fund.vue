<template>
    <div>
      <!--面包屑导航区-->
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item><a href="/">账单管理</a></el-breadcrumb-item>
        <el-breadcrumb-item>明细管理</el-breadcrumb-item>
      </el-breadcrumb>

      <!--卡片视图区域-->
      <el-card>
       <!-- 搜索条件区域-->
        <el-row>
          <el-col :span="6">
            <el-input placeholder="请输入内容"></el-input>
          </el-col>
          <el-col :span="8" class="uploadBtn">
            <el-upload
              class="upload-demo"
              :action="uploadUrl"
              :headers="headerObject"
              list-type="fileList"
              :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-col>
        </el-row>

        <!--table表格区域-->
        <el-table :data="billList" border stripe show-summary>
          <el-table-column type="index"></el-table-column>
          <el-table-column label="交易单号" prop="transactionNumber" width="250"></el-table-column>
          <el-table-column label="交易创建时间" width="140">
            <template slot-scope="scope">{{scope.row.businessCreateTime | dataFormatT}}</template>
          </el-table-column>
          <el-table-column label="交易付款时间" width="140">
            <template slot-scope="scope">{{scope.row.businessPayTime | dataFormatT}}</template>
          </el-table-column>
          <el-table-column label="交易来源" prop="businessSource" width="120"></el-table-column>
          <el-table-column label="交易类型" prop="businessType" width="100"></el-table-column>
          <el-table-column label="交易对方" prop="businessOther" width="250"></el-table-column>
          <el-table-column label="交易商品名称" prop="businessGoodsName" width="300"></el-table-column>
          <el-table-column label="交易金额" prop="businessAmount"></el-table-column>
          <el-table-column label="资金类型" prop="businessAmountType"></el-table-column>
          <el-table-column label="交易状态" prop="businessStatus"></el-table-column>
          <el-table-column label="交易服务费" prop="businessServiceCharge" width="90"></el-table-column>
          <el-table-column label="交易资金状态" prop="businessAmountStatus" width="100"></el-table-column>
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
        pageSize: 10
      },
      billList: [],
      total: 0,
      uploadUrl: 'http://127.0.0.1:8088/bill/upload',
      headerObject: {
        Authorization: window.sessionStorage.getItem('token')
      }
    }
  },
  created () {
    this.getBillList()
  },
  methods: {
    handleSuccess () {},
    async getBillList () {
      const { data: res } = await this.$http.post('/bill/list', this.queryInfo)
      const { data, meta } = res
      if (meta.code !== 200) return this.$message.error(meta.message)
      this.total = data.total
      this.billList = data.list
      console.log(this.billList)
    },
    handleSizeChange (newSize) {
      this.queryInfo.pageSize = newSize
      this.getBillList()
    },
    handleCurrentChange (newNum) {
      this.queryInfo.pageNum = newNum
      this.getBillList()
    }
  },
  name: 'Fund'
}
</script>

<style lang="less" scoped>
.uploadBtn {
  padding-left: 15px;
}
</style>
