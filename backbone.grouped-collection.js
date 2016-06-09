/*jshint indent:2 */
(function (global) {

  var Backbone = global.Backbone,
      Lib = {},
      _ = global._;

  if ((!_  || !Backbone) && (typeof require !== 'undefined')) {
    _ = require('underscore');
    Backbone = require('backbone');
  }

  /**
   * Checks a parameter from the obj
   *
   * @param {Object} obj         parameters
   * @param {String} name        of the parameter
   * @param {String} explanation used when throwing an error
   */
  function needs(obj, name, explanation) {
    if (!obj[name]) {
      throw new Error('Missing parameter ' + name + '. ' + explanation);
    }
  }

  Lib.GroupModel = Backbone.Model;
  Lib.GroupCollection = Backbone.Collection.extend({
    closeWith: function (event_emitter) {
      event_emitter.on('close', this.stopListening);
    }
  });

  /**
   * Function that returns a collection of sorting groups
   *
   * @param {Object} options
   *  - {Collection} collection (base collection)
   *  - {Function} groupby (function that returns a model's group id)
   *
   *  - {[Function]} comparator
   *  - {[Function]} GroupModel the group model
   *  - {[Function]} GroupCollection the groups collection
   *
   * @return {Collection}
   */
  Lib.buildGroupedCollection = function (options) {
    var Constructor = options.GroupCollection || Lib.GroupCollection;

    needs(options, 'collection', 'The base collection to group');
    needs(options, 'groupBy', 'The function that returns a model\'s group id');

    options.group_collection = new Constructor(null, {
      comparator: options.comparator
    });

    Lib._onReset(options);
    options.group_collection.listenTo(options.collection, 'add', _.partial(Lib._onAdd, options));
    options.group_collection.listenTo(options.collection, 'change', _.partial(Lib._onAdd, options));
    options.group_collection.listenTo(options.collection, 'remove', _.partial(Lib._onRemove, options));
    options.group_collection.listenTo(options.collection, 'reset', _.partial(Lib._onReset, options));


    if (!options.close_with) {
      console.warn("You should provide an event emitter via `close_with`," +
        " or else the listeners will never be unbound!");
    } else {
      options.group_collection.listenToOnce(options.close_with,
          'close', options.group_collection.stopListening);
      options.group_collection.listenToOnce(options.close_with,
          'destroy', options.group_collection.stopListening);
    }

    return options.group_collection;
  };

  /**
   * Creates a Group model for a given id.
   *
   * @param {Object} options
   * @param {String} group_id
   * @return {Group}
   */
  Lib._createGroup = function (options, group_id) {
    var Constructor = options.GroupModel || Lib.GroupModel,
        vc, group, vc_options;

    vc_options = _.extend(options.vc_options || {}, {
      filter: function (model) {
        return options.groupBy(model) === group_id;
      },
      close_with: options.close_with
    });

    vc = new Backbone.VirtualCollection(options.collection, vc_options);
    group = new Constructor({id: group_id, vc: vc});
    group.vc = vc;
    vc.listenTo(vc, 'remove', _.partial(Lib._onVcRemove, options.group_collection, group));

    return group;
  };

  /**
   * Handles the add event on the base collection
   *
   * @param {Object} options
   * @param {Model} model
   */
  Lib._onAdd = function (options, model) {
    var id = options.groupBy(model);

    if (!options.group_collection.get(id)) {
      options.group_collection.add(Lib._createGroup(options, id));
    }
  };

  /**
   * Handles the remove event on the base collection
   *
   * @param {Object} options
   * @param  {Model} model
   */
  Lib._onRemove = function (options, model) {
    var id = options.groupBy(model),
        group = options.group_collection.get(id);

    if (group && !group.vc.length) {
      options.group_collection.remove(group);
    }
  };

  /**
   * Handles the reset event on the base collection
   *
   * @param {Object} options
   */
  Lib._onReset = function (options) {
    var group_ids = _.uniq(options.collection.map(options.groupBy));
    options.group_collection.reset(_.map(group_ids, _.partial(Lib._createGroup, options)));
  };

  /**
   * Handles vc removal
   *
   * @param {VirtualCollection} group_collection
   * @param {?} group
   */
  Lib._onVcRemove = function (group_collection, group) {
    if (!group.vc.length) {
      group_collection.remove(group);
    }
  };

  Backbone.buildGroupedCollection = Lib.buildGroupedCollection;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Lib;
  }

}(this));
