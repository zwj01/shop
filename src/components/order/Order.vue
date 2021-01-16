<template>
    <div>
      <!--面包屑导航区-->
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item><a href="/">订单管理</a></el-breadcrumb-item>
        <el-breadcrumb-item>订单列表</el-breadcrumb-item>
      </el-breadcrumb>

      <!--卡片视图区域-->
      <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
    </el-card>

      <!--表格区域-->
      <el-table :data="orderList" stripe border>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="orderNumber"></el-table-column>
        <el-table-column label="订单金额" prop="orderPrice"></el-table-column>
        <el-table-column label="是否付款" prop="payStatus">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.payStatus === 1">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="isSend"></el-table-column>
        <el-table-column label="下单时间" prop="createTime">
          <template slot-scope="scope">
            {{scope.row.createTime | dataFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showBox(scope.row)"></el-button>
            <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressBox(scope.row)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页区域-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="this.queryInfo.pageNum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="this.queryInfo.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>

      <!--修改地址对话框-->
      <el-dialog
        title="修改地址"
        :visible.sync="addressDialogVisible"
        width="50%" @close="addressDialogVisibleClosed">
        <el-form :model="editAddressForm" :rules="editAddressRules" ref="editAddressRef" label-width="100px">
          <el-form-item label="省市区/县" prop="address">
            <el-cascader :options="cityDate" v-model="editAddressForm.address"></el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="address2">
            <el-input v-model="editAddressForm.address2"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addressDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addressDialogVisible = false">确 定</el-button>
        </span>
      </el-dialog>

      <!--展示物流进度的对话框-->
      <el-dialog
        title="物流进度"
        :visible.sync="progressDialogVisible"
        width="30%">
        <!--时间线-->
        <el-timeline>
          <el-timeline-item
            v-for="(activity, index) in progressInfo"
            :key="index"
            :timestamp="activity.createTime | dataFormat">
            {{activity.expressContent}}
          </el-timeline-item>
        </el-timeline>
      </el-dialog>
    </div>
</template>

<script>
import cityDate from './citydata.js'
export default {
  data () {
    return {
      queryInfo: {
        pageNum: 1,
        pageSize: 5
      },
      orderList: [],
      total: 0,
      addressDialogVisible: false,
      editAddressForm: {
        address: [],
        address2: ''
      },
      editAddressRules: {
        address: [
          { required: true, message: '请选择省市1区/县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请填写详细地址', trigger: 'blur' }
        ]
      },
      cityDate: cityDate,
      progressDialogVisible: false,
      progressInfo: []
    }
  },
  created () {
    this.getOrderList()
  },
  methods: {
    async getOrderList () {
      const { data: res } = await this.$http.post('/order/list', this.queryInfo)
      const { data, meta } = res
      if (meta.code !== 200) return this.$message.error(meta.message)
      this.orderList = data.list
      console.log(data)
      this.total = data.total
    },
    handleSizeChange (newSize) {
      this.queryInfo.pageSize = newSize
      this.getOrderList()
    },
    handleCurrentChange (pageNum) {
      this.queryInfo.pageNum = pageNum
      this.getOrderList()
    },
    showBox (row) {
      this.addressDialogVisible = true
    },
    addressDialogVisibleClosed () {
      this.$refs.editAddressRef.resetFields()
    },
    async showProgressBox (row) {
      this.queryInfo.orderId = row.orderId
      const { data: res } = await this.$http.post('/express/list', this.queryInfo)
      const { data, meta } = res
      if (meta.code !== 200) return this.$message.error(meta.message)
      this.progressInfo = data
      console.log(this.progressInfo)
      this.progressDialogVisible = true
    }
  },
  name: 'Order'
}
</script>

<style lang="less" scoped>
@import "../../plugins/timeline/timeline.css";
@import "../../plugins/timeline-item/timeline-item.css";
.el-cascader {
  width: 100%;
}
</style>
