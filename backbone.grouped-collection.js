(function () {

  var collection_proto;

  collection_proto = {
    closeWith: function (view) {
      view.on('close', this.stopListening);
    }
  };


  /**
   * Creates a Group model for a given id.
   * Context is the options object
   *
   * @param {String} group_id
   * @return {Group}
   */
  function createGroup(group_id) {
    var options = this
      , group = new Backbone.Model({id: group_id});

    group.vc = new Backbone.VirtualCollection(this.collection, function (model) {
      return options.groupBy(model) === group_id;
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

    if (!this.separator_collection.get(id)) {
      this.separator_collection.add(createGroup(id));
    }
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
   *  - other options will be added to the sorted collection's prototype
   *
   * @return {Collection}
   */
  Lib.buildGroupedCollection = function (options) {
    var separator_collection_proto, group_ids;

    needs(options, 'collection', 'The base collection to group');
    needs(options, 'groupBy', 'The function that returns a model\'s group id');

    separator_collection_proto = _.omit(options, ['collection']);
    _.extend(separator_collection_proto, collection_proto);

    options.separator_collection = new (Backbone.Collection.extend(separator_collection_proto))();
    group_ids = _.uniq(options.collection.map(options.groupBy));

    options.separator_collection.reset(_.map(group_ids, _.bind(createGroup, options)));
    options.separator_collection.listenTo(options.collection, 'add', _.bind(onAdd, options));
    // change, remove, reset

    return options.separator_collection;
  };

}());
