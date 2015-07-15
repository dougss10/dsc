/**
 * Created by JOSEVALDERLEI on 07/07/2015.
 */
var router = require('express').Router();
var Problem = require('../../models/problem/problem');
var User = require('../../models/user');
var configMail = require('../../../configmail');
var Q = require('q');

function sendMail(mailOptions){
    require('../../sendmailDSC')(mailOptions);
}

module.exports = function () {

    router.route('/newproblem/')
        .post(addNewProblem);
    router.route('/getproblem/')
        .get(getProblem);
    router.route('/getproblems/')
        .get(getAllProblems);
    router.route('/invite/')
        .post(addColaborator)
    router.route('/getcollaborators/')
        .get(getAllCollaborators)
    router.route('/getonion/')
        .get(findOnion)
    router.route('/getevaluation/')
        .get(findEvaluationFraming)
    router.route('/getsemiotic/')
        .get(findSemioticFramework)
    router.route('/removeproblem/')
        .get(removeProblem)
    router.route('/getcarf/')
        .get(findCarf)

    return router;

    function searchSemioticFramework(id){
        var deferred = Q.defer();
        Problem.findOne({
            _id: id
        }).select('semioticframework').exec(function (err, problem){
            if(err) {
                return deferred.reject(err)
            };
            if(!problem){
                return deferred.reject(new Error("Problem n�o encontrado"));
            }
            deferred.resolve(problem)
        });
        return deferred.promise;
    }

    function findSemioticFramework(req, res){
        searchSemioticFramework(req.query.idproblem)
            .then(function(problem){
                res.json({
                        success: true,
                    semioticframework: problem.semioticframework
                    });
            }).catch(function (erro) {
                res.status(400)
                    .json({
                        message: erro.message
                    })
            });
    };


    function searchCarf(id){
        var deferred = Q.defer();
        Problem.findOne({
            _id: id
        }).select('stakeholders carf').exec(function (err, problem){
            if(err) {
                return deferred.reject(err)
            };
            if(!problem){
                return deferred.reject(new Error("Problem n�o encontrado"));
            }
            deferred.resolve(problem)
        });
        return deferred.promise;
    }

    function buildStakeholderList(stakeholders){
        var list = [];
        stakeholders.forEach(function(stakeholder){
                list.push((stakeholder.name));
        });
        return list;

    }

    function findCarf(req,res){
        searchCarf(req.query.idproblem)
            .then(function(problem){
                var stakeholderList = buildStakeholderList(problem.stakeholders);
                res.json({
                    success: true,
                    stakeholders: stakeholderList,
                    carf: problem.carf
                });
            }).catch(function (erro) {
                res.status(400)
                    .json({
                        message: erro.message
                    })
            });
    }

    function findCollaboratorsForProblem(id){
        var deferred = Q.defer();
        Problem.findOne({
            _id: id
        }).select('collaborators').exec(function(err,problem){
            if(err) {
                return deferred.reject(err)
            };
            if(!problem){
                return deferred.resolve(new Error("Problem n�o encontrado"));
            }
            deferred.resolve(problem)
        });
        return deferred.promise;
    }

    function getAllCollaborators(req,res){
        findCollaboratorsForProblem(req.query.idproblem)
            .then(function (problem) {
                res.json({
                    success: true,
                    collaborators: problem.collaborators
                }
                );
            }).catch(function (erro) {
                res.status(400)
                    .json({
                        message: erro.message
                    })
            });
    }

    function searchUser(id){
        var deferred = Q.defer();
        User.findOne({
            _id: id
        }).select('fullname nickname email').exec(function(err,user){
            if(err) {
                return deferred.reject(err)
            };
            if(!user){
                return deferred.resolve(new Error("User n�o encontrado"));
            }
            deferred.resolve(user)
        });
        return deferred.promise;
    }

     function addNewProblem(req, res){
       searchUser(req.body.userid)
            .then(function(user){
                var problem = new Problem({
                    title: req.body.title,
                    description: req.body.description,
                    owner: {
                        fullname: user.fullname,
                        nickname: user.nickname,
                        email: user.email
                    }
                });
                problem.save(function (err) {
                    if(err){
                        console.log(err);
                        return;
                    }
                    res.json({
                        success: true,
                        mensage: "New Problem created",
                        problem: problem
                    })
                })
            }).catch(function (erro) {
                res.status(400)
                    .json({
                        message: erro.message
                    })
            });
    }

    function getAllProblems(req, res){
         Problem.find({})
            .where('owner.email').equals(req.query.email)
             .where('status' ).equals('active')
            .exec (function (err,problems) {
            if(err){
                res.send(err);
                return;
            }
            if(!problems){
                res.send({
                    success: false,
                    message: "Cadastre seus problemas."
                });
            }else{
                res.send({
                    success: true,
                    problems: problems
                });
            }
        });
    }

    function getProblem(req,res){
        Problem.findOne({
            _id: req.query.idproblem
        }).select('_id title description').exec(function(err,problem){
            if(err) throw err;

            if(!problem){
                res.send({
                    success: false,
                    mensage: "Not Problem"
                });
            }else{
                    res.json({
                        success: true,
                        problem: problem
                    });
            }
        });

    }



    function tratarResultado(sucesso, erro) {
        return function (err, dado) {
            if (err) {
                return erro(err);
            }
            sucesso(dado);
        }
    }

    function searchOnion(id){
        var deferred = Q.defer();
        Problem.findOne({
            _id: id
        }).select('stakeholders').exec(function (err, problem){
            if(err) {
                return deferred.reject(err)
            };
            if(!problem){
                return deferred.reject(new Error("Problem n�o encontrado"));
            }
            deferred.resolve(problem)
        });
        return deferred.promise;
    }

    function findOnion(req, res){
        searchOnion(req.query.idproblem)
            .then(function (problem) {
                res.json({
                        success:true,
                        stakeholders: problem.stakeholders
                    }
                );
            }).catch(function (erro) {
                res.status(400)
                    .json({
                        message: erro.message
                    })
            });
    }

    function findEvaluationFraming(req, res){
        searchOnion(req.query.idproblem)
            .then(function (problem) {
                var data = [
                    {
                        onionlayer: "Community",
                        stakeholders:[],
                    },
                    {
                        onionlayer: "Market",
                        stakeholders:[],
                    },
                    {
                        onionlayer: "Source",
                        stakeholders:[],
                    },
                    {
                        onionlayer: "Contribution",
                        stakeholders:[],
                    },
                    {
                        onionlayer: "Technico",
                        stakeholders:[],
                    }
                ];
                 for (var i = 0; i < problem.stakeholders.length; i++) {
                   for (var j = 0; j < data.length; j++) {
                             if (data[j].onionlayer == problem.stakeholders[i].onionlayer) {
                             var stakeholder = {
                                        _id: problem.stakeholders[i]._id,
                                        name: problem.stakeholders[i].name,
                                        onionlayer: data[j].onionlayer,
                                        description: problem.stakeholders[i].description,
                                        openEdit: problem.stakeholders[i].openEdit,
                                        problems: problem.stakeholders[i].evaluationframing.problems,
                                        solutions: problem.stakeholders[i].evaluationframing.solutions
                                    }
                                data[j].stakeholders.push(stakeholder);
                                 break;
                            }
                        }
                  }
                res.json({
                    success: true,
                    evaluationframework: data
                    })

            }).catch(function (erro) {
                res.status(400)
                    .json({
                        message: erro.message
                    })
            });
    }

    function findProblem(idproblem){
        var deferred = Q.defer();
        Problem.findOne({
            _id: id
        }).exec(function (err, problem){
            if(err) {
                return deferred.reject(err)
            };
            if(!problem){
                return deferred.reject(new Error("Problem n�o encontrado"));
            }
            deferred.resolve(problem)
        });
        return deferred.promise;
    }

    function removeProblem(req,res){
        findProblem(req.query.idproblem)
            .then(function(problem){
                problem.update({$set: { status: "inactive" }}, function(err) {
                    if( err ){
                        console.log(err);
                        return;
                    }
                    res.json({
                            success:true,
                        }
                    );
                });
            }).catch(function (erro) {
                res.status(400)
                    .json({
                        message: erro.message
                    })
            });

    }

    function findProblem(id,email) {
        var deferred = Q.defer();
        Problem.findOne({
            _id: id
        }).exec(function (err, problem){
            if(err) {
                return deferred.reject(err)
            };
            if(!problem){
                return deferred.reject(new Error("Problem n�o encontrado"));
            }
            if(buscaUser(problem.collaborators,email)){
                return deferred.reject(new Error("User is Colaborator."));
            }
            deferred.resolve(problem)
        });
        return deferred.promise;
    }

    function findUser(email) {
        var deferred = Q.defer();
        User.findOne({
            email: email
        }).exec(function (err, user){
            if(err) {
                return deferred.reject(err)
            };
            if(!user){
                var newUser = {
                    nickname: 'not User',
                    email: email
                }
                return deferred.resolve(newUser);
            }
            deferred.resolve(user)
        });
        return deferred.promise;
    }

    function addColaboratorInProblem(result) {
        var deferred = Q.defer();
        result.problem.collaborators.push(result.user);
        result.problem.save(tratarResultado(deferred.resolve, deferred.reject));
        return deferred.promise;
    }
    function buscaUser(listauser, email) {
        for(var i=0; i < listauser.length; i++){
            if(listauser[i].email == email){
                return true;
            }
        }
        return false;
    }

    function addColaborator(req, res) {
        findProblem(req.body.idproblem,req.body.email)
            .then(function (problem) {
                return findUser(req.body.email)
                    .then(function (user) {
                        return {problem: problem, user: user};
                    })
            }).then(addColaboratorInProblem)
             .then(function (problem) {
                  /* var mailOptions = {
                    from: configMail.email, // sender address
                    to: req.body.email, // list of receivers
                    subject: 'Project DSC', // Subject line
                    text: 'Ol�,! Voc� foi selecionado para nos ajudar a entender melhor o problema ' + problem.title + '.' +
                    'Acesse http://'+ configMail.serverURL +':3000/'
                };
                sendMail(mailOptions);*/
                res.json({
                    success:true,
                    collaborators: problem.collaborators
                }
                );
            }).catch(function (erro) {
                res.status(400)
                    .json({
                        message: erro.message
                    })
            });
    }


}