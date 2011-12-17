PostView = Backbone.View.extend({
    tagName: 'li'
  , events: {
        'click #add_point': 'addPoint'
      , 'click #remove_point': 'removePoint'
    }
  , initialize: function() {
      var self = this
      console.log('New post view')
      this.model.bind('change:points','pointsChange')
      this.template = $('#postListTemplate').html()
    }
  , pointsChange: function() {
      $('li#'+this.model.get('_id')+' .pointValue').html(this.model.points)
    }
  , render: function() {
      //console.log('Rendering post ' + this.get('title'))
      //$(this.el).html(this.model.get('title'))
      $(this.el).html($.tmpl(this.template,this.model.toJSON()))
      $(this.el).attr('id',this.model.get('_id'))
      return this
    }
  , remove: function() {
      this.collection.remove(this.model)
    }
  , addPoint: function() {
      this.model.addPoint()
    }
  , removePoint: function() {
      this.model.removePoint()
    }

})
getTemplate('templates/post.html','postListTemplate')

// This is the container for the list of posts
PostListView = Backbone.Collection.extend({
    el: $('body')
  , tagName: 'div'
  , events: {
        'click #addPost': 'newPost'
    }
  , initialize: function(collection){
        _.bindAll(this, 'render', 'newPost', 'appendPost','removePost'); // remember: every function that uses 'this' as the current object should be in here
        this.collection = collection
        this.collection.bind('add', this.appendPost) // collection event binder
        this.collection.bind('remove',this.removePost)
        this.collection.bind('change',this.render)
        this.collection.bind('reset',this.render)
    }
  , appendPost: function(post,collection){
        $('ul', this.el).append((new PostView({model:post})).render().el)
    }
  , removePost: function(post,collection) {
        $('ul li#'+post.id).remove()
    }
  , newPost: function() {
        window.location.hash = '#post/new'
    }
  , render: function() {
        console.log('Render list view')
        this.el.empty() // clear list
        this.el.append('<ul></ul>')
        _(this.collection.models).each(function(post){ // iterate the post models
            this.appendPost(post,this.collection) // append the models
        },this)
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
