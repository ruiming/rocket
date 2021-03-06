var Router = require('koa-router')
var fs = Promise.promisifyAll(require('fs'))
var co = require('co')
var path = require('path')
var make = require('../make')
var yaml = require('js-yaml')
var bindo = require('../bindo')
var asyncBusboy = require('async-busboy')

const router = new Router({
    prefix: '/bindo'
})

// 后台主页页面
router.get('/', co.wrap(function *(ctx, next) {
    let posts = bindo.get('posts')
    yield ctx.render('index', Object.assign({}, posts, {
        config: bindo.get('config')
    }))
}))

// 创建新文章页面
router.get('/new', co.wrap(function *(ctx, next) {
    let tags = bindo.get('tags')
    yield ctx.render('create', Object.assign({}, {
        all_tags: tags.tags.map(tag => Object.assign({ tag: tag })),
        config:   bindo.get('config'),
        tags:     []
    }))
}))

// 编辑文章页面
router.get('/edit/:id', co.wrap(function *(ctx, next) {
    let post = bindo.get('post', ctx.params.id)
    let tags = bindo.get('tags')
    yield ctx.render('create', Object.assign(post, {
        config:   bindo.get('config'),
        all_tags: tags.tags.map(tag => Object.assign({ tag: tag }))
    }))
}))

// 编辑配置页面
router.get('/config', co.wrap(function *(ctx, next) {
    let config = yield fs.readFileAsync(path.resolve(__dirname, '../config.yml'), 'utf-8')
    yield ctx.render('config', {
        config: bindo.get('config'),
        cfg:    config
    })
}))

// 保存配置修改
router.post('/config', co.wrap(function *(ctx, next) {
    let config = ctx.request.body.config
    try {
        yaml.safeLoad(config)
    } catch (e) {
        ctx.status = 400
        return ctx.body = {
            success: false,
            message: `配置格式有误, 不是规范的 YAML 格式\n${e}`
        }
    }
    yield fs.writeFileAsync(path.resolve(__dirname, '../config.yml'), config)
    yield make()
    ctx.body = {
        success: true,
        data:    '保存成功'
    }
}))

// 发布/修改文章
router.post('/new', co.wrap(function *(ctx, next) {
    let { title, tags, content, id, created_date, updated_date } = ctx.request.body
    if (!title.length || !content.length || !created_date.length || !updated_date.length ) {
        ctx.status = 400
        return ctx.body = {
            success: false,
            message: '请完整填写'
        }
    }
    if (id) {
        yield bindo.deleteMd(id)
    } else {
        id = Date.now()
    }
    yield bindo.createMd({
        title,
        tags,
        content,
        id,
        created_date,
        updated_date
    })
    yield make()
    ctx.body = {
        success: true,
        data:    title
    }
}))


// 删除文章
router.delete('/post/:id', co.wrap(function *(ctx, next) {
    yield bindo.deleteMd(ctx.params.id)
    yield make()
    ctx.body = {
        success: true,
        data:    ctx.params.id
    }
}))

// 上传图片
router.post('/upload', co.wrap(function *(ctx, next) {
    const { files, fields } = yield asyncBusboy(ctx.req)
    try {
        yield fs.accessAsync(path.resolve(__dirname, '../images', fields.name || files[0].filename))
        ctx.status = 409
        ctx.body = {
            success: false,
            message: '存在同名文件'
        }
    } catch (e) {
        files.map(file => file.pipe(fs.createWriteStream(path.resolve(__dirname, '../images', fields.name || file.filename))))
        bindo.buildImg()
        return ctx.body = {
            success: true
        }
    }
}))

module.exports = router
