PostView = Backbone.View.extend({
    tagName: 'li'
  , events: {
        'click #add_point': 'addPoint'
      , 'click #remove_point': 'removePoint'
    }
  , initialize: function() {
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
PostListView = Backbone.View.extend({
    tagName: 'div'
  , events: {
        'click #newPost': 'newPost'
    }
  , initialize: function(collection){
        _.bindAll(this, 'render', 'newPost', 'appendPost','removePost') // remember: every function that uses 'this' as the current object should be in here
        if (collection) {
            this.collection = collection
            this.collection.bind('add', this.appendPost) // collection event binder
            this.collection.bind('remove',this.removePost)
            this.collection.bind('change',this.render)
            this.collection.bind('reset',this.render)
        }
    }
  , appendPost: function(post,collection){
        $('ul', this.el).append((new PostView({model:post})).render().el)
    }
  , removePost: function(post,collection) {
        $('ul li#'+post.id).remove()
    }
  , newPost: function() {
        console.log('New post clicked')
        window.location.hash = 'post/new'
    }
  , render: function() {
        console.log('Render list view')
        $('body').empty().append(this.el)
        $(this.el).empty().append('<ul></ul>')
        $('ul',this.el).append('<li><button id="newPost">New</button></li>')
        _(this.collection.models).each(function(post){ // iterate the post models
            this.appendPost(post,this.collection) // append the models
        },this)
        return this
    }
})

getTemplate('templates/postForm.html','postFormTemplate')
PostFormView = Backbone.View.extend({
    el:$('body')
  , events: {
    }
  , initialize: function() {
      console.log('New post form view')
      this.template = $('#postFormTemplate').html()
      _.bindAll(this, 'render' ) // remember: every function that uses 'this' as the current object should be in here
    }
  , render: function() {
      $(this.el).html($.tmpl(this.template,this.model.toJSON()))
    }
})
