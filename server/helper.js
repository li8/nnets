const multer  = require('multer');
const cq = require('concurrent-queue');


var queue = cq().limit({ concurrency: 10 });


queue.process(function (task, cb) {
    task(cb);
})



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

var generator =  (options) => {
  // options.Experiments
  // options.name
  // options.DataSetId
  if(options.i.length == 0 ){
    options.i=[0.001,0.01,0.1];
  }

  if(options.j.length == 0 ) {
    options.j=[1,2,4];
  }
  if(options.k.length == 0){
    options.k=[1000,2000,4000];
  }

  var clsr = (name,experiment)=>{
    return (cb)=>{

    }
  }
  var clb =(experiment)=>{
    return (err,accuracy)=>{
      experiment.updateAttributes({
        accuracy: accuracy
      }).success(()=>{
        console.log(experiment.id + '=== > done');
      }).error((error)=>{
        console.error(experiment.id + '=== > ', error.message);
      });
    }
  }
  options.i.map((iv)=>{
    options.j.map((jv)=>{
      options.j.map((kv)=>{
        // check for queues
        console.log("Queued---- ");
        var expObj = {
          i:iv,
          j:jv,
          k:kv,
          accuracy:null,
          DataSetId:options.DataSetId
        };
        console.log(expObj);
        options.Experiments.create(clsObj).then(experiment=>{
          queue(clsr(options.name,experiment)(),clb(experiment)());
        }).catch(error=>{
          console.error("Error in creating experiment");
        });
      })
    })
  })
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
