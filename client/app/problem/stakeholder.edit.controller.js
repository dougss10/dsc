/**
 * Created by JOSEVALDERLEI on 29/06/2015.
 */

(function(){

'use strict';

angular
    .module('app')
    .controller('stakeholderController',stakeholderController);


function stakeholderController(Socket,$window,problemService,toastApp){

    var self = this;
    self.idproblem = "";
    self.stakeholderList = [];
    self.stakeholder = "";
    self.intitOnion = intitOnion;
    self.move = false;
    self.inProcessing = true;
    self.saveStakeholder = saveStakeholder;
    self.setOpenEdit = setOpenEdit;
    self.delPostIt = delPostIt;
    self.addPostIt = addPostIt;
    self.acende = acende;
    self.apaga = apaga;

    function intitOnion(){
        self.idproblem = $window.localStorage.getItem('problemid');
        problemService.getonion(self.idproblem)
            .success(function(data) {
                if(data.success) {
                    self.stakeholderList = data.stakeholders;
                }else{
                    toastApp.errorMessage(data.message);
                }
            });
        self.inProcessing = false;
    }

    Socket.on('onBroadcastOnionSave', function (data) {
          angular.forEach(self.stakeholderList, function (stakeholder) {
            if (stakeholder._id == data._id){
                stakeholder.stakeholder = data.stakeholder;
                stakeholder.name = data.name;
                stakeholder.description = data.description;
                stakeholder.openEdit = data.openEdit;
                stakeholder.x = data.x;
                stakeholder.y = data.y;
            }
        });

    });

    function saveStakeholder(stakeholder) {
        console.log('Salvar....' + stakeholder.name);
        console.log('Salvar....' + stakeholder.description);
        Socket.emit('broadcastOnionSave', stakeholder);
    }

    Socket.on('onBroadcastOnionEdit', function (id) {
        angular.forEach(self.stakeholderList, function (stakeholder) {
            if(stakeholder._id === id) {
                stakeholder.openEdit = true;
            }
        });

    });

    function setOpenEdit(id){
        Socket.emit('broadcastOnionEdit', id);
    }

    Socket.on('onBroadcastOnionRemove', function (id) {
        var stakeholder = document.getElementById("stakeholder" +self.stakeholderList[id]._id);
        stakeholder.style.display = 'none';
        self.stakeholderList.splice(id,1);
    });

    function delPostIt(index,stakeholder) {
        var obj = {
            index: index,
            stakeholder: stakeholder
        };
        Socket.emit('broadcastOnionRemove', obj);
    }

    Socket.on('onBroadcastOnionAdd', function (retorno) {
        self.stakeholderList.push(retorno);
    });

    function addPostIt(e,camada) {
        var newStakeholder =
        {
            "onionlayer": camada,
            "name": "",
            "description": "",
            "openEdit": true,
            "x": e.pageX + 'px',
            "y": e.pageY + 'px'
        };
       Socket.emit('broadcastOnionAdd', newStakeholder);
    }

    function acende(evt) {
        evt.target.setAttribute("opacity", "0.8");
    }

    function apaga(evt) {
        evt.target.setAttribute("opacity", "1.0");
    }
}

})();