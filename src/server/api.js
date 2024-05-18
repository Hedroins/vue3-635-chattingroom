const KoaRouter = require('koa-router')
const router = new KoaRouter()
const mongoose = require('mongoose')
const db_url = require('./database')
const md5 = require('md5')
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
    signature: String,
    isLogin:Number,
    friends_id: [String]
})

const User = mongoose.model("user", userShema)


router.post('/api/searchFriends', (ctx, next) => {
    let requestBody = JSON.parse(ctx.request.body)
    return new Promise((resolve, reject) => {
          User.find({$or:[{username:requestBody.searchContent},{user_id:requestBody.searchContent}] }).then(result => {
               resolve(result)
          })
       
      }).then(friends => {
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

router.post('/api/addFriend', (ctx, next) => {
    let requestBody = JSON.parse(ctx.request.body)
    return new Promise((resolve, reject) => {
        User.find({ user_id: requestBody.user_id }).then(result => {
            if(result[0].friends_id.indexOf(requestBody.friend_id) == -1){
                let p1 = new Promise((_resolve, _reject) => {
                    User.findOneAndUpdate({ user_id: requestBody.user_id },{$push:{friends_id:requestBody.friend_id}}).then(result => {
                        _resolve(result)
                    })
                  })
                  let p2 = new Promise((_resolve, reject) => {
                      User.findOneAndUpdate({ user_id: requestBody.friend_id },{$push:{friends_id:requestBody.user_id}}).then(result => {
                          _resolve(result)
                      })
                  })
                Promise.all([p1,p2]).then(result => {
                    resolve(result)
                  })
            }else{
                reject(result)
            }
        })
    }).then(result => {
        ctx.res.statusCode = 200;
        ctx.res.setHeader('Content-Type', 'application/json');
        ctx.res.write(JSON.stringify(
            {status:1}
        ));
        ctx.res.end();
    }).catch(err => {
        ctx.res.statusCode = 200;
        ctx.res.setHeader('Content-Type', 'application/json');
        ctx.res.write(JSON.stringify(
            {status:0}
        ));
        ctx.res.end();
    })
})

router.post('/api/getFriends', (ctx, next) => {
    let requestBody = JSON.parse(ctx.request.body)
    return new Promise((resolve, reject) => {
        User.find({ user_id: requestBody.user_id }).then(result => {
            if(result instanceof Array){
                result = [...result]
            }else{
                result = [result]
            }
            if(result?.[0]?.friends_id?.length>0){
                User.find({$or:[{user_id:{$in:result[0].friends_id}}]}).then(result => {
                    resolve(result)
                })
            }else{
                resolve([])
            }
        })
    }).then(result => {
        ctx.res.statusCode = 200;
        ctx.res.setHeader('Content-Type', 'application/json');
        ctx.res.write(JSON.stringify(result));
        ctx.res.end();
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
        signature: '萌新驾到！',
        friends_id: []
        
    });
    user.save().then(() => {
        console.log('执行成功！')
    })
    ctx.res.statusCode = 200;
    ctx.res.setHeader('Content-Type', 'application/json');
    ctx.res.write(JSON.stringify({ name: 'ok' }));
    ctx.res.end();
})

router.post('/api/resetUserState', (ctx, next) => {
    return new Promise((resolve, reject) => {
        let requestBody = JSON.parse(ctx.request.body)
        console.log('用户状态重置',requestBody)
        User.findOneAndUpdate({ user_id: requestBody.user_id },{$set:{isLogin:0}}).then(result => {
            resolve(result)
        })
    }).then(result => {
        console.log('用户状态重置数据',result)
        ctx.res.statusCode = 200;   
        ctx.res.setHeader('Content-Type', 'application/json');
        ctx.res.write(JSON.stringify({status:1}));
        ctx.res.end();
    })
    
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
        User.findOneAndUpdate({username: ctx.request.body.username, password: md5(ctx.request.body.password) },{$set:{isLogin:1}}).then(result => {
            resolve(result)
        })
    }).then(result => {
        console.log('用户登录',result)
        if (!result) {
            ctx.res.statusCode = 200;
            ctx.res.setHeader('Content-Type', 'application/json');
            ctx.res.write(JSON.stringify({ name: 'error' }));
        } else {
            ctx.res.statusCode = 302;
            ctx.res.setHeader('Content-Type', 'application/json');
            ctx.cookies.set('isLogin', '1', { maxAge: 8000000 ,httpOnly: false});
            ctx.cookies.set('sex', result.sex,{ maxAge: 8000000,httpOnly: false});
            ctx.cookies.set('name',   Buffer.from(result.username,'utf-8').toString('base64'), { maxAge: 8000000,httpOnly:false});
            ctx.cookies.set('user_id', result.user_id, { maxAge: 8000000,httpOnly:false});
            ctx.cookies.set('avatar', result.avatar, { maxAge: 8000000,httpOnly:false});
            ctx.cookies.set('signature', Buffer.from(result.signature,'utf-8').toString('base64'), { maxAge: 8000000,httpOnly:false});
            ctx.res.write(JSON.stringify(result));

        }
        ctx.res.end();
    })
})


router.post('/api/logout', (ctx, next) => {
    let requestBody = JSON.parse(ctx.request.body)
    console.log('用户扽出',requestBody)
    return new Promise((resolve, reject) => {
        User.findOneAndUpdate({ user_id:requestBody.user_id },{$set:{isLogin:0}}).then(result => {
            resolve(result)
        })
    }).then(result => {
        ctx.res.statusCode = 200;
        ctx.res.setHeader('Content-Type', 'application/json');
        ctx.res.write(JSON.stringify(
            {message:'退出成功！'}
        ));
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
