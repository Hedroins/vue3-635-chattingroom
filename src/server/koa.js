const Koa = require('koa');
let app = new Koa();
const {router} = require('./api')
const body = require('koa-body');
const static = require('koa-static')
const wsSetting = require('./ws')

app.use(body.koaBody({multipart: true,
    formLimit: "10mb",
    jsonLimit: "10mb",
    textLimit: "10mb",
    enableTypes: ['json', 'form', 'text']}));
app.use(router.routes())
app.use(router.allowedMethods())
app.use(static(__dirname + '../../public/avatar'))


// app.use(async (ctx,next)=>{
//     await initDB()
// })

app.listen(5028,()=>{
    console.log('server is running at port 5028');
});

module.exports = app