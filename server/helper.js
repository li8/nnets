const multer  = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("name for request", req.body.name);
    var name = getName(req);
    if(!name){
      cb(true,null);
    }else{
      cb(null, 'assets/datasets/'+name);
    }
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
});

var storageTmp = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("  name for test request", req.body.name);
    cb(null, 'tmp/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
});


var imageFilter =  (req, file, cb) =>{
    // accept image only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};


var upload = multer({ storage: storage ,fileFilter: imageFilter });

var uploadTest = multer({ storage: storageTmp ,fileFilter: imageFilter });

var generator =  (name) => {

};

var run_cmd = (cmd, args, callBack ) => {
    var spawn = require('child_process').spawn;

    var child = spawn(cmd, args);
    var resp = "";
    child.stdout.on('data', function (buffer) {
      resp += buffer.toString() ;
    });
    child.stdout.on('end', function() { callBack (resp) });
};



var getDataset = (DataSets,name,cb)=>{
  DataSets.findOne({
    where:{
      name:name
    },
    raw:true
  }).then(dataset=>{
    cb(null,dataset);
  }).catch(error=>{
    cb(error);
  })
};


var getName = (req,res)=>{
  var name = req.body.name;
  if(!name){
    return false;
  }
  return name;
};


module.exports ={
  generator:generator,
  runCmd:run_cmd,
  getName:getName,
  upload:upload,
  uploadTest:uploadTest
}
