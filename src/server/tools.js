const fs = require('fs');
const path = require('path');

function saveBase64AsFile(base64String, fileName,fn) {
    let base64Data = Buffer.from(base64String.replace(/^data:image\/\w+;base64,/, ""),'base64');
    fs.unlink(path.resolve(__dirname, '../../public/avatar/' +fileName + '.png'), function (err) {
        if (err) {
            console.log('删除错误！',err)
        }else{
           console.log('删除成功')
  
        }
        fs.writeFile(path.resolve(__dirname, '../../public/avatar/' +fileName + '.png'), base64Data, function (err,data) {
           if (err) {
               console.log(err)
               if(fn){
                fn(err)
               }
           }else{
               console.log('写入成功')
           }
       });
    })
}

module.exports = {saveBase64AsFile};