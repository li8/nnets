module.exports = app => {
  const DataSets = app.server.db.models.DataSets;
  const Experiments = app.server.db.models.Experiments;
  const fileLimit = 30;
  const helper = require('./helper.js');



  /**
   * @api {post} /upload
   * @apiGroup Upload
   * @apiVersion 1.0.0
   * @apiParam {String} name DataSet Name
   * @apiParamExample {json} Input
   *    {
   *      "name": "set#1",
   *    }
   * @apiSuccessExample {json} Success
   *    HTTP/1.1 200 OK
   *    {
   *      "msg": "set#1 dataset added. Scheduled to generate experiments.",
   *    }
   * @apiErrorExample {json} Error
   *    HTTP/1.1 412 Precondition Failed
   */



  app.post('/upload', helper.upload.array('dataset', fileLimit), function (req, res) {
    // req.files is array of `dataset` files
    // req.body will contain the text fields, if there were any

    var name = helper.getName(req);
    if(!name){
      res.status(412).json({msg:"Precondition Failed"});
      return;
    }
    DataSets.create(req.body)
      .then(dataset => {
        var optObj ={
          Experiments:Experiments,
          name:name,
          DataSetId:dataset.id
        };
        helper.generator(optObj);
        res.status(200).json({msg: name + " dataset added. Scheduled to generate experiments."})
      })
      .catch(error => {
        console.log("-----loca ", JSON.stringify(error.message));
        res.status(412).json({ msg: error.message });
      });

  })



    /**
     * @api {put} /upload
     * @apiGroup Upload
     * @apiVersion 1.0.0
     * @apiParam {String} name DataSet Name
     * @apiParamExample {json} Input
     *    {
     *      "name": "set#1",
     *    }
     * @apiSuccessExample {json} Success
     *    HTTP/1.1 200 OK
     *    {
     *      "msg": "set#1 dataset added. Scheduled to generate experiments.",
     *    }
     * @apiErrorExample {json} Error
     *    HTTP/1.1 412 Precondition Failed
     */




  app.put('/upload', helper.upload.array('dataset', fileLimit), function (req, res) {
      // req.files is array of `dataset` files
      // req.body will contain the text fields, if there were any
      // upload files and run generate & train  -- update experiments
      var name = helper.getName(req);
      if(!name){
        res.status(412).json({msg:"Name parameters missing"});
        return;
      }
      var cb = (error,dataset)=>{
        if(error){
          res.status(412).json({ msg: error.message });
          return;
        }
        if(dataset){
          var optObj ={
            Experiments:Experiments,
            name:name,
            DataSetId:dataset.id
          };
          helper.generator(optObj);
          res.status(200).json({msg: name + " dataset added. Scheduled to generate experiments."})
        }else{
          res.status(412).json({msg:name + " - Dataset does not exist. Please create one using the /upload endpoint."})
        }
      }
      helper.getDataset(DataSets,name,cb);
  })




    /**
     * @api {post} /train
     * @apiGroup Train
     * @apiVersion 1.0.0
     * @apiParam {String} name DataSet Name
     * @apiParamExample {json} Input
     *    {
     *      "name": "set#1",
     *      "i": [0.001,0.01,0.1],
     *      "j": [1,2,4],
     *      "k": [1000,2000,4000]
     *    }
     * @apiSuccessExample {json} Success
     *    HTTP/1.1 200 OK
     *    {
     *      "msg": "set#1 dataset added. Scheduled to generate experiments.",
     *    }
     * @apiErrorExample {json} Error
     *    HTTP/1.1 412 {
     *      "msg": "Precondition Failed"
     *    }
     */




  app.post('/train',function (req, res) {
    // get dataset -- generate more experiments with params
    // return scheduled_id & check state
    var name = helper.getName(req);
    if(!name){
      res.status(412).json({msg:"Precondition Failed: name"});
      return;
    }

    if(!req.body.i || req.body.i.length === 0){
      res.status(412).json({msg:"Precondition Failed: i value"});
      return;
    }
    if(!req.body.j || req.body.j.length === 0){
      res.status(412).json({msg:"Precondition Failed: j value"});
      return;
    }
    if(!req.body.k || req.body.k.length === 0){
      res.status(412).json({msg:"Precondition Failed: k value"});
      return;
    }


    var cb = (error,dataset)=>{
      if(error){
        res.status(412).json({ msg: error.message });
        return;
      }
      if(dataset){

        var optObj ={
          Experiments:Experiments,
          name:name,
          DataSetId:dataset.id,
          i:req.body.i,
          j:req.body.j,
          k:req.body.k
        };
        helper.generator(optObj);
        res.status(200).json({msg: name + " dataset added. Scheduled to generate experiments."})
      }else{
        res.status(412).json({msg:name + " - Dataset does not exist. Please create one using the /upload endpoint."})
      }
    }
    helper.getDataset(DataSets,name,cb);

  })




    /**
     * @api {post} /test
     * @apiGroup Test
     * @apiVersion 1.0.0
     * @apiParam {String} name DataSet Name
     * @apiParamExample {json} Input
     *    {
     *      "name": "set#1"
     *    }
     * @apiSuccess {Decimal} i Experiment i
     * @apiSuccess {Decimal} j Experiment j
     * @apiSuccess {Decimal} k Experiment k
     * @apiSuccess {Decimal} accuracy Experiment accuracy
     * @apiSuccessExample {json} Success
     *    HTTP/1.1 200 OK
     *    {
     *      'i': '0.001',
     *      'k': '2000',
     *      'j': '2',
     *      'accuracy': 0.8825040064299458
     *    }
     * @apiErrorExample {json} Error
     *    HTTP/1.1 412 {
     *      "msg": "Precondition Failed"
     *    }
     */





  app.post('/test',helper.uploadTest.single(),function(req,res){
    var name = helper.getName(req);
    if(!name){
      res.status(412).json({msg:"Name parameters missing"});
      return;
    }
    var cb = (error,dataset)=>{
      if(error){
        res.status(412).json({ msg: error.message });
        return;
      }
      if(dataset){
        Experiments.findAll({
          where:{
            DataSetId:dataset.id
          },
          raw:true
        }).then(experiments=>{
          if(experiments){
            var breakLoop = false;
            var expCount = 0;
            // best scenario the first one
            var highExpIndex = null;
            var highAccuracy = null;
            while(!breakLoop){
              if(expCount < experiments.length){
                if(experiments[expCount].accuracy){
                  res.status(200).json({msg:name + " dataset is still training."});
                  breakLoop = true;
                }
                if(highAccuracy === null ||  highAccuracy < experiments[expCount].accuracy){
                  highAccuracy = experiments[expCount].accuracy;
                  highExpIndex = expCount;
                }
                expCount = expCount +1;
              }else{
                // exit counter
                breakLoop = true;
              }
            }
            var bestExp = experiments[highExpIndex];
            helper.runCmd( "python",["assets/py/test.py", "--i",bestExp.i,"--j",bestExp.j,"--k",bestExp.k,"--image",req.file.path] , function(text) {
          			console.log("Tested for " + name + " : " + text);
                var rslt = JSON.parse(text.replace(/\'/g,"\""));
                delete rslt.image;
                res.status(200).json({result: rslt});
          		});
          }else{
            res.status(412).json({ msg: "No experiment - found " });
          }
        }).catch(error=>{
          res.status(412).json({ msg: error.message });
        });
        res.status(200).json({msg: name + " dataset added. Scheduled to generate experiments."})
      }else{
        res.status(412).json({msg:name + " - Dataset does not exist. Please create one using the /upload endpoint."})
      }
    }
    helper.getDataset(DataSets,name,cb);
  });

  app.get('/', function(req, res){
		if (req.accepts('html')) {
      DataSets.findAll({
        raw:true
      }).then(datasets=>{
          if(datasets.length == 0 ){
              res.render('index', { dataset:{"----na-----":" no dataset uploaded"} });
          }else{
            res.render('index', { dataset:datasets });
          }
      }).catch(error=>{
  			res.render('index', { dataset:{error:error.message} });
      });
			return;
		}

		// respond with json
		if (req.accepts('json')) {
			res.send({ error: 'Not found' });
			return;
		}

		// default to plain-text. send()
		res.type('txt').send('Not found');
	});


	app.get('*', function(req, res){
		res.status(404);
		// respond with html page
		if (req.accepts('html')) {
			res.render('404', { });
			return;
		}

		// respond with json
		if (req.accepts('json')) {
			res.send({ error: 'Not found' });
			return;
		}

		// default to plain-text. send()
		res.type('txt').send('Not found');
	});

};
