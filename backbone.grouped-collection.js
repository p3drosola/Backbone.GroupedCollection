  /*jshint indent:2 */
(function (global) {

  var GroupModel,
      GroupCollection,
      Backbone = global.Backbone,
      _ = global._;

  if ((!_  || !Backbone) && (typeof require !== 'undefined')) {
    _ = require('underscore');
    Backbone = require('backbone');
  }

  GroupCollection = Backbone.Collection.extend({
    closeWith: function (event_emitter) {
      event_emitter.on('close', this.stopListening);
    }
  });

  GroupModel = Backbone.Model;


  /**
   * Creates a Group model for a given id.
   * Context is the options object
   *
   * @param {String} group_id
   * @return {Group}
   */
  function createGroup (group_id) {
    var options = this,
        group = new (options.GroupModel || GroupModel)({id: group_id});

    group.vc = new Backbone.VirtualCollection(this.collection, {
      filter:function (model) {
        return options.groupBy(model) === group_id;
      }
    });

    return group;
  }

  /**
   * Handles the add event on the base collection
   *
   * @param {Model} model
   */
  function onAdd(model) {
    var id = this.groupBy(model);

    if (!this.group_collection.get(id)) {
      this.group_collection.add(createGroup.call(this, id));
    }
  }

  /**
   * Handles the remove event on the base collection
   * @param  {Model} model
   */
  function onRemove(model) {
    var id = this.groupBy(model),
        group = this.group_collection.get(id);

    if (!group.vc.length) {
      this.group_collection.remove(group);
    }
  }

  /**
   * Handles the reset event on the base collection
   */
  function onReset() {
    var group_ids = _.uniq(this.collection.map(this.groupBy));
    this.group_collection.reset(_.map(group_ids, createGroup.bind(this)));
  }

  /**
   * Checks a parameter from the obj

   * @param {Object} obj         parameters
   * @param {String} name        of the parameter
   * @param {String} explanation used when throwing an error
   */
  function needs(obj, name, explanation) {
    if (!obj[name]) {
      throw new Error('Missing parameter ' + name + '. ' + explanation);
    }
  }

  /**
   * Function that returns a collection of sorting groups
   *
   * @param {Object} options
   *  - {Collection} collection (base collection)
   *  - {Function} groupby (function that returns a model's group id)
   *
   *  - {[Function]} GroupModel the group model
   *  - {[Function]} GroupCollection the groups collection
   *
   * @return {Collection}
   */
  function buildGroupedCollection(options) {

    needs(options, 'collection', 'The base collection to group');
    needs(options, 'groupBy', 'The function that returns a model\'s group id');
    options.group_collection = new (options.GroupCollection || GroupCollection)();

    onReset.call(options);

    options.group_collection.listenTo(options.collection, 'add', onAdd.bind(options));
    options.group_collection.listenTo(options.collection, 'remove', onRemove.bind(options));
    options.group_collection.listenTo(options.collection, 'reset', onReset.bind(options));

    return options.group_collection;
  }


  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      buildGroupedCollection: buildGroupedCollection,
      GroupModel: GroupModel,
      GroupCollection: GroupCollection
    };
  }

  Backbone.buildGroupedCollection = buildGroupedCollection;

}(this));
