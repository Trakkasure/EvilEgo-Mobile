PostView = Backbone.View.extend({
    template: ''
  , events: {
        'click #add_point': 'addPoint'
      , 'click #remove_point': 'removePoint'
    }
  , initialize: function(model) {
      this.model = model
      var self = this
      getTemplate('templates/post.html','postListTemplate',function(data) {
          self.template = $.tmpl($('#postListTemplate'))
      })
      this.model.bind('change:points','pointsChange')
    }
  , pointsChange: function() {
      $('li#'+this.model._id+' .pointValue').html(this.model.points)
    }
  , render: function() {
      return $.tmpl(this.template,this.model.toJSON())
    }
  , addPoint: function() {
      this.model.addPoint()
    }
  , addPoint: function() {
      this.model.removePoint()
    }

})

PostListView = Backbone.View.extend({
    el: $('#postList')
  , events: {
        'click #addPost': 'newPost'
    }
  , initialize: function(collection){
      _.bindAll(this, 'render', 'newPost', 'addPost', 'appendPost'); // remember: every function that uses 'this' as the current object should be in here
      this.collection = collection
      this.collection.bind('add', this.appendPost); // collection event binder
    }
  , addPost: function(post){ // adding a model to a view. Converts to a view object and appends the view
      this.collection.add(post); // add item to collection; view is updated via event 'add'
    }
  , appendPost: function(post){
      $('ul', this.el).append(post.render())
    }
  , newPost: function() {
      window.location.hash = '#post/new'
    }
  , render: function() {
        this.el.children().remove()
        _(this.models).each(function(post){this.el.append(post.render())})
    }
})

PostFormView = Backbone.View.extend({
    el:$('#postList')
  , events: {
    }
  , initialize: function(model) {
      this.model = model
    }
  , render: function() {
    }
  , addPoint:function() {
      this.model.addPoint()
    }
  , addPoint:function() {
      this.model.removePoint()
    }
})
