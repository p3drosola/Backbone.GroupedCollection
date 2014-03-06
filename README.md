# Backbone.GroupedCollection

<a href="http://teambox.com"><img alt="Built at Teambox" src="http://i.imgur.com/hqNPlHe.png"/></a>

![Build Status](https://api.travis-ci.org/p3drosola/Backbone.VirtualCollection.png)

Backbone.GroupedCollection is for creating interfaces like this

![mzl mkdxrqaw 320x480-75](https://f.cloud.github.com/assets/520550/961451/b380a274-04d5-11e3-818d-783b4ec5c915.jpg)


In which you have a collection and you want to group the models in the collection into an arbitrary number of groups, based on attributes of the models.

Using this library allows you to do some things that could get quite complicated if not, for example:

- Sorting groups and models in groups seperately
- Appending new models to the right group automatically
- Adding and removing groups when models are added or removed


### How does it work?

`Backbone.buildGroupedCollection` recieves a base collection and a `groupBy` function. It returns a collection of models (groups).
Each of the groups has it's group identifier as the id, and a special property `vc` which is a [Backbone.VirtualCollection](https://github.com/p3drosola/Backbone.VirtualCollection) of the models that belong in the group.

It works well with Marionette or stand-alone.

```javascript

var animals = new Backbone.Collection([
  {name: 'cat', color: 'black'},
  {name: 'dog', color: 'black'},
  {name: 'bird', color: 'red'}
]);

var grouped_animals = Backbone.buildGroupedCollection({
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

### Recursive Grouping

Somtimes you want to make sub-groups, or infinitely nested groups. For example, you have a shopping list that you want grouped by store, and then within each store, by item type.

```javascript
var grouped_shopping_list = Backbone.buildGroupedCollection({
  collection: shopping_list,
, groupBy: groupByShop
, Group: Backbone.Model.extend({
    initialize: function (options) {
      // options.id is the group id
      // options.vc is the  virtual collection
      this.grouped_vc = Backbone.buildGroupedCollection({
        collection: options.vc
      , groupBy: groupByItemType
      })
    }
  })
});

// the items of type "office supplies" from the store "home depot" will be accesible at

grouped_shopping_list.get('home_depot').grouped_vc.get('office_supplies') // retutns a virtual collection

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

#### GroupModel
Specifes an alternative 'class' for the Groups to have. It should extend from Backbone.Model;

## Changelog
```
0.1.1 Add listeners for 'change', 'remove' and 'reset' only once
0.1.0 Fixes groups not being deleted because a race condition with `VirtualCollection`
0.0.3 Fixes bug when changing a model failed to create a new Group
0.0.2 Add GroupCollection & Group options
```

## License
The MIT License (MIT)

Copyright (c) 2013 Pedro  p3dro.sola@gmail.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
