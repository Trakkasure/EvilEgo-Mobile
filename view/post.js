PostView = Backbone.View.extend({
    tagName: 'li'
  , deleteOn: false
  , menuOn: false
  , events: {
        'tap .vote_up'     : 'addPoint'
      , 'tap .vote_down'   : 'removePoint'
      , 'tap .post-delete' : 'remove'
      , 'swiperight'       : 'swiperight'
      //, 'swipeleft'        : 'swipeleft'
      , 'tap .images .image' : 'showImages'
      , 'tap .post-reply'  : 'addComment'
      , 'tap .post-view-comments': 'showComments'
      , 'tap'              : 'clickedContent'
    }
  , initialize: function() {
        _.bindAll(this,'render','remove','addPoint','removePoint','pointsChange','swiperight', 'clickedContent','addComment','showComments','showMenu','showImages','hideMenus','commentsChange')
        this.model.bind('change:points',this.pointsChange)
        this.model.bind('change:comments',this.commentsChange)
//        this.model.bind('hideMenus',this.hideMenus)
        this.template = '#postTemplate'
    }
  , clickedContent: function(e) {
        e.stopPropagation()
        e.preventDefault()
        if(EvilEgo.disableEvents) return
        if (!this.deleteOn && !this.menuOn) {
            // when the view is created in the PostListView, the collection is assocaited with the post model
            this.collection.trigger('hideMenus')
            //console.log('Showing menu')
            this.showMenu((e.pageX || e.clientX)?e:e.originalEvent) // on the iPhone hardware, the originalEvent doesn't contain the tap cooids
            this.menuTimer = setTimeout(this.hideMenus,5000)
        } else {
            this.hideMenus()
        }
        return this
    }
  , hideMenus: function() {
        if (this.menuTimer) {
            clearTimeout(this.menuTimer)
            this.menuTimer = null
        }
        if (this.menuOn || this.deleteOn) {
            $('.post-delete-container',this.el).fadeOut(500)
            $('.post-menu-container',this.el).fadeOut(500)
            $('.points',this.el).show()
            this.menuOn = this.deleteOn = false
        }
        return this
    }
  , showMenu: function(e) {
        if ('notification' === this.model.get('type')) return
        this.menuOn = true
        var dc = $('.post-menu-container',this.el)
          , el = $(this.el)

          , posx = 0
          , posy = 0

        if (e.pageX || e.pageY) {
            posx = e.pageX
            posy = e.pageY
        }
        else if (e.clientX || e.clientY) {
            posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft
            posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop
        }
        dc.css('top',posy-el.position().top-(parseInt(dc.css('height'))/2))
        dc.css('left',(parseInt(el.css('width'))/2)-(parseInt(dc.css('width'))/2)+15) // +15 accounts for margin
        dc.show()
        return this
    }
  , showImages: function(e) {
        if (!this.model.get('images').length) return // return if there are no images.
        e.stopPropagation()
        e.preventDefault()
        var src = $('a',e.currentTarget).attr('href').split('/').pop()
        var pv = new ImageView(this.model,this.model.get('images').indexOf(src))
        window.location.hash = "photo"
    }
  , showComments: function(e) {
        if (e) {
            e.stopPropagation()
            e.preventDefault()
        }
        //console.log('Show comments')
        var self = this
        var cm = new CommentCollection({post_id: this.model.get('_id')})
        var cv = CommentListView.getView(cm)
        cv.fetch().done(function() {
            if (window.location.hash != 'comments')
                window.location.hash = 'comments'
        })
        this.hideMenus()
        return this
    }
  , addComment: function(e) {
        if (e) {
            e.stopPropagation()
            e.preventDefault()
        }
        this.hideMenus()
        CommentFormView.getView({model: new CommentFormModel({post_id: this.model.get('_id')})}).render()
        var cm = new CommentCollection({post_id: this.model.get('_id')})
        var cv = CommentListView.getView(cm)
        window.location.hash = 'new-comment'
        cv.promise(cm.fetchComments())
        return this
    }
  , swipeleft: function(e) {
        e.stopPropagation()
        e.preventDefault()
        if (this.menuOn || this.deleteOn) return this.hideMenus()
        EvilEgo.disableEvents = true
        var self = this
        this.collection.trigger('hideMenus')
        setTimeout(function() {
            EvilEgo.disableEvents = false
        },500)
        if (this.model.get('comments')==0) this.showMenu()
        else this.showComments()
        return this
    }
  , swiperight: function(e) {
        if (e) {
            e.preventDefault()
            e.stopPropagation()
        }
        //console.log('Swiperight')
        this.collection.trigger('hideMenus')
        if (!this.deleteOn && this.model.get('canDelete')) {
            //console.log('CanDelete')
            var self = this
            EvilEgo.disableEvents = true
            setTimeout(function() {
                EvilEgo.disableEvents = false
            },500)
            this.deleteOn = true
            var dc = $('.post-delete-container',this.el)
              , el = $(this.el)

            var p = el.position()
            $('.points',this.el).hide()
            this.height = el.css('height')
            dc.css('height',dc.css.height)
            $('div',dc).css('top',parseInt($('.post-body',el).css('height'))/2 + 20)
            $('div',dc).css('left',(parseInt(el.css('width'))/2)-30)
            this.menuTimer = setTimeout(this.hideMenus,5000)
            dc.show()
        }
        return this
        
    }
  , remove: function(e) {
        if (e) {
            e.stopPropagation()
            e.preventDefault()
        }
        if (navigator.notificationEx) {
            navigator.notificationEx.loadingStart({labelText:'Removing Post...'})//,duration:10})
        }
        this.hideMenus()
        var self = this
        this.model.remove().done(function() {
            //console.log('Remove done')
            //console.log(self.el)
            $(self.el).remove()
            if (navigator.notificationEx)
                navigator.notificationEx.loadingStop()
        }).error(function() {
            if (navigator.notificationEx)
                navigator.notificationEx.loadingStop()
        })
        return this
    }
  , pointsChange: function() {
        $('.pointValue','li#'+this.model.get('_id')).html(this.model.get('points'))
        return this
    }
  , commentsChange: function(model,newVal) { 
        if (newVal) {
            $('.comment-count',this.el).html(
                    '<a href="#comments" class="post-view-comments">'+
                        newVal+' comments'+
                    '</a>'
            )
        } else {
            $('.comment-count',this.el).html(
                    '<a href="#" class="post-reply">'+
                        '0 comments'+
                    '</a>'
            )
        }
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
          , 'tap #logout-button': 'logout'
    }
  , initialize: function(collection){
            _.bindAll(this, 'render', 'logout', 'newPost', 'appendPost','removePost') // remember: every function that uses 'this' as the current object should be in here
            this.template = '#postListTemplate'
            $('#newsfeed-container',this.el).empty()
            if (!collection) collection = EvilEgo.collections.PostCollection
            if (collection) {
                this.collection = EvilEgo.collections.PostCollection = collection
                this.collection.bind('add', this.render) // collection event binder
                this.collection.bind('remove',this.removePost)
                //this.collection.bind('destroy',this.removePost)
                this.collection.bind('reset',this.render)
                //this.collection.bind('change',function(){console.log('Change event on collection')})
            }
    }
  , logout: function() {
        this.collection.logout().done(function(){window.location.hash='login'})
    }
  , appendPost: function(post,collection){
        if (!collection && this.collection.models.indexOf(post)==-1) {
            //console.log('Post not in collection. Adding...')
            this.collection.add(post) // we weren't called by an event
        } else {
            if (post.collection && (post.collection != this.collection)) {
                //console.log('Post in another collection. Removing and adding to this one.')
                post.collection.remove(post) // remove from other collection
                return this.collection.add(post) // add to our collection
            }
            post.collection = collection || this.collection
            var pv = new PostView({model:post})
            pv.collection = collection || this.collection
            post.collection.bind('hideMenus',pv.hideMenus) // listen to hiding of the menus event
            $('ul', this.el).append(pv.render().el)
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
      //console.log("New Post")
        new PostFormView({model: new PostFormModel({owner: EvilEgo.currentUser})})
        window.location.hash = 'new-post'
    }
  , render: function() {
        //console.log('Rendering post list')
        $('#newsfeed-container',this.el).html($.tmpl($(this.template).html(),{}))
        if (this.collection.models.length == 0) return
        var self = this
        //console.log(this.collection)
        _(this.collection.models).each(function(post){ // iterate the post models
            self.appendPost(post,self.collection) // append the models
        })
        setTimeout(function(){$(self.el).trigger('create')},100)
        return this
    }
  , fetch: _.debounce(function() {
        if (navigator.notificationEx)
            navigator.notificationEx.loadingStart({labelText:'Getting Newsfeed...'})
        this.collection.fetchPosts().done(function() {
            if (navigator.notificationEx)
                navigator.notificationEx.loadingStop()
        }).error(function() {
            if (navigator.notificationEx)
                navigator.notificationEx.loadingStop()
        })
    },10000) // limit refreshes from happening at least 10 seconds apart
})

getTemplate('templates/postForm.html','postFormTemplate')
PostFormView = Backbone.View.extend({
    el: $('#new-post')
  , events: {
        'tap #save-post'                : 'submitPost'
      , 'change input[name="title"]'    : 'updateTitle'
      , 'change textarea[name="post"]'  : 'updatePostText'
      , 'tap #add-image-button'         : 'selectImage'
      , 'tap #add-video-button'         : 'selectVideo'
      , 'tap #choose_mission'           : 'enableMissions'
    }
  , initialize: function() {
        //console.log('New post form view')
        this.template = '#postFormTemplate'
        _.bindAll(this, 'render', 'submitPost', 'updateTitle', 'updatePostText', 'selectImage', 'enableMissions' ) // remember: every function that uses 'this' as the current object should be in here
        //this.model.bind('change',this.render)
        var self = this
        //console.log('fetching')
        $('#new-post-container',this.el).empty()
        this.model.fetch().done(function(){self.render()})
    }
  , render: function() {
        //console.log('Rendering form')
        try {
            //console.log(this.template)
            //console.log($('#new-post-container',this.el).html())
            $('#new-post-container',this.el).html($.tmpl($(this.template).html(),this.model.toJSON()))
        } catch (e) {
            console.log(e.description)
        }
        var self = this
        $('#new-post-container',this.el).trigger('create')
        /*
         $('#video_upload_form').transloadit({
            wait:true, autoSubmit:false,
            onProgress: function(bytesReceived, bytesExpected) {
                // render your own progress bar!
                $('.progress',self.el).text((bytesReceived / bytesExpected * 100).toFixed(2)+'%')
            }
          , onError: function(assembly) {
                alert(assembly.error+': '+assembly.message)
            }
          , onSuccess: function(assembly) {
                var results      = assembly.results
                  , thumbnail    = results.extracted_thumbs[0].url
                  , video        = results.realtime_flash_video[0].url
                  , mobile_video = results.realtime_iphone_video[0].url
                $('form#post_form input:hidden[name="video_url"]').val(video)
                $('form#post_form input:hidden[name="mobile_video_url"]').val(mobile_video)
                $('form#post_form input:hidden[name="video_th_url"]').val(thumbnail)
                $('#uploaded_images').append("<img src='"+thumbnail+"' alt=''>")
            }
        });
        */  
        return this
    }
  , submitPost: _.debounce(function(e) {
        if (e) {
            e.stopPropagation()
            e.preventDefault()
        }
        this.updateTitle($('input[name="title"]',this.el).val())
        this.updatePostText($('textarea[name="post"]',this.el).val())
        if (this.model.get('title').trim() == '' || this.model.get('post').trim() == '') return
        if (EvilEgo.disableEvents || EvilEgo.lastEventTimestamp == e.timeStamp) return
        EvilEgo.lastEventTimestamp = e.timeStamp
        EvilEgo.disableEvents = true
        if (navigator.notificationEx)
            navigator.notificationEx.loadingStart({labelText:'Saving post...'})
        //window.location.hash = 'newsfeed'
        var self = this
        var d = this.model.save()
        var networkTimer = setTimeout(d.fail,10000)
        d.done(function(data) {
            if (navigator.notificationEx)
                navigator.notificationEx.loadingStop()
            EvilEgo.collections.PostCollection.add(data)
            EvilEgo.disableEvents = false
            history.back()
        }).error(function() {
            if (navigator.notificationEx) {
                navigator.notificationEx.loadingStop()
                navigator.notification.alert('Error','Could not save the post.')
            } else
                console.log('Error saving the post')
            EvilEgo.disableEvents = false
        })
    },2000)
  , updateTitle: function(e) {
        if (e && e.currentTarget)
            this.model.set({title: e.currentTarget.value})
        else if (e)
            this.model.set({title: e})
    }
  , updatePostText: function(e) {
        if (e && e.currentTarget)
            this.model.set({post: e.currentTarget.value})
        else if (e)
            this.model.set({post: e})
    }
  , selectImage: _.debounce(function(e) {
        if (e) {
            e.stopPropagation()
            e.preventDefault()
        }
        var self = this
        var el = $(e.currentTarget)
        if (el) el.hide()
        var d =$.Deferred()
        var sourceType = [
            navigator.camera.PictureSourceType.SAVEDPHOTOALBUM
          , navigator.camera.PictureSourceType.CAMERA
        ]
        navigator.notification.confirm('Camera or Photo Library?',function(b){d.resolveWith(null,[b])},'Choose Source','Photo Library,Camera')
        d.done(function(button) {
            button--
            navigator.camera.getPicture(function (imageURI) {
                if (navigator.notificationEx)
                    navigator.notificationEx.loadingStart({labelText:'Uploading Image...'})
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
     
                //console.log('ImageURI:'+imageURI)
                var a_img = imageURI.split('/')
                var localURI = a_img.pop()
                localURI = a_img.pop() + '/'+ localURI
                //console.log('ImageURI:')
                //console.log(localURI)
                var img = $('<img src="../../'+localURI+'" style="height: 128px; overflow: crop;margin:5px" />')
                var width = parseInt($(img).css('width'))
                var offset = -50 - (width/2)
                var loader = $('<img src="images/loading_sm_icon.gif" style="width:32px;position:relative;top:-45px;left:'+offset+'px" />')

                $('#uploaded_images').append(img)
                $('#uploaded_images').append(loader)

                var s = function(results) {
                    if (el) el.show()
                    try {
                        navigator.notificationEx.loadingStop()
                        //console.log('Upload complete')
                        var data = JSON.parse(results.response)
                        self.model.get('images').push(data.data)
                        $('#uploaded_images').append('<input type="hidden" name="images[]" value="'+data.data+'" />')
                        loader.remove()
                    } catch (e) {
                        navigator.notificationEx.loadingStop()
                        loader.remove()
                        img.remove()
                        if (navigator.notification) navigator.notification.alert("An error occurred while processing upload response.")
                        //console.log(JSON.stringify(e))
                    }
                }
                var f = function(error) {
                    console.log('Upload failed')
                    loader.remove()
                    img.remove()
                    if (navigator.notification) navigator.notification.alert("An error occurred while uploading an image.")
                }
                var ft = new FileTransfer()
                ft.upload(imageURI, EvilEgo.dataHost+'/post/image/'+self.model.get('owner'),s,f,options)
            }, function (e) {
                el.show()
                //console.log(e)
                //if (navigator.notification) navigator.notification.alert("An error occurred while choosing an image.")
                //else alert('Failed to choose an image')
            },{
                sourceType      : sourceType[button]
              , destinationType : navigator.camera.DestinationType.FILE_URI
              , mediaType       : navigator.camera.MediaType.PICTURE
              , allowEdit       : true
            })
        })
    },2000)
  , selectVideo: _.debounce(function(e) {
        //console.log('Selecting video')
        //console.log(JSON.stringify(navigator.camera.PictureSourceType))
        var self = this
        var el = $(e.currentTarget)
        el.hide()
        navigator.camera.getPicture(function (imageURI) {
            //console.log(imageURI)
            //$('#post_form').append('<input type="file" value="'+file_path+'" />')
            var options = new FileUploadOptions()
            options.fileKey="file"
            options.fileName=imageURI.substr(imageURI.lastIndexOf('/')+1)
            options.mimeType="image/mov"
 
            var params = new Object()
            //params.value1 = "test"
            //params.value2 = "param"
 
            options.params = params
            options.chunkedMode = false
 
            //var img = $('<video src="'+imageURI+'" style="height: 128px; overflow: crop;margin:5px" />')
            var img = $('<video height="128"><source src="'+imageURI+'" type="video/3gp" /></video>')
            var width = $(img).css('width')
            var x = (width/2()+50)*-1
            //console.log('X: '+x)
            var loader = $('<img src="images/loading_sm_icon.gif" style="width:32px;position:relative;top:-45px;left:'+x+'px" />')

            $('#uploaded_video').append(img)
            $('#uploaded_video').append(loader)
            //if (navigator.notification) navigator.notification.alert("An error occurred while uploading a video.")
            //var ft = new FileTransfer()
            //ft.upload(imageURI, EvilEgo.dataHost+'/post/video/'+self.model.get('owner'),s,f,options)
            $('#video_upload_file_select',self.el).val(imageURI)
            $('#video_upload_form', this.el).submit()
        }, function (e) {
            //console.log(e)
            el.show()
            //if (navigator.notification) navigator.notification.alert("An error occurred while choosing an image.")
            //else alert('Failed to choose an image')
        },{
            sourceType      : navigator.camera.PictureSourceType.SAVEDPHOTOALBUM
          , destinationType : navigator.camera.DestinationType.FILE_URI
          , mediaType       : navigator.camera.MediaType.VIDEO
        })

    },2000)
  , enableMissions: function(e) {
        $(e.currentTarget).hide()
        $('#challenge').show()
    }

})

