<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item><a href="/">用户管理</a></el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图-->
    <el-card >
     <!-- 搜索与添加区域-->

      <el-row :gutter="15">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.userName" :clearable="true" @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!--用户列表区-->
      <el-table :data="userList" :border="true" :stripe="true">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="userName"></el-table-column>
        <el-table-column label="邮箱" prop="userEmail"></el-table-column>
        <el-table-column label="电话" prop="userTel"></el-table-column>
        <el-table-column label="爱好" prop="userHobby"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.delete" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!--编辑按钮-->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.userId)"></el-button>
            <!--删除按钮-->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.userId)"></el-button>
            <!--分配权限按钮-->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--分页区域-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pageNum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="queryInfo.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!--添加用户的对话框-->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!--内容主体区域-->
      <el-form :model="addUserForm" :rules="addUserFormRules" ref="addUserFormRef" label-width="70px" class="demo-ruleForm">
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="addUserForm.userName"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addUserForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="userEmail">
          <el-input v-model="addUserForm.userEmail"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="userTel">
          <el-input v-model="addUserForm.userTel"></el-input>
        </el-form-item>
        <el-form-item label="爱好" prop="userHobby">
          <el-input v-model="addUserForm.userHobby"></el-input>
        </el-form-item>
      </el-form>
      <!--底部区域-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!--编辑用户的对话框-->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editUserForm" :rules="editUserFormRules" ref="editUserFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editUserForm.userName" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="userEmail">
          <el-input v-model="editUserForm.userEmail" ></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="userTel">
          <el-input v-model="editUserForm.userTel"></el-input>
        </el-form-item>
        <el-form-item label="爱好" prop="userHobby">
          <el-input v-model="editUserForm.userHobby"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editUserInfo">确 定</el-button>
  </span>
    </el-dialog>
  </div>

</template>

<script>
export default {
  data () {
    var checkEmail = (rule, value, callback) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        return callback()
      }
      callback(new Error('请输入合法的邮箱'))
    }

    var checkTel = (rule, value, callback) => {
      const regTel = /^1[3|4|5|7|8][0-9]{9}$/
      if (regTel.test(value)) {
        return callback()
      }
      callback(new Error('请输入合法手机号'))
    }

    return {
      queryInfo: {
        query: '',
        pageNum: 1,
        pageSize: 10,
        userId: 0
      },
      userList: [],
      total: 0,
      addDialogVisible: false,
      addUserForm: {
        userName: '',
        password: '',
        userEmail: '',
        userTel: '',
        userHobby: ''
      },
      addUserFormRules: {
        userName: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名的长度在3-10字符之间', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入登陆密码', trigger: 'blur' },
          { min: 6, max: 15, message: '密码的长度在3-10字符之间', trigger: 'blur' }
        ],
        userEmail: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        userTel: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkTel, trigger: 'blur' }
        ]
      },
      editUserFormRules: {
        userEmail: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        userTel: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkTel, trigger: 'blur' }
        ]
      },
      editDialogVisible: false,
      editUserForm: {}
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    async getUserList () {
      const { data: res } = await this.$http.post('/user/users', this.queryInfo)
      const { data, meta } = res
      if (meta.code !== 200) return this.$message.error(meta.megssae)
      this.userList = data.list
      this.total = data.total
    },
    handleSizeChange (newSize) {
      console.log(newSize)
      this.queryInfo.pageSize = newSize
      this.getUserList()
    },
    handleCurrentChange (newSize) {
      console.log(newSize)
      this.queryInfo.pageNum = newSize
      this.getUserList()
    },
    async userStateChanged (userInfo) {
      console.log(userInfo)
      const { data: res } = await this.$http.post('/user/update', userInfo)
      const { meta } = res
      if (meta.code !== 200) {
        userInfo.delete = !userInfo.delete
        return this.$message.error(meta.megssae)
      }
      this.$message.success(meta.message)
    },
    addDialogClosed () {
      this.$refs.addUserFormRef.resetFields()
    },
    addUser () {
      this.$refs.addUserFormRef.validate(async valid => {
        console.log(valid)
        if (!valid) return
        const { data: res } = await this.$http.post('/user/save', this.addUserForm)
        const { data, meta } = res
        if (meta.code !== 200) return this.$message.error(meta.message)
        console.log(data)
        this.addDialogVisible = false
        this.$message.success(meta.message)
        this.getUserList()
      })
    },
    async showEditDialog (userId) {
      console.log(userId)
      this.queryInfo.userId = userId
      const { data: res } = await this.$http.post('/user/user', this.queryInfo)
      const { data, meta } = res
      if (meta.code !== 200) {
        return this.$message.error(meta.message)
      }
      this.editUserForm = data
      this.editDialogVisible = true
    },
    editDialogClosed () {
      this.$refs.editUserFormRef.resetFields()
    },
    editUserInfo () {
      this.$refs.editUserFormRef.validate(async valid => {
        console.log(valid)
        if (!valid) return
        const { data: res } = await this.$http.post('/user/update', this.editUserForm)
        console.log(res)
        const { meta } = res
        if (meta.code !== 200) return this.$message.error(meta.message)
        this.editDialogVisible = false
        this.$message.success(meta.message)
        this.getUserList()
      })
    },
    async removeUserById (userId) {
      console.log(userId)
      const res = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).catch(err => {
        return err
      })
      if (res !== 'confirm') {
        return this.$message.info('已取消该用户！')
      }
      this.queryInfo.userId = userId
      const { data: da } = await this.$http.post('/user/delete', this.queryInfo)
      console.log(da)
      const { data, meta } = da
      console.log(data)
      if (meta.code !== 200) return this.$message.error(meta.message)
      this.$message.success(meta.message)
      this.getUserList()
    }
  }
}
</script>

<style lang="less" scoped>

</style>
