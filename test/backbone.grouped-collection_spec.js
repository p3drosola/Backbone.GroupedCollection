/*global it, describe, before, beforeEach*/

var assert = require("assert"),
    sinon = require('sinon'),
    _ = require("underscore"),
    Backbone = require("backbone"),
    grouped_collection = require('../backbone.grouped-collection'),
    collection;

Backbone.VirtualCollection = require('backbone-virtual-collection');
Backbone.buildGroupedCollection = grouped_collection.buildGroupedCollection;


describe('Backbone.GroupedCollection', function () {
  describe('#buildGroupedCollection', function () {
    beforeEach(function () {
      collection = new Backbone.Collection([
        {name: 'Bob', club: 'Penguins'},
        {name: 'Frank', club: 'Penguins'},
        {name: 'Jimmy', club: 'Panthers'}
      ]);
    });
    it('should return an instance of GroupCollection', function () {
      var gc = Backbone.buildGroupedCollection({
        collection: collection,
        groupBy: function (model) {
          return model.get('club');
        }
      });
      assert(gc instanceof grouped_collection.GroupCollection);
    });
    it('uses the GroupCollection class if passed the parameter', function () {
      var MyGroupCollection = Backbone.Collection.extend({}),
      gc = Backbone.buildGroupedCollection({
        collection: collection,
        groupBy: function (model) {
          return model.get('club');
        },
        GroupCollection: MyGroupCollection
      });
      assert(gc instanceof MyGroupCollection);
    });
    it('uses the GroupModel class if passed the parameter', function () {
      var MyGroupModel = Backbone.Model.extend({}),
      gc = Backbone.buildGroupedCollection({
        collection: collection,
        groupBy: function (model) {
          return model.get('club');
        },
        GroupModel: MyGroupModel
      });
      gc.each(function (group) {
        assert(group instanceof MyGroupModel);
      });
    });
    it('groups models according to the groupBy function', function () {
      var gc = Backbone.buildGroupedCollection({
        collection: collection,
        groupBy: function (model) {
          return model.get('club');
        }
      });

      assert.equal(gc.length, 2);
      assert.deepEqual(gc.pluck('id').sort(), ['Penguins', 'Panthers'].sort());
      console.log(gc.get('Panthers').vc.map(function (i){return i.get('name'); }));
      assert.equal(gc.get('Penguins').vc.length, 2);
      assert.equal(gc.get('Panthers').vc.length, 1);
    });
  });
});
