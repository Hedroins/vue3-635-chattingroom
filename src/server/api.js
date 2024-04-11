const KoaRouter = require('koa-router')
const router = new KoaRouter()
const mongoose = require('mongoose')
const db_url = require('./database')
const md5 = require('md5')
const { resolve } = require('../../webpack.config')
const fs = require('node:fs')
const path = require('node:path')

let db =null;



let initDB = async () => {
    console.log('创建数据库链接...')
    try {
        db =   await mongoose.connect(db_url.db_url, { useUnifiedTopology: true, useNewUrlParser: true })
    } catch (e) {
        throw e
    }
}

initDB()
let userShema = new mongoose.Schema({
    user_id: String,
    username: String,
    password: String,
    sex: String,
    email: String,
    avatar: String,
    signature: String
})

const User = mongoose.model("user", userShema)


router.post('/api/searchFriends', (ctx, next) => {
    let requestBody = JSON.parse(ctx.request.body)
    console.log('查询参数',requestBody)
    return new Promise((resolve, reject) => {
          User.find({$or:[{username:requestBody.searchContent},{user_id:requestBody.searchContent}] }).then(result => {
               resolve(result)
          })
       
      }).then(friends => {
        console.log(friends)
          if(friends.length>0){
              ctx.res.statusCode = 200;
                ctx.res.setHeader('Content-Type', 'application/json');
                ctx.res.write(JSON.stringify(friends));
                ctx.res.end();
          }else{
            ctx.res.statusCode = 200;
            ctx.res.setHeader('Content-Type', 'application/json');
            ctx.res.write(JSON.stringify([]));
            ctx.res.end();
          }
      })
})

router.get('/(.*).png', (ctx, next) => {
    ctx.res.setHeader('Content-Type', 'image/png')
    ctx.body = fs.createReadStream(path.resolve(__dirname, '../../public/avatar/' + ctx.params[0] + '.png'))

})

router.post('/api/registry', (ctx, next) => {
    const user = new User({
        user_id: ctx.request.body.user_id,
        username: ctx.request.body.username,
        password: md5(ctx.request.body.password),
        sex: ctx.request.body.sex,
        email: ctx.request.body.email,
        avatar: ctx.request.body.avatar,
        signature: '萌新驾到！'
    });
    user.save().then(() => {
        console.log('执行成功！')
    })
    ctx.res.statusCode = 200;
    ctx.res.setHeader('Content-Type', 'application/json');
    ctx.res.write(JSON.stringify({ name: 'ok' }));
    ctx.res.end();
})

router.post('/api/checkuser', (ctx, next) => {
    return new Promise((resolve, reject) => {
        User.find({ email: ctx.request.body.email }).then(result => {
            resolve(result)
        })
    }).then(result => {
        ctx.res.statusCode = 200;
        ctx.res.setHeader('Content-Type', 'application/json');
        ctx.res.write(JSON.stringify(result));
        ctx.res.end();
    })
})


router.post('/api/login', (ctx, next) => {
    return new Promise((resolve, reject) => {
        User.find({ username: ctx.request.body.username, password: md5(ctx.request.body.password) }).then(result => {
            resolve(result)
        })
    }).then(result => {
        if (result.length == 0) {
            ctx.res.statusCode = 200;
            ctx.res.setHeader('Content-Type', 'application/json');
            ctx.res.write(JSON.stringify({ name: 'error' }));
        } else {
            console.log(result)
            ctx.res.statusCode = 302;
            ctx.res.setHeader('Content-Type', 'application/json');
            ctx.cookies.set('isLogin', '1', { maxAge: 10000000 ,httpOnly: false});
            ctx.cookies.set('sex', result[0].sex,{ maxAge: 10000000,httpOnly: false});
            ctx.cookies.set('name',   Buffer.from(result[0].username,'utf-8').toString('base64'), { maxAge: 10000000,httpOnly:false});
            ctx.cookies.set('user_id', result[0].user_id, { maxAge: 10000000,httpOnly:false});
            ctx.cookies.set('avatar', result[0].avatar, { maxAge: 10000000,httpOnly:false});
            ctx.cookies.set('signature', Buffer.from(result[0].signature,'utf-8').toString('base64'), { maxAge: 10000000,httpOnly:false});
            ctx.res.write(JSON.stringify(result[0]));
        }
        ctx.res.end();
    })
})


router.post('/api/updateUserInfo', (ctx, next) => {
    let bodyObj = JSON.parse(ctx.request.body) 
    let expire = bodyObj.expires-Math.floor(Date.now()/1000);
       return new Promise((resolve, reject) => { 
          console.log('user_id:',bodyObj.user_id)
            User.findOneAndUpdate({ user_id: bodyObj.user_id },{$set:(function(body){
                let obj = {}
                for(let key in body){
                 if(key == 'avatar'){
                     let base64Data = Buffer.from(body[key].replace(/^data:image\/\w+;base64,/, ""),'base64');
                     fs.unlink(path.resolve(__dirname, '../../public/avatar/' +bodyObj.user_id + '.png'), function (err) {
                         if (err) {
                             console.log('删除错误！',err)
                         }else{
                            console.log('删除成功')
                   
                         }
                         fs.writeFile(path.resolve(__dirname, '../../public/avatar/' +bodyObj.user_id + '.png'), base64Data, function (err,data) {
                            if (err) {
                                console.log(err)
                                reject(err)
                            }else{
                                console.log('写入成功')
                            }
                        });
                     })
             
                     obj[key] = bodyObj.user_id + '.png'
                
                 }else{
                    obj[key] = body[key]
                 } 
                }
                return obj
               })(bodyObj)}).then((data)=>{
                if(!data) {
                    console.log('未查找到相关数据')
                    reject(err)
                }
                else if(data){
                    console.log('修改数据成功')
                    resolve(data)
                    
                }
               }).catch(err => {
                   reject(err)
               })
         
       
       }).then(result => {
        ctx.res.statusCode = 200;
        console.log(bodyObj.username,'bodyObj')
        console.log(result,'result')
        ctx.res.setHeader('Content-Type', 'application/json');
        ctx.cookies.set('sex', bodyObj.sex||result.sex,{maxAge:expire,httpOnly:false});
        ctx.cookies.set('name',Buffer.from(bodyObj.username||result.username,'utf-8').toString('base64'),{maxAge:expire,httpOnly:false});
        ctx.cookies.set('user_id', result.user_id,{maxAge:expire,httpOnly:false});
        ctx.cookies.set('avatar', result.avatar,{maxAge:expire,httpOnly:false});
        ctx.cookies.set('signature',Buffer.from(bodyObj.signature||result.signature,'utf-8').toString('base64'),{maxAge:expire,httpOnly:false});
        ctx.res.write(JSON.stringify({sex:bodyObj.sex||result.sex,username: bodyObj.username||result.username,user_id: result.user_id,avatar: result.avatar,signature: bodyObj.signature||result.signature}));
        ctx.res.end();
    }).catch(err => {
        ctx.res.statusCode = 500;
        ctx.res.setHeader('Content-Type', 'application/json');
        ctx.res.write(JSON.stringify({ name: 'error' }));
        ctx.res.end();
    })
})


router.post('/api', (ctx, next) => {
    ctx.res.statusCode = 200;
    ctx.res.setHeader('Content-Type', 'application/json');
    ctx.res.write(JSON.stringify({ name: 'hejialin' }));
    ctx.res.end();
})

exports.router = router;
