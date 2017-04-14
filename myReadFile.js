/*
*  读文件
*  @param path     文件路径
*  @param options  读文件的编码和模式
*  @param callback 文件读取完成的回调函数
*/
const fs = require("fs");
const kMaxLength = 0x3FFFFFFF;

function myReadFile(path,options,callback){
     var callback = maybeCallback(arguments[arguments.length-1]);

     if(!options||isFunction(options)){
       options = {flag:"r",encoding:"utf8"};
     }else if(isString(options)){
       options = {flag:"r",encoding:options};
     }else if(!isObject(options)){
       throw new TypeError("Arguments unavailable!");
     }

     var encoding = options.encoding;
     checkEncoding(encoding);

     var size;
     var buffer;
     var pos = 0;
     var fd;

     var flag = options.flag||"r";
     fs.open(path,flag,0666,(err,fd_)=>{
       if(err){
         return callback(err);
       }else{
         fd = fd_;
         fs.fstat(fd,(err,stats)=>{
           if(err){
             return callback(err);
           }else{
             size = stats.size;

             //文件大小为0
             if(size === 0){

              return read();

             }

             //文件大小超过最大储存空间
             if(size > kMaxLength){
               var maxErr = new Error("The file is not allowed to be read whoes size is more than "+ kMaxLength +":"+path);
               return fs.close(fd,(err)=>{
                 return callback(maxErr);
               });
             }

             buffer = Buffer.alloc(size);
             read();

           }

         });
       }
     });


     function read(){
       if(size===0){
         buffer = Buffer.alloc(8192);
         return fs.read(fd,buffer,0,8192,-1,afterRead);
       }else{
         return fs.read(fd,buffer,pos,size-pos,-1,afterRead);
       }
     }

     function afterRead(err,bytesRead,buf){
       if(err){
         return fs.close(fd,(err2)=>{
           return callback(err);
         });
       }

       //如果读不到字符了，则关闭并退出
       if(bytesRead === 0){
         return close();
       }
      //否则，则一直要去read操作
       pos += bytesRead;
       if(size !== 0){
          if(pos === size) close();
          else read();
       }else{
         //read();
       }
     }

     function close(){
       fs.close(fd,(err)=>{
            if(size === 0){

            }else if(pos < size){
              buffer = buffer.slice(0,pos);
            }
            if(encoding)buffer = buffer.toString(encoding);
            return callback(err,buffer);
       });
     }

     function checkEncoding(encode){
       if(encode && !Buffer.isEncoding(encode)){
         throw new Error("Unknow encodeType:"+encode);
       }
     }

     function maybeCallback(callback){
       return isFunction(callback)?callback:(err)=>{throw err};
     }

     function isFunction(fun){
       return typeof fun == "function"?true:false;
     }

     function isObject(obj){
       return obj!=null?(typeof obj == "object"?true:false):false;
     }

     function isString(str){
       return typeof str == "string"?true:false;
     }
}


module.exports = {myReadFile};
