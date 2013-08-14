Backbone.GroupedCollection
==========================


Backbone.GroupedCollection is for creating interfaces like this

![mzl mkdxrqaw 320x480-75](https://f.cloud.github.com/assets/520550/961451/b380a274-04d5-11e3-818d-783b4ec5c915.jpg)


This library is useful in the following scenaraio: you have a collection and you want to group the models in the collection into an arbitrary number of groups, based on attributes of the models.

Using this library allows you to do some things that could get quite complicated if not, for example:

- Sorting groups and models in groups seperately
- Appending new models to the right group automatically
- Adding and removing groups when models are added or removed


### How does it work?

`Backbone.createGroupedCollection` recieves a base collection and a `groupBy` function. It returns a collection of models (groups).
Each of the groups has it's group identifier as the id, and a special property `vc` which is a [Backbone.VirtualCollection](https://github.com/p3drosola/Backbone.VirtualCollection) of the models that belong in the group.

```javascript

var animals = new Backbone.Collection([
  {name: 'cat', color: 'black'},
  {name: 'dog', color: 'black'},
  {name: 'bird', color: 'red'}
]);

var grouped_animals = Backbone.createGroupedCollection({
  collection: animals,
, groupBy: function (animal) {
    return animal.get('color');
  }
});
```

The structure looks something like this:

- GroupCollection
    - Group (black)
        - Animal (cat)
        - Animal (dog)
    - Group (red)
        - Animal (bird)



And the structure adapts itself constantly to changes in the base colleciton.

```javascript
grouped_animals.pluck('id'); // ['black', 'red']
grouped_animals.get('black').vc.length; // 2
grouped_animals.get('red').vc.length; // 1

// adding elements
animals.add({name: 'dinosaur', color: 'green'});
grouped_animals.pluck('id'); // ['black', 'red', 'green']
grouped_animals.get('green').vc.at(0) === animals.findWhere({name: 'dinosaur'}); // true

// removing elements
animals.remove(animals.findWhere({name: 'cat'}));
grouped_animals.pluck('id'); // ['black', 'green']

```

## Options


#### collection 
The base collection.

#### groupBy
The function that defines the grouping. It recieves a model as the argument, and it must return the id of the group it belongs to.

#### close_with
The GroupCollection will continue listening to the base collection untill you call `stopListening()` on it. You can bind the lifespan of a grouped_collection
to that of a marionette view by specifying a `close_with` option. (it can also be any event emitter that emits a `close` event)  

#### GroupCollection
Specifies an alternative 'class' for the GroupCollection to have. It should extend from Backbone.Collection.

#### Group
Specifes an alternative 'class' for the Groups to have. It should extend from Backbone.Model;




