<template>
    <div>
      <!--面包屑导航区-->
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item><a href="/">商品管理</a></el-breadcrumb-item>
        <el-breadcrumb-item>添加商品</el-breadcrumb-item>
      </el-breadcrumb>

      <!--卡片视图区域-->
      <el-card>
        <!--消息提示区域-->
        <el-alert
          title="添加商品信息"
          type="info"
          center
          show-icon
        :closable="false">
        </el-alert>
        <!--步骤条-->
        <el-steps :space="200" :active="activeIndex -0" finish-status="success">
          <el-step title="基本信息"></el-step>
          <el-step title="商品参数"></el-step>
          <el-step title="商品属性"></el-step>
          <el-step title="商品照片"></el-step>
          <el-step title="商品内容"></el-step>
          <el-step title="完成"></el-step>
        </el-steps>
        <!--tab栏区域-->
        <el-form :model="addGoodsForm" :rules="addGoodsFormRules" ref="addGoodsFormRef" label-width="100px" label-position="top">
          <el-tabs :tab-position="'left'" v-model="activeIndex" :before-leave="beforeTabLeave" @tab-click="tabClicked">
            <el-tab-pane label="基本信息" name="0">
              <el-form-item label="商品名称" prop="goodsName">
                <el-input v-model="addGoodsForm.goodsName"></el-input>
              </el-form-item>
              <el-form-item label="商品价格" prop="goodsPrice">
                <el-input v-model="addGoodsForm.goodsPrice" type="number"></el-input>
              </el-form-item>
              <el-form-item label="商品重量" prop="goodsWeight">
                <el-input v-model="addGoodsForm.goodsWeight" type="number"></el-input>
              </el-form-item>
              <el-form-item label="商品数量" prop="goodsNumber">
                <el-input v-model="addGoodsForm.goodsNumber" type="number"></el-input>
              </el-form-item>
              <el-form-item label="商品分类" prop="selectedKeys">
                <el-cascader
                  v-model="selectedKeys"
                  :options="catList"
                  :props="cascaderProps"
                  @change="handleChange"></el-cascader>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品参数" name="1">
              <!--渲染表单的item项动态参数-->
              <el-form-item :label="item.attrName" v-for="item in dynamicListData" :key="item.attrId">
                <!--复选框组-->
                <el-checkbox-group v-model="item.attrValsList">
                  <el-checkbox :label="cb" v-for=" (cb, i) in  item.attrValsList" :key="i" border></el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品属性" name="2">
              <!--渲染表单的item项静态属性-->
              <el-form-item :label="item.attrName" v-for="item in staticListData" :key="item.attrId">
                <!--复选框组-->
                <el-checkbox-group v-model="item.attrValsList">
                  <el-checkbox :label="cb" v-for=" (cb, i) in  item.attrValsList" :key="i" border></el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品照片" name="3">
              <el-upload
                class="upload-demo"
                :action="uploadUrl"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                :headers="headerObject"
                list-type="picture"
                :on-success="handleSuccess">
                <el-button size="small" type="primary">点击上传</el-button>
              </el-upload>
            </el-tab-pane>
            <el-tab-pane label="商品内容" name="4">
              <!--富文本编辑器-->
              <quill-editor v-model="addGoodsForm.goodsIntroduce"></quill-editor>
              <!--添加商品的按钮-->
              <el-button type="primary" class="btnAdd" @click="addGoods">添加商品</el-button>
            </el-tab-pane>
          </el-tabs>
        </el-form>
      </el-card>

      <!--图片预览-->
      <el-dialog
        title="图片预览"
        :visible.sync="preViewDialogVisible"
        width="50%">
        <img :src="'data:image/gif;base64,'+preViewFile" class="preViewImage"/>
      </el-dialog>
    </div>
</template>

