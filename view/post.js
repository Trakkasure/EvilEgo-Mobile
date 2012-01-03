PostView = Backbone.View.extend({
    tagName: 'li'
  , disableMouseEvents: false
  , deleteOn: false
  , menuOn: false
  , events: {
        'tap .vote_up'     : 'addPoint'
      , 'tap .vote_down'   : 'removePoint'
      , 'tap .post-delete' : 'remove'
      , 'swiperight'       : 'swiperight'
      , 'swipeleft'        : 'swipeleft'
      , 'tap .images .image' : 'showImages'
      , 'tap .post-reply'  : 'reply'
      , 'tap .post-view-comments': 'showComments'
      , 'tap'              : 'clickedContent'
    }
  , initialize: function() {
      _.bindAll(this,'render','remove','addPoint','removePoint','pointsChange','swiperight', 'clickedContent','reply','showComments','showMenu','showImages')
      this.model.bind('change:points',this.pointsChange)
      this.template = '#postTemplate'
    }
  , clickedContent: function(e) {
        e.stopPropagation()
        e.preventDefault()
        if(this.disableMouseEvents) return
        //console.log('Tap content')
        //if (e.currentTarget != $('.post-delete',this.el))
        if (this.deleteOn) {
            $('.post-delete-container',this.el).hide()
            this.deleteOn = false
        } else if (this.menuOn) {
            $('.post-menu-container',this.el).hide()
            this.menuOn = false
        } else {
            this.showMenu()
        }
        return this
    }
  , showMenu: function() {
        if ('notification' === this.model.get('type')) return
        this.menuOn = true
        var dc = $('.post-menu-container',this.el)
        var el = $(this.el)
        dc.css('top',(parseInt(el.css('height'))/2)-10) // -10 accounts for margin
        dc.css('left',(parseInt(el.css('width'))/2)-(parseInt(dc.css('width'))/2)+15)
        dc.show()
        return this
    }
  , showComments: function() {
        //console.log('Show comments')
        EvilEgo.collections.CommentCollection = this.model.getComments()
        var cv = new CommentListView(EvilEgo.collections.CommentCollection)
        $('.post-menu-container',this.el).hide()
        this.menuOn = false
        window.location.hash = 'comments'
        return this
    }
  , showImages: function(e) {
        if (!this.model.get('images').length) return // return if there are no images.
        e.stopPropagation()
        e.preventDefault()
        var src = $('a',e.currentTarget).attr('href').split('/').pop()
        console.log('Showing image '+src)
        var pv = new ImageView(this.model,this.model.get('images').indexOf(src))
        window.location.hash = "photo"
    }
  , reply: function() {
        new CommentFormView({model: new CommentFormModel({post_id: this.model.get('_id')})})
        EvilEgo.collections.CommentCollection = this.model.getComments()
        var cv = new CommentListView(EvilEgo.collections.CommentCollection) // load it up.
        $('.post-menu-container',this.el).hide()
        window.location.hash = 'new-comment'
        return this
    }
  , swipeleft: function(e) {
        e.stopPropagation()
        e.preventDefault()
        this.disableMouseEvents = true
        var self = this
        setTimeout(function() {
            self.disableMouseEvents = false
        },500)
        if (this.model.get('comments')==0) this.showMenu()
        else this.showComments()
        return this
    }
  , swiperight: function(e) {
        e.stopPropagation()
        e.preventDefault()
        $('.post-menu-container',this.el).hide()
        if (!this.deleteOn && this.model.get('canDelete')) {
            var self = this
            this.disableMouseEvents = true
            setTimeout(function() {
                self.disableMouseEvents = false
            },500)
            this.deleteOn = true
            var dc = $('.post-delete-container',this.el)
            var el = $(this.el)
            dc.css('top',(parseInt(el.css('height'))/2)-10) // -10 accounts for margin
            dc.css('left',(parseInt(el.css('width'))/2)-30)
            dc.show()
        }
        return this
        
    }
  , remove: function(e) {
        if (e) {
            e.stopPropagation()
            e.preventDefault()
        }
       // if (this.deleteOn) {
            //console.log('deleting')
            //$('.post-delete-container',this.el).hide()
            //this.deleteOn = false
            this.model.remove()
        //}
        return this
    }
  , pointsChange: function() {
        $('.pointValue','li#'+this.model.get('_id')).html(this.model.get('points'))
        return this
    }
  , render: function() {
        $(this.el).html($.tmpl($(this.template).html(),this.model.toJSON()))
        $(this.el).attr('id',this.model.get('_id'))
        return this
    }
  , addPoint: function(e) {
        e.stopPropagation()
        e.preventDefault()
        var el = $(e.currentTarget)
        var p  = el.position()
        var loader = $('<img src="images/loading_sm_icon.gif" />')
        el.hide()
        loader.attr('top',p.top+10)
        loader.attr('left',p.left+10)
        el.parent().append(loader)
        return this.model.addPoint().done(function() {
            el.show()
            loader.remove()
        })
    }
  , removePoint: function(e) {
        e.stopPropagation()
        e.preventDefault()
        var el = $(e.currentTarget)
        var p  = el.position()
        var loader = $('<img src="images/loading_sm_icon.gif" />')
        el.hide()
        loader.attr('top',p.top+10)
        loader.attr('left',p.left+10)
        el.parent().append(loader)
        return this.model.removePoint().done(function() {
            el.show()
            loader.remove()
        })
    }

})
getTemplate('templates/postList.html','postListTemplate')
getTemplate('templates/post.html','postTemplate')

