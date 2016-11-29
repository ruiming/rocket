# 静态博客框架 Rocket

基于 Node.js 的静态博客框架

通过后台系统管理和书写博客, 当博客新增或修改后自动以飞一般的速度立即重新编译博客静态页面

文章存放至 `posts` 文件夹, 文章图片存放至 `images` 文件夹. 其余静态资源在 `static` 文件夹.

**请勿存放东西至 `public` 文件夹, 该文件夹仅供自动构建用**


## 施工中

已完成功能:

- 博客静态页面的渲染, 包含文章页, 首页以及分页

- 博客初次使用的初次配置

- 后台系统登录

- 文章创建, 编辑, 删除. 支持图片插入, 标签选择新建等, 暂不支持时间自定义

- 博客或配置变更后自动重新编译整个博客静态页面

TODO:

- 图片便捷的插入到博客书写区中

- ~~自定义博客的书写时间和更新时间~~

- 按标签查看文章

- 更多用户配置项

- 用户头像自定义

- 优化目录和文件结构

- Hexo 博客的迁移支持

- 评论功能
