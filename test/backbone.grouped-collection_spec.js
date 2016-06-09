/*global it, describe, before, beforeEach*/

var assert = require("assert"),
    sinon = require('sinon'),
    _ = require("underscore"),
    Backbone = require("backbone"),
    grouped_collection = require('../backbone.grouped-collection'),
    collection;

Backbone.VirtualCollection = require('backbone-virtual-collection');
Backbone.buildGroupedCollection = grouped_collection.buildGroupedCollection;

function byClub(model) {
  return model.get('club');
}

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
        groupBy: byClub
      });
      assert(gc instanceof grouped_collection.GroupCollection);
    });

    it('uses the GroupCollection class if passed the parameter', function () {
      var MyGroupCollection = Backbone.Collection.extend({}),
      gc = Backbone.buildGroupedCollection({
        collection: collection,
        groupBy: byClub,
        GroupCollection: MyGroupCollection
      });
      assert(gc instanceof MyGroupCollection);
    });

    it('uses the GroupModel class if passed the parameter', function () {
      var MyGroupModel = Backbone.Model.extend({}),
      gc = Backbone.buildGroupedCollection({
        collection: collection,
        groupBy: byClub,
        GroupModel: MyGroupModel
      });
      gc.each(function (group) {
        assert(group instanceof MyGroupModel);
      });
    });

    it('binds close and remove events of the close_with event emmiter to stopListening', function () {
      var emitter = _.extend({}, Backbone.Events)

      gc = Backbone.buildGroupedCollection({
        collection: collection,
        GroupCollection: Backbone.Collection.extend({
          stopListening: sinon.stub(),
        }),
        groupBy: byClub,
        close_with: emitter
      });

      emitter.trigger('close');
      emitter.trigger('destroy');

      assert.equal(gc.stopListening.callCount, 2);
    });

    it('propagates close_with event emmiter to the virtual collections', function () {
      var emitter = _.extend({}, Backbone.Events)

      sinon.stub(Backbone.VirtualCollection.prototype, 'stopListening');

      gc = Backbone.buildGroupedCollection({
        collection: collection,
        groupBy: byClub,
        close_with: emitter
      });

      assert(!gc.at(0).vc.stopListening.called);
      emitter.trigger('close');

      assert(gc.at(0).vc.stopListening.called);
      assert(gc.at(1).vc.stopListening.called);

      Backbone.VirtualCollection.prototype.stopListening.restore();
    });

    it('groups models according to the groupBy function', function () {
      var gc = Backbone.buildGroupedCollection({
        collection: collection,
        groupBy: byClub
      });
      assert.deepEqual(gc.pluck('id').sort(), ['Penguins', 'Panthers'].sort());
      assert.equal(gc.get('Penguins').vc.length, 2);
      assert.equal(gc.get('Panthers').vc.length, 1);
    });

    it('accepts a comparator function', function () {
      var gc = Backbone.buildGroupedCollection({
        collection: collection,
        comparator: function (model) {
          return model.id;
        },
        groupBy: byClub
      });
      assert.deepEqual(gc.pluck('id'), ['Panthers', 'Penguins']);
    });

    it('handles adds to the parent collection correctly', function () {
      var gc = Backbone.buildGroupedCollection({
        collection: collection,
        groupBy: byClub
      });
      assert.equal(gc.get('Panthers').vc.length, 1);
      collection.add({name: 'Hillary', club: 'Panthers'});
      assert.equal(gc.get('Panthers').vc.length, 2);
    });

    it('creates a new group if necesary', function () {
      var gc = Backbone.buildGroupedCollection({
        collection: collection,
        groupBy: byClub
      });
      collection.add([{club: 'Penguins'}, {club: 'Rats'}]);
      assert.equal(gc.length, 3);
      assert.equal(gc.get('Rats').vc.length, 1);
    });

    it('handles remove from the parent collection correctly', function () {
      var gc = Backbone.buildGroupedCollection({
        collection: collection,
        groupBy: byClub
      });
      assert.equal(gc.get('Penguins').vc.length, 2);
      collection.remove(collection.findWhere({name: 'Bob'}));
      assert.equal(gc.get('Penguins').vc.length, 1);
    });

    it('removes a group when it is empty', function () {
      var gc = Backbone.buildGroupedCollection({
        collection: collection,
        groupBy: byClub
      });
      assert.equal(gc.length, 2);
      collection.remove(collection.findWhere({club: 'Panthers'}));
      assert.equal(collection.get('Panthers'), undefined);
      assert.equal(gc.length, 1);
    });

    it('removes a group when it does not match the grouping condition anymore', function () {
      var gc = Backbone.buildGroupedCollection({
        collection: collection,
        groupBy: byClub
      });
      assert.equal(gc.length, 2);
      collection.get(collection.findWhere({club: 'Panthers'})).set({club: 'Penguins'});
      assert.equal(gc.length, 1);
    });

    it('handles reset of the parent collection correctly', function () {
      var gc = Backbone.buildGroupedCollection({
        collection: collection,
        groupBy: byClub
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
        groupBy: byClub
      });

      collection.findWhere({name: 'Frank'}).set({club: 'HODOR'});

      assert.equal(gc.get('Panthers').vc.length, 1);
      assert.equal(gc.get('Penguins').vc.length, 1);
      assert.equal(gc.get('HODOR').vc.length, 1);
    });
  });
});