// This is the container for the list of posts
PostListView = Backbone.View.extend({
    el: $('#newsfeed')
  , events: {
        'tap #new-post-button': 'newPost'
      , 'tap #refresh-post-button': 'fetch'
    }
  , initialize: function(collection){
        _.bindAll(this, 'render', 'newPost', 'appendPost','removePost') // remember: every function that uses 'this' as the current object should be in here
        this.template = '#postListTemplate'
        if (!collection) collection = EvilEgo.collections.PostCollection
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
            //console.log('Post not in collection. Adding...')
            this.collection.add(post) // we weren't called by an event
        } else {
            if (post.collection && (post.collection != this.collection)) post.collection.remove(post)
            post.collection = this.collection
            $('ul', this.el).append((new PostView({model:post})).render().el)
        }
        return this
    }
  , removePost: function(post,collection) {
        if (!collection) {
            //console.log('Post still in collection. Removing.')
            this.collection.remove(post) // we weren't called by an event
        } else {
            //console.log('remove post')
        }
        $('ul li#'+post.get('_id')).remove() // remove from the view
        return this
    }
  , newPost: function() {
        new PostFormView({model: new PostFormModel({owner: EvilEgo.currentUser})})
        window.location.hash = 'new-post'
    }
  , render: function() {
        $('#newsfeed-container',this.el).html($.tmpl($(this.template).html(),{}))
        _(this.collection.models).each(function(post){ // iterate the post models
            this.appendPost(post,this.collection) // append the models
        },this)
        $(this.el).trigger('create')
        return this
    }
  , fetch: function() {
        this.collection.fetch()
    }
})

getTemplate('templates/postForm.html','postFormTemplate')
PostFormView = Backbone.View.extend({
    el: $('#new-post')
  , events: {
        'tap #save-post'            : 'submitPost'
      , 'change input[name="title"]'    : 'updateTitle'
      , 'change textarea[name="post"]'  : 'updatePostText'
      , 'tap #upload_image'           : 'selectImage'
      , 'tap #choose_mission'         : 'enableMissions'
    }
  , initialize: function() {
        //console.log('New post form view')
        this.template = '#postFormTemplate'
        _.bindAll(this, 'render', 'submitPost', 'updateTitle', 'updatePostText', 'selectImage', 'enableMissions' ) // remember: every function that uses 'this' as the current object should be in here
        //this.model.bind('change',this.render)
        var self = this
        //console.log('fetching')
        this.model.fetch().done(function(){self.render()})
    }
  , render: function() {
        //console.log('Rendering form')
        try {
            //console.log(this.template)
            //console.log($('#new-post-container',this.el).html())
            $('#new-post-container',this.el).html($.tmpl($(this.template).html(),this.model.toJSON())).trigger('create')
        } catch (e) {
            console.log(e.description)
        }
        return this
    }
  , submitPost: function() {
        this.model.save().done(function(data) {
            //console.log('Post saved')
            EvilEgo.collections.PostCollection.add(data)
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
        //console.log('Selecting image')
        //console.log(JSON.stringify(navigator.camera.PictureSourceType))
        var self = this
        navigator.camera.getPicture(function (imageURI) {
            //console.log(imageURI)
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
                //console.log('Upload complete')
                var data = JSON.parse(results.response)
                this.model.images.push(data.data)
                //console.log($('#uploaded_images').append('<input type="hidden" name="images[]" value="'+data.data+'" />'))
                loader.remove()
            }
            var f = function(error) {
                //console.log('Upload failed')
                loader.remove()
                img.remove()
            }
            var ft = new FileTransfer()
            ft.upload(imageURI, EvilEgo.dataHost+'/post/image/'+self.model.get('owner'),s,f,options)
        }, function (e) {
            //console.log(e)
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

