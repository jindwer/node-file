
const fs    = require("fs");
function myWriteFile(path,data,options,callback){
        callback = maybeCallback(arguments[arguments.length-1]);

        if(!options||isFunction(options)){
          options = {encoding:'utf8',mode:0666,flag:'w'};
        }else if(isString(options)){
          options = {encoding:options,mode:0666,flag:'w'};
        }else if(!isObject(options)){
          throw new TypeError("Wrong arguments,checkout it!");
        }
        //转换为buffer
        var buffer = Buffer.isBuffer(data)?data:Buffer.from(data,options.encoding);
        var length = buffer.length;

        var fd;
        var pos    = 0;
        isEncoding(options.encoding);

        fs.open(path,options.flag||'w',options.mode,(err,fd_)=>{
          if(err){
            return callback(err);
          }
          fd = fd_;
          write();
        });


//写文件
function write(){
   fs.write(fd,buffer,pos,length-pos,pos,afterWrite);
}
//写文件之后的回调
function afterWrite(err,bytesWriten){
  if(err){
    return fs.close(fd,(err2)=>{
      callback(err);
    });
  }

  if(bytesWriten===0){
    return close();
  }

  pos += bytesWriten;

  if(pos === length){
    return close();
  }else{
    write();
  }
}
//关闭文件　执行回调
function close(){
  fs.close(fd,(err)=>{
    return callback(err);
  });
}
//检查编码是否被允许
function isEncoding(encode){
  if(encode&&!Buffer.isEncoding(encode)){
    throw new Error("Unknow the file flag:"+encode);
  }
}
//处理回调函数
function maybeCallback(callback){
  return isFunction(callback)?callback:(err)=>{throw err};
}
//判断是否为函数
function isFunction(fun){
  return typeof fun === "function"?true:false;
}
//判断是否为字符串
function isString(str){
  return typeof str === "string"?true:false;
}
//判断是否为对象
function isObject(obj){
  return obj!=null?(typeof obj === "object"?true:false):false;
}

}
module.exports = {myWriteFile};
