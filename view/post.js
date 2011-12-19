console.log('view/post.js')

PostView = Backbone.View.extend({
    tagName: 'li'
  , deleteOn: false
  , originX: 0
  , originY: 0
  , events: {
        'click #add_point'   : 'addPoint'
      , 'click #remove_point': 'removePoint'
      , 'click .post-delete' : 'remove'
      , 'swiperight'         : 'touchmove'
      , 'click'              : 'clickedContent'
    }
  , initialize: function() {
      _.bindAll(this,'render','remove','addPoint','removePoint','pointsChange','touchmove', 'clickedContent')
      this.model.bind('change:points',this.pointsChange)
      this.template = $('#postTemplate').html()
    }
  , clickedContent: function(e) {
        e.stopPropagation()
        e.preventDefault()
        console.log('Clicked content')
        //if (e.currentTarget != $('.post-delete',this.el))
        if (this.deleteOn) {
            $('.post-delete-container',this.el).hide()
            this.deleteOn = false
        }
    }
  , touchmove: function(e) {
        e.stopPropagation()
        if (this.model.get('canDelete')) {
            this.deleteOn = true
            var dc = $('.post-delete-container',this.el)
            var el = $(this.el)
            dc.css('top',el.position().top+(parseInt(el.css('height'))/2)-10)
            dc.css('left',(parseInt(el.css('width'))/2)-30)
            dc.show()
        }
        
    }
  , remove: function(e) {
        e.stopPropagation()
        e.preventDefault()
        if (this.deleteOn) {
            console.log('deleting')
            //$('.post-delete-container',this.el).hide()
            //this.deleteOn = false
            this.model.remove()
        }
    }
  , pointsChange: function() {
      $('.pointValue','li#'+this.model.get('_id')).html(this.model.get('points'))
    }
  , render: function() {
      //console.log('Rendering post ' + this.get('title'))
      //$(this.el).html(this.model.get('title'))
      $(this.el).html($.tmpl(this.template,this.model.toJSON()))
      $(this.el).attr('id',this.model.get('_id'))
      return this
    }
  , addPoint: function(e) {
      e.stopImmediatePropagation()
      console.log('Adding point')
      this.model.addPoint()
    }
  , removePoint: function(e) {
      e.stopImmediatePropagation()
      console.log('Removing point')
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
        EvilEgo.currentPostList = this
        if (collection) {
            this.collection = collection
            this.collection.bind('add', this.render) // collection event binder
            this.collection.bind('remove',this.removePost)
            //this.collection.bind('destroy',this.removePost)
            this.collection.bind('reset',this.render)
            //this.collection.bind('change',this.render)
        }
    }
  , appendPost: function(post,collection){
        if (!collection && this.collection.models.indexOf(post)==-1) {
            console.log('Post not in collection. Adding...')
            this.collection.add(post) // we weren't called by an event
        } else {
            // Add to the view
            //var idx = collection.models.indexOf(post)
            //if (idx == models.length-1)
            if (post.collection && (post.collection != this.collection)) post.collection.remove(post)
            post.collection = this.collection
            $('ul', this.el).append((new PostView({model:post})).render().el)
        }
        return this
    }
  , removePost: function(post,collection) {
        if (!collection) {
            console.log('Post still in collection. Removing.')
            this.collection.remove(post) // we weren't called by an event
        } else
            console.log('remove post')
        $('ul li#'+post.get('_id')).remove() // remove from the view
        return this
    }
  , newPost: function() {
        new PostFormView({model: new PostFormModel({owner: EvilEgo.currentUser})})
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
  , deferred: []
  , events: {
        'click #post_submit'            : 'submitPost'
      , 'change input[name="title"]'    : 'updateTitle'
      , 'change textarea[name="post"]'  : 'updatePostText'
      , 'click #upload_image'           : 'selectImage'
      , 'click #choose_mission'         : 'enableMissions'
    }
  , initialize: function() {
        console.log('New post form view')
        this.template = $('#postFormTemplate').html()
        _.bindAll(this, 'render', 'submitPost', 'updateTitle', 'updatePostText', 'selectImage', 'enableMissions' ) // remember: every function that uses 'this' as the current object should be in here
        //this.model.bind('change',this.render)
        var self = this
        console.log('fetching')
        this.model.fetch().done(function(){self.render()})
    }
  , render: function() {
        console.log('Rendering form')
        try {
            $(this.el).html($.tmpl(this.template,this.model.toJSON())).trigger('create')
        } catch (e) {
            console.log(e.description)
        }
        return this
    }
  , submitPost: function() {
        this.model.save().done(function(data) {
            console.log('Post saved')
            EvilEgo.currentPostList.appendPost(data)
            window.location.hash = 'newsfeed'
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
        var self = this
        navigator.camera.getPicture(function (imageURI) {
            console.log(imageURI)
            //$('#post_form').append('<input type="file" value="'+file_path+'" />')
            var options = new FileUploadOptions()
            options.fileKey="file"
            options.fileName=imageURI.substr(imageURI.lastIndexOf('/')+1)
            options.mimeType="image/jpeg"
 
            var params = new Object()
            params.value1 = "test"
            params.value2 = "param"
 
            options.params = params
            options.chunkedMode = false
 
            var img = $('<img src="'+imageURI+'" style="height: 128px; overflow: crop;margin:5px" />')
            var loader = $('<img src="images/loading_sm_icon.gif" style="width:32px;position:relative;top:-45px;left:-50px" />')
            $('#uploaded_images').append(img)
            $('#uploaded_images').append(loader)

            var s = function(results) {
                console.log('Upload complete')
                var data = JSON.parse(results.response)
                this.model.images.push(data.data)
                //console.log($('#uploaded_images').append('<input type="hidden" name="images[]" value="'+data.data+'" />'))
                loader.remove()
            }
            var f = function(error) {
                console.log('Upload failed')
                loader.remove()
                img.remove()
            }
            var ft = new FileTransfer()
            ft.upload(imageURI, EvilEgo.dataHost+'/post/image/'+self.model.get('owner'),s,f,options)
        }, function (e) {
            console.log(e)
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
