<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item><a href="/">商品管理</a></el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图区域-->
    <el-card>
       <el-row>
         <el-col>
           <el-button type="primary" @click="showAddCatDialog()">添加分类</el-button>
         </el-col>
       </el-row>
      <!--表格占位-->
      <!--<el-table :data="goodsCateList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="分类名称" prop="catName"></el-table-column>
        <el-table-column label="是否有效" prop="isShow"></el-table-column>
        <el-table-column label="排序" prop="catSort"></el-table-column>
        <el-table-column label="操作"></el-table-column>
      </el-table>-->
      <tree-table class="treeTable" :data="goodsCateList"
                  :columns="cateColumns"
                  :selection-type="false"
                  :expand-type="false"
                  show-index
                  index-text="#"
                  border
                  :show-row-hover="false">
        <!--是否有效模板-->
        <template slot="isShow" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.isShow === 1 "
          style="color: lightgreen;"></i>
          <i class="el-icon-error" v-else style="color: red;"></i>
        </template>
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.catSort === 0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.catSort === 1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <template slot="opt" slot-scope="scope">
          <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditCatsDialog(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeCatsById(scope.row.catId)">删除</el-button>
        </template>
      </tree-table>
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
    </el-card>

    <!--添加分类对话框-->
    <el-dialog
      title="添加分类"
      :visible.sync="addCatDialogVisible"
      width="50%"
    @close="addCatDiaologClosed">
      <!--添加分类的表单-->
      <el-form :model="addCatForm" :rules="addCatFormRule" ref="addCatFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="catName">
          <el-input v-model="addCatForm.catName"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
            v-model="selectedKeys"
            :options="parentCatList"
            :props="cascaderProps"
            @change="parentCatChange" clearable show-all-levels></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
          <el-button @click="addCatDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addCat">确 定</el-button>
      </span>
    </el-dialog>

    <!--编辑商品分类对话框-->
    <el-dialog
      title="编辑分类信息"
      :visible.sync="editGoodCatsDialogVisible"
      width="50%">
      <!--添加分类的表单-->
      <el-form :model="editCatForm" :rules="editCatFormRule" ref="editCatFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="catName">
          <el-input v-model="editCatForm.catName"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
            v-model="selectedKeys"
            :options="parentCatList"
            :props="cascaderProps"
            @change="editParentCatChange" clearable show-all-levels></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editGoodCatsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCat">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      queryInfo: {
        pageNum: 1,
        pageSize: 5
      },
      total: 0,
      goodsCateList: [],
      cateColumns: [
        {
          label: '分类名称',
          prop: 'catName'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isShow'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      addCatDialogVisible: false,
      addCatForm: {
        catName: '',
        pCatId: 0,
        catSort: 0
      },
      addCatFormRule: {
        catName: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      parentCatList: [],
      cascaderProps: {
        value: 'catId',
        label: 'catName',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true
      },
      selectedKeys: [],
      editGoodCatsDialogVisible: false,
      editCatForm: {},
      editCatFormRule: {
        catName: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      }
    }
  },
  name: 'GoodsCate',
  created () {
    this.getGoodsCateList()
  },
  methods: {
    async getGoodsCateList () {
      const { data: res } = await this.$http.post('/categories/list', this.queryInfo)
      const { data: page, meta } = res
      if (meta.code !== 200) return this.$message.error(meta.message)
      this.goodsCateList = page.list
      this.total = page.total
      console.log(this.goodsCateList)
    },
    handleSizeChange (newSize) {
      this.queryInfo.pageSize = newSize
      this.getGoodsCateList()
    },
    handleCurrentChange (pageNum) {
      this.queryInfo.pageNum = pageNum
      this.getGoodsCateList()
    },
    showAddCatDialog () {
      this.getParentCatList()
      this.addCatDialogVisible = true
    },
    async getParentCatList () {
      const { data: res } = await this.$http.get('/categories/plist')
      const { data: list, meta } = res
      if (meta.code !== 200) return this.$message.error(meta.message)
      this.parentCatList = list
    },
    parentCatChange () {
      if (this.selectedKeys.length > 0) {
        this.addCatForm.pCatId = this.selectedKeys[this.selectedKeys.length - 1]
        this.addCatForm.catSort = this.selectedKeys.length
      } else {
        this.addCatForm.pCatId = 0
        this.addCatForm.catSort = 0
      }
    },
    addCat () {
      this.$refs.addCatFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('/categories/save', this.addCatForm)
        const { data, meta } = res
        console.log(data)
        if (meta.code !== 200) return this.$message.error(meta.message)
        this.addCatDialogVisible = false
        this.$message.success(meta.message)
        this.getGoodsCateList()
      })
      console.log(this.addCatForm)
    },
    addCatDiaologClosed () {
      this.$refs.addCatFormRef.resetFields()
      this.selectedKeys = []
      this.addCatForm.catSort = 0
      this.addCatForm.pCatId = 0
    },
    showEditCatsDialog (row) {
      this.editGoodCatsDialogVisible = true
      this.editCatForm = row
      this.getParentCatList()
      console.log(this.editCatForm)
    },
    editParentCatChange () {
      if (this.selectedKeys.length > 0) {
        this.editCatForm.pCatId = this.selectedKeys[this.selectedKeys.length - 1]
        this.editCatForm.catSort = this.selectedKeys.length
      } else {
        this.editCatForm.pCatId = 0
        this.editCatForm.catSort = 0
      }
    },
    editCat () {
      this.$refs.editCatFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('/categories/update', this.editCatForm)
        const { data, meta } = res
        if (meta.code !== 200) return this.$message.error(meta.message)
        console.log(data)
        this.$message.success(meta.message)
        this.selectedKeys = []
        this.editGoodCatsDialogVisible = false
        console.log(this.editCatForm)
        this.getGoodsCateList()
      })
    },
    async removeCatsById (catId) {
      const res = await this.$confirm('此操作将永久删除该分类及子分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).catch(err => {
        return err
      })
      if (res !== 'confirm') {
        return this.$message.info('已取消删除分类操作！')
      }
      this.queryInfo.catId = catId
      const { data: da } = await this.$http.post('/categories/delete', this.queryInfo)
      const { data, meta } = da
      console.log(data)
      if (meta.code !== 200) return this.$message.error(meta.message)
      this.$message.success(meta.message)
      this.getGoodsCateList()
    }
  }
}
</script>

<style scoped>
.treeTable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
