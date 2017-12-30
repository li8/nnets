module.exports = app => {
  const DataSets = app.server.db.models.DataSets;
  const Experiments = app.server.db.models.Experiments;
  const fileLimit = 30;
  const helper = require('./helper.js');



  /**
   * @api {post} /users Register a new user
   * @apiGroup User
   * @apiParam {String} name User name
   * @apiParam {String} email User email
   * @apiParam {String} password User password
   * @apiParamExample {json} Input
   *    {
   *      "name": "John Connor",
   *      "email": "john@connor.net",
   *      "password": "123456"
   *    }
   * @apiSuccess {Number} id User id
   * @apiSuccess {String} name User name
   * @apiSuccess {String} email User email
   * @apiSuccess {String} password User encrypted password
   * @apiSuccess {Date} updated_at Update's date
   * @apiSuccess {Date} created_at Register's date
   * @apiSuccessExample {json} Success
   *    HTTP/1.1 200 OK
   *    {
   *      "id": 1,
   *      "name": "John Connor",
   *      "email": "john@connor.net",
   *      "password": "$2a$10$SK1B1",
   *      "updated_at": "2016-02-10T15:20:11.700Z",
   *      "created_at": "2016-02-10T15:29:11.700Z",
   *    }
   * @apiErrorExample {json} Register error
   *    HTTP/1.1 412 Precondition Failed
   */



  app.post('/upload', helper.upload.array('dataset', fileLimit), function (req, res) {
    // req.files is array of `dataset` files
    // req.body will contain the text fields, if there were any

    var name = helper.getName(req);
    if(!name){
      res.status(412).json({msg:"Name parameters missing"});
      return;
    }
    DataSets.create(req.body)
      .then(result => {
        helper.generator(Experiments,name,null);
        res.status(200).json({msg: name + " dataset added. Scheduled to generate experiments."})
      })
      .catch(error => {
        res.status(412).json({ msg: error.message });
      });

  })


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
          helper.generator(Experiments,name,null);
          res.status(200).json({msg: name + " dataset added. Scheduled to generate experiments."})
        }else{
          res.status(412).json({msg:name + " - Dataset does not exist. Please create one using the /upload endpoint."})
        }
      }
      helper.getDataset(DataSets,name,cb);
  })



  // train --- /id {params: i[],j[],k[]} --< scheduled_id & check state
  // test -- /id {img} -- < results

  app.post('/train',function (req, res) {
    // get dataset -- generate more experiments with params
    // return scheduled_id & check state
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
        var options = {
          i:req.body.i,
          j:req.body.j,
          k:req.body.k
        }
        helper.generator(Experiments,name,options);
        res.status(200).json({msg: name + " dataset added. Scheduled to generate experiments."})
      }else{
        res.status(412).json({msg:name + " - Dataset does not exist. Please create one using the /upload endpoint."})
      }
    }
    helper.getDataset(DataSets,name,cb);

  })


// response :
//{
//   'i': '0.001',
//   'k': '2000',
//   'j': '2',
//   'image': '/home/li8/Pictures/Screenshot_20171219_164923.png',
//   'accuracy': 0.8825040064299458
// }



  app.post('/test',helper.upload.single(),function(req,res){
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
            helper.runCmd( "python test.py --i "+ bestExp.i + " --j "+bestExp.j+" --k "+bestExp.k+" --image "+req.file.path , {}, function(text) {
          			console.log("Tested for " + name + " : " + text);
                var rslt = JSON.parse(text);
                delete rslt.image;
                res.status(200).json({result: rslt.img});
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
