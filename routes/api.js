/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var app = require ('../server.js')
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB;

module.exports = function (app) {
  MongoClient.connect(CONNECTION_STRING, function(err, db) {
    app.route('/api/issues/:project')
    
      .get(function (req, res){
        var project = req.params.project;
        req.query._id? req.query._id=ObjectId(req.query._id) : null
        req.query.open? req.query.open=eval(req.query.open) : null       
        db.collection(project).find(req.query).toArray((err,doc)=>{
          if (err) res.send(err);
          else res.send(doc.reverse())
        })    
      })      

      .post(function (req, res){
        var project = req.params.project;
        db.collection(project).insertOne({
           issue_title:req.body.issue_title, 
           issue_text:req.body.issue_text, 
           created_by:req.body.created_by, 
           assigned_to:req.body.assigned_to,
           status_text:req.body.status_text,
           created_on:new Date(),
           updated_on:new Date(),
           open:true,
        },(err,doc)=>{
          if (err) {
            res.send(err)                        
          } else {
            res.redirect('/api/issues/'+project)
          }     
        })
      })    
    
      .put(function (req, res){
        var project = req.params.project;
        var _id=req.body._id
        for (let x in req.body){
          if (req.body[x]===''){
            delete req.body[x]
          }
        }
        delete req.body._id
        if(JSON.stringify(req.body)==='{}'){
          return res.send('no updated field sent')
        } 
        req.body.updated_on=new Date()
        req.body.open==='false' ? req.body.open=false : null
        db.collection(project).findOneAndUpdate({_id:ObjectId(_id)},
                                                {$set:req.body},
                                                (err,doc)=>{
          if (err) {
            res.send('could not update '+req.body._id)
          } else {
            res.send('successfully updated')
          }
        })
      })

      .delete(function (req, res){
        var project = req.params.project;
        if (req.body._id===''){
          return res.send('_id error')
        }
        db.collection(project).findOneAndDelete({_id:ObjectId(req.body._id)},
                                                (err,doc)=>{
          if (err) res.send('could not delete '+req.body._id)
          else res.send('deleted '+req.body._id)          
        })
      });
    })
};
