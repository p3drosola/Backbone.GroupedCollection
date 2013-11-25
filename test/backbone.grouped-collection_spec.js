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
      assert.deepEqual(gc.pluck('id').sort(), ['Penguins', 'Panthers'].sort());
      assert.equal(gc.get('Penguins').vc.length, 2);
      assert.equal(gc.get('Panthers').vc.length, 1);
    });

    it('handles adds to the parent collection correctly', function () {
      var gc = Backbone.buildGroupedCollection({
        collection: collection,
        groupBy: function (model) {
          return model.get('club');
        }
      });
      assert.equal(gc.get('Panthers').vc.length, 1);
      collection.add({name: 'Hillary', club: 'Panthers'});
      assert.equal(gc.get('Panthers').vc.length, 2);
    });

    it('creates a new group if necesary', function () {
      var gc = Backbone.buildGroupedCollection({
        collection: collection,
        groupBy: function (model) {
          return model.get('club');
        }
      });
      collection.add([{club: 'Penguins'}, {club: 'Rats'}]);
      assert.equal(gc.length, 3);
      assert.equal(gc.get('Rats').vc.length, 1);
    });

    it('handles remove from the parent collection correctly', function () {
      var gc = Backbone.buildGroupedCollection({
        collection: collection,
        groupBy: function (model) {
          return model.get('club');
        }
      });
      assert.equal(gc.get('Penguins').vc.length, 2);
      collection.remove(collection.findWhere({name: 'Bob'}));
      assert.equal(gc.get('Penguins').vc.length, 1);
    });

    it('removes a group when it is empty', function () {
      var gc = Backbone.buildGroupedCollection({
        collection: collection,
        groupBy: function (model) {
          return model.get('club');
        }
      });
      assert.equal(gc.length, 2);
      collection.remove(collection.findWhere({club: 'Panthers'}));
      assert.equal(collection.get('Panthers'), undefined);
      assert.equal(gc.length, 1);
    });

    it('removes a group when it does not match the grouping condition anymore', function () {
      var gc = Backbone.buildGroupedCollection({
        collection: collection,
        groupBy: function (model) {
          return model.get('club');
        }
      });
      assert.equal(gc.length, 2);
      collection.get(collection.findWhere({club: 'Panthers'})).set({club: 'Penguins'});
      assert.equal(gc.length, 1);
    });

    it('handles reset of the parent collection correctly', function () {
      var gc = Backbone.buildGroupedCollection({
        collection: collection,
        groupBy: function (model) {
          return model.get('club');
        }
      });
      assert.equal(gc.get('Penguins').vc.length, 2);

      collection.reset([{club: 'Whales'}, {club: 'Whales'}, {club: 'Cats'}]);

      assert.equal(gc.get('Whales').vc.length, 2);
      assert.equal(gc.get('Cats').vc.length, 1);
      assert.equal(gc.length, 2);
    });

    it('handles changes to the models, what impact their grouping', function () {
      var gc = Backbone.buildGroupedCollection({
        collection: collection,
        groupBy: function (model) {
          return model.get('club');
        }
      });

      collection.findWhere({name: 'Frank'}).set({club: 'HODOR'});

      assert.equal(gc.get('Panthers').vc.length, 1);
      assert.equal(gc.get('Penguins').vc.length, 1);
      assert.equal(gc.get('HODOR').vc.length, 1);
    });
  });
});
