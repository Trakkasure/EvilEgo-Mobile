CommentView = Backbone.View.extend({
    tagName: 'li'
  , disableMouseEvents: false
  , menuOn: false
  , events: {
        'tap'              : 'clickedContent'
      , 'tap .profile'     : 'showProfile'
      , 'swiperight'         : 'swiperight'
      , 'tap .comment-delete' : 'remove'
    }
  , initialize: function() {
        _.bindAll(this,'render','clickedContent','showProfile','swiperight','hideMenus','remove')
        this.template = '#commentTemplate'
    }
  , clickedContent: function(e) {
        e.stopPropagation()
        e.preventDefault()
        // do nothing right now.
    }
  , showProfile: function() {
        e.stopPropagation()
        e.preventDefault()
        // do nothing right now.
    }
  , swiperight: function(e) {
        if (e) {
            e.stopPropagation()
            e.preventDefault()
        }
        this.collection.trigger('hideMenus')
        if (!this.deleteOn && this.model.get('canDelete')) {
            var self = this
            this.disableMouseEvents = true
            setTimeout(function() {
                self.disableMouseEvents = false
            },500)
            this.deleteOn = true
            var dc = $('.comment-delete-container',this.el)
              , el = $(this.el)

            var p = el.position()
            this.height = el.css('height')
            dc.css('height',dc.css.height)
            $('div',dc).css('top',parseInt($('.post-body',el).css('height'))/2 + 20)
            $('div',dc).css('left',(parseInt(el.css('width'))/2)-30)
            this.menuTimer = setTimeout(this.hideMenus,5000)
            dc.show()
        }
        return this
        
    }
  , hideMenus: function() {
        if (this.menuTimer) {
            clearTimeout(this.menuTimer)
            this.menuTimer = null
        }
        if (this.menuOn || this.deleteOn) {
            $('.comment-delete-container',this.el).fadeOut(500)
            this.menuOn = this.deleteOn = false
        }
        return this
    }
  , remove: function(e) {
        if (e) {
            e.stopPropagation()
            e.preventDefault()
        }
        if (navigator.notificationEx) {
            navigator.notificationEx.loadingStart({labelText:'Removing Comment...'})//,duration:10})
        }
        this.hideMenus()
        var self = this
        this.model.remove().done(function() {
            self.collection.remove(self)
            var x = EvilEgo.collections.PostCollection.get(self.model.get('post_id'))
            x.set({comments:x.get('comments')-1})
            if (navigator.notificationEx)
                navigator.notificationEx.loadingStop()
        }).error(function() {
            if (navigator.notificationEx)
                navigator.notificationEx.loadingStop()
        })
        //}
        return this
    }
  , render: function() {
      $(this.el).html($.tmpl($(this.template).html(),this.model.toJSON()))
      $(this.el).attr('id',this.model.get('_id'))
      return this
    }
})
getTemplate('templates/commentList.html','commentListTemplate')
getTemplate('templates/comment.html','commentTemplate')