<script>
export default {
  data () {
    return {
      activeIndex: '0',
      addGoodsForm: {
        goodsName: '',
        goodsPrice: 0,
        goodsNumber: 0,
        goodsWeight: 0,
        catId: 0,
        pictureEntityList: [],
        goodsIntroduce: '',
        goodsAttributesRelationEntityList: []
      },
      catList: [],
      addGoodsFormRules: {
        goodsName: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goodsPrice: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goodsNumber: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goodsWeight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ]
      },
      cascaderProps: {
        value: 'catId',
        label: 'catName',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true
      },
      queryInfo: {},
      selectedKeys: [],
      dynamicListData: [],
      staticListData: [],
      uploadUrl: 'http://127.0.0.1:8088/goods/upload',
      headerObject: {
        Authorization: window.sessionStorage.getItem('token')
      },
      preViewFile: '',
      preViewDialogVisible: false
    }
  },
  created () {
    this.getCatList()
  },
  methods: {
    async getCatList () {
      const { data: res } = await this.$http.get('/categories/plist')
      const { data, meta } = res
      if (meta.code !== 200) this.$message.error(meta.message)
      this.catList = data
    },
    handleChange () {
      if (this.selectedKeys.length === 3) {
        this.addGoodsForm.catId = parseInt(this.selectedKeys[2])
      } else {
        this.addGoodsForm.catId = null
        this.selectedKeys = []
      }
    },
    beforeTabLeave (activeName, oldActiveName) {
      if (oldActiveName === '0' && this.selectedKeys.length !== 3) {
        this.$message.error('请选择商品分类！')
        return false
      }
    },
    async tabClicked () {
      this.queryInfo.catId = this.addGoodsForm.catId
      if (this.activeIndex === '1') {
        console.log('动态参数面板')
        this.queryInfo.attrSel = 'dynamic'
        const { data: res } = await this.$http.post('/attribute/list', this.queryInfo)
        const { data: list, meta } = res
        if (meta.code !== 200) this.$message.error(meta.message)
        this.dynamicListData = list
        console.log(list)
      } else if (this.activeIndex === '2') {
        this.queryInfo.attrSel = 'static'
        const { data: res } = await this.$http.post('/attribute/list', this.queryInfo)
        const { data: list, meta } = res
        if (meta.code !== 200) this.$message.error(meta.message)
        this.staticListData = list
        console.log(list)
      }
    },
    handlePreview (file) {
      console.log(file)
      this.preViewFile = file.response.data.picture
      this.preViewDialogVisible = true
      console.log(this.preViewFile)
    },
    handleRemove (file) {
      const filePath = file.response.data.pictureId
      const i = this.addGoodsForm.pictureEntityList.findIndex(x => x.pictureId === filePath)
      this.addGoodsForm.pictureEntityList.splice(i, 1)
      console.log(this.addGoodsForm)
    },
    handleSuccess (response) {
      this.addGoodsForm.pictureEntityList.push(response.data)
      console.log(this.addGoodsForm)
    },
    addGoods () {
      this.$refs.addGoodsFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项！')
        }
        console.log(this.selectedKeys)
        console.log(valid)
        this.dynamicListData.forEach(item => {
          const newInfo = {
            attrId: item.attrId,
            attrValue: item.attrValsList.join(',')
          }
          this.addGoodsForm.goodsAttributesRelationEntityList.push(newInfo)
        })
        this.staticListData.forEach(item => {
          const newInfo = {
            attrId: item.attrId,
            attrValue: item.attrValsList.join(',')
          }
          this.addGoodsForm.goodsAttributesRelationEntityList.push(newInfo)
        })
        const { data: da } = await this.$http.post('/goods/save', this.addGoodsForm)
        if (da.meta.code !== 200) return this.$message.error(da.meta.message)
        this.$message.success(da.meta.message)
        this.$router.push('/glist')
        console.log(this.addGoodsForm)
      })
    }
  },
  name: 'AddGoods'
}
</script>

<style lang="less" scoped>
.el-steps{
  margin: 15px 0;
}
.el-step__title {
  font-size: 13px ;
}
  .el-checkbox {
    margin: 0 10px 0 0  !important;
  }
  .preViewImage {
    width: 100%;
  }
  .btnAdd {
    margin-top: 15px;
  }
</style>
