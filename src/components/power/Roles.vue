<template>
    <div>
      <!--面包屑导航区-->
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item><a href="/">权限管理</a></el-breadcrumb-item>
        <el-breadcrumb-item>角色列表</el-breadcrumb-item>
      </el-breadcrumb>
      <!--卡片视图-->
      <el-card>
        <!--添加角色按钮区-->
        <el-row>
          <el-col>
            <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
          </el-col>
        </el-row>
        <!--角色列表区-->
        <el-table :data="roleList" border stripe>
          <!--展开列-->
          <el-table-column type="expand">
            <template slot-scope="scope">
              <el-row :class="['bdbottom', i1 === 0 ? 'bdtop':'','vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
                <!--渲染第一级权限-->
                <el-col :span="5">
                  <el-tag closable @close="removePermission(scope.row, item1.id)">{{item1.name}}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <!--渲染二级和三级权限-->
                <el-col :span="19">
                  <!--通过for循环嵌套渲染二级权限-->
                  <el-row :class="[i2 === 0 ? '':'bdtop','vcenter']" v-for="(item2,i2) in item1.children" :key="item2.id" >
                      <el-col :span="6">
                        <el-tag type="success" closable @close="removePermission(scope.row, item2.id)">{{item2.name}}</el-tag>
                        <i class="el-icon-caret-right"></i>
                      </el-col>
                      <el-col :span="18">
                        <el-tag type="warning" v-for="(item3) in item2.children" :key="item3.id" closable @close="removePermission(scope.row, item3.id)">{{item3.name}}</el-tag>
                      </el-col>
                  </el-row>
                </el-col>
              </el-row>
              <!--<pre>
                {{scope.row}}
              </pre>-->
            </template>
          </el-table-column>
          <!--索引列-->
          <el-table-column type="index"></el-table-column>
          <el-table-column label="角色名称" prop="roleName"></el-table-column>
          <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
          <el-table-column label="操作" width="500px">
            <template slot-scope="scope">
              <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.roleId)">编辑</el-button>
              <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeRoleById(scope.row.roleId)">删除</el-button>
              <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!--添加角色弹框-->
      <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" >
        <el-form :model="addRoleForm" :rules="addRoleFormRules" ref="addRoleFormRef" label-width="80px">
            <el-form-item label="角色名称" prop="roleName">
              <el-input v-model="addRoleForm.roleName" ></el-input>
            </el-form-item>
          <el-form-item label="角色描述">
            <el-input v-model="addRoleForm.roleDesc" ></el-input>
          </el-form-item>
        </el-form>
        <!--底部区域-->
        <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
      </el-dialog>

      <el-dialog title="修改角色" :visible.sync="editDialogVisible" width="50%">
          <el-form :model="editRoleForm" ref="editRoleFormRef" label-width="70px">
            <el-form-item label="角色名称" prop="roleName">
              <el-input v-model="editRoleForm.roleName" disabled></el-input>
            </el-form-item>
            <el-form-item label="角色描述">
              <el-input v-model="editRoleForm.roleDesc"></el-input>
            </el-form-item>
          </el-form>
        <!--底部区域-->
        <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleInfo">确 定</el-button>
      </span>
      </el-dialog>

      <!--分配权限弹框-->
      <el-dialog
        title="分配权限"
        :visible.sync="setRightDialogVisible"
        width="50%"
        @close="setRightsDialogClosed">
        <!--树形控件-->
        <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRightDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="allotRights()">确 定</el-button>
      </span>
      </el-dialog>
    </div>
</template>

<script>
export default {
  name: 'Roles',
  data () {
    return {
      roleList: [],
      addDialogVisible: false,
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      addRoleFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 3, max: 10, message: '角色名称的长度在3-10字符之间', trigger: 'blur' }
        ]
      },
      editDialogVisible: false,
      editRoleForm: {},
      queryInfo: {},
      setRightDialogVisible: false,
      rightsList: [],
      treeProps: {
        children: 'children',
        label: 'name'
      },
      defKeys: [],
      roleId: ''
    }
  },
  created () {
    this.getRoleList()
  },
  methods: {
    async getRoleList () {
      const { data: res } = await this.$http.get('/role/list')
      const { data, meta } = res
      if (meta.code !== 200) return this.$message.error(meta.message)
      this.roleList = data
    },
    addRole () {
      this.$refs.addRoleFormRef.validate(async valid => {
        const { data: res } = await this.$http.post('/role/save', this.addRoleForm)
        const { data, meta } = res
        if (meta.code !== 200) return this.$message.error(meta.message)
        this.addDialogVisible = false
        console.log(data)
        this.$message.success(meta.message)
        this.getRoleList()
      })
    },
    async showEditDialog (roleId) {
      this.editRoleForm.roleId = roleId
      const { data: res } = await this.$http.post('/role/getRole', this.editRoleForm)
      this.editRoleForm = res.data
      this.editDialogVisible = true
    },
    async editRoleInfo () {
      const { data: res } = await this.$http.post('/role/update', this.editRoleForm)
      if (res.meta.code !== 200) return this.$message.error(res.meta.message)
      this.$message.success(res.meta.message)
      this.editDialogVisible = false
      this.getRoleList()
    },
    async removeRoleById (roleId) {
      const res = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).catch(err => {
        return err
      })
      if (res !== 'confirm') {
        return this.$message.info('已取消删除该角色！')
      }
      this.queryInfo.roleId = roleId
      const { data: da } = await this.$http.post('/role/delete', this.queryInfo)
      const { data, meta } = da
      console.log(data)
      if (meta.code !== 200) return this.$message.error(meta.message)
      this.$message.success(meta.message)
      this.getRoleList()
    },
    async removePermission (role, rightId) {
      const res = await this.$confirm('是否删除该权限?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).catch(err => {
        return err
      })
      if (res !== 'confirm') {
        return this.$message.info('取消删除该权限！')
      }
      this.queryInfo.roleId = role.roleId
      this.queryInfo.permissionId = rightId
      const { data: da } = await this.$http.post('/role/removePermission', this.queryInfo)
      const { data, meta } = da
      if (meta.code !== 200) return this.$message.error(meta.message)
      this.$message.success(meta.message)
      role.children = data.children
    },
    async showSetRightDialog (role) {
      this.queryInfo.type = 'tree'
      this.roleId = role.roleId
      const { data: res } = await this.$http.post('/menu/rights', this.queryInfo)
      const { data: list, meta } = res
      console.log(list)
      if (meta.code !== 200) return this.$message.error(meta.message)
      this.rightsList = list
      console.log(meta)
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    getLeafKeys (node, arr) {
      if (node.children === null) {
        return arr.push(node.id)
      }
      node.children.forEach(item =>
        this.getLeafKeys(item, arr)
      )
    },
    setRightsDialogClosed () {
      this.defKeys = []
    },
    async allotRights () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      console.log(keys)
      const idStr = keys.join(',')
      this.queryInfo.roleId = this.roleId
      this.queryInfo.permissionIds = idStr
      const { data: res } = await this.$http.post('/role/update', this.queryInfo)
      const { data, meta } = res
      if (meta.code !== 200) return this.$message.error(meta.message)
      console.log(data)
      this.setRightDialogVisible = false
      this.$message.success(meta.message)
      this.getRoleList()
    }
  }
}
</script>

<style scoped>
 .el-tag{
   margin: 7px;
 }
  .bdtop {
    border-top: 1px solid #eee;
  }
  .bdbottom {
    border-bottom: 1px solid #eee;
  }
  .vcenter {
    display: flex;
    align-items: center;
  }
</style>