// This is the container for the list of posts
CommentListView = Backbone.View.extend({
    el: $('#comments')
  , events: {
        'click #new-comment-button': 'newComment'
      //, 'swipeleft'          : 'swipeleft'
    }
  , template: '#commentListTemplate'
  , initialize: function(collection) {
        _.bindAll(this, 'render', 'appendComment', 'newComment','removeComment') // remember: every function that uses 'this' as the current object should be in here
        EvilEgo.collections.CommentCollection = collection
        if (collection) {
            this.collection = collection
            this.collection.bind('add', this.render) // collection event binder
            this.collection.bind('remove', this.removeComment) // collection event binder
            this.collection.bind('reset',this.render)
        }
    }
  , appendComment: function(comment,collection) {
        if (!collection && this.collection.models.indexOf(comment)==-1) {
            //console.log('Post not in collection. Adding...')
            this.collection.add(comment) // we weren't called by an event
        } else {
            if (comment.collection && (comment.collection != this.collection)) {
                comment.collection.remove(comment)
                return this.collection.add(comment)
            }
            comment.collection = this.collection
            var cv = new CommentView({model:comment})
            cv.collection = this.collection
            comment.collection.bind('hideMenus',cv.hideMenus) // listen to hiding of the menus event
            $('ul', this.el).append(cv.render().el)
        }
        return this
    }
  , removeComment: function(post,collection) {
        if (!collection) {
            //console.log('Post still in collection. Removing.')
            this.collection.remove(post) // we weren't called by an event
        } else {
            //console.log('remove post')
        }
        $('ul li#'+post.get('_id')).remove() // remove from the view
        return this
    }
  , newComment: function() {
        new CommentFormView({model: new CommentFormModel({player: EvilEgo.currentLogin, post_id: this.collection.post_id})})
        window.location.hash = 'new-comment'
    }
  , render: function() {
        $('#comments-container',this.el).html($.tmpl($(this.template).html(),{}))
        if (this.collection.models.length == 0) return
        _(this.collection.models).each(function(post){ // iterate the post models
            this.appendComment(post,this.collection) // append the models
        },this)
        $(this.el).trigger('create')
        return this
    }
})

getTemplate('templates/commentForm.html','commentFormTemplate')
CommentFormView = Backbone.View.extend({
    el: $('#new-comment')
  , events: {
        'tap #save-comment'               : 'submitComment'
      , 'tap #cancel-comment'             : 'back'
      , 'change textarea[name="comment"]' : 'updateCommentText'
    }
  , template: '#commentFormTemplate'
  , initialize: function() {
        //console.log('New comment form view')
        _.bindAll(this, 'render', 'submitComment', 'updateCommentText') // remember: every function that uses 'this' as the current object should be in here
        //this.model.bind('change',this.render)
        var self = this
        //console.log('fetching')
        //this.model.fetch().done(function(){self.render()})
        this.render()
    }
  , back: function() {
        history.back()
    }
  , render: function() {
        //console.log('Rendering comment form')
        try {
            $('#new-comment-container',this.el).html($.tmpl($(this.template).html(),this.model.toJSON()||{})).trigger('create')
        } catch (e) {
            console.log(e.description)
        }
        return this
    }
  , submitComment: function(e) {
        if (e) {
            e.stopPropagation()
            e.preventDefault()
        }
        if (EvilEgo.disableEvents || EvilEgo.lastEventTimestamp == e.timeStamp) return
        EvilEgo.lastEventTimestamp = e.timeStamp
        EvilEgo.disableEvents = true
        console.log('Saving comment')
        var self = this
        this.updateCommentText($('textarea[name="comment"]',this.el).val())
        if (navigator.notificationEx)
            navigator.notificationEx.loadingStart({labelText:'Saving comment...'})
        EvilEgo.disableEvents = false
        var d = this.model.save()
        var networkTimer = setTimeout(d.fail,10000)
        d.done(function(data) {
            if (navigator.notificationEx)
                navigator.notificationEx.loadingStop()
            data.prettyDate = "just now"
            EvilEgo.collections.CommentCollection.add(data)
            var x = EvilEgo.collections.PostCollection.get(data.post_id)
            x.set({comments:x.get('comments')+1})
            history.back()
        }).error(function(e) {
            if (navigator.notificationEx)
                navigator.notificationEx.loadingStop()
            navigator.notification.alert('Error','Could not save the comment.')
        })

        //.error(function(data) {
          //  if (navigator.notification)
          //      navigator.notification.alert('Could not save comment.\n')
          //  else
          //      alert('Could not save comment.')
        //})
    }
  , updateCommentText: function(e) {
        if (e && e.currentTarget)
            this.model.set({'comment':e.currentTarget.value})
        else if (e)
            this.model.set({comment: e})
    }
})
