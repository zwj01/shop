<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item><a href="/">商品管理</a></el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区域-->
    <el-card>
      <!--头部警告区域-->
      <el-alert
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning"
        :closable="false"
        show-icon>
      </el-alert>
      <!--选择商品分类区域-->
      <el-row>
        <el-col class="cat_opt">
          <span>选择商品分类：</span>
          <!--选择商品分类的级联选择框-->
          <el-cascader
            v-model="selectedKeys"
            :options="catList"
            :props="catProps"
            @change="handleChange"></el-cascader>
        </el-col>
      </el-row>
      <!--tab页签区域-->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!--添加动态参数面板-->
        <el-tab-pane label="动态参数" name="dynamic">
          <el-button size="mini" type="primary" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数</el-button>
          <!--动态参数表格-->
          <el-table :data="dynamicTabData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!--循环渲染tag标签Tag-->
                <el-tag v-for="(item, i) in scope.row.attrValsList" :key="i" closable @close="handleClosed(i, scope.row)">{{item}}</el-tag>
                <!--输入文本框-->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
               <!-- 添加按钮-->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!--索引列-->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attrName"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" icon="el-icon-edit" type="primary" @click="showEditDialog(scope.row)">编辑</el-button>
                <el-button size="mini" icon="el-icon-delete" type="warning" @click="removeAttributeById(scope.row.attrId)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!--添加静态属性面板-->
        <el-tab-pane label="静态属性" name="static">
          <el-button size="mini" type="primary" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加属性</el-button>
          <!--静态参数表格-->
          <el-table :data="staticTabData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item, i) in scope.row.attrValsList" :key="i" closable @close="handleClosed(i, scope.row)">{{item}}</el-tag>
                <!--输入文本框-->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加按钮-->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attrName"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" icon="el-icon-edit" type="primary" @click="showEditDialog(scope.row.attrId)">编辑</el-button>
                <el-button size="mini" icon="el-icon-delete" type="warning" @click="removeAttributeById(scope.row.attrId)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!--添加属性/参数弹框-->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
    @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" class="demo-ruleForm">
        <el-form-item :label="titleText" prop="attrName">
          <el-input v-model="addForm.attrName"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!--修改参数弹框-->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px" class="demo-ruleForm">
        <el-form-item :label="titleText" prop="attrName">
          <el-input v-model="editForm.attrName"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      catList: [],
      selectedKeys: [],
      catProps: {
        value: 'catId',
        label: 'catName',
        children: 'children',
        expandTrigger: 'hover'
      },
      activeName: 'dynamic',
      queryInfo: {},
      dynamicTabData: [],
      staticTabData: [],
      addDialogVisible: false,
      addForm: {},
      addFormRules: {
        attrName: [
          { required: true, message: '请添加属性', trigger: 'blur' }
        ]
      },
      editDialogVisible: false,
      editForm: {},
      editFormRules: {
        attrName: [
          { required: true, message: '请添加属性', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getCategories()
  },
  name: 'GoodsParams',
  methods: {
    async getCategories () {
      const { data: res } = await this.$http.get('/categories/plist')
      const { data, meta } = res
      if (meta.code !== 200) return this.$message.error(meta.message)
      this.catList = data
    },
    handleChange () {
      this.getParamsList()
    },
    handleTabClick () {
      this.getParamsList()
    },
    async getParamsList () {
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        this.dynamicTabData = []
        this.staticTabData = []
        return
      }
      this.queryInfo.catId = parseInt(this.catId)
      this.queryInfo.attrSel = this.activeName
      const { data: res } = await this.$http.post('/attribute/list', this.queryInfo)
      const { data: list, meta } = res
      if (meta.code !== 200) return this.$message.error(meta.message)
      console.log(list)
      list.forEach(item => {
        item.attrVals = item.attrVals !== null ? item.attrVals.split(',') : []
        item.inputVisible = false
        item.inputValue = ''
      })
      if (this.activeName === 'dynamic') {
        this.dynamicTabData = list
      } else {
        this.staticTabData = list
      }
    },
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        this.addForm.catId = this.catId
        this.addForm.attrSel = this.activeName
        const { data: res } = await this.$http.post('/attribute/save', this.addForm)
        const { data, meta } = res
        if (meta.code !== 200) return this.$message.error(meta.message)
        console.log(data)
        this.addDialogVisible = false
        this.$message.success(meta.message)
        this.getParamsList()
      })
    },
    async showEditDialog (attrId) {
      this.queryInfo.attrId = parseInt(attrId)
      this.queryInfo.attrSel = null
      const { data: res } = await this.$http.post('/attribute/get', this.queryInfo)
      const { data, meta } = res
      if (meta.code !== 200) return this.$message.error(meta.message)
      this.editForm = data
      this.editDialogVisible = true
    },
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    editParams () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('/attribute/update', this.editForm)
        const { data, meta } = res
        if (meta.code !== 200) return this.$message.error(meta.message)
        console.log(data)
        this.$message.success(meta.message)
        this.editDialogVisible = false
        this.getParamsList()
      })
    },
    async removeAttributeById (attrId) {
      const res = await this.$confirm('此操作将删除该属性, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).catch(err => {
        return err
      })
      if (res !== 'confirm') {
        return this.$message.info('已取消删除属性操作！')
      }
      this.queryInfo.attrId = parseInt(attrId)
      const { data: da } = await this.$http.post('/attribute/delete', this.queryInfo)
      const { data, meta } = da
      console.log(data)
      if (meta.code !== 200) return this.$message.error(meta.message)
      this.$message.success(meta.message)
      this.getParamsList()
    },
    async handleInputConfirm (row) {
      console.log(row.inputValue)
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      if (row.attrValsList === null) {
        row.attrValsList = []
      }
      row.attrValsList.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      row.attrVals = row.attrValsList.join(',')
      const { data: res } = await this.$http.post('/attribute/update', row)
      const { data, meta } = res
      if (meta.code !== 200) this.$message.error(meta.message)
      console.log(data)
    },
    showInput (row) {
      row.inputVisible = true
      this.$nextTick(b => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    async handleClosed (i, row) {
      row.attrValsList.splice(i, 1)
      row.attrVals = row.attrValsList.join(',')
      const { data: res } = await this.$http.post('/attribute/update', row)
      const { data, meta } = res
      if (meta.code !== 200) this.$message.error(meta.message)
      console.log(data)
    }
  },
  computed: {
    isBtnDisabled () {
      if (this.selectedKeys.length !== 3) {
        return true
      } else {
        return false
      }
    },
    catId () {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[this.selectedKeys.length - 1]
      } else {
        return null
      }
    },
    titleText () {
      if (this.activeName === 'dynamic') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt{
  margin: 15px 0px;
}
.el-tag {
  margin-right: 15px;
}
.input-new-tag {
  width: 120px;
}
</style>
