console.log('view/post.js')

PostView = Backbone.View.extend({
    tagName: 'li'
  , events: {
        'click #add_point': 'addPoint'
      , 'click #remove_point': 'removePoint'
    }
  , initialize: function() {
      this.model.bind('change:points','pointsChange')
      this.template = $('#postTemplate').html()
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
getTemplate('templates/postList.html','postListTemplate')
getTemplate('templates/post.html','postTemplate')

// This is the container for the list of posts
PostListView = Backbone.View.extend({
    el: $('#newsfeed')
  , events: {
        'click #newPost': 'newPost'
    }
  , initialize: function(collection){
        _.bindAll(this, 'render', 'newPost', 'appendPost','removePost') // remember: every function that uses 'this' as the current object should be in here
        this.template = $('#postListTemplate').html()
        if (collection) {
            this.collection = collection
            this.collection.bind('add', this.appendPost) // collection event binder
            this.collection.bind('remove',this.removePost)
            //this.collection.bind('change',this.render)
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
        new PostFormView({model: new PostFormModel})
        window.location.hash = 'newPost'
    }
  , render: function() {
        $(this.el).html($.tmpl(this.template,{}))
        _(this.collection.models).each(function(post){ // iterate the post models
            this.appendPost(post,this.collection) // append the models
        },this)
        $(this.el).trigger('create')
        return this
    }
})

getTemplate('templates/postForm.html','postFormTemplate')
PostFormView = Backbone.View.extend({
    el: $('#newPost')
  , events: {
        'click #post_submit'            : 'submitPost'
      , 'change input[name="title"]'    : 'updateTitle'
      , 'change textarea[name="post"]'  : 'updatePostText'
      , 'click #image_upload'           : 'selectImage'
      , 'click #choose_mission'         : 'enableMissions'
    }
  , initialize: function() {
        console.log('New post form view')
        this.template = $('#postFormTemplate').html()
        _.bindAll(this, 'render', 'submitPost', 'updateTitle', 'updatePostText', 'selectImage', 'enableMissions' ) // remember: every function that uses 'this' as the current object should be in here
        //this.model.bind('change',this.render)
        var self = this
        this.model.fetch().done(function(){self.render()})
    }
  , render: function() {
        $(this.el).empty().append('<div id="content" data-role="content"></div>')
        console.log('Rendering form')
        try {
            $('#content',this.el).html($.tmpl(this.template,this.model.toJSON())).trigger('create')
        } catch (e) {
            console.log(e.description)
        }
    }
  , submitPost: function() {
        this.model.save().done(function() {
            console.log('Post saved')
        })
    }
  , updateTitle: function(e) {
        this.model.set({title: e.currentTarget.value})
    }
  , updatePostText: function(e) {
        this.model.set({post: e.currentTarget.value})
    }
  , selectImage: function() {
        console.log('Selecting image')
        console.log(JSON.stringify(navigator.camera.PictureSourceType))
        navigator.camera.getPicture(function (file_path) {
            $('#post_form').append('<input type="file" value="'+file_path+'" />')
            $('#uploade_images').append('<img src="'+file_path+'" style="width: 64px;margin:5px" />')
        }, function (e) {
            if (navigator.notification) navigator.notification.alert("An error occurred while choosing an image.")
            else alert('Failed to choose an image')
        },{
            sourceType:      navigator.camera.PictureSourceType.SAVEDPHOTOALBUM
          , destinationType: navigator.camera.DestinationType.FILE_URI
        })

    }
  , enableMissions: function(e) {
        $(e.currentTarget).hide()
        $('#challenge').show()
    }

})
